"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildTrailer, DEFAULT_CONFIG, overallLength, type ChapterId, type Kind, type TrailerConfig } from "@/trailer/model";
import { buildPartGeometry, type BuiltPart } from "@/trailer/geometry";
import { partMassKg } from "@/trailer/mass";
import { createMaterials, INK, PAPER } from "@/trailer/materials";
import { sound } from "@/lib/sound";
import { RANGES, chapterAt, clamp01, easeInOut, easeOutCubic, easeSettle, film, partWindows } from "./timeline";

const REDUCED = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- camera path ---------------- */
type Key = { dir: [number, number, number]; dist: number; tgt: [number, number, number] };
/** Camera direction (from target), distance in metres, and look-at target for each chapter. */
const KEYS: Record<ChapterId, Key> = {
  drawing: { dir: [0, 0.08, 1], dist: 14, tgt: [0.5, 1.3, 0] },
  chassis: { dir: [1, 0.62, 0.95], dist: 9.5, tgt: [0.7, 0.6, 0] },
  running: { dir: [-0.2, 0.18, 1], dist: 5.4, tgt: [-0.7, 0.5, 0.6] },
  wheels: { dir: [0.65, 0.22, 1], dist: 7.8, tgt: [-0.6, 0.6, 0] },
  frame: { dir: [1, 0.75, 0.8], dist: 12, tgt: [0, 1.4, 0] },
  skin: { dir: [1, 0.3, 0.95], dist: 12.5, tgt: [0.2, 1.4, 0] },
  doors: { dir: [-1, 0.18, 0.55], dist: 10, tgt: [-1.2, 1.2, 0] },
  systems: { dir: [-0.9, 0.65, -0.75], dist: 12, tgt: [0, 1.6, 0] },
  finish: { dir: [0.95, 0.14, 1], dist: 12.5, tgt: [0.5, 1.2, 0] },
};
const ORDER = Object.keys(KEYS) as ChapterId[];
const centreOf = (id: ChapterId) => (RANGES[id][0] + RANGES[id][1]) / 2;
const keyPos = (k: Key, out: THREE.Vector3) => out.set(...k.dir).normalize().multiplyScalar(k.dist).add(v3.set(...k.tgt));

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();
function cameraAt(p: number, outPos: THREE.Vector3, outTgt: THREE.Vector3) {
  let i = 0;
  while (i < ORDER.length - 1 && p > centreOf(ORDER[i + 1])) i++;
  const a = ORDER[i];
  const b = ORDER[Math.min(i + 1, ORDER.length - 1)];
  const ca = centreOf(a);
  const cb = centreOf(b);
  const t = cb === ca ? 0 : easeInOut(clamp01((p - ca) / (cb - ca)));
  keyPos(KEYS[a], outPos).lerp(keyPos(KEYS[b], v1), t);
  outTgt.set(...KEYS[a].tgt).lerp(v2.set(...KEYS[b].tgt), t);
}

/**
 * Where the trailer should sit on screen (fractions of the viewport), so it lands in the
 * space between the text panels instead of behind them.
 */
function safeCentre(p: number, aspect: number) {
  const k = easeInOut(clamp01((p - RANGES.drawing[1] * 0.6) / (RANGES.drawing[1] * 0.6)));
  if (aspect >= 1) return { x: 0.7 + (0.56 - 0.7) * k, y: 0.56 + (0.54 - 0.56) * k };
  return { x: 0.5, y: 0.7 + (0.6 - 0.7) * k };
}

/* ---------------- weld sparks: simple ballistic particles with gravity and floor bounce ---------------- */
const SPARKS = 420;
function Sparks({ api }: { api: React.MutableRefObject<((at: THREE.Vector3, n: number) => void) | null> }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    g.setAttribute("life", new THREE.BufferAttribute(new Float32Array(SPARKS), 1));
    return g;
  }, []);
  const vel = useMemo(() => new Float32Array(SPARKS * 3), []);
  const cursor = useRef(0);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uSize: { value: 26 } },
        vertexShader: `attribute float life; varying float vL; uniform float uSize;
          void main(){ vL=life; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=uSize*life/-mv.z; gl_Position=projectionMatrix*mv; }`,
        fragmentShader: `varying float vL; void main(){ if(vL<=0.) discard; float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d)*vL;
          vec3 c=mix(vec3(1.,.45,.08),vec3(1.,.95,.8),vL); gl_FragColor=vec4(c,a); }`,
      }),
    [],
  );
  useEffect(() => {
    api.current = (at, n) => {
      const pos = geo.attributes.position.array as Float32Array;
      const life = geo.attributes.life.array as Float32Array;
      for (let k = 0; k < n; k++) {
        const i = cursor.current++ % SPARKS;
        pos[i * 3] = at.x;
        pos[i * 3 + 1] = at.y;
        pos[i * 3 + 2] = at.z;
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3.5;
        vel[i * 3] = Math.cos(a) * s;
        vel[i * 3 + 1] = 1 + Math.random() * 3.2;
        vel[i * 3 + 2] = Math.sin(a) * s;
        life[i] = 0.6 + Math.random() * 0.4;
      }
    };
  }, [api, geo, vel]);
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const pos = geo.attributes.position.array as Float32Array;
    const life = geo.attributes.life.array as Float32Array;
    let any = false;
    for (let i = 0; i < SPARKS; i++) {
      if (life[i] <= 0) continue;
      any = true;
      vel[i * 3 + 1] -= 9.81 * dt;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (pos[i * 3 + 1] < 0.01) {
        pos[i * 3 + 1] = 0.01;
        vel[i * 3 + 1] *= -0.35; // lose energy on the workshop floor
        vel[i * 3] *= 0.6;
        vel[i * 3 + 2] *= 0.6;
      }
      life[i] -= dt * 1.1;
    }
    if (any) {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.life.needsUpdate = true;
    }
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/* ---------------- the trailer ---------------- */
type Runtime = {
  built: BuiltPart;
  group: THREE.Group;
  pivot: THREE.Group;
  solid: THREE.Group;
  lines: THREE.LineSegments;
  mats: THREE.Material[];
  landed: boolean;
};

function Trailer({ lite, sparks, kind }: { lite: boolean; sparks: React.MutableRefObject<((at: THREE.Vector3, n: number) => void) | null>; kind: Kind }) {
  const root = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const cfg = useMemo<TrailerConfig>(() => (kind === "toyhauler" ? DEFAULT_CONFIG : kind === "offroad" ? { ...DEFAULT_CONFIG, kind, length: 3.0, axles: 1, rack: false } : { ...DEFAULT_CONFIG, kind, length: 7.2, axles: 2, rack: false }), [kind]);
  const parts = useMemo(() => buildTrailer(cfg), [cfg]);
  useEffect(() => {
    film.masses = parts.map((p) => partMassKg(p));
    film.emit();
  }, [parts]);
  // camera framing was set for the 6.3 m toy hauler; scale it to this trailer's size
  const scale = overallLength(cfg) / overallLength(DEFAULT_CONFIG);
  const windows = useMemo(() => partWindows(parts), [parts]);
  const runtime = useMemo<Runtime[]>(() => {
    const base = createMaterials(cfg.colour);
    return parts.map((part) => {
      const built = buildPartGeometry(part, lite);
      const group = new THREE.Group();
      const pivot = new THREE.Group();
      const solid = new THREE.Group();
      const mats: THREE.Material[] = [];
      if (part.hinge) {
        pivot.position.set(...part.hinge.origin);
        solid.position.set(-part.hinge.origin[0], -part.hinge.origin[1], -part.hinge.origin[2]);
      }
      built.byMat.forEach(({ mat, geo }) => {
        const m = base[mat].clone();
        m.transparent = true;
        mats.push(m);
        const mesh = new THREE.Mesh(geo, m);
        mesh.castShadow = !lite;
        mesh.receiveShadow = !lite;
        mesh.userData.partIndex = parts.indexOf(part);
        solid.add(mesh);
      });
      pivot.add(solid);
      group.add(pivot);
      const lines = new THREE.LineSegments(built.edges, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.9 }));
      group.add(lines);
      return { built, group, pivot, solid, lines, mats, landed: false };
    });
  }, [parts, lite]);

  useEffect(() => {
    const r = root.current!;
    runtime.forEach((rt) => r.add(rt.group));
    return () => {
      runtime.forEach((rt) => r.remove(rt.group));
    };
  }, [runtime]);

  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camTgt = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const explodeS = useRef(0);
  const rampS = useRef(0);
  const lightS = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    // smooth the scroll value so fast flicks still read as motion
    film.ps += (film.p - film.ps) * (1 - Math.exp(-dt * 6));
    const p = film.ps;
    const drawEnd = RANGES.drawing[1];
    const finishK = clamp01((p - RANGES.finish[0]) / (RANGES.finish[1] - RANGES.finish[0]));

    explodeS.current += (film.explode - explodeS.current) * (1 - Math.exp(-dt * 5));
    rampS.current += ((film.ramp || finishK > 0.45 ? 1 : 0) - rampS.current) * (1 - Math.exp(-dt * 2.2));
    lightS.current += ((film.lights || finishK > 0.25 ? 1 : 0) - lightS.current) * (1 - Math.exp(-dt * 3));

    let active = -1;
    runtime.forEach((rt, i) => {
      const w = windows[i];
      const part = rt.built.part;
      // blueprint lines: drawn progressively during chapter 00, then fade as steel arrives
      const drawK = clamp01((p - (i / runtime.length) * drawEnd * 0.8) / (drawEnd * 0.35));
      const count = rt.built.edges.attributes.position.count;
      rt.lines.geometry.setDrawRange(0, Math.floor(count * drawK));
      const k = clamp01((p - w.start) / (w.end - w.start));
      const lm = rt.lines.material as THREE.LineBasicMaterial;
      lm.opacity = 0.85 * (1 - easeOutCubic(clamp01((k - 0.55) / 0.45))) * (1 - finishK);
      rt.lines.visible = lm.opacity > 0.01 && drawK > 0;

      // solid part flies in and settles
      const e = easeSettle(k);
      const fly = REDUCED ? 0 : 1 - e;
      const ex = explodeS.current;
      rt.group.position.set(part.from[0] * fly + part.explode[0] * ex, part.from[1] * fly + part.explode[1] * ex, part.from[2] * fly + part.explode[2] * ex);
      rt.solid.visible = k > 0;
      const op = clamp01(k / 0.35);
      rt.mats.forEach((m) => {
        m.opacity = op;
        const opaque = op >= 0.999;
        if (m.transparent === opaque) {
          m.transparent = !opaque;
          m.needsUpdate = true;
        }
      });
      // lines stay where the part will land
      rt.lines.position.set(-rt.group.position.x, -rt.group.position.y, -rt.group.position.z);

      // weld sparks the moment a steel part lands
      if (k >= 0.98 && !rt.landed) {
        rt.landed = true;
        const settled = film.ps > drawEnd && Math.abs(film.p - film.ps) < 0.03;
        if (part.weld && sparks.current && settled) {
          if (!REDUCED) sparks.current(tmp.set(...part.anchor), lite ? 40 : 90);
          sound.weld();
        } else if (settled) sound.clank();
      } else if (k < 0.9) rt.landed = false;
      if (k > 0 && k < 1) active = i;
      if (k >= 1 && active === -1 && p < w.end + 0.03) active = i;

      // hinges
      if (part.hinge) {
        const open = part.id === "ramp" ? rampS.current : rampS.current * 0.75;
        rt.pivot.setRotationFromAxisAngle(tmp.set(...part.hinge.axis), (part.id === "ramp" ? -1 : 1) * part.hinge.open * easeInOut(open));
      }
      // lights
      if (part.id === "lights") {
        rt.mats.forEach((m) => {
          const sm = m as THREE.MeshStandardMaterial;
          sm.emissiveIntensity = 0.25 + lightS.current * 3.2;
        });
      }
    });

    if (film.pinned >= 0) active = film.pinned;
    if (active !== film.active) {
      film.active = active;
      film.emit();
    }

    // camera with pointer parallax
    cameraAt(p, camPos, camTgt);
    camPos.sub(camTgt).multiplyScalar(0.25 + 0.75 * scale).add(camTgt);
    camTgt.x *= scale;
    camPos.x += camTgt.x - camTgt.x / scale;
    const aspect = size.width / size.height;
    const sc = safeCentre(p, aspect);
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.setViewOffset(size.width, size.height, -(sc.x - 0.5) * size.width, -(sc.y - 0.5) * size.height, size.width, size.height);
    const fit = aspect < 1 ? Math.min(2.1, 1.05 / aspect) : 1;
    camPos.sub(camTgt).multiplyScalar(fit).add(camTgt);
    if (!REDUCED) {
      camPos.x += pointer.current.x * 0.5;
      camPos.y -= pointer.current.y * 0.3;
    }
    state.camera.position.lerp(camPos, 1 - Math.exp(-dt * 8));
    look.lerp(camTgt, 1 - Math.exp(-dt * 8));
    state.camera.lookAt(look);

    // background: drafting paper -> Karoo dusk at handover
    const bg = state.scene.background as THREE.Color;
    bg.copy(PAPER).lerp(DUSK, easeInOut(finishK));
    const fog = state.scene.fog as THREE.Fog;
    fog.color.copy(bg);

    // label leader
    if (film.label && active >= 0) {
      const part = runtime[active].built.part;
      proj.set(...part.anchor).add(runtime[active].group.position).project(camera);
      const x = Math.min(size.width - 12, Math.max(12, (proj.x * 0.5 + 0.5) * size.width));
      const y = Math.min(size.height - 12, Math.max(12, (-proj.y * 0.5 + 0.5) * size.height));
      film.label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      film.label.style.opacity = proj.z < 1 ? "1" : "0";
      // card: beside the part, but always fully on screen; a leader line joins them
      const card = film.label.querySelector<HTMLElement>("[data-card]");
      const leader = film.label.querySelector<HTMLElement>("[data-leader]");
      if (card && leader) {
        const cw = card.offsetWidth;
        const chh = card.offsetHeight;
        const gap = 28;
        const pad = 16;
        const wantLeft = x > size.width * 0.55 ? x - gap - cw : x + gap;
        const left = Math.min(size.width - pad - cw, Math.max(pad, wantLeft));
        const wantTop = y < size.height * 0.34 ? y + gap : y - gap - chh;
        let top = Math.min(size.height - 150 - chh, Math.max(80, wantTop));
        let leftAdj = left;
        // keep clear of the chapter text and the parts list
        for (const el of film.avoid) {
          if (!el || el.offsetParent === null) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || getComputedStyle(el).opacity === "0") continue;
          const hit = leftAdj < r.right + 8 && leftAdj + cw > r.left - 8 && top < r.bottom + 8 && top + chh > r.top - 8;
          if (!hit) continue;
          if (r.width > size.width * 0.5) top = r.bottom + 12; // full-width block (phones): go below it
          else if (r.left > size.width / 2) leftAdj = Math.max(pad, r.left - 12 - cw); // right column: go left of it
          else leftAdj = Math.min(size.width - pad - cw, r.right + 12); // left column: go right of it
        }
        top = Math.min(size.height - 150 - chh, top);
        card.style.transform = `translate3d(${(leftAdj - x).toFixed(1)}px, ${(top - y).toFixed(1)}px, 0)`;
        // leader from the part to the nearest point on the card
        const nx = Math.min(leftAdj + cw, Math.max(leftAdj, x)) - x;
        const ny = Math.min(top + chh, Math.max(top, y)) - y;
        const len = Math.hypot(nx, ny);
        leader.style.width = `${len.toFixed(1)}px`;
        leader.style.transform = `rotate(${Math.atan2(ny, nx)}rad)`;
      }
    }
  });

  return (
    <group
      ref={root}
      onClick={(e) => {
        e.stopPropagation();
        const idx = e.object.userData.partIndex;
        if (typeof idx === "number") {
          film.pinned = film.pinned === idx ? -1 : idx;
        }
      }}
      onPointerMissed={() => (film.pinned = -1)}
    />
  );
}

const DUSK = new THREE.Color("#1A1F36");

function Floor() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const finishK = clamp01((film.ps - RANGES.finish[0]) / (RANGES.finish[1] - RANGES.finish[0]));
    const m = ref.current!.material as THREE.MeshStandardMaterial;
    m.color.copy(PAPER).lerp(GROUND, easeInOut(finishK));
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
      <circleGeometry args={[40, 64]} />
      <meshStandardMaterial color={PAPER} roughness={1} />
    </mesh>
  );
}
const GROUND = new THREE.Color("#2A2620");

function GridLines() {
  // drafting grid on the floor: 500 mm squares
  const ref = useRef<THREE.GridHelper>(null);
  useFrame(() => {
    const finishK = clamp01((film.ps - RANGES.finish[0]) / (RANGES.finish[1] - RANGES.finish[0]));
    const m = ref.current!.material as THREE.Material;
    m.opacity = 0.35 * (1 - finishK);
  });
  return <gridHelper ref={ref} args={[30, 60, INK, INK]} position-y={0.002} material-transparent material-opacity={0.35} />;
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    const finishK = easeInOut(clamp01((film.ps - RANGES.finish[0]) / (RANGES.finish[1] - RANGES.finish[0])));
    key.current!.intensity = 2.6 - finishK * 1.9;
    key.current!.color.setRGB(1, 1 - finishK * 0.35, 1 - finishK * 0.6);
    hemi.current!.intensity = 1.1 - finishK * 0.75;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#ffffff", "#9aa3a0", 1.1]} />
      <directionalLight
        ref={key}
        position={[6, 9, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
    </>
  );
}

export default function FilmScene({ active = true, kind = "toyhauler" }: { active?: boolean; kind?: Kind }) {
  const sparks = useRef<((at: THREE.Vector3, n: number) => void) | null>(null);
  const lite = typeof window !== "undefined" && (window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows={!lite}
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ fov: 32, near: 0.1, far: 140, position: [0.5, 2.4, 14] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ scene, gl, camera }) => {
        scene.background = PAPER.clone();
        scene.fog = new THREE.Fog(PAPER.clone(), 24, 60);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __film: unknown }).__film = { scene, gl, camera, film };
      }}
    >
      <Lights />
      <Environment resolution={lite ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-8, 2, 4]} rotation-y={Math.PI / 2.5} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9a0" position={[8, 1.5, -4]} rotation-y={-Math.PI / 2.5} scale={[8, 3, 1]} />
      </Environment>
      <Floor />
      <GridLines />
      {!lite && <ContactShadows position={[0, 0.004, 0]} opacity={0.45} scale={14} blur={2.4} far={3} resolution={512} />}
      <Trailer key={kind} lite={lite} sparks={sparks} kind={kind} />
      <Sparks api={sparks} />
    </Canvas>
  );
}

export { chapterAt };
