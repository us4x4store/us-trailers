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

export type MatSet = Record<Mat, THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial>;

export function createMaterials(bodyColour: string): MatSet {
  const spang = spangle();
  const bump = checkerBump();
  const m: MatSet = {
    galv: new THREE.MeshStandardMaterial({ color: "#B9C1C4", metalness: 0.85, roughness: 0.42, roughnessMap: spang }),
    powder: new THREE.MeshPhysicalMaterial({ color: bodyColour, metalness: 0.1, roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
    alu: new THREE.MeshStandardMaterial({ color: "#C9CED1", metalness: 0.8, roughness: 0.35 }),
    checker: new THREE.MeshStandardMaterial({ color: "#C3C8CB", metalness: 0.9, roughness: 0.3, bumpMap: bump, bumpScale: 2.2 }),
    rubber: new THREE.MeshStandardMaterial({ color: "#151719", metalness: 0, roughness: 0.92 }),
    rim: new THREE.MeshStandardMaterial({ color: "#3A3F44", metalness: 0.7, roughness: 0.38 }),
    brake: new THREE.MeshStandardMaterial({ color: "#8E9498", metalness: 0.9, roughness: 0.25 }),
    ply: new THREE.MeshStandardMaterial({ color: "#B08A5A", metalness: 0, roughness: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#0E1418", metalness: 0, roughness: 0.08, clearcoat: 1 }),
    ledRed: new THREE.MeshStandardMaterial({ color: "#5A0E0A", emissive: "#FF2A14", emissiveIntensity: 0.25, roughness: 0.3 }),
    ledAmber: new THREE.MeshStandardMaterial({ color: "#5A3A0A", emissive: "#FFA51A", emissiveIntensity: 0.25, roughness: 0.3 }),
    ledWhite: new THREE.MeshStandardMaterial({ color: "#D8D8D0", emissive: "#FFF3DC", emissiveIntensity: 0.1, roughness: 0.3 }),
    wire: new THREE.MeshStandardMaterial({ color: "#1B1D20", roughness: 0.7 }),
    solar: new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: solarTex(), metalness: 0.2, roughness: 0.15, clearcoat: 1 }),
    poly: new THREE.MeshStandardMaterial({ color: "#1E2124", roughness: 0.75 }),
    accent: new THREE.MeshStandardMaterial({ color: "#1F3B73", metalness: 0.3, roughness: 0.4 }),
  };
  return m;
}

export const INK = new THREE.Color("#1F3B73");
export const PAPER = new THREE.Color("#E6EAE5");
