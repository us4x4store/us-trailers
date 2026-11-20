"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import {
  CuboidCollider,
  HeightfieldCollider,
  useFixedJoint,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { axlePositions, buildTrailer, DEFAULT_CONFIG, DIM, overallLength, tareKg } from "@/trailer/model";
import { buildPartGeometry } from "@/trailer/geometry";
import { createMaterials, PAPER } from "@/trailer/materials";
import { heightAt, heightfield, ROAD, TILE, type Surface } from "./road";
import { drive, LOADS, type LoadKind } from "./driveState";

const CFG = DEFAULT_CONFIG;
const TARE = tareKg(CFG);
const COUPLER: [number, number, number] = [CFG.length / 2 + 1.35, DIM.coupleH, 0];
const WHEELS = axlePositions(CFG).flatMap((x) => [
  { x, z: DIM.trackZ },
  { x, z: -DIM.trackZ },
]);
const REST = 0.3;
const AXLE_X = axlePositions(CFG).reduce((a, b) => a + b, 0) / axlePositions(CFG).length;
const HARD_Y = DIM.railY;

/* ------------------------------------------------------------------ road */
function Road({ surface, lite }: { surface: Surface; lite: boolean }) {
  const hf = useMemo(() => heightfield(surface, 0.1, 0.25), [surface]);

  const geo = useMemo(() => {
    const sx = lite ? 0.2 : 0.1;
    const segX = Math.round(ROAD.len / sx);
    const segZ = lite ? 18 : 36;
    const g = new THREE.PlaneGeometry(ROAD.len, ROAD.halfW * 2, segX, segZ);
    g.rotateX(-Math.PI / 2);
    g.translate(ROAD.x0 + ROAD.len / 2, 0, 0);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const base = new THREE.Color("#B49B76");
    const rut = new THREE.Color("#8F7A5C");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z, surface);
      pos.setY(i, h);
      const track = Math.exp(-(((Math.abs(z) - 1.05) / 0.5) ** 2));
      const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
      const grain = (n - Math.floor(n)) * 0.12;
      c.copy(base).lerp(rut, track * 0.5 + grain);
      if (surface === "tar") c.set("#3B3D40").offsetHSL(0, 0, grain * 0.3 - track * 0.03);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [surface, lite]);

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={hf.centre} userData={{ ground: true }}>
        <HeightfieldCollider args={[hf.nrows, hf.ncols, Array.from(hf.heights), hf.scale]} friction={0.9} />
      </RigidBody>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[50, -0.06, 0]} receiveShadow>
        <planeGeometry args={[600, 400]} />
        <meshStandardMaterial color="#C9B897" roughness={1} />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ trailer */
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const yAxis = new THREE.Vector3(0, 1, 0);
function placeBetween(o: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, thickness: number) {
  const d = tmpB.copy(b).sub(a);
  const len = d.length();
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.copy(tmpQ.setFromUnitVectors(yAxis, d.normalize()));
  o.scale.set(thickness, len, thickness);
}

function Rig({ lite }: { lite: boolean }) {
  const { world, rapier } = useRapier();
  const trailer = useRef<RapierRigidBody>(null);
  const tow = useRef<RapierRigidBody>(null);
  const water = useRef<RapierRigidBody>(null);
  const bakkie = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Group[]>([]);
  const armRefs = useRef<THREE.Mesh[]>([]);
  const coilRefs = useRef<THREE.Mesh[]>([]);
  const controller = useRef<ReturnType<typeof world.createVehicleController> | null>(null);
  const state = useRef({ x: COUPLER[0], v: 0, dist: 0, lastVy: 0, g: 1, gPeak: 0, readT: 0, nose: 0 });
  // where each load settled on the deck (trailer space), to spot loads that shift
  const homes = useRef(new Map<number, { x: number; z: number; t: number }>());
  const [loads, setLoads] = useState(drive.loads);

  useSphericalJoint(tow as React.RefObject<RapierRigidBody>, trailer as React.RefObject<RapierRigidBody>, [
    [0, 0, 0],
    COUPLER,
  ]);

  const mats = useMemo(() => createMaterials(CFG.colour), []);
  const statics = useMemo(() => {
    const parts = buildTrailer(CFG).filter((p) => !p.wheel && !p.id.startsWith("susp") && !p.id.startsWith("brakes"));
    return parts.flatMap((p) => buildPartGeometry(p, lite).byMat.map((b) => ({ key: p.id + b.mat, geo: b.geo, mat: mats[b.mat] })));
  }, [lite, mats]);
  const wheelGeo = useMemo(() => {
    const w = buildTrailer(CFG).find((p) => p.wheel)!;
    const shifted = { ...w, meshes: w.meshes.map((m) => ({ ...m, p: [0, 0, 0] as [number, number, number] })) };
    return buildPartGeometry(shifted, lite).byMat;
  }, [lite]);

  // vehicle controller: one ray-cast suspension per wheel
  useEffect(() => {
    const body = trailer.current!;
    const vc = world.createVehicleController(body);
    WHEELS.forEach((w, i) => {
      vc.addWheel({ x: w.x, y: HARD_Y, z: w.z }, { x: 0, y: -1, z: 0 }, { x: 0, y: 0, z: -1 }, REST, DIM.wheelR);
      vc.setWheelSuspensionStiffness(i, 40); // ~60 mm static sag, ~2 Hz body bounce
      vc.setWheelSuspensionCompression(i, 2.2);
      vc.setWheelSuspensionRelaxation(i, 2.8);
      vc.setWheelMaxSuspensionTravel(i, 0.25);
      vc.setWheelMaxSuspensionForce(i, 80000);
      vc.setWheelFrictionSlip(i, 1.6);
      vc.setWheelSideFrictionStiffness(i, 1.0);
    });
    controller.current = vc;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __drive: unknown }).__drive = { world, vc, body, tow: tow.current, drive, heightAt, rapier };
    return () => {
      controller.current = null;
      try {
        world.removeVehicleController(vc);
      } catch {
        /* world already freed on unmount */
      }
    };
  }, [world]);

  // loads list from the UI
  useEffect(() => {
    const f = () => setLoads([...drive.loads]);
    drive.listeners.add(f);
    return () => {
      drive.listeners.delete(f);
    };
  }, []);

  // water: an 80 kg mass that appears in the front tank when filled
  useEffect(() => {
    const f = () => {
      const c = water.current?.collider(0);
      if (c) c.setMass(drive.water ? 80 : 0.01);
    };
    drive.listeners.add(f);
    f();
    return () => {
      drive.listeners.delete(f);
    };
  }, []);

  useBeforePhysicsStep((w) => {
    const vc = controller.current;
    const t = tow.current;
    const b = trailer.current;
    if (!vc || !t || !b) return;
    const dt = w.timestep;
    const s = state.current;
    // accelerate like a real bakkie with a trailer: ~1.5 m/s², brake at ~3 m/s²
    const target = drive.targetKmh / 3.6;
    const a = target > s.v ? 1.5 : -3;
    s.v = target > s.v ? Math.min(target, s.v + a * dt) : Math.max(target, s.v + a * dt);
    s.x += s.v * dt;
    s.dist += s.v * dt;
    const y = heightAt(s.x, 0, drive.surface) + COUPLER[1] + 0.02 * Math.sin(s.dist * 0.9);
    t.setNextKinematicTranslation({ x: s.x, y, z: 0 });
    vc.updateVehicle(dt);

    // endless road: shift everything back one tile (the surface repeats every TILE metres)
    if (s.x > ROAD.x0 + ROAD.len - 70) {
      s.x -= TILE;
      const shift = (rb: RapierRigidBody) => {
        const p = rb.translation();
        rb.setTranslation({ x: p.x - TILE, y: p.y, z: p.z }, true);
      };
      t.setTranslation({ x: s.x, y, z: 0 }, true);
      t.setNextKinematicTranslation({ x: s.x, y, z: 0 });
      shift(b);
      world.forEachRigidBody((rb) => {
        if (rb.userData && (rb.userData as { load?: boolean }).load) shift(rb as unknown as RapierRigidBody);
      });
    }
  });

  const lastV = useRef(new THREE.Vector3());
  const e = useMemo(() => new THREE.Euler(), []);
  const hub = useMemo(() => new THREE.Vector3(), []);
  const pivot = useMemo(() => new THREE.Vector3(), []);
  const coilTop = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const vc = controller.current;
    const b = trailer.current;
    if (!vc || !b) return;
    const s = state.current;
    // wheels + suspension, in chassis space
    WHEELS.forEach((w, i) => {
      const len = vc.wheelSuspensionLength(i) ?? REST;
      const side = Math.sign(w.z);
      hub.set(w.x, HARD_Y - len, w.z);
      const g = wheelRefs.current[i];
      if (g) {
        g.position.copy(hub);
        g.rotation.z = -s.dist / DIM.wheelR;
      }
      pivot.set(w.x + 0.6, HARD_Y - 0.06, side * (DIM.railZ + 0.03));
      const arm = armRefs.current[i];
      if (arm) placeBetween(arm, pivot, tmpA.set(w.x, hub.y, side * (DIM.trackZ - 0.2)), 0.07);
      const coil = coilRefs.current[i];
      coilTop.set(w.x + 0.22, HARD_Y + 0.04, side * (DIM.railZ + 0.06));
      if (coil) placeBetween(coil, tmpA.set(w.x + 0.12, hub.y + 0.06, side * (DIM.trackZ - 0.26)), coilTop, 0.05);
    });

    // bakkie follows the tow ball
    const tp = tow.current!.translation();
    if (bakkie.current) bakkie.current.position.set(tp.x, tp.y - COUPLER[1], tp.z);

    // readouts at ~12 Hz
    s.readT += dt;
    const lv = b.linvel();
    const vy = lv.y;
    const acc = (vy - s.lastVy) / Math.max(dt, 1e-3);
    s.lastVy = vy;
    s.g += (1 + acc / 9.81 - s.g) * 0.15;
    // peak vertical g at the floor over the last second or so (what you'd feel)
    const gRaw = Math.max(-2, Math.min(4, 1 + acc / 9.81));
    s.gPeak = Math.max(s.gPeak * Math.exp(-dt * 1.2), Math.abs(gRaw - 1));
    if (s.readT > 0.08) {
      s.readT = 0;
      const q = b.rotation();
      e.setFromQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w), "YXZ");
      let wheelN = 0;
      const travel = WHEELS.map((_, i) => {
        wheelN += vc.wheelSuspensionForce(i) ?? 0;
        return Math.round((REST - (vc.wheelSuspensionLength(i) ?? REST)) * 1000);
      });
      const loadKg = drive.loads.reduce((m, l) => m + LOADS[l.kind].kg, 0) + (drive.water ? 80 : 0);
      const gross = TARE + loadKg;
      // Static nose weight by moment balance about the axle group: what a scale under the
      // jockey wheel would read when parked level. Uses the real masses and positions in the sim.
      const qInv = new THREE.Quaternion(q.x, q.y, q.z, q.w).invert();
      const bp = b.translation();
      let m = 0;
      let mx = 0;
      const addBody = (rb: { mass(): number; worldCom(): { x: number; y: number; z: number } }) => {
        const c = rb.worldCom();
        const local = tmpB.set(c.x - bp.x, c.y - bp.y, c.z - bp.z).applyQuaternion(qInv);
        m += rb.mass();
        mx += rb.mass() * local.x;
      };
      addBody(b);
      if (water.current && drive.water) addBody(water.current);
      // a load counts only while it is on the deck; one that has left it is reported as loose
      let loose = 0;
      let shifted = 0;
      world.forEachRigidBody((rb) => {
        if (!(rb.userData as { load?: boolean } | undefined)?.load) return;
        const c = rb.translation();
        const l = tmpB.set(c.x - bp.x, c.y - bp.y, c.z - bp.z).applyQuaternion(qInv);
        const onDeck = Math.abs(l.x) < CFG.length / 2 + 0.2 && Math.abs(l.z) < DIM.bodyW / 2 + 0.2 && l.y > DIM.floorY - 0.2 && l.y < DIM.roofY + 0.2;
        if (onDeck) addBody(rb);
        else loose++;
        const h = homes.current.get(rb.handle);
        if (!h) homes.current.set(rb.handle, { x: l.x, z: l.z, t: performance.now() });
        else if (performance.now() - h.t < 2500) Object.assign(h, { x: l.x, z: l.z }); // still settling
        else if (Math.hypot(l.x - h.x, l.z - h.z) > 0.25) shifted++;
      });
      const comX = mx / Math.max(m, 1);
      const nose = (gross * (comX - AXLE_X)) / (COUPLER[0] - AXLE_X);
      // live hitch load from the suspension forces, heavily smoothed (it swings with every bump)
      s.nose += (gross - wheelN / 9.81 - s.nose) * 0.06;
      drive.readout = {
        kmh: Math.min(160, Math.round(Math.hypot(lv.x, lv.z) * 3.6)),
        travel,
        pitch: +THREE.MathUtils.radToDeg(e.z).toFixed(1),
        roll: +THREE.MathUtils.radToDeg(e.x).toFixed(1),
        g: +(1 + s.gPeak).toFixed(2),
        noseKg: Math.round(Math.max(-gross, Math.min(gross, nose))),
        liveNoseKg: Math.round(Math.max(-gross, Math.min(gross, s.nose))),
        loose,
        shifted,
        gross,
        ready: true,
      };
      drive.emit();
      lastV.current.set(lv.x, lv.y, lv.z);
      // safety net: if the trailer is flung or rolls over (e.g. a phone dropping frames), reset the rig
      const towV = state.current.v;
      if (Math.abs(e.x) > 1.0 || Math.abs(e.z) > 0.9 || Math.hypot(lv.x, lv.z) > towV + 12 || !Number.isFinite(bp.y)) drive.reset("The trailer left the road, so we reset the rig.");
    }
  });

  return (
    <>
      <RigidBody ref={tow} type="kinematicPosition" position={COUPLER} colliders={false} />
      <RigidBody
        ref={trailer}
        colliders={false}
        position={[0, 0.06, 0]}
        canSleep={false}
        linearDamping={0.05}
        angularDamping={0.4}
        ccd
        userData={{ trailer: true }}
      >
        {/* mass model: heavy chassis low down, light body shell above (≈ tare) */}
        <CuboidCollider args={[CFG.length / 2, 0.08, 0.62]} position={[0, DIM.railY, 0]} mass={TARE * 0.5} />
        <CuboidCollider args={[CFG.length / 2, 0.08, DIM.bodyW / 2]} position={[0, DIM.floorY - 0.08, 0]} mass={TARE * 0.12} />
        <CuboidCollider args={[CFG.length / 2, (DIM.roofY - DIM.floorY) / 2, 0.08]} position={[0, (DIM.roofY + DIM.floorY) / 2, DIM.bodyW / 2 + 0.06]} mass={TARE * 0.1} />
        <CuboidCollider args={[CFG.length / 2, (DIM.roofY - DIM.floorY) / 2, 0.08]} position={[0, (DIM.roofY + DIM.floorY) / 2, -DIM.bodyW / 2 - 0.06]} mass={TARE * 0.1} />
        <CuboidCollider args={[0.08, (DIM.roofY - DIM.floorY) / 2, DIM.bodyW / 2]} position={[CFG.length / 2 + 0.06, (DIM.roofY + DIM.floorY) / 2, 0]} mass={TARE * 0.05} />
        <CuboidCollider args={[0.08, (DIM.roofY - DIM.floorY) / 2, DIM.bodyW / 2]} position={[-CFG.length / 2 - 0.05, (DIM.roofY + DIM.floorY) / 2, 0]} mass={TARE * 0.06} />
        <CuboidCollider args={[CFG.length / 2, 0.08, DIM.bodyW / 2]} position={[0, DIM.roofY + 0.06, 0]} mass={TARE * 0.05} />
        <CuboidCollider args={[0.65, 0.05, 0.3]} position={[CFG.length / 2 + 0.65, DIM.coupleH + 0.03, 0]} mass={TARE * 0.02} />
        {statics.map((s) => (
          <mesh key={s.key} geometry={s.geo} material={s.mat} castShadow={!lite} receiveShadow={!lite} />
        ))}
        {WHEELS.map((w, i) => (
          <group key={i} ref={(g) => void (g && (wheelRefs.current[i] = g))} scale-z={Math.sign(w.z)}>
            {wheelGeo.map((b) => (
              <mesh key={b.mat} geometry={b.geo} material={mats[b.mat]} castShadow={!lite} />
            ))}
          </group>
        ))}
        {WHEELS.map((_, i) => (
          <mesh key={"a" + i} ref={(m) => void (m && (armRefs.current[i] = m))} geometry={unitBox} material={mats.galv} />
        ))}
        {WHEELS.map((_, i) => (
          <mesh key={"c" + i} ref={(m) => void (m && (coilRefs.current[i] = m))} geometry={unitCyl} material={mats.accent} />
        ))}
      </RigidBody>
      {/* water in the front tank, fixed to the chassis */}
      <WaterMass trailer={trailer} body={water} />
      {loads.map((l, k) => (
        <Load key={l.id} kind={l.kind} index={k} trailer={trailer} />
      ))}
      <group ref={bakkie}>
        <Bakkie />
      </group>
    </>
  );
}

function WaterMass({ trailer, body }: { trailer: React.RefObject<RapierRigidBody | null>; body: React.RefObject<RapierRigidBody | null> }) {
  const x = CFG.length / 2 - 1.2;
  useFixedJoint(trailer as React.RefObject<RapierRigidBody>, body as React.RefObject<RapierRigidBody>, [
    [x, DIM.railY - 0.15, 0],
    [0, 0, 0, 1],
    [0, 0, 0],
    [0, 0, 0, 1],
  ]);
  return (
    <RigidBody ref={body} position={[x, DIM.railY - 0.09, 0]} colliders={false}>
      <CuboidCollider args={[0.5, 0.09, 0.5]} mass={0.01} sensor />
    </RigidBody>
  );
}

/** Ratchet straps: a fixed joint holding the load at the pose it settled in. Mounted only while strapped. */
function Strap({ trailer, load }: { trailer: React.RefObject<RapierRigidBody | null>; load: React.RefObject<RapierRigidBody | null> }) {
  const [frame] = useState(() => {
    const a = trailer.current!;
    const b = load.current!;
    const pa = a.translation();
    const qa = a.rotation();
    const pb = b.translation();
    const qb = b.rotation();
    const qaInv = new THREE.Quaternion(qa.x, qa.y, qa.z, qa.w).invert();
    const rel = new THREE.Vector3(pb.x - pa.x, pb.y - pa.y, pb.z - pa.z).applyQuaternion(qaInv);
    const relQ = qaInv.multiply(new THREE.Quaternion(qb.x, qb.y, qb.z, qb.w));
    return [rel.toArray(), [relQ.x, relQ.y, relQ.z, relQ.w], [0, 0, 0], [0, 0, 0, 1]] as [
      [number, number, number],
      [number, number, number, number],
      [number, number, number],
      [number, number, number, number],
    ];
  });
  useFixedJoint(trailer as React.RefObject<RapierRigidBody>, load as React.RefObject<RapierRigidBody>, frame);
  return null;
}

function Load({ kind, index, trailer }: { kind: LoadKind; index: number; trailer: React.RefObject<RapierRigidBody | null> }) {
  const spec = LOADS[kind];
  const ref = useRef<RapierRigidBody>(null);
  const settled = useRef(0);
  const [landed, setLanded] = useState(false);
  const [strapped, setStrapped] = useState(drive.strapped);
  const [hs] = useState(() => spec.size.map((v) => v / 2) as [number, number, number]);
  // where it drops in, in trailer space
  const local = useMemo(() => {
    const zOff = kind === "bike" ? (index % 2 ? 0.45 : -0.45) : kind === "jerry" ? -0.7 + (index % 4) * 0.2 : 0;
    return new THREE.Vector3(spec.x, DIM.floorY + hs[1] + 0.35, zOff);
  }, [kind, index, spec.x, hs]);
  const [start] = useState(() => {
    const b = trailer.current;
    if (!b) return local.clone();
    const p = b.translation();
    const q = b.rotation();
    return local.clone().applyQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w)).add(new THREE.Vector3(p.x, p.y, p.z));
  });
  useEffect(() => {
    const f = () => setStrapped(drive.strapped);
    drive.listeners.add(f);
    return () => {
      drive.listeners.delete(f);
    };
  }, []);
  useFrame((_, dt) => {
    if (landed) return;
    settled.current += dt;
    const v = ref.current?.linvel();
    if (settled.current > 0.8 && v && Math.hypot(v.x, v.y, v.z) < 0.6) setLanded(true);
  });

  return (
    <>
      <RigidBody ref={ref} position={start.toArray()} colliders={false} userData={{ load: true }} ccd>
        <CuboidCollider args={hs} mass={spec.kg} friction={0.7} restitution={0.05} />
        <LoadMesh kind={kind} size={spec.size} />
      </RigidBody>
      {landed && strapped && <Strap trailer={trailer} load={ref} />}
    </>
  );
}

function LoadMesh({ kind, size }: { kind: LoadKind; size: [number, number, number] }) {
  const [x, y, z] = size;
  if (kind === "jerry")
    return (
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#3E5A2E" roughness={0.6} />
      </mesh>
    );
  const wheelR = kind === "quad" ? 0.26 : 0.34;
  const wx = x / 2 - wheelR;
  const wheelZ = kind === "quad" ? [z / 2 - 0.12, -z / 2 + 0.12] : [0];
  return (
    <group>
      <mesh position={[0, -y / 2 + wheelR + 0.22, 0]} castShadow>
        <boxGeometry args={[x * 0.62, y * 0.38, kind === "quad" ? z * 0.6 : z * 0.7]} />
        <meshStandardMaterial color={kind === "quad" ? "#B8352A" : "#E4E1D8"} roughness={0.45} />
      </mesh>
      <mesh position={[x * 0.05, y / 2 - 0.12, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, kind === "quad" ? z * 0.8 : 0.7]} />
        <meshStandardMaterial color="#1E2124" roughness={0.6} />
      </mesh>
      {[-wx, wx].flatMap((px) =>
        wheelZ.map((pz) => (
          <mesh key={`${px}${pz}`} position={[px, -y / 2 + wheelR, pz]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[wheelR, wheelR, kind === "quad" ? 0.22 : 0.1, 18]} />
            <meshStandardMaterial color="#151719" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Rear half of a double-cab bakkie with its tow bar. Origin at ground under the tow ball. */
function Bakkie() {
  const body = "#D9DCD8";
  return (
    <group position={[0.25, 0, 0]}>
      <mesh position={[1.3, 0.95, 0]} castShadow>
        <boxGeometry args={[2.2, 0.62, 1.86]} />
        <meshStandardMaterial color={body} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[2.9, 1.45, 0]} castShadow>
        <boxGeometry args={[1.6, 0.62, 1.7]} />
        <meshStandardMaterial color={body} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[2.9, 1.48, 0]}>
        <boxGeometry args={[1.62, 0.4, 1.72]} />
        <meshStandardMaterial color="#1A2026" roughness={0.1} />
      </mesh>
      <mesh position={[3.9, 0.95, 0]} castShadow>
        <boxGeometry args={[1.4, 0.62, 1.86]} />
        <meshStandardMaterial color={body} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.55, 0]}>
        <boxGeometry args={[0.16, 0.16, 1.9]} />
        <meshStandardMaterial color="#2A2D30" roughness={0.6} />
      </mesh>
      <mesh position={[0.05, 0.45, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.06]} />
        <meshStandardMaterial color="#2A2D30" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#B9C1C4" metalness={0.9} roughness={0.2} />
      </mesh>
      {[0.95, 3.85].flatMap((x) =>
        [0.82, -0.82].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.39, z]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.39, 0.39, 0.27, 24]} />
            <meshStandardMaterial color="#151719" roughness={0.9} />
          </mesh>
        )),
      )}
      {[0.86, -0.86].map((z) => (
        <mesh key={z} position={[0.22, 1.05, z]}>
          <boxGeometry args={[0.05, 0.28, 0.1]} />
          <meshStandardMaterial color="#5A0E0A" emissive="#FF2A14" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ camera */
const VIEWS = {
  chase: { off: new THREE.Vector3(-8.5, 3.2, 6.5), look: new THREE.Vector3(0.5, 0.9, 0) },
  wheel: { off: new THREE.Vector3(-1.3, 0.55, 3.4), look: new THREE.Vector3(-0.9, 0.45, 0.9) },
  side: { off: new THREE.Vector3(0.5, 1.2, 11.5), look: new THREE.Vector3(1.0, 1.0, 0) },
};
function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const last = useRef(new THREE.Vector3());
  const view = useRef(drive.view);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const d = (window as unknown as { __drive?: { body: RapierRigidBody } }).__drive;
    const c = controls.current;
    if (!d || !c) return;
    const p = d.body.translation();
    target.set(p.x, p.y, p.z);
    if (view.current !== drive.view || last.current.lengthSq() === 0) {
      view.current = drive.view;
      const v = VIEWS[drive.view];
      camera.position.copy(target).add(v.off);
      c.target.copy(target).add(v.look);
      last.current.copy(target);
    }
    // follow: move camera and orbit target by the trailer's motion
    const delta = tmpA.copy(target).sub(last.current);
    if (delta.lengthSq() > 100) delta.set(-TILE, 0, 0).setY(target.y - last.current.y); // teleport
    camera.position.add(delta);
    c.target.add(delta);
    last.current.copy(target);
    c.update();
  });
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={2.2} maxDistance={22} maxPolarAngle={Math.PI / 2 - 0.04} />;
}

export default function DriveScene({ surface, active = true, resetKey = 0 }: { surface: Surface; active?: boolean; resetKey?: number }) {
  const lite = typeof window !== "undefined" && (window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows={!lite}
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ fov: 34, near: 0.1, far: 300, position: [-8, 3.2, 7] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color("#E9E2D3");
        scene.fog = new THREE.Fog(new THREE.Color("#E9E2D3"), 30, 110);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <hemisphereLight args={["#fff8ec", "#a89577", 1.0]} />
      <directionalLight
        position={[18, 22, 10]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      >
        <object3D attach="target" position={[0, 0, 0]} />
      </directionalLight>
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffe2b8" position={[8, 2, -4]} rotation-y={-Math.PI / 2.5} scale={[8, 3, 1]} />
      </Environment>
      <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} key={`${surface}-${resetKey}`} paused={!active}>
        <Road surface={surface} lite={lite} />
        <Rig lite={lite} />
      </Physics>
      <CameraRig />
      <ShadowFollow />
    </Canvas>
  );
}

/** keep the sun's shadow camera centred on the trailer */
function ShadowFollow() {
  const { scene } = useThree();
  useFrame(() => {
    const d = (window as unknown as { __drive?: { body: RapierRigidBody } }).__drive;
    if (!d) return;
    const p = d.body.translation();
    scene.traverse((o) => {
      if ((o as THREE.DirectionalLight).isDirectionalLight) {
        const l = o as THREE.DirectionalLight;
        l.position.set(p.x + 18, 22, 10);
        l.target.position.set(p.x, 0, 0);
        l.target.updateMatrixWorld();
      }
    });
  });
  return null;
}

export { overallLength, PAPER };
