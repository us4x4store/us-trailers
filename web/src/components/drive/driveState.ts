import type { Surface } from "./road";
import { DEFAULT_CONFIG, tareKg } from "@/trailer/model";

export type LoadKind = "quad" | "bike" | "jerry";
export const LOADS: Record<LoadKind, { label: string; kg: number; size: [number, number, number]; x: number }> = {
  quad: { label: "Quad bike", kg: 290, size: [1.9, 1.15, 1.15], x: -1.2 },
  bike: { label: "Dirt bike", kg: 105, size: [2.1, 1.2, 0.36], x: 0.9 },
  jerry: { label: "Jerry can, full", kg: 22, size: [0.35, 0.47, 0.17], x: 1.9 },
};

/** Rated gross vehicle mass for this example build (kg). */
export const GVM = 3000;
/** Example tow vehicle: double-cab 4×4 bakkie. */
export const BAKKIE = { name: "Double-cab 4×4 bakkie", tare: 2100, gvm: 3210, gcm: 5850, towRating: 3500 };

export type Readout = {
  kmh: number;
  travel: number[]; // mm compression per wheel
  pitch: number;
  roll: number;
  g: number;
  noseKg: number;
  liveNoseKg: number;
  gross: number;
  ready: boolean;
  loose?: number;
  shifted?: number;
};

export const drive = {
  // parked until the visitor sets off; with reduced motion it stays parked
  targetKmh: 0,
  surface: "gravel" as Surface,
  view: "chase" as "chase" | "wheel" | "side",
  strapped: true,
  water: false,
  loads: [] as { id: number; kind: LoadKind }[],
  nextId: 1,
  readout: { kmh: 0, travel: [0, 0, 0, 0], pitch: 0, roll: 0, g: 1, noseKg: 0, liveNoseKg: 0, gross: tareKg(DEFAULT_CONFIG), ready: false } as Readout,
  resetKey: 0,
  notice: "",
  /** rebuild the physics world from scratch, keeping the visitor's loads and settings */
  lastReset: 0,
  reset(notice = "") {
    if (Date.now() - this.lastReset < 3000) return;
    this.lastReset = Date.now();
    this.resetKey++;
    this.notice = notice;
    this.readout = { ...this.readout, ready: false };
    this.emit();
  },
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach((f) => f());
  },
};
