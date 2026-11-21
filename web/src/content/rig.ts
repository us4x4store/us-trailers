import type { TrailerConfig } from "@/trailer/model";
import { gvmKg } from "@/trailer/pricing";
import { towCheck, type TowResult } from "./towrules";
import type { Vehicle } from "./vehicles";

/**
 * The one place that answers "what does this trailer need behind this vehicle?".
 * The test rig, the designer and the tow checker all read it, so they can't disagree.
 */
export function rigRules(cfg: TrailerConfig, v: Vehicle): TowResult & { fitted: string; gvm: number } {
  const gvm = gvmKg(cfg);
  const r = towCheck({ vehicle: v.kind, tare: v.tare, gvm: v.gvm, trailerGvm: gvm, towRating: v.towRating, gcm: v.gcm });
  const fitted =
    gvm <= 750
      ? "Parking brake; no service brakes needed at this weight"
      : r.brakes.need.includes("driver") || r.brakes.need === "Parking brake + service brakes"
        ? "Electric disc brakes with an in-cab controller"
        : "Overrun disc brakes";
  return { ...r, fitted, gvm };
}
