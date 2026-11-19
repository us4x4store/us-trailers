import { DEFAULT_CONFIG, type TrailerConfig } from "@/trailer/model";

/** The visitor's current design, shared between the configurator and the enquiry form. */
export const buildStore = {
  cfg: { ...DEFAULT_CONFIG } as TrailerConfig,
  touched: false,
  listeners: new Set<() => void>(),
  set(cfg: TrailerConfig) {
    this.cfg = cfg;
    this.touched = true;
    this.listeners.forEach((f) => f());
  },
};
