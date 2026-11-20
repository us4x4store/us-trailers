import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildTrailer, type Mat, type TrailerConfig } from "./model";
import { buildPartGeometry } from "./geometry";

/** Texture-free materials for AR files: colour, metalness and roughness only. */
const PLAIN: Record<Mat, { color: string; metalness: number; roughness: number; emissive?: string }> = {
  galv: { color: "#B9C1C4", metalness: 0.85, roughness: 0.42 },
  powder: { color: "#2C3136", metalness: 0.1, roughness: 0.48 },
  alu: { color: "#C9CED1", metalness: 0.8, roughness: 0.35 },
  checker: { color: "#C3C8CB", metalness: 0.9, roughness: 0.3 },
  rubber: { color: "#151719", metalness: 0, roughness: 0.92 },
  rim: { color: "#3A3F44", metalness: 0.7, roughness: 0.38 },
  brake: { color: "#8E9498", metalness: 0.9, roughness: 0.25 },
  ply: { color: "#B08A5A", metalness: 0, roughness: 0.8 },
  glass: { color: "#0E1418", metalness: 0, roughness: 0.08 },
  ledRed: { color: "#8A140C", metalness: 0, roughness: 0.3, emissive: "#FF2A14" },
  ledAmber: { color: "#8A5A0C", metalness: 0, roughness: 0.3, emissive: "#FFA51A" },
  ledWhite: { color: "#D8D8D0", metalness: 0, roughness: 0.3 },
  wire: { color: "#1B1D20", metalness: 0, roughness: 0.7 },
  solar: { color: "#13233D", metalness: 0.2, roughness: 0.15 },
  poly: { color: "#1E2124", metalness: 0, roughness: 0.75 },
  accent: { color: "#1F3B73", metalness: 0.3, roughness: 0.4 },
};

/**
 * The configured trailer as a real-size scene (metres, Y up, wheels on y = 0, centred),
 * with one mesh per material so phones render it smoothly in AR.
 */
export function trailerScene(cfg: TrailerConfig): THREE.Scene {
  const byMat = new Map<Mat, THREE.BufferGeometry[]>();
  for (const part of buildTrailer(cfg)) {
    for (const { mat, geo } of buildPartGeometry(part, true).byMat) {
      if (!byMat.has(mat)) byMat.set(mat, []);
      byMat.get(mat)!.push(geo);
    }
  }
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  root.name = "US Trailers build";
  for (const [mat, geos] of byMat) {
    const p = PLAIN[mat];
    const m = new THREE.MeshStandardMaterial({ color: mat === "powder" ? cfg.colour : p.color, metalness: p.metalness, roughness: p.roughness });
    if (p.emissive) m.emissive = new THREE.Color(p.emissive);
    m.name = mat;
    const mesh = new THREE.Mesh(mergeGeometries(geos, false)!, m);
    mesh.name = mat;
    root.add(mesh);
  }
  // centre on the origin from the real bounds, wheels resting on y = 0
  const box = new THREE.Box3().setFromObject(root);
  root.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  scene.add(root);
  return scene;
}
