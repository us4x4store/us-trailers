import type { Kind, TrailerConfig } from "./model";

/** body lengths (m) offered per kind */
export const KIND_LENGTHS: Record<Kind, number[]> = {
  toyhauler: [3.6, 4.2, 4.8, 5.4, 6.0],
  offroad: [2.4, 3.0, 3.6],
  gooseneck: [6.0, 7.2, 8.4],
};

export const buildKey = (cfg: TrailerConfig) => `${cfg.kind ?? "toyhauler"}-${cfg.length}-${cfg.axles}-${cfg.rack ? 1 : 0}-${cfg.solar ? 1 : 0}`;
