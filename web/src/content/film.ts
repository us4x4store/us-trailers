import manifest from "../../render/manifest.json";

/**
 * The rendered build film: 220 frames from render/trailer.py (Blender Cycles), scrubbed by scroll.
 * Captions come from the same schedule the render used, so a part is named the moment it lands.
 */
export const FILM = { frames: manifest.frames, finale: manifest.finale as [number, number] };

export const FILM_CHAPTERS: { n: string; title: string; line: string; from: number }[] = [
  { n: "01", title: "Chassis", line: "Galvanised rails and cross members, jigged square and welded. The A-frame runs to a forged coupler.", from: 1 },
  { n: "02", title: "Running gear", line: "Tandem axles on leaf springs, vented discs and red calipers on every wheel.", from: 34 },
  { n: "03", title: "Wheels", line: "Mirror-polished six-spoke aluminium on all-terrain tyres, under polished stainless radius fenders.", from: 52 },
  { n: "04", title: "Frame & floor", line: "Marine-ply floor under coin-grip, a welded steel cage, white lining, E-track and floor rings for every ATV.", from: 78 },
  { n: "05", title: "Skin & V-nose", line: "Gloss-black bonded panels and the Texan V-nose that splits the wind ahead of the box.", from: 104 },
  { n: "06", title: "Ramp & doors", line: "A spring-assisted ramp with a polished checker face, and a side door with a flush lock.", from: 136 },
  { n: "07", title: "Light it up", line: "RGB underglow, belt-line, roof and garage strips on one controller. Clearance and tail lights to the letter of the law.", from: 152 },
  { n: "08", title: "Handover", line: "Lights down. Ramp down. Bring the toys.", from: 168 },
];

/** what each part does: one line, shown as it arrives */
const JOBS: Record<string, string> = {
  "Main rails": "150 × 60 mm galvanised rails carry every kilogram from coupler to axles.",
  "Cross members": "Every 400 mm, so the floor never flexes under an ATV.",
  Welds: "Full-length MIG beads at every joint, then hot-dip galvanised.",
  "A-frame tongue": "Two rails converge on the coupler for a stiff, straight tow.",
  "Coupler & chains": "Forged coupler, safety chains crossed under the hitch.",
  "Jockey wheel": "Winds the nose onto the ball so one person can hitch up.",
  "Axle & springs": "Leaf-sprung tandem axles share the load and smooth the corrugations.",
  "Second axle": "Two axles: more load, more stability, a spare chance if a tyre goes.",
  "Polished wheel": "Mirror-polished six-spoke aluminium, load-rated all-terrain tyres.",
  "Radius fenders": "Polished stainless half-rounds keep stones off the gloss.",
  "Marine-ply floor": "Marine ply under black coin-grip rubber: quiet, grippy, easy to hose out.",
  "Steel cage": "Welded studs and roof bows: the body is a frame, not a box of panels.",
  "White interior lining": "Bright white walls so the garage is easy to work in at night.",
  "E-track & D-rings": "Two rows of E-track and chrome floor rings: strap anything, anywhere.",
  "Gloss side panel, kerb side": "Bonded composite under a deep gloss clear coat.",
  "Gloss side panel": "One continuous panel, no rivet lines, mirror finish.",
  "V-nose": "Raked prow wrapped in polished diamond plate. Less drag, more locker.",
  "Crowned roof": "One piece, crowned to shed water, walk-on rated.",
  "Aluminium trims": "Extruded corner caps and rub rails frame every edge.",
  "Spring-assist ramp": "Rated for a 400 kg ATV, light enough to lift with one hand.",
  "Side door": "Flush lock, three hinges, a drip rail above.",
  "RGB lighting": "Addressable strips under, along and inside. Any colour, from your phone.",
  "LED lights & vent": "Sealed LED clearance and tail lights; a roof vent for the fumes.",
};

export const FILM_PARTS = manifest.parts
  .filter((p) => JOBS[p.name])
  .map((p) => ({ name: p.name.replace(", kerb side", ""), job: JOBS[p.name], start: p.start, end: p.end }));
