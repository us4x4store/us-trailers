import { DEFAULT_CONFIG, type TrailerConfig } from "@/trailer/model";

/** The visitor's current design, shared between the configurator and the enquiry form. */
export const buildStore = {
  cfg: { ...DEFAULT_CONFIG } as TrailerConfig,
  touched: false,
  listeners: new Set<() => void>(),
  /** follow the trailer chosen elsewhere (the film), unless the visitor has designed their own */
  suggest(cfg: TrailerConfig) {
    if (this.touched) return;
    this.cfg = cfg;
    this.listeners.forEach((f) => f());
  },
  set(cfg: TrailerConfig) {
    this.cfg = cfg;
    this.touched = true;
    this.listeners.forEach((f) => f());
  },
};
