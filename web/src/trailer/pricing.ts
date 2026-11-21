import { overallLength, tareKg, type Kind, type TrailerConfig } from "./model";
import { KIND_LENGTHS } from "./catalogue";

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
/** EXAMPLE base prices for the other kinds (shortest body, standard kit) */
const KIND_PRICE: Record<Kind, { base: number; perMetre: number; from: number }> = {
  toyhauler: { base: PRICING.base, perMetre: PRICING.perMetre, from: 3.6 },
  offroad: { base: 165_000, perMetre: 38_000, from: 2.4 }, // kitchen, tent, tank, lithium included
  gooseneck: { base: 395_000, perMetre: 52_000, from: 6.0 }, // neck, landing legs, brakes sized to the tow vehicle
};

/** toy hauler lengths (kept for older code); use KIND_LENGTHS for every kind */
export const LENGTHS = KIND_LENGTHS.toyhauler;
export { KIND_LENGTHS };

export const COLOURS = [
  { name: "Graphite", hex: "#2C3136" },
  { name: "Prussian", hex: "#1F3B73" },
  { name: "Fynbos", hex: "#56624A" },
  { name: "Karoo sand", hex: "#BFA67E" },
  { name: "Salt white", hex: "#E6E4DD" },
  { name: "Oxide", hex: "#6E3426" },
  { name: "Gloss black", hex: "#0B0C0E" },
];

export function priceRange(cfg: TrailerConfig): [number, number] {
  const p = PRICING;
  const k = KIND_PRICE[cfg.kind ?? "toyhauler"];
  const kitRack = (cfg.kind ?? "toyhauler") === "toyhauler" && cfg.rack ? p.rack : 0;
  const tandem = (cfg.kind ?? "toyhauler") === "toyhauler" && cfg.axles === 2 ? p.tandem : 0;
  const mid = k.base + Math.max(0, cfg.length - k.from) * k.perMetre + tandem + kitRack + (cfg.solar ? p.solar : 0);
  const round = (v: number) => Math.round(v / 5000) * 5000;
  return [round(mid * (1 - p.spread)), round(mid * (1 + p.spread))];
}

/** Rated GVM (kg), EXAMPLE axle ratings: toy hauler single 1 600 / tandem 3 000; off-road 1 500; gooseneck by length. */
export function gvmKg(cfg: TrailerConfig) {
  if (cfg.kind === "offroad") return 1500;
  if (cfg.kind === "gooseneck") return 3500; // stays within a light vehicle's 3 500 kg braked towing rating
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
    brakes:
      gvm > 750
        ? `Overrun disc brakes, or electric disc brakes with an in-cab controller when the trailer's ${gvm.toLocaleString("en-ZA").replace(/,/g, " ")} kg GVM is more than your vehicle's tare.`
        : "Parking brake, plus overrun brakes if the trailer's GVM is over half your vehicle's tare.",
    // a loaded single axle over ~4.2 m carries too much on one axle: we recommend tandem
    axleAdvice: cfg.axles === 1 && cfg.length > 4.2 ? "Over 4.2 m we fit two axles. One axle would be overloaded." : null,
  };
}

const KIND_LETTER: Record<Kind, string> = { toyhauler: "L", offroad: "O", gooseneck: "G" };

/** Compact, shareable build code: L = toy hauler, O = off-road, G = gooseneck, e.g. "G72-A2-C1-R0-S1". */
export function encodeBuild(cfg: TrailerConfig): string {
  const c = Math.max(0, COLOURS.findIndex((x) => x.hex.toLowerCase() === cfg.colour.toLowerCase()));
  return `${KIND_LETTER[cfg.kind ?? "toyhauler"]}${Math.round(cfg.length * 10)}-A${cfg.axles}-C${c}-R${cfg.rack ? 1 : 0}-S${cfg.solar ? 1 : 0}`;
}

export function decodeBuild(code: string | null | undefined): TrailerConfig | null {
  const m = /^([LOG])(\d{2})-A([12])-C(\d)-R([01])-S([01])$/.exec(code ?? "");
  if (!m) return null;
  const kind = (Object.keys(KIND_LETTER) as Kind[]).find((k) => KIND_LETTER[k] === m[1])!;
  const length = +m[2] / 10;
  if (!KIND_LENGTHS[kind].includes(length)) return null;
  const axles = +m[3] as 1 | 2;
  if ((kind === "offroad" && axles !== 1) || (kind === "gooseneck" && axles !== 2)) return null;
  const colour = COLOURS[+m[4]]?.hex;
  if (!colour) return null;
  return { kind, length, axles, colour, rack: kind === "toyhauler" && m[5] === "1", solar: m[6] === "1" };
}

export const rand = (n: number) => "R" + n.toLocaleString("en-ZA").replace(/,/g, " ");
