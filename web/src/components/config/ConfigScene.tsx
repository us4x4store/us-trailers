"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Finish, setupRenderer, StudioEnv } from "@/components/three/Studio";
import {
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import type { PartInfo } from "./Teardown";

// physics engine loads only when someone takes a trailer apart
const Teardown = lazy(() => import("./Teardown"));

export type TearState = {
  apart: boolean;
  tearing: boolean;
  onBack: () => void;
  onPick: (p: PartInfo | null) => void;
};
import * as THREE from "three";
import { buildTrailer, type TrailerConfig } from "@/trailer/model";
import { buildPartGeometry } from "@/trailer/geometry";
import { createMaterials, INK, PAPER } from "@/trailer/materials";

export type Light = "day" | "dusk" | "night";
/** 0 = day, 1 = dusk, 2 = night; eased so the light changes like a real evening, not a cut */
const env = { target: 0, k: 0 };
const LOOK = {
  bg: [
    new THREE.Color("#E6EAE5"),
    new THREE.Color("#C9A88E"),
    new THREE.Color("#10142A"),
  ],
  ground: [
    new THREE.Color("#E6EAE5"),
    new THREE.Color("#A88E77"),
    new THREE.Color("#1A1D2A"),
  ],
  sun: [
    new THREE.Color("#ffffff"),
    new THREE.Color("#ffc58f"),
    new THREE.Color("#8ea4ff"),
  ],
  sunI: [2.4, 1.6, 0.18],
  hemiI: [1.05, 0.7, 0.12],
  led: [0.25, 0.9, 4.2],
  work: [0, 0.4, 6],
};
const mix = (arr: number[], k: number) =>
  k <= 1
    ? arr[0] + (arr[1] - arr[0]) * k
    : arr[1] + (arr[2] - arr[1]) * (k - 1);
const mixC = (arr: THREE.Color[], k: number, out: THREE.Color) =>
  k <= 1
    ? out.copy(arr[0]).lerp(arr[1], k)
    : out.copy(arr[1]).lerp(arr[2], k - 1);

function LightRig() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const work = useRef<THREE.SpotLight>(null);
  const ground = useRef<THREE.MeshStandardMaterial>(null);
  const grid = useRef<THREE.GridHelper>(null);
  useFrame((state, dt) => {
    env.k += (env.target - env.k) * (1 - Math.exp(-dt * 2.4));
    const k = env.k;
    const bg = state.scene.background as THREE.Color;
    mixC(LOOK.bg, k, bg);
    if (ground.current) mixC(LOOK.ground, k, ground.current.color);
    if (sun.current) {
      mixC(LOOK.sun, k, sun.current.color);
      sun.current.intensity = mix(LOOK.sunI, k);
      sun.current.position.set(6 - k * 4, 9 - k * 3.5, 6);
    }
    if (hemi.current) hemi.current.intensity = mix(LOOK.hemiI, k);
    if (work.current) work.current.intensity = mix(LOOK.work, k);
    if (grid.current)
      (grid.current.material as THREE.Material).opacity =
        0.22 * Math.max(0, 1 - k);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#ffffff", "#9aa3a0", 1.05]} />
      <directionalLight
        ref={sun}
        position={[6, 9, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* awning work light over the side door, aimed at the ground */}
      <spotLight
        ref={work}
        position={[1.4, 2.6, 1.6]}
        angle={0.9}
        penumbra={0.7}
        distance={9}
        intensity={0}
        color="#ffe2b8"
        castShadow={false}
        target-position={[1.4, 0, 3]}
      />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial ref={ground} color={PAPER} roughness={1} />
      </mesh>
      <gridHelper
        ref={grid}
        args={[24, 48, INK, INK]}
        position-y={0.002}
        material-transparent
        material-opacity={0.22}
      />
    </>
  );
}

function Trailer({
  cfg,
  lite,
  tear,
}: {
  cfg: TrailerConfig;
  lite: boolean;
  tear?: TearState;
}) {
  const mats = useMemo(() => createMaterials(cfg.colour), []); // eslint-disable-line react-hooks/exhaustive-deps
  // structure changes rebuild geometry; colour changes only touch the material
  const key = `${cfg.kind ?? "toyhauler"}-${cfg.length}-${cfg.axles}-${cfg.rack}-${cfg.solar}`;
  const meshes = useMemo(() => {
    const parts = buildTrailer(cfg);
    return parts.flatMap((p) =>
      buildPartGeometry(p, lite).byMat.map((b) => ({
        k: p.id + b.mat,
        geo: b.geo,
        mat: b.mat,
      })),
    );
  }, [key, lite]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => meshes.forEach((m) => m.geo.dispose()), [meshes]);

  const target = useRef(new THREE.Color(cfg.colour));
  useEffect(() => {
    target.current.set(cfg.colour);
  }, [cfg.colour]);

  // a small "set down" settle each time the structure changes
  const group = useRef<THREE.Group>(null);
  const settle = useRef(1);
  useEffect(() => {
    settle.current = 0;
  }, [key]);
  useFrame((_, dt) => {
    (mats.powder as THREE.MeshPhysicalMaterial).color.lerp(
      target.current,
      1 - Math.exp(-dt * 8),
    );
    const led = mix(LOOK.led, env.k);
    (mats.ledRed as THREE.MeshStandardMaterial).emissiveIntensity = Math.min(
      led,
      1.4,
    ); // keep tail lights red, not blown out
    (mats.ledAmber as THREE.MeshStandardMaterial).emissiveIntensity = led;
    (mats.ledWhite as THREE.MeshStandardMaterial).emissiveIntensity = led * 1.2;
    if (settle.current < 1 && group.current) {
      settle.current = Math.min(1, settle.current + dt * 2.2);
      const k = settle.current;
      group.current.position.y = Math.sin(k * Math.PI) * 0.06 * (1 - k);
      group.current.scale.setScalar(0.985 + 0.015 * (1 - Math.pow(1 - k, 3)));
    }
  });

  // measure the real bounds of whichever kind this is, then centre it and dimension it
  const bounds = useMemo(() => {
    const box = new THREE.Box3();
    meshes.forEach((m) => {
      m.geo.computeBoundingBox();
      box.union(m.geo.boundingBox!);
    });
    return box;
  }, [meshes]);
  const cx = (bounds.min.x + bounds.max.x) / 2;
  return (
    <>
      {tear?.tearing && (
        <Suspense fallback={null}>
          <Teardown
            cfg={cfg}
            mats={mats}
            offsetX={-cx}
            apart={tear.apart}
            onBack={tear.onBack}
            onPick={tear.onPick}
            lite={lite}
          />
        </Suspense>
      )}
      <group ref={group} position-x={-cx} visible={!tear?.tearing}>
        {meshes.map((m) => (
          <mesh
            key={m.k}
            geometry={m.geo}
            material={mats[m.mat]}
            castShadow={!lite}
            receiveShadow={!lite}
          />
        ))}
        <Dimension
          from={bounds.min.x}
          to={bounds.max.x}
          z={bounds.max.z + 0.55}
          label={`${Math.round((bounds.max.x - bounds.min.x) * 1000)
            .toLocaleString("en-ZA")
            .replace(/,/g, " ")} mm overall`}
        />
      </group>
    </>
  );
}

/** Dimension text drawn to a canvas and laid flat on the ground, like lettering on a drawing. */
function DimLabel({
  text,
  position,
}: {
  text: string;
  position: [number, number, number];
}) {
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 96;
    const c = cv.getContext("2d")!;
    c.fillStyle = "#E6EAE5";
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = "#1F3B73";
    c.font = "500 52px 'IBM Plex Mono', ui-monospace, monospace";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text.toUpperCase(), cv.width / 2, cv.height / 2 + 2);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [text]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={position} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[2.6, 0.244]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Drafting dimension line on the ground, in brand ink. */
function Dimension({
  from,
  to,
  z,
  label,
}: {
  from: number;
  to: number;
  z: number;
  label: string;
}) {
  const geo = useMemo(() => {
    const y = 0.004;
    const pts = [
      from,
      y,
      z,
      to,
      y,
      z,
      from,
      y,
      z - 0.12,
      from,
      y,
      z + 0.12,
      to,
      y,
      z - 0.12,
      to,
      y,
      z + 0.12,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [from, to, z]);
  return (
    <>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={INK} />
      </lineSegments>
      <DimLabel text={label} position={[(from + to) / 2, 0.012, z + 0.3]} />
    </>
  );
}

export default function ConfigScene({
  cfg,
  active,
  light = "day",
  tear,
}: {
  cfg: TrailerConfig;
  active: boolean;
  light?: Light;
  tear?: TearState;
}) {
  env.target = light === "day" ? 0 : light === "dusk" ? 1 : 2;
  const lite =
    typeof window !== "undefined" &&
    (window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4);
  const controls = useRef(null);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows={!lite}
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ fov: 30, near: 0.1, far: 100, position: [9.5, 4.2, 11] }}
      gl={{ antialias: lite, preserveDrawingBuffer: process.env.NODE_ENV !== "production" }}
      onCreated={({ scene, gl, camera }) => {
        scene.background = PAPER.clone();
        if (process.env.NODE_ENV !== "production")
          (window as unknown as { __cfg: unknown }).__cfg = {
            gl,
            scene,
            camera,
            THREE,
          };
        setupRenderer(gl);
      }}
    >
      <LightRig />
      <StudioEnv resolution={lite ? 128 : 256} />

      {!lite && (
        <ContactShadows
          position={[0, 0.003, 0]}
          opacity={0.5}
          scale={14}
          blur={2.2}
          far={3}
          resolution={512}
        />
      )}
      <Trailer cfg={cfg} lite={lite} tear={tear} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={6}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2 - 0.06}
        target={[0, 1.1, 0]}
        autoRotate={
          active &&
          !(
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
        }
        autoRotateSpeed={0.35}
      />
      {!lite && <Finish />}
    </Canvas>
  );
}
