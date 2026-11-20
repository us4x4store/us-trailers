"use client";

import { useFrame } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildTrailer, type Part, type TrailerConfig } from "@/trailer/model";
import { buildPartGeometry } from "@/trailer/geometry";
import { partMassKg } from "@/trailer/mass";
import type { MatSet } from "@/trailer/materials";

export type PartInfo = { name: string; job: string; material: string; spec: string; kg: number };

type Piece = {
  part: Part;
  kg: number;
  centre: THREE.Vector3;
  half: [number, number, number];
  geos: { mat: keyof MatSet; geo: THREE.BufferGeometry }[];
};

/**
 * "Take it apart": every part becomes its own rigid body with its real mass and a box collider
 * fitted to its own bounds, so heavy rails thud and light lights scatter. "Put it back" flies
 * each part home from wherever it landed.
 */
export default function Teardown({
  cfg,
  mats,
  offsetX,
  apart,
  onBack,
  onPick,
  lite,
}: {
  cfg: TrailerConfig;
  mats: MatSet;
  offsetX: number;
  apart: boolean;
  onBack: () => void;
  onPick: (p: PartInfo | null) => void;
  lite: boolean;
}) {
  const pieces = useMemo<Piece[]>(() => {
    return buildTrailer(cfg).map((part) => {
      const built = buildPartGeometry(part, true);
      const box = new THREE.Box3();
      built.byMat.forEach((b) => {
        b.geo.computeBoundingBox();
        box.union(b.geo.boundingBox!);
      });
      const centre = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      // each part's geometry re-centred on its own centre of mass (approximated by its bounds)
      const geos = built.byMat.map((b) => ({ mat: b.mat as keyof MatSet, geo: b.geo.clone().translate(-centre.x, -centre.y, -centre.z) }));
      return {
        part,
        kg: Math.max(0.5, partMassKg(part)),
        centre,
        half: [Math.max(0.02, size.x / 2), Math.max(0.02, size.y / 2), Math.max(0.02, size.z / 2)],
        geos,
      };
    });
  }, [cfg]);
  useEffect(() => () => pieces.forEach((p) => p.geos.forEach((g) => g.geo.dispose())), [pieces]);

  // where each part came to rest, captured each frame while physics runs
  const rest = useRef<{ p: THREE.Vector3; q: THREE.Quaternion }[]>([]);
  const bodies = useRef<(RapierRigidBody | null)[]>([]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const [phase, setPhase] = useState<"falling" | "returning">("falling");
  const t = useRef(0);

  useEffect(() => {
    if (!apart && phase === "falling") {
      // freeze where everything landed, then fly home
      rest.current = pieces.map((pc, i) => {
        const b = bodies.current[i];
        const tr = b?.translation();
        const ro = b?.rotation();
        return { p: tr ? new THREE.Vector3(tr.x, tr.y, tr.z) : pc.centre.clone(), q: ro ? new THREE.Quaternion(ro.x, ro.y, ro.z, ro.w) : new THREE.Quaternion() };
      });
      t.current = 0;
      setPhase("returning");
      onPick(null);
    }
  }, [apart, phase, pieces, onPick]);

  const qHome = useMemo(() => new THREE.Quaternion(), []);
  useFrame((_, dt) => {
    if (phase !== "returning") return;
    t.current = Math.min(1, t.current + dt / 1.4);
    pieces.forEach((pc, i) => {
      const g = groups.current[i];
      const r = rest.current[i];
      if (!g || !r) return;
      // stagger: heavy structure first, then the parts that hang off it
      const k = THREE.MathUtils.clamp((t.current - (i / pieces.length) * 0.35) / 0.65, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      g.position.copy(r.p).lerp(pc.centre, e);
      g.position.y += Math.sin(e * Math.PI) * 0.6;
      g.quaternion.copy(r.q).slerp(qHome, e);
    });
    if (t.current >= 1) onBack();
  });

  const meshesOf = (pc: Piece, i: number) =>
    pc.geos.map((g) => (
      <mesh
        key={g.mat}
        geometry={g.geo}
        material={mats[g.mat]}
        castShadow={!lite}
        onClick={(e) => {
          e.stopPropagation();
          onPick({ name: pc.part.name, job: pc.part.job, material: pc.part.material, spec: pc.part.spec, kg: pc.kg });
        }}
        userData={{ piece: i }}
      />
    ));

  if (phase === "returning")
    return (
      <group position-x={offsetX}>
        {pieces.map((pc, i) => (
          <group key={pc.part.id} ref={(g) => void (groups.current[i] = g)}>
            {meshesOf(pc, i)}
          </group>
        ))}
      </group>
    );

  return (
    <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60}>
      {/* workshop floor */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[20, 0.1, 20]} position={[0, -0.1, 0]} friction={0.9} />
      </RigidBody>
      <group position-x={offsetX}>
        {pieces.map((pc, i) => (
          <Body key={pc.part.id} pc={pc} index={i} bodies={bodies}>
            {meshesOf(pc, i)}
          </Body>
        ))}
      </group>
    </Physics>
  );
}

/** One part as a rigid body: its own mass, its own box, and a push away from the trailer. */
function Body({ pc, index, bodies, children }: { pc: Piece; index: number; bodies: React.RefObject<(RapierRigidBody | null)[]>; children: React.ReactNode }) {
  const ref = useRef<RapierRigidBody>(null);
  useEffect(() => {
    const b = ref.current;
    bodies.current[index] = b;
    if (!b) return;
    // unbolt: each part is pushed out along its explode direction and given a small spin
    const d = new THREE.Vector3(...pc.part.explode);
    if (d.lengthSq() < 1e-4) d.set(0, 1, 0);
    d.normalize();
    const m = b.mass();
    b.applyImpulse({ x: d.x * m * 1.6, y: (Math.max(0, d.y) * 1.6 + 1.2) * m, z: d.z * m * 1.6 }, true);
    b.applyTorqueImpulse({ x: (Math.random() - 0.5) * m * 0.3, y: (Math.random() - 0.5) * m * 0.3, z: (Math.random() - 0.5) * m * 0.3 }, true);
  }, [bodies, index, pc]);
  return (
    <RigidBody ref={ref} position={pc.centre.toArray()} colliders={false} linearDamping={0.15} angularDamping={0.4}>
      <CuboidCollider args={pc.half} mass={pc.kg} friction={0.7} restitution={0.15} />
      {children}
    </RigidBody>
  );
}
