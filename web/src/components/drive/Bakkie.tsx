"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { shapeGeometry } from "@/trailer/geometry";
import type { MatSet } from "@/trailer/materials";

/*
 * A generic double-cab 4×4 bakkie, drawn from a side profile rather than boxes:
 * raked screen, cab, open load bed, cut wheel arches, flares, steps, lights, real wheels.
 * Local x points forward; the tow ball sits at x = -0.2 (unchanged, the physics hitch to it).
 * No maker's styling or badges: it stands for "your bakkie".
 */

const W = 1.84; // body width, m
const R_AX = 0.95; // rear axle x
const F_AX = 3.85; // front axle x
const WHEEL_R = 0.39;
const ARCH = 0.5;

function bodyProfile() {
  const s = new THREE.Shape();
  const arch = (cx: number, from: number, to: number) => {
    // wheel arch: semicircle over the wheel, walked from `from` to `to` along the bottom edge
    s.lineTo(from, 0.5);
    // walking +x along the bottom, the arch goes up and over: from angle π down to 0, clockwise
    s.absarc(cx, 0.42, ARCH, Math.acos((from - cx) / ARCH), Math.acos((to - cx) / ARCH), true);
  };
  // start at the rear, bottom of the tailgate, and go round anticlockwise (bottom edge first)
  s.moveTo(0.15, 0.5);
  s.lineTo(R_AX - ARCH, 0.5);
  arch(R_AX, R_AX - ARCH, R_AX + ARCH);
  s.lineTo(F_AX - ARCH, 0.5);
  arch(F_AX, F_AX - ARCH, F_AX + ARCH);
  s.lineTo(4.72, 0.5);
  // nose and bonnet
  s.quadraticCurveTo(4.86, 0.52, 4.86, 0.7);
  s.lineTo(4.84, 1.0);
  s.quadraticCurveTo(4.8, 1.08, 4.6, 1.1);
  s.lineTo(3.55, 1.17);
  // windscreen, roof, back of the cab
  s.lineTo(3.0, 1.76);
  s.quadraticCurveTo(2.9, 1.82, 2.75, 1.82);
  s.lineTo(1.98, 1.82);
  s.quadraticCurveTo(1.86, 1.81, 1.84, 1.7);
  s.lineTo(1.8, 1.14);
  // drop to the bed floor (the bed is open; its walls are separate)
  s.lineTo(1.76, 0.78);
  s.lineTo(0.15, 0.78);
  s.closePath();
  return s;
}

function sideGlass() {
  const s = new THREE.Shape();
  s.moveTo(1.93, 1.24);
  s.lineTo(1.96, 1.72);
  s.quadraticCurveTo(1.98, 1.76, 2.05, 1.76);
  s.lineTo(2.92, 1.76);
  s.lineTo(3.38, 1.24);
  s.closePath();
  return s;
}

export default function Bakkie({ mats }: { mats: MatSet }) {
  const { body, glass, flare } = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(bodyProfile(), { depth: W - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 24 });
    body.translate(0, 0, -(W - 0.12) / 2);
    const glass = new THREE.ExtrudeGeometry(sideGlass(), { depth: W + 0.004, bevelEnabled: false });
    glass.translate(0, 0, -(W + 0.004) / 2);
    const flare = new THREE.TorusGeometry(ARCH + 0.02, 0.045, 8, 32, Math.PI);
    return { body, glass, flare };
  }, []);
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#E9EBE7", roughness: 0.28, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.08 }), []);
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C1F22", roughness: 0.55, metalness: 0.1 }), []);
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: "#C9CED2", roughness: 0.18, metalness: 1 }), []);
  const tyre = useMemo(() => shapeGeometry({ k: "tyre", r: WHEEL_R, w: 0.27 }), []);
  const rim = useMemo(() => shapeGeometry({ k: "wheelRim", r: 0.22, w: 0.22 }), []);

  return (
    <group position={[0.25, 0, 0]}>
      <mesh geometry={body} material={paint} castShadow receiveShadow />
      {/* tinted side glass, split by the B-pillar */}
      <mesh geometry={glass} material={mats.glass} />
      <mesh position={[2.62, 1.5, 0]} material={paint}>
        <boxGeometry args={[0.09, 0.56, W + 0.012]} />
      </mesh>
      {/* windscreen and rear window */}
      <mesh position={[3.3, 1.49, 0]} rotation-z={-0.82} material={mats.glass}>
        <boxGeometry args={[0.8, 0.012, W - 0.2]} />
      </mesh>
      <mesh position={[1.765, 1.46, 0]} material={mats.glass}>
        <boxGeometry args={[0.012, 0.36, W - 0.4]} />
      </mesh>
      {/* load bed: walls, tailgate, floor */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.96, 0.96, s * (W / 2 - 0.04)]} material={paint} castShadow>
          <boxGeometry args={[1.62, 0.36, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0.17, 0.96, 0]} material={paint} castShadow>
        <boxGeometry args={[0.06, 0.36, W - 0.06]} />
      </mesh>
      <mesh position={[0.96, 0.79, 0]} material={trim}>
        <boxGeometry args={[1.6, 0.02, W - 0.16]} />
      </mesh>
      {/* front: grille, headlights, bumper and bash plate */}
      <mesh position={[4.9, 0.84, 0]} material={trim}>
        <boxGeometry args={[0.04, 0.26, 0.96]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[4.9, 0.95, s * 0.66]} material={mats.ledWhite}>
          <boxGeometry args={[0.04, 0.1, 0.32]} />
        </mesh>
      ))}
      <mesh position={[4.9, 0.56, 0]} material={trim} castShadow>
        <boxGeometry args={[0.14, 0.18, W - 0.02]} />
      </mesh>
      {/* rear bumper, tail lights */}
      <mesh position={[0.1, 0.56, 0]} material={chrome}>
        <boxGeometry args={[0.14, 0.12, W - 0.04]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.13, 1.0, s * (W / 2 - 0.05)]} material={mats.ledRed}>
          <boxGeometry args={[0.04, 0.26, 0.1]} />
        </mesh>
      ))}
      {/* mirrors, side steps, flares */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[3.32, 1.3, s * (W / 2 + 0.12)]} material={trim}>
            <boxGeometry args={[0.12, 0.16, 0.18]} />
          </mesh>
          <mesh position={[2.55, 0.46, s * (W / 2 + 0.04)]} material={trim} castShadow>
            <boxGeometry args={[1.6, 0.05, 0.16]} />
          </mesh>
          {[R_AX, F_AX].map((x) => (
            <mesh key={x} geometry={flare} material={trim} position={[x, 0.42, s * (W / 2 + 0.005)]} />
          ))}
        </group>
      ))}
      {/* tow bar and ball (the physics hitches here) */}
      <mesh position={[0.15, 0.55, 0]} material={trim}>
        <boxGeometry args={[0.16, 0.16, 0.3]} />
      </mesh>
      <mesh position={[0.05, 0.45, 0]} material={trim}>
        <boxGeometry args={[0.35, 0.06, 0.06]} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0]} material={chrome}>
        <sphereGeometry args={[0.025, 16, 16]} />
      </mesh>
      {/* wheels: the same tyres and steel wheels as the trailer, sized for a bakkie */}
      {[R_AX, F_AX].flatMap((x) =>
        [1, -1].map((s) => (
          <group key={`${x}${s}`} position={[x, WHEEL_R, s * 0.8]} rotation-y={s > 0 ? 0 : Math.PI}>
            <mesh geometry={tyre} material={mats.rubber} castShadow />
            <mesh geometry={rim} material={mats.rim} />
          </group>
        )),
      )}
    </group>
  );
}
