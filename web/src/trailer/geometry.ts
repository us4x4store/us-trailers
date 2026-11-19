import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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

export function shapeGeometry(shape: Shape, lite = false): THREE.BufferGeometry {
  switch (shape.k) {
    case "box":
      return new THREE.BoxGeometry(...shape.s);
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
      const g = new THREE.BoxGeometry(shape.s[1], 1, shape.s[0]);
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

function specGeometry(m: MeshSpec, lite: boolean) {
  const g = shapeGeometry(m.shape, lite);
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

export function buildPartGeometry(part: Part, lite = false): BuiltPart {
  const groups = new Map<Mat, THREE.BufferGeometry[]>();
  for (const m of part.meshes) {
    const g = specGeometry(m, lite);
    for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
    if (!groups.has(m.m)) groups.set(m.m, []);
    groups.get(m.m)!.push(g);
  }
  const byMat = [...groups.entries()].map(([mat, gs]) => ({ mat, geo: mergeGeometries(gs, false)! }));
  const all = mergeGeometries(byMat.map((b) => b.geo), false)!;
  const edges = new THREE.EdgesGeometry(all, 28);
  all.computeBoundingBox();
  const centre = all.boundingBox!.getCenter(new THREE.Vector3());
  all.dispose();
  return { part, byMat, edges, centre };
}
