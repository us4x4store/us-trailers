import * as THREE from "three";
import { axlePositions, buildTrailer, DIM, GN, OFF, type Kind, type TrailerConfig } from "@/trailer/model";
import { RIG_CFG } from "./driveState";
import { partMassKg, UNDRAWN } from "@/trailer/mass";
import { buildPartGeometry } from "@/trailer/geometry";
import { tareKg } from "@/trailer/model";


export type MassBox = { half: [number, number, number]; pos: [number, number, number]; kg: number };

export type RigSpec = {
  kind: Kind;
  cfg: TrailerConfig;
  tare: number;
  /** hitch point in trailer space: tow ball (or gooseneck ball in the load bed) */
  coupler: [number, number, number];
  wheels: { x: number; z: number }[];
  wheelR: number;
  hardY: number;
  rest: number;
  axleX: number;
  railZ: number;
  trackZ: number;
  body: { L: number; W: number; floorY: number; roofY: number };
  /** every non-wheel part as a box carrying its real mass, so the centre of mass is the real one */
  massBoxes: MassBox[];
  /** where water sits (tank centre, trailer space) */
  tank: [number, number, number];
  /** bakkie placement relative to the hitch: gooseneck balls sit over the bakkie's rear axle */
  bakkieShift: number;
};

const cache = new Map<Kind, RigSpec>();
export function rigSpec(kind: Kind): RigSpec {
  const hit = cache.get(kind);
  if (hit) return hit;
  const cfg = RIG_CFG[kind];
  const L = cfg.length;
  const d = kind === "offroad" ? OFF : kind === "gooseneck" ? GN : DIM;
  const axles = axlePositions(cfg);
  const coupler: [number, number, number] =
    kind === "offroad" ? [L / 2 + OFF.drawbar, OFF.coupleH, 0] : kind === "gooseneck" ? [L / 2 + GN.neck - 0.6, GN.ballY, 0] : [L / 2 + 1.35, DIM.coupleH, 0];
  const parts = buildTrailer(cfg).filter((p) => !p.wheel);
  const massBoxes: MassBox[] = parts.map((p) => {
    const box = new THREE.Box3();
    buildPartGeometry(p, true).byMat.forEach((b) => {
      b.geo.computeBoundingBox();
      box.union(b.geo.boundingBox!);
    });
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    return { half: [Math.max(0.01, s.x / 2), Math.max(0.01, s.y / 2), Math.max(0.01, s.z / 2)], pos: [c.x, c.y, c.z], kg: partMassKg(p) * UNDRAWN };
  });
  const tank = parts.find((p) => p.id === "tank");
  const spec: RigSpec = {
    kind,
    cfg,
    tare: tareKg(cfg),
    coupler,
    wheels: axles.flatMap((x) => [
      { x, z: d.trackZ },
      { x, z: -d.trackZ },
    ]),
    wheelR: d.wheelR,
    hardY: d.railY,
    rest: d.railY - d.wheelR + 0.06, // ≈60 mm static sag puts the wheel centre at its radius
    axleX: axles.reduce((a, b) => a + b, 0) / axles.length,
    railZ: d.railZ,
    trackZ: d.trackZ,
    body: { L, W: d.bodyW, floorY: d.floorY, roofY: d.roofY },
    massBoxes,
    tank: tank ? (tank.meshes[0].p as [number, number, number]) : [L / 2 - 1.2, d.railY - 0.15, 0],
    bakkieShift: kind === "gooseneck" ? -1.2 : 0,
  };
  cache.set(kind, spec);
  return spec;
}
