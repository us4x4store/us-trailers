"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildTrailer, overallLength, DIM, type TrailerConfig } from "@/trailer/model";
import { buildPartGeometry } from "@/trailer/geometry";
import { createMaterials, INK, PAPER } from "@/trailer/materials";

function Trailer({ cfg, lite }: { cfg: TrailerConfig; lite: boolean }) {
  const mats = useMemo(() => createMaterials(cfg.colour), []); // eslint-disable-line react-hooks/exhaustive-deps
  // structure changes rebuild geometry; colour changes only touch the material
  const key = `${cfg.length}-${cfg.axles}-${cfg.rack}-${cfg.solar}`;
  const meshes = useMemo(() => {
    const parts = buildTrailer(cfg);
    return parts.flatMap((p) => buildPartGeometry(p, lite).byMat.map((b) => ({ k: p.id + b.mat, geo: b.geo, mat: b.mat })));
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
    (mats.powder as THREE.MeshPhysicalMaterial).color.lerp(target.current, 1 - Math.exp(-dt * 8));
    if (settle.current < 1 && group.current) {
      settle.current = Math.min(1, settle.current + dt * 2.2);
      const k = settle.current;
      group.current.position.y = Math.sin(k * Math.PI) * 0.06 * (1 - k);
      group.current.scale.setScalar(0.985 + 0.015 * (1 - Math.pow(1 - k, 3)));
    }
  });

  const half = overallLength(cfg) / 2;
  const front = cfg.length / 2 + 1.53;
  return (
    <group ref={group} position-x={-(front - half) + 0.0}>
      {meshes.map((m) => (
        <mesh key={m.k} geometry={m.geo} material={mats[m.mat]} castShadow={!lite} receiveShadow={!lite} />
      ))}
      <Dimension from={-cfg.length / 2} to={front} z={DIM.bodyW / 2 + 0.75} label={`${Math.round(overallLength(cfg) * 1000).toLocaleString("en-ZA").replace(/,/g, " ")} mm overall`} />
    </group>
  );
}

/** Dimension text drawn to a canvas and laid flat on the ground, like lettering on a drawing. */
function DimLabel({ text, position }: { text: string; position: [number, number, number] }) {
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
function Dimension({ from, to, z, label }: { from: number; to: number; z: number; label: string }) {
  const geo = useMemo(() => {
    const y = 0.004;
    const pts = [from, y, z, to, y, z, from, y, z - 0.12, from, y, z + 0.12, to, y, z - 0.12, to, y, z + 0.12];
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

export default function ConfigScene({ cfg, active }: { cfg: TrailerConfig; active: boolean }) {
  const lite = typeof window !== "undefined" && (window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4);
  const controls = useRef(null);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      shadows={!lite}
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ fov: 30, near: 0.1, far: 100, position: [9.5, 4.2, 11] }}
      gl={{ antialias: true }}
      onCreated={({ scene, gl }) => {
        scene.background = PAPER.clone();
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <hemisphereLight args={["#ffffff", "#9aa3a0", 1.05]} />
      <directionalLight position={[6, 9, 6]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-8, 2, 4]} rotation-y={Math.PI / 2.5} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#ffd9a0" position={[8, 1.5, -4]} rotation-y={-Math.PI / 2.5} scale={[8, 3, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color={PAPER} roughness={1} />
      </mesh>
      <gridHelper args={[24, 48, INK, INK]} position-y={0.002} material-transparent material-opacity={0.22} />
      {!lite && <ContactShadows position={[0, 0.003, 0]} opacity={0.5} scale={14} blur={2.2} far={3} resolution={512} />}
      <Trailer cfg={cfg} lite={lite} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={6}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2 - 0.06}
        target={[0, 1.1, 0]}
        autoRotate={active}
        autoRotateSpeed={0.35}
      />
    </Canvas>
  );
}
