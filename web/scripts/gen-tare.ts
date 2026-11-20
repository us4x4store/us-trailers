// Precompute tare (kg) for every buildable configuration, from the part masses.
// Run: npx tsx scripts/gen-tare.ts  → writes src/trailer/tare.json (small, safe to import anywhere).
import { writeFileSync } from "node:fs";
import { buildTrailer, type Kind, type TrailerConfig } from "../src/trailer/model";
import { partMassKg, UNDRAWN } from "../src/trailer/mass";
import { KIND_LENGTHS, buildKey } from "../src/trailer/catalogue";

const out: Record<string, number> = {};
const report: string[] = [];
for (const kind of Object.keys(KIND_LENGTHS) as Kind[]) {
  for (const length of KIND_LENGTHS[kind]) {
    for (const axles of kind === "offroad" ? [1] : kind === "gooseneck" ? [2] : [1, 2]) {
      for (const rack of [false, true]) {
        for (const solar of [false, true]) {
          const cfg: TrailerConfig = { kind, length, axles: axles as 1 | 2, colour: "#2C3136", rack, solar };
          const parts = buildTrailer(cfg);
          const kg = parts.reduce((s, p) => s + partMassKg(p), 0) * UNDRAWN;
          out[buildKey(cfg)] = Math.round(kg);
          if (rack && solar) report.push(`${kind} ${length} m ${axles}ax: ${Math.round(kg)} kg  [${parts.map((p) => `${p.id} ${Math.round(partMassKg(p))}`).join(", ")}]`);
        }
      }
    }
  }
}
writeFileSync(new URL("../src/trailer/tare.json", import.meta.url), JSON.stringify(out, null, 0) + "\n");
console.log(report.join("\n"));
