import type { Surface } from "./road";

export type LoadKind = "quad" | "bike" | "jerry";
export const LOADS: Record<LoadKind, { label: string; kg: number; size: [number, number, number]; x: number }> = {
  quad: { label: "Quad bike", kg: 290, size: [1.9, 1.15, 1.15], x: -1.2 },
  bike: { label: "Dirt bike", kg: 105, size: [2.1, 1.2, 0.36], x: 0.9 },
  jerry: { label: "Jerry can, full", kg: 22, size: [0.35, 0.47, 0.17], x: 1.9 },
};

/** Rated gross vehicle mass for this example build (kg). */
export const GVM = 3000;
/** Example tow vehicle: double-cab 4×4 bakkie. */
export const BAKKIE = { name: "Double-cab 4×4 bakkie", gvm: 3210, towRating: 3500 };

export type Readout = {
  kmh: number;
  travel: number[]; // mm compression per wheel
  pitch: number;
  roll: number;
  g: number;
  noseKg: number;
  gross: number;
};

export const drive = {
  targetKmh: 40,
  surface: "gravel" as Surface,
  view: "chase" as "chase" | "wheel" | "side",
  strapped: true,
  water: false,
  loads: [] as { id: number; kind: LoadKind }[],
  nextId: 1,
  readout: { kmh: 0, travel: [0, 0, 0, 0], pitch: 0, roll: 0, g: 1, noseKg: 0, gross: 0 } as Readout,
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach((f) => f());
  },
};
