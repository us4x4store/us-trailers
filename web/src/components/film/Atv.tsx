"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { shapeGeometry } from "@/trailer/geometry";
import type { MatSet } from "@/trailer/materials";

/**
 * A generic sport ATV, about 2.0 × 1.15 × 1.15 m, built from real-proportioned parts:
 * fat low-pressure tyres on beadlock-style wheels, plastics, seat, bars, racks and a front bumper.
 * No maker's styling. Local x points to the ATV's front; y = 0 is the ground.
 */
export default function Atv({ mats, colour = "#B8352A" }: { mats: MatSet; colour?: string }) {
  const g = useMemo(() => {
    const plastic = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
    const black = new THREE.MeshStandardMaterial({ color: "#16181a", roughness: 0.6 });
    const seat = new THREE.MeshStandardMaterial({ color: "#1d1f22", roughness: 0.85 });
    const tyreF = shapeGeometry({ k: "tyre", r: 0.29, w: 0.22 });
    const tyreR = shapeGeometry({ k: "tyre", r: 0.3, w: 0.27 });
    const rim = shapeGeometry({ k: "wheelRim", r: 0.16, w: 0.18 });
    const rb = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r);
    return { plastic, black, seat, tyreF, tyreR, rim, rb };
  }, [colour]);

  const wheels: [number, number, THREE.BufferGeometry][] = [
    [0.62, 0.29, g.tyreF],
    [-0.62, 0.3, g.tyreR],
  ];
  return (
    <group>
      {wheels.flatMap(([x, r, tyre]) =>
        [1, -1].map((s) => (
          <group key={`${x}${s}`} position={[x, r, s * 0.46]} rotation-y={s > 0 ? 0 : Math.PI}>
            <mesh geometry={tyre} material={mats.rubber} castShadow />
            <mesh geometry={g.rim} material={mats.rim} />
          </group>
        )),
      )}
      {/* frame and engine block */}
      <mesh position={[0, 0.42, 0]} geometry={g.rb(1.1, 0.26, 0.42, 0.05)} material={g.black} castShadow />
      {/* front and rear plastics with fenders */}
      <mesh position={[0.56, 0.66, 0]} geometry={g.rb(0.62, 0.16, 1.0, 0.07)} material={g.plastic} castShadow />
      <mesh position={[-0.56, 0.66, 0]} geometry={g.rb(0.6, 0.16, 1.04, 0.07)} material={g.plastic} castShadow />
      <mesh position={[0.08, 0.7, 0]} geometry={g.rb(0.62, 0.24, 0.42, 0.08)} material={g.plastic} castShadow />
      {/* seat */}
      <mesh position={[-0.3, 0.86, 0]} geometry={g.rb(0.72, 0.12, 0.34, 0.05)} material={g.seat} castShadow />
      {/* handlebars and headlight pod */}
      <mesh position={[0.42, 0.98, 0]} rotation-x={Math.PI / 2} material={mats.galv}>
        <cylinderGeometry args={[0.014, 0.014, 0.82, 12]} />
      </mesh>
      <mesh position={[0.4, 0.86, 0]} rotation-z={-0.35} material={g.black}>
        <cylinderGeometry args={[0.03, 0.03, 0.26, 12]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0.42, 0.98, s * 0.37]} rotation-x={Math.PI / 2} material={g.black}>
          <cylinderGeometry args={[0.022, 0.022, 0.12, 12]} />
        </mesh>
      ))}
      <mesh position={[0.86, 0.62, 0]} geometry={g.rb(0.06, 0.1, 0.36, 0.02)} material={mats.ledWhite} />
      {/* racks and front bumper */}
      {[0.66, -0.66].map((x) => (
        <mesh key={x} position={[x, 0.79, 0]} geometry={g.rb(0.4, 0.025, 0.7, 0.012)} material={g.black} />
      ))}
      <mesh position={[0.98, 0.42, 0]} rotation-x={Math.PI / 2} material={g.black}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 12]} />
      </mesh>
    </group>
  );
}
