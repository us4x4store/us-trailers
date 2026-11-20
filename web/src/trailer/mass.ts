import * as THREE from "three";
import type { Mat, Part } from "./model";
import { buildPartGeometry } from "./geometry";

/**
 * Effective density (kg/m³) of each material AS MODELLED. Sections drawn as solid blocks are
 * really hollow (SHS, RHS, channel ≈ 20% steel), panels are drawn thicker than they are,
 * tyres are mostly air. So: real kg = modelled volume × effective density.
 */
export const DENSITY: Record<Mat, number> = {
  galv: 7850 * 0.2, // hollow steel sections
  powder: 375, // 3 mm aluminium composite drawn 12 mm thick (≈ 4.5 kg/m²)
  alu: 2700 * 0.3,
  checker: 2700 * 0.5, // 2-3 mm plate drawn 4-6 mm thick
  rubber: 260, // tyre carcass, not solid rubber
  rim: 420,
  brake: 7200,
  ply: 600, // marine ply, real thickness
  glass: 600,
  ledRed: 600,
  ledAmber: 600,
  ledWhite: 600,
  wire: 1500,
  solar: 214, // ≈ 12 kg per 200 W panel
  poly: 60, // empty tanks and shells are thin-walled
  accent: 7850 * 0.35, // springs, calipers, jerry holders
};

/** true material density (kg/m³) for sheet-metal boxes given a real wall thickness */
const SHEET: Partial<Record<Mat, number>> = { checker: 2700, alu: 2700, accent: 7850, galv: 7850, powder: 1500, poly: 950 };

function area(g: THREE.BufferGeometry): number {
  const p = g.attributes.position as THREE.BufferAttribute;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const idx = g.index;
  const n = idx ? idx.count : p.count;
  let s = 0;
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(p, idx ? idx.getX(i) : i);
    b.fromBufferAttribute(p, idx ? idx.getX(i + 1) : i + 1);
    c.fromBufferAttribute(p, idx ? idx.getX(i + 2) : i + 2);
    s += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
  }
  return s;
}

/** fixings, paint, sealant, wiring and fittings not drawn as parts */
export const UNDRAWN = 1.12;

function volume(g: THREE.BufferGeometry): number {
  // signed volume of a closed triangle mesh (divergence theorem); open shells come out close enough
  const p = g.attributes.position as THREE.BufferAttribute;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  let v = 0;
  const idx = g.index;
  const n = idx ? idx.count : p.count;
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(p, idx ? idx.getX(i) : i);
    b.fromBufferAttribute(p, idx ? idx.getX(i + 1) : i + 1);
    c.fromBufferAttribute(p, idx ? idx.getX(i + 2) : i + 2);
    v += a.dot(b.clone().cross(c)) / 6;
  }
  return Math.abs(v);
}

const cache = new Map<string, number>();
/** Real mass of one part in kg, from its geometry and materials. */
export function partMassKg(part: Part): number {
  const key = JSON.stringify(part.meshes);
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  let kg = 0;
  for (const m of part.meshes) {
    if (m.kg !== undefined) {
      kg += m.kg;
      continue;
    }
    const built = buildPartGeometry({ ...part, meshes: [m] }, true);
    for (const { mat, geo } of built.byMat) kg += m.shell ? area(geo) * m.shell * (SHEET[mat] ?? 2700) : volume(geo) * DENSITY[mat];
  }
  cache.set(key, kg);
  return kg;
}
