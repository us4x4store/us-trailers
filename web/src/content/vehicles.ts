/**
 * Common South African tow vehicles with typical licence-disc and owner's-manual figures (kg).
 * Typical figures for current double-cab 4×4 automatics; every vehicle's own disc wins,
 * which is why the tow checker lets visitors overwrite each number.
 */
export type Vehicle = {
  id: string;
  name: string;
  kind: "car" | "bakkie";
  tare: number;
  gvm: number;
  gcm: number;
  towRating: number;
};

export const VEHICLES: Vehicle[] = [
  { id: "hilux", name: "Toyota Hilux 2.8 GD-6 double cab", kind: "bakkie", tare: 2110, gvm: 3210, gcm: 5850, towRating: 3500 },
  { id: "ranger", name: "Ford Ranger 3.0 V6 double cab", kind: "bakkie", tare: 2330, gvm: 3270, gcm: 6350, towRating: 3500 },
  { id: "dmax", name: "Isuzu D-Max 3.0 double cab", kind: "bakkie", tare: 2010, gvm: 2950, gcm: 5950, towRating: 3500 },
  { id: "lc79", name: "Toyota Land Cruiser 79 double cab", kind: "bakkie", tare: 2290, gvm: 3300, gcm: 6800, towRating: 3500 },
  { id: "fortuner", name: "Toyota Fortuner 2.8 GD-6", kind: "car", tare: 2135, gvm: 2735, gcm: 5835, towRating: 3100 },
  { id: "defender", name: "Land Rover Defender 110", kind: "car", tare: 2320, gvm: 3150, gcm: 6650, towRating: 3500 },
];

/** The tow vehicle the visitor chose, shared by the test rig, the tow checker and the enquiry. */
export const vehicleStore = {
  v: VEHICLES[0] as Vehicle,
  chosen: false,
  listeners: new Set<() => void>(),
  set(v: Vehicle) {
    this.v = v;
    this.chosen = true;
    this.listeners.forEach((f) => f());
  },
};

/** A one-line summary of the visitor's rig from the test rig, attached to their brief. */
export const rigStore = {
  summary: "",
  listeners: new Set<() => void>(),
  set(summary: string) {
    this.summary = summary;
    this.listeners.forEach((f) => f());
  },
};
