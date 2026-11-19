import { overallLength, tareKg, type TrailerConfig } from "./model";

/**
 * EXAMPLE PRICING. Replace with Justin's real numbers (questions batch 1, Q4).
 * Pitched between local enclosed bike trailers (R40k–R130k) and imported toy haulers (~R950k),
 * see research/market.md section 5.
 */
export const PRICING = {
  base: 189_000, // 3.6 m single-axle enclosed toy hauler, galvanised chassis, rear ramp
  perMetre: 41_000, // each metre of body over 3.6 m
  tandem: 29_500,
  rack: 14_500,
  solar: 18_900,
  spread: 0.1, // ±10% until the brief is drawn
};

export const LENGTHS = [3.6, 4.2, 4.8, 5.4, 6.0];

export const COLOURS = [
  { name: "Graphite", hex: "#2C3136" },
  { name: "Prussian", hex: "#1F3B73" },
  { name: "Fynbos", hex: "#56624A" },
  { name: "Karoo sand", hex: "#BFA67E" },
  { name: "Salt white", hex: "#E6E4DD" },
  { name: "Oxide", hex: "#6E3426" },
];

export function priceRange(cfg: TrailerConfig): [number, number] {
  const p = PRICING;
  const mid = p.base + Math.max(0, cfg.length - 3.6) * p.perMetre + (cfg.axles === 2 ? p.tandem : 0) + (cfg.rack ? p.rack : 0) + (cfg.solar ? p.solar : 0);
  const round = (v: number) => Math.round(v / 5000) * 5000;
  return [round(mid * (1 - p.spread)), round(mid * (1 + p.spread))];
}

/** Rated GVM per axle set (kg): single 1 600 kg, tandem 3 000 kg (example axle ratings). */
export function gvmKg(cfg: TrailerConfig) {
  return cfg.axles === 2 ? 3000 : 1600;
}

export function specs(cfg: TrailerConfig) {
  const tare = tareKg(cfg);
  const gvm = gvmKg(cfg);
  return {
    overallMm: Math.round(overallLength(cfg) * 1000),
    bodyMm: Math.round(cfg.length * 1000),
    tare,
    gvm,
    payload: gvm - tare,
    licence: gvm > 750 ? "EB" : "B",
    brakes: gvm > 750 ? "Required (fitted: override discs)" : "Not required",
    // a loaded single axle over ~4.2 m carries too much on one axle: we recommend tandem
    axleAdvice: cfg.axles === 1 && cfg.length > 4.2 ? "Over 4.2 m we fit two axles. One axle would be overloaded." : null,
  };
}

/** Compact, shareable build code, e.g. "L48-A2-C1-R1-S1". */
export function encodeBuild(cfg: TrailerConfig): string {
  const c = Math.max(0, COLOURS.findIndex((x) => x.hex.toLowerCase() === cfg.colour.toLowerCase()));
  return `L${Math.round(cfg.length * 10)}-A${cfg.axles}-C${c}-R${cfg.rack ? 1 : 0}-S${cfg.solar ? 1 : 0}`;
}

export function decodeBuild(code: string | null | undefined): TrailerConfig | null {
  const m = /^L(\d{2})-A([12])-C(\d)-R([01])-S([01])$/.exec(code ?? "");
  if (!m) return null;
  const length = +m[1] / 10;
  if (!LENGTHS.includes(length)) return null;
  const colour = COLOURS[+m[3]]?.hex;
  if (!colour) return null;
  return { length, axles: +m[2] as 1 | 2, colour, rack: m[4] === "1", solar: m[5] === "1" };
}

export const rand = (n: number) => "R" + n.toLocaleString("en-ZA").replace(/,/g, " ");
