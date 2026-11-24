import * as THREE from "three";
import type { Mat } from "./model";

/** Procedural textures so the steel reads as steel without downloading image files. */
function canvasTex(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, repeat: [number, number]) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const c = cv.getContext("2d")!;
  draw(c, size);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

/** Diamond tread checker plate as a bump map. */
function checkerBump() {
  return canvasTex(
    256,
    (c, s) => {
      c.fillStyle = "#000";
      c.fillRect(0, 0, s, s);
      const step = s / 4;
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          const cx = x * step + step / 2;
          const cy = y * step + step / 2;
          const a = (x + y) % 2 ? Math.PI / 4 : -Math.PI / 4;
          c.save();
          c.translate(cx, cy);
          c.rotate(a);
          const grd = c.createLinearGradient(-step * 0.35, 0, step * 0.35, 0);
          grd.addColorStop(0, "#444");
          grd.addColorStop(0.5, "#fff");
          grd.addColorStop(1, "#444");
          c.fillStyle = grd;
          c.beginPath();
          c.ellipse(0, 0, step * 0.36, step * 0.09, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
    },
    [10, 10],
  );
}

/** Hot-dip galvanising spangle: soft crystalline mottling for the roughness map. */
function spangle() {
  return canvasTex(
    256,
    (c, s) => {
      c.fillStyle = "#808080";
      c.fillRect(0, 0, s, s);
      let seed = 11;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 260; i++) {
        const x = rnd() * s;
        const y = rnd() * s;
        const r = 6 + rnd() * 22;
        const v = Math.floor(90 + rnd() * 110);
        c.fillStyle = `rgb(${v},${v},${v})`;
        c.beginPath();
        const sides = 5 + Math.floor(rnd() * 3);
        for (let k = 0; k < sides; k++) {
          const a = (k / sides) * Math.PI * 2 + rnd() * 0.4;
          const rr = r * (0.7 + rnd() * 0.4);
          c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        c.fill();
      }
    },
    [3, 3],
  );
}

function solarTex() {
  return canvasTex(
    256,
    (c, s) => {
      c.fillStyle = "#0E1A2E";
      c.fillRect(0, 0, s, s);
      c.strokeStyle = "#5B6B85";
      c.lineWidth = 2;
      for (let i = 0; i <= 6; i++) {
        c.beginPath();
        c.moveTo((i * s) / 6, 0);
        c.lineTo((i * s) / 6, s);
        c.stroke();
      }
      for (let i = 0; i <= 10; i++) {
        c.beginPath();
        c.moveTo(0, (i * s) / 10);
        c.lineTo(s, (i * s) / 10);
        c.stroke();
      }
    },
    [1, 1],
  );
}

/** All-terrain tread: staggered blocks across the crown, smooth sidewalls (bump map).
 *  On the lathe the texture's x runs round the tyre and y runs across the profile. */
function treadBump() {
  return canvasTex(
    256,
    (c, s) => {
      c.fillStyle = "#000";
      c.fillRect(0, 0, s, s);
      // [across from, across to, phase round the tyre] for one pitch; repeated 36 times round
      const blocks: [number, number, number][] = [
        [0.36, 0.48, 0],
        [0.52, 0.64, 0.5],
        [0.3, 0.36, 0.5],
        [0.64, 0.7, 0],
      ];
      for (const [v0, v1, ph] of blocks) {
        const g = c.createLinearGradient(0, v0 * s, 0, v1 * s);
        g.addColorStop(0, "#aaa");
        g.addColorStop(0.5, "#fff");
        g.addColorStop(1, "#aaa");
        c.fillStyle = g;
        const x = ph * s + s * 0.07;
        c.fillRect(x, v0 * s, s * 0.36, (v1 - v0) * s);
      }
    },
    [36, 1],
  );
}

export type MatSet = Record<Mat, THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial>;

export function createMaterials(bodyColour: string): MatSet {
  const spang = spangle();
  const bump = checkerBump();
  const tread = treadBump();
  const m: MatSet = {
    galv: new THREE.MeshStandardMaterial({ color: "#B9C1C4", metalness: 0.85, roughness: 0.42, roughnessMap: spang }),
    // satin powder coat: a soft base with a thin glossy skin on top, like the real thing
    // deep gloss paint over the panels: mirror clear coat on a soft base
    powder: new THREE.MeshPhysicalMaterial({ color: bodyColour, metalness: 0.15, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.04 }),
    // brushed aluminium: trims, rails, plate
    alu: new THREE.MeshPhysicalMaterial({ color: "#D3D7DA", metalness: 1, roughness: 0.3, anisotropy: 0.5 }),
    checker: new THREE.MeshStandardMaterial({ color: "#C3C8CB", metalness: 0.9, roughness: 0.3, bumpMap: bump, bumpScale: 2.2 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#1A1C1E", metalness: 0, roughness: 0.86, bumpMap: tread, bumpScale: 6 }),
    // satin-black steel wheels with a clear coat
    // mirror-polished aluminium wheels
    rim: new THREE.MeshPhysicalMaterial({ color: "#E4E7EA", metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03 }),
    brake: new THREE.MeshStandardMaterial({ color: "#8E9498", metalness: 0.9, roughness: 0.25 }),
    ply: new THREE.MeshStandardMaterial({ color: "#B08A5A", metalness: 0, roughness: 0.8 }),
    // tinted acrylic windows: dark, with sharp reflections
    glass: new THREE.MeshPhysicalMaterial({ color: "#0B1014", metalness: 0.2, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, reflectivity: 0.9 }),
    ledRed: new THREE.MeshStandardMaterial({ color: "#5A0E0A", emissive: "#FF2A14", emissiveIntensity: 0.25, roughness: 0.3 }),
    ledAmber: new THREE.MeshStandardMaterial({ color: "#5A3A0A", emissive: "#FFA51A", emissiveIntensity: 0.25, roughness: 0.3 }),
    ledWhite: new THREE.MeshStandardMaterial({ color: "#D8D8D0", emissive: "#FFF3DC", emissiveIntensity: 0.1, roughness: 0.3 }),
    wire: new THREE.MeshStandardMaterial({ color: "#1B1D20", roughness: 0.7 }),
    solar: new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: solarTex(), metalness: 0.2, roughness: 0.15, clearcoat: 1 }),
    poly: new THREE.MeshStandardMaterial({ color: "#1E2124", roughness: 0.75 }),
    accent: new THREE.MeshStandardMaterial({ color: "#1F3B73", metalness: 0.3, roughness: 0.4 }),
    // addressable RGB strip: the scene cycles its colour; bright enough to bloom
    rgb: new THREE.MeshStandardMaterial({ color: "#111", emissive: "#ff2bd6", emissiveIntensity: 3.2, roughness: 0.4, toneMapped: true }),
    chrome: new THREE.MeshPhysicalMaterial({ color: "#E8ECEF", metalness: 1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02 }),
  };
  m.rgb.userData.rgb = true;
  return m;
}

export const INK = new THREE.Color("#8B6BFF");
export const PAPER = new THREE.Color("#0A0B0D");
