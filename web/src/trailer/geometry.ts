import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Mat, MeshSpec, Part, Shape, V3 } from "./model";

const tmpQ = new THREE.Quaternion();
const up = new THREE.Vector3(0, 1, 0);

function between(g: THREE.BufferGeometry, a: V3, b: V3) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  g.scale(1, len, 1);
  tmpQ.setFromUnitVectors(up, dir.normalize());
  g.applyQuaternion(tmpQ);
  const mid = va.add(vb).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

class HelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private r: number, private turns: number) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2 * this.turns;
    return target.set(Math.cos(a) * this.r, t - 0.5, Math.sin(a) * this.r);
  }
}

/** Real steel and panels never have knife edges: a small radius catches the light along every edge. */
function rounded(w: number, h: number, d: number, lite: boolean) {
  const min = Math.min(w, h, d);
  const r = Math.min(0.014, min * 0.3);
  if (r < 0.0015) return new THREE.BoxGeometry(w, h, d);
  return new RoundedBoxGeometry(w, h, d, lite ? 1 : 2, r);
}

/** Six-spoke steel wheel, built at the origin with its axis along y (the caller turns it). */
function wheelRim(r: number, w: number, lite: boolean) {
  const seg = lite ? 24 : 48;
  const parts: THREE.BufferGeometry[] = [];
  // barrel with a rolled lip each side
  const prof = [
    [r * 0.97, -w / 2],
    [r * 1.02, -w / 2 + 0.008],
    [r * 0.96, -w / 2 + 0.02],
    [r * 0.9, -w / 2 + 0.03],
    [r * 0.9, w / 2 - 0.03],
    [r * 0.96, w / 2 - 0.02],
    [r * 1.02, w / 2 - 0.008],
    [r * 0.97, w / 2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  parts.push(new THREE.LatheGeometry(prof, seg));
  // dished face: outer ring, recessed centre
  const face = [
    [0.001, w * 0.18],
    [r * 0.3, w * 0.18],
    [r * 0.36, w * 0.24],
    [r * 0.62, w * 0.26],
    [r * 0.7, w * 0.3],
    [r * 0.9, w * 0.3],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  parts.push(new THREE.LatheGeometry(face, seg));
  // spokes between hub and ring
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const g = new THREE.BoxGeometry(r * 0.12, w * 0.07, r * 0.4);
    g.translate(0, w * 0.27, r * 0.5);
    g.rotateY(a);
    parts.push(g);
  }
  // hub cap and wheel nuts
  const hub = new THREE.CylinderGeometry(r * 0.17, r * 0.2, w * 0.1, lite ? 12 : 24);
  hub.translate(0, w * 0.3, 0);
  parts.push(hub);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const n = new THREE.CylinderGeometry(r * 0.035, r * 0.035, w * 0.06, 6);
    n.translate(Math.cos(a) * r * 0.25, w * 0.3, Math.sin(a) * r * 0.25);
    parts.push(n);
  }
  const all = mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false)!;
  return all;
}

export function shapeGeometry(shape: Shape, lite = false, detail = true): THREE.BufferGeometry {
  switch (shape.k) {
    case "box":
      return detail ? rounded(shape.s[0], shape.s[1], shape.s[2], lite) : new THREE.BoxGeometry(...shape.s);
    case "wheelRim": {
      if (!detail) {
        const g = new THREE.CylinderGeometry(shape.r, shape.r, shape.w, 16);
        g.rotateX(Math.PI / 2);
        return g;
      }
      const g = wheelRim(shape.r, shape.w, lite);
      // face outwards on both sides is handled by the caller's rotation; axis along z
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "cyl": {
      const g = new THREE.CylinderGeometry(shape.r2 ?? shape.r, shape.r, shape.h, shape.seg ?? (lite ? 16 : 28));
      if (shape.axis === "x") g.rotateZ(Math.PI / 2);
      if (shape.axis === "z") g.rotateX(Math.PI / 2);
      return g;
    }
    case "tyre": {
      // lathe profile: rounded shoulders and a tread
      const { r, w } = shape;
      const pts: THREE.Vector2[] = [];
      const ri = r * 0.6;
      const sh = w * 0.18;
      pts.push(new THREE.Vector2(ri, -w / 2));
      pts.push(new THREE.Vector2(r - sh, -w / 2));
      for (let i = 0; i <= 6; i++) {
        const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
        pts.push(new THREE.Vector2(r - sh + Math.cos(a) * sh, -w / 2 + sh + Math.sin(a) * sh));
      }
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * (Math.PI / 2);
        pts.push(new THREE.Vector2(r - sh + Math.cos(a) * sh, w / 2 - sh + Math.sin(a) * sh));
      }
      pts.push(new THREE.Vector2(ri, w / 2));
      const g = new THREE.LatheGeometry(pts, lite ? 24 : 48);
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "beam": {
      // rolled sections have a corner radius of about twice the wall thickness
      const len = new THREE.Vector3(...shape.a).distanceTo(new THREE.Vector3(...shape.b));
      if (!detail || len < 0.02) return between(new THREE.BoxGeometry(shape.s[1], 1, shape.s[0]), shape.a, shape.b);
      const r = Math.min(0.008, Math.min(...shape.s) * 0.2);
      const g = new RoundedBoxGeometry(shape.s[1], len, shape.s[0], lite ? 1 : 2, r);
      g.scale(1, 1 / len, 1);
      return between(g, shape.a, shape.b);
    }
    case "rod": {
      const g = new THREE.CylinderGeometry(shape.r, shape.r, 1, lite ? 10 : 16);
      return between(g, shape.a, shape.b);
    }
    case "coil": {
      const g = new THREE.TubeGeometry(new HelixCurve(shape.r, shape.turns), shape.turns * (lite ? 10 : 18), shape.wire, 6, false);
      return between(g, shape.a, shape.b);
    }
    case "tube": {
      const curve = new THREE.CatmullRomCurve3(shape.pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.1);
      return new THREE.TubeGeometry(curve, lite ? 40 : 80, shape.r, 8, false);
    }
  }
}

function specGeometry(m: MeshSpec, lite: boolean, detail = true) {
  const g = shapeGeometry(m.shape, lite, detail);
  if (m.rot) g.applyQuaternion(tmpQ.setFromEuler(new THREE.Euler(...m.rot)));
  if (m.p) g.translate(...m.p);
  // keep attribute sets identical for merging
  if (!g.index) return g;
  return g.toNonIndexed();
}

export type BuiltPart = {
  part: Part;
  /** one merged geometry per material, in trailer space */
  byMat: { mat: Mat; geo: THREE.BufferGeometry }[];
  /** blueprint edges, all materials together */
  edges: THREE.BufferGeometry;
  centre: THREE.Vector3;
};

export function buildPartGeometry(part: Part, lite = false, opts: { detail?: boolean } = {}): BuiltPart {
  const detail = opts.detail ?? true;
  const groups = new Map<Mat, THREE.BufferGeometry[]>();
  // blueprint lines come from the plain shapes, so rounded corners don't fill the drawing with lines
  const sharp: THREE.BufferGeometry[] = [];
  for (const m of part.meshes) {
    if (!detail && m.cosmetic) continue;
    const g = specGeometry(m, lite, detail);
    if (detail && !m.cosmetic) {
      const s = specGeometry(m, true, false);
      for (const k of Object.keys(s.attributes)) if (k !== "position") s.deleteAttribute(k);
      sharp.push(s);
    }
    for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
    if (!groups.has(m.m)) groups.set(m.m, []);
    groups.get(m.m)!.push(g);
  }
  const byMat = [...groups.entries()].map(([mat, gs]) => ({ mat, geo: mergeGeometries(gs, false)! }));
  const all = mergeGeometries(byMat.map((b) => b.geo), false)!;
  const sharpAll = sharp.length ? mergeGeometries(sharp, false) : null;
  const edges = new THREE.EdgesGeometry(sharpAll ?? all, 28);
  sharpAll?.dispose();
  all.computeBoundingBox();
  const centre = all.boundingBox!.getCenter(new THREE.Vector3());
  all.dispose();
  return { part, byMat, edges, centre };
}
