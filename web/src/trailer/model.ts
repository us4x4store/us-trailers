/**
 * The US Trailers parametric trailer model.
 * One source of truth for the assembly film, exploded view, physics rig and configurator.
 * Units: metres. Axes: +X towards the coupler (front), +Y up, +Z to the kerb (left) side.
 * Ground is y = 0.
 *
 * Specs below are example specs for the concept build (marked EXAMPLE in the UI copy)
 * until Justin confirms his real components.
 */

import TARE from "./tare.json";
import { buildKey } from "./catalogue";

export type V3 = [number, number, number];

export type Mat =
  | "galv" // hot-dip galvanised steel
  | "powder" // powder-coated body colour
  | "alu" // aluminium composite / plate
  | "checker" // aluminium checker plate
  | "rubber"
  | "rim"
  | "brake"
  | "ply" // marine ply
  | "glass"
  | "ledRed"
  | "ledAmber"
  | "ledWhite"
  | "wire"
  | "solar"
  | "poly" // black polyethylene (tanks, blocks)
  | "accent"; // Prussian-blue powder coat (springs, calipers)

export type Shape =
  | { k: "box"; s: V3 }
  | { k: "cyl"; r: number; h: number; axis: "x" | "y" | "z"; seg?: number; r2?: number }
  | { k: "tyre"; r: number; w: number }
  /** square/rect section member between two points; s = [height, width] of the section */
  | { k: "beam"; a: V3; b: V3; s: [number, number] }
  /** round rod between two points */
  | { k: "rod"; a: V3; b: V3; r: number }
  /** coil spring between two points */
  | { k: "coil"; a: V3; b: V3; r: number; wire: number; turns: number }
  /** tube along a polyline */
  | { k: "tube"; pts: V3[]; r: number };

export type MeshSpec = {
  shape: Shape;
  p?: V3;
  rot?: V3;
  m: Mat;
  /** sheet-metal box: real wall thickness in metres (mass = surface area × thickness × density) */
  shell?: number;
  /** bought-in component with a catalogue mass, kg (overrides the geometry) */
  kg?: number;
};

export type ChapterId = "drawing" | "chassis" | "running" | "wheels" | "frame" | "skin" | "doors" | "systems" | "finish";

export type Hinge = { origin: V3; axis: V3; open: number };

export type Part = {
  id: string;
  name: string;
  job: string;
  material: string;
  spec: string;
  chapter: ChapterId;
  meshes: MeshSpec[];
  /** label anchor in trailer space */
  anchor: V3;
  /** direction the part flies in from (relative offset, metres) */
  from: V3;
  /** exploded-view offset (metres) */
  explode: V3;
  /** steel parts throw weld sparks when they land */
  weld?: boolean;
  hinge?: Hinge;
  /** dynamic wheel: rendered per-wheel by the physics rig */
  wheel?: { x: number; side: 1 | -1 };
};

export type Chapter = { id: ChapterId; n: string; title: string; line: string };

export const CHAPTERS: Chapter[] = [
  { id: "drawing", n: "00", title: "The drawing", line: "Every US Trailer starts on paper, drawn around one owner's vehicle, licence and load." },
  { id: "chassis", n: "01", title: "Chassis", line: "The backbone. Cut, jigged and welded square, then hot-dip galvanised inside and out." },
  { id: "running", n: "02", title: "Running gear", line: "Independent trailing arms with coil-overs. Each wheel answers the road on its own." },
  { id: "wheels", n: "03", title: "Wheels", line: "Matched to your tow vehicle: same stud pattern, same spare." },
  { id: "frame", n: "04", title: "Frame & floor", line: "A welded SHS cage carries the body. The floor is marine ply under checker plate." },
  { id: "skin", n: "05", title: "Skin", line: "Bonded aluminium composite. Quiet on corrugations, light on the scale." },
  { id: "doors", n: "06", title: "Doors & ramp", line: "A rear ramp rated for a 300 kg quad, and a side door where you actually need it." },
  { id: "systems", n: "07", title: "Systems", line: "Sealed LED lighting, one wiring harness, water, solar. Labelled at both ends." },
  { id: "finish", n: "08", title: "Handover", line: "Weighed, registered, roadworthy. Then it's yours." },
];

export type Kind = "toyhauler" | "offroad" | "gooseneck";

export const KINDS: { id: Kind; name: string; short: string }[] = [
  { id: "toyhauler", name: "Toy hauler", short: "Toy hauler" },
  { id: "offroad", name: "Off-road camper", short: "Off-road" },
  { id: "gooseneck", name: "Gooseneck toy hauler", short: "Gooseneck" },
];

export type TrailerConfig = {
  /** which kind of trailer (toy hauler if missing, for older build codes) */
  kind?: Kind;
  /** body length, metres */
  length: number;
  axles: 1 | 2;
  /** body colour, hex */
  colour: string;
  solar: boolean;
  rack: boolean;
};

export const DEFAULT_CONFIG: TrailerConfig = { length: 4.8, axles: 2, colour: "#2C3136", solar: true, rack: true };

/* ---------- fixed dimensions (metres) ---------- */
export const DIM = {
  bodyW: 1.9,
  floorY: 0.74,
  roofY: 2.8,
  railY: 0.62,
  railZ: 0.6,
  wheelR: 0.38,
  tyreW: 0.27,
  trackZ: 1.08,
  coupleH: 0.55,
};

const lin = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

export function axlePositions(cfg: TrailerConfig): number[] {
  // positions tuned in the test rig so the hitch carries ~9% (camper) and ~20% (gooseneck) when parked
  if (cfg.kind === "offroad") return [-cfg.length * 0.03];
  // gooseneck: axles well back, the hitch over the bakkie's rear axle carries 15-25% of the load
  if (cfg.kind === "gooseneck") return [-cfg.length * 0.06 + 0.45, -cfg.length * 0.06 - 0.45];
  // axle group sits just behind the centre of mass so the coupler carries ~9% nose weight
  // (checked live in the test rig: nose kg = gross − Σ wheel suspension forces / g)
  const L = cfg.length;
  const centre = -L * 0.066;
  return cfg.axles === 2 ? [centre + 0.45, centre - 0.45] : [centre];
}

export function buildTrailer(cfg: TrailerConfig = DEFAULT_CONFIG): Part[] {
  if (cfg.kind === "offroad") return buildOffroad(cfg);
  if (cfg.kind === "gooseneck") return buildGooseneck(cfg);
  const L = cfg.length;
  const hx = L / 2;
  const { bodyW, floorY, roofY, railY, railZ, wheelR, tyreW, trackZ, coupleH } = DIM;
  const hz = bodyW / 2;
  const coupX = hx + 1.35;
  const axles = axlePositions(cfg);
  const bodyH = roofY - floorY;
  const parts: Part[] = [];

  /* ---------------- 01 Chassis ---------------- */
  parts.push({
    id: "rails",
    name: "Main rails",
    job: "Carry every kilogram from the coupler to the axles.",
    material: "Hot-dip galvanised steel",
    spec: "150 × 50 × 5 mm channel",
    chapter: "chassis",
    weld: true,
    anchor: [hx - 0.4, railY, railZ],
    from: [0, 3.2, 0],
    explode: [0, -0.5, 0],
    meshes: [-1, 1].map((s) => ({ shape: { k: "box", s: [L + 0.1, 0.15, 0.05] }, p: [0, railY, s * railZ] as V3, m: "galv" as Mat })),
  });
  parts.push({
    id: "cross",
    name: "Cross members",
    job: "Tie the rails square and stop the chassis twisting on uneven ground.",
    material: "Hot-dip galvanised steel",
    spec: `${Math.round(L / 0.7) + 1} × 100 × 50 mm, every 700 mm`,
    chapter: "chassis",
    weld: true,
    anchor: [0, railY, 0],
    from: [0, 2.6, 0],
    explode: [0, -0.8, 0],
    meshes: [
      ...lin(-hx + 0.05, hx - 0.05, Math.round(L / 0.7) + 1).map((x) => ({ shape: { k: "box", s: [0.05, 0.1, bodyW - 0.06] }, p: [x, railY + 0.02, 0] as V3, m: "galv" as Mat } as MeshSpec)),
      ...[-1, 1].map((s) => ({ shape: { k: "box", s: [L, 0.08, 0.04] }, p: [0, railY + 0.035, s * (hz - 0.02)] as V3, m: "galv" as Mat } as MeshSpec)),
    ],
  });
  parts.push({
    id: "drawbar",
    name: "A-frame drawbar",
    job: "Turns the bakkie's pull into the chassis and keeps the trailer tracking straight.",
    material: "Hot-dip galvanised steel",
    spec: "100 × 50 × 4 mm RHS, 1.35 m",
    chapter: "chassis",
    weld: true,
    anchor: [hx + 0.7, coupleH + 0.05, 0.3],
    from: [2.4, 1.2, 0],
    explode: [1.0, 0, 0],
    meshes: [-1, 1].map((s) => ({ shape: { k: "beam", a: [hx - 0.3, railY, s * railZ], b: [coupX - 0.12, coupleH, s * 0.05], s: [0.1, 0.05] }, m: "galv" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "coupler",
    name: "Off-road coupling",
    job: "Lets the trailer roll through 360° when the track twists, so nothing binds or snaps.",
    material: "Forged steel, poly bush",
    spec: "3 500 kg rated, articulating",
    chapter: "chassis",
    anchor: [coupX + 0.05, coupleH, 0],
    from: [1.6, 0.6, 0],
    explode: [0.7, 0.2, 0],
    meshes: [
      { shape: { k: "box", s: [0.26, 0.11, 0.12] }, p: [coupX, coupleH, 0], m: "galv" },
      { shape: { k: "cyl", r: 0.06, h: 0.1, axis: "y" }, p: [coupX + 0.14, coupleH, 0], m: "poly" },
      { shape: { k: "rod", a: [coupX - 0.05, coupleH + 0.06, 0.04], b: [coupX + 0.1, coupleH + 0.11, 0.04], r: 0.012 }, m: "galv" },
    ],
  });
  parts.push({
    id: "jockey",
    name: "Jockey wheel",
    job: "Holds the nose level when unhitched, and winds up so one person can hitch alone.",
    material: "Galvanised clamp, solid rubber wheel",
    spec: "Ø 200 mm wheel, 500 kg",
    chapter: "chassis",
    anchor: [coupX - 0.55, 0.3, 0.26],
    from: [0, 1.5, 1.2],
    explode: [0, -0.2, 0.6],
    meshes: [
      { shape: { k: "cyl", r: 0.03, h: 0.62, axis: "y" }, p: [coupX - 0.55, 0.45, 0.24], m: "galv" },
      { shape: { k: "cyl", r: 0.012, h: 0.18, axis: "x" }, p: [coupX - 0.55, 0.78, 0.24], m: "galv" },
      { shape: { k: "tyre", r: 0.1, w: 0.07 }, p: [coupX - 0.55, 0.1, 0.24], m: "rubber" },
    ],
  });

  /* ---------------- 02 Running gear ---------------- */
  axles.forEach((ax, i) => {
    const sides = [1, -1] as const;
    parts.push({
      id: `susp${i}`,
      name: cfg.axles === 2 ? `Suspension, ${i === 0 ? "front" : "rear"} pair` : "Suspension",
      job: "Trailing arms pivot from the chassis; coil-overs soak up each bump separately.",
      material: "Galvanised arms, nitrogen shocks",
      spec: "2 × trailing arm, 250 mm travel",
      chapter: "running",
      weld: true,
      anchor: [ax + 0.3, 0.5, -railZ - 0.1],
      from: [0, -1.4, sides[0] * 0],
      explode: [0, -0.35, 0],
      meshes: sides.flatMap((s) => [
        { shape: { k: "beam", a: [ax + 0.6, railY - 0.06, s * (railZ + 0.03)], b: [ax, wheelR, s * (trackZ - 0.2)], s: [0.08, 0.06] }, m: "galv" } as MeshSpec,
        { shape: { k: "coil", a: [ax + 0.12, wheelR + 0.06, s * (trackZ - 0.26)], b: [ax + 0.22, railY + 0.04, s * (railZ + 0.06)], r: 0.055, wire: 0.011, turns: 7 }, m: "accent" } as MeshSpec,
        { shape: { k: "rod", a: [ax + 0.12, wheelR + 0.06, s * (trackZ - 0.26)], b: [ax + 0.22, railY + 0.04, s * (railZ + 0.06)], r: 0.025 }, m: "rim" } as MeshSpec,
        { shape: { k: "cyl", r: 0.045, h: 0.14, axis: "z" }, p: [ax, wheelR, s * (trackZ - 0.14)], m: "galv" } as MeshSpec,
      ]),
    });
    parts.push({
      id: `brakes${i}`,
      name: cfg.axles === 2 ? `Disc brakes, ${i === 0 ? "front" : "rear"}` : "Disc brakes",
      job: "Overrun braking: when the bakkie slows, the trailer presses on the coupling and that applies its own brakes. Electric brakes are added when the trailer outweighs your vehicle.",
      material: "Vented disc, galvanised caliper",
      spec: "Ø 300 mm discs, overrun (electric where required)",
      chapter: "running",
      anchor: [ax, wheelR + 0.15, trackZ - 0.05],
      from: [0, 0, 1.4],
      explode: [0, 0, 0.45],
      meshes: [1, -1].flatMap((s) => [
        { shape: { k: "cyl", r: 0.15, h: 0.028, axis: "z" }, p: [ax, wheelR, s * (trackZ - 0.06)], m: "brake" } as MeshSpec,
        { shape: { k: "box", s: [0.1, 0.07, 0.06] }, p: [ax + 0.11, wheelR + 0.09, s * (trackZ - 0.06)], m: "accent" } as MeshSpec,
      ]),
    });
  });

  /* ---------------- 03 Wheels ---------------- */
  axles.forEach((ax, i) =>
    ([1, -1] as const).forEach((s) => {
      parts.push({
        id: `wheel${i}${s > 0 ? "L" : "R"}`,
        name: "Wheel & tyre",
        job: "Same size and stud pattern as your bakkie, so one spare fits both.",
        material: "Alloy rim, all-terrain tyre",
        spec: "265/75 R16, 6 × 139.7",
        chapter: "wheels",
        anchor: [ax, wheelR * 2, s * trackZ],
        from: [0, 0.2, s * 2.2],
        explode: [0, 0, s * 0.8],
        wheel: { x: ax, side: s },
        meshes: [
          { shape: { k: "tyre", r: wheelR, w: tyreW }, p: [ax, wheelR, s * trackZ], m: "rubber" },
          { shape: { k: "cyl", r: 0.21, h: tyreW * 0.82, axis: "z" }, p: [ax, wheelR, s * trackZ], m: "rim" },
          { shape: { k: "cyl", r: 0.05, h: tyreW * 0.9, axis: "z" }, p: [ax, wheelR, s * trackZ], m: "galv" },
        ],
      });
    }),
  );
  const ax0 = Math.max(...axles) + wheelR + 0.08;
  const ax1 = Math.min(...axles) - wheelR - 0.08;
  parts.push({
    id: "guards",
    name: "Mudguards",
    job: "Stop stones sand-blasting the body. Strong enough to stand on.",
    material: "3 mm aluminium checker plate",
    spec: "Flat-top tandem guards, 340 mm wide",
    chapter: "wheels",
    anchor: [(ax0 + ax1) / 2, wheelR * 2 + 0.1, trackZ + 0.17],
    from: [0, 1.5, 0],
    explode: [0, 0.5, 0.4],
    meshes: [1, -1].flatMap((s) => [
      { shape: { k: "box", s: [ax0 - ax1, 0.006, 0.34] }, p: [(ax0 + ax1) / 2, wheelR * 2 + 0.07, s * trackZ], m: "checker" } as MeshSpec,
      { shape: { k: "box", s: [0.006, 0.26, 0.34] }, p: [ax0, wheelR * 2 - 0.06, s * trackZ], rot: [0, 0, -0.5], m: "checker" } as MeshSpec,
      { shape: { k: "box", s: [0.006, 0.26, 0.34] }, p: [ax1, wheelR * 2 - 0.06, s * trackZ], rot: [0, 0, 0.5], m: "checker" } as MeshSpec,
    ]),
  });

  /* ---------------- 04 Frame & floor ---------------- */
  const studXs = lin(-hx + 0.03, hx - 0.03, Math.round(L / 0.6) + 1);
  parts.push({
    id: "cage",
    name: "Body frame",
    job: "A welded cage that carries the skin, roof load and tie-down rails.",
    material: "Galvanised SHS",
    spec: "40 × 40 × 2 mm, studs every 600 mm",
    chapter: "frame",
    weld: true,
    anchor: [0.6, roofY - 0.1, hz],
    from: [0, 3.5, 0],
    explode: [0, 1.1, 0],
    meshes: [
      ...studXs.flatMap((x) => [1, -1].map((s) => ({ shape: { k: "box", s: [0.04, bodyH, 0.04] }, p: [x, floorY + bodyH / 2, s * (hz - 0.03)] as V3, m: "galv" as Mat } as MeshSpec))),
      ...studXs.map((x) => ({ shape: { k: "box", s: [0.04, 0.04, bodyW - 0.06] }, p: [x, roofY - 0.02, 0] as V3, m: "galv" as Mat } as MeshSpec)),
      ...[1, -1].flatMap((s) => [floorY + 1.0, roofY - 0.02].map((y) => ({ shape: { k: "box", s: [L, 0.04, 0.04] }, p: [0, y, s * (hz - 0.03)] as V3, m: "galv" as Mat } as MeshSpec))),
      ...lin(-hz + 0.1, hz - 0.1, 4).map((z) => ({ shape: { k: "box", s: [0.04, bodyH, 0.04] }, p: [hx - 0.03, floorY + bodyH / 2, z] as V3, m: "galv" as Mat } as MeshSpec)),
    ],
  });
  parts.push({
    id: "floor",
    name: "Floor",
    job: "Takes a quad's tyres and a dropped toolbox without flexing.",
    material: "18 mm marine ply under 2 mm checker plate",
    spec: "Rated 450 kg/m², 6 recessed tie-downs",
    chapter: "frame",
    anchor: [-0.6, floorY, 0],
    from: [0, 2.2, 0],
    explode: [0, 0.4, 0],
    meshes: [
      { shape: { k: "box", s: [L, 0.018, bodyW - 0.02] }, p: [0, floorY - 0.012, 0], m: "ply" },
      { shape: { k: "box", s: [L - 0.04, 0.004, bodyW - 0.08] }, p: [0, floorY, 0], m: "checker" },
    ],
  });
  parts.push({
    id: "tank",
    name: "Water tank",
    job: "Underslung between the rails to keep weight low and centred.",
    material: "Food-grade polyethylene",
    spec: "80 L, stone-guarded",
    chapter: "frame",
    anchor: [hx - 1.2, railY - 0.2, 0],
    from: [0, -1.2, 0],
    explode: [0, -1.1, 0],
    meshes: [{ shape: { k: "box", s: [1.0, 0.18, railZ * 2 - 0.1] }, p: [hx - 1.2, railY - 0.15, 0], m: "poly" }],
  });

  /* ---------------- 05 Skin ---------------- */
  parts.push({
    id: "sides",
    name: "Side panels",
    job: "Close the body against dust and rain. Bonded, not riveted, so they don't drum.",
    material: "3 mm aluminium composite",
    spec: "Powder-coated, colour of your choice",
    chapter: "skin",
    anchor: [0.4, floorY + 1.4, hz + 0.01],
    from: [0, 0, 2.6],
    explode: [0, 0, 1.3],
    meshes: [1, -1].map((s) => ({ shape: { k: "box", s: [L, bodyH, 0.012] }, p: [0, floorY + bodyH / 2, s * (hz + 0.006)] as V3, m: "powder" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "nose",
    name: "Front wall & stone guard",
    job: "Takes the gravel the bakkie throws back. A sloped guard stops chips at the front.",
    material: "Aluminium composite + 3 mm checker plate",
    spec: "Sloped 30° stone guard, lockable nose locker",
    chapter: "skin",
    anchor: [hx + 0.2, floorY + 0.4, 0.4],
    from: [2.4, 0, 0],
    explode: [1.4, 0, 0],
    meshes: [
      { shape: { k: "box", s: [0.012, bodyH, bodyW + 0.024] }, p: [hx + 0.006, floorY + bodyH / 2, 0], m: "powder" },
      { shape: { k: "box", s: [0.4, 0.5, bodyW - 0.1] }, p: [hx + 0.2, floorY + 0.25, 0], m: "checker", shell: 0.003 },
      { shape: { k: "box", s: [0.012, 0.58, bodyW - 0.1] }, p: [hx + 0.32, floorY + 0.36, 0], rot: [0, 0, 0.5], m: "checker" },
    ],
  });
  parts.push({
    id: "roof",
    name: "Roof",
    job: "One-piece, crowned so water runs off and doesn't pool.",
    material: "3 mm aluminium composite",
    spec: "Walk-on rated with rack fitted",
    chapter: "skin",
    anchor: [-0.8, roofY + 0.01, -0.3],
    from: [0, 2.8, 0],
    explode: [0, 1.6, 0],
    meshes: [{ shape: { k: "box", s: [L + 0.02, 0.012, bodyW + 0.03] }, p: [0, roofY + 0.006, 0], m: "powder" }],
  });

  /* ---------------- 06 Doors ---------------- */
  const rampH = bodyH - 0.06;
  parts.push({
    id: "ramp",
    name: "Rear ramp door",
    job: "Drops to a 17° loading ramp for bikes and quads; closes as a sealed rear wall.",
    material: "Galvanised frame, checker-plate face",
    spec: "300 kg rated, gas-strut assisted",
    chapter: "doors",
    anchor: [-hx - 0.02, floorY + 1.2, 0.5],
    from: [-2.2, 0, 0],
    explode: [-1.2, 0, 0],
    hinge: { origin: [-hx - 0.02, floorY, 0], axis: [0, 0, 1], open: 1.86 },
    meshes: [
      { shape: { k: "box", s: [0.05, rampH, bodyW - 0.02] }, p: [-hx - 0.025, floorY + rampH / 2, 0], m: "powder" },
      { shape: { k: "box", s: [0.006, rampH - 0.1, bodyW - 0.12] }, p: [-hx - 0.052, floorY + rampH / 2, 0], m: "checker" },
    ],
  });
  const doorX = hx - 0.95;
  parts.push({
    id: "door",
    name: "Side door",
    job: "Kerb-side entry with a two-point lock, placed where you reach the gear you use most.",
    material: "Aluminium composite on SHS frame",
    spec: "700 × 1 850 mm, two-point lock",
    chapter: "doors",
    anchor: [doorX, floorY + 1.0, hz + 0.03],
    from: [0, 0, 1.6],
    explode: [0, 0, 0.9],
    hinge: { origin: [doorX + 0.35, 0, hz + 0.02], axis: [0, 1, 0], open: 1.4 },
    meshes: [
      { shape: { k: "box", s: [0.7, 1.85, 0.03] }, p: [doorX, floorY + 0.05 + 0.925, hz + 0.02], m: "powder" },
      { shape: { k: "box", s: [0.04, 0.16, 0.03] }, p: [doorX - 0.28, floorY + 1.0, hz + 0.045], m: "galv" },
    ],
  });
  parts.push({
    id: "windows",
    name: "Windows",
    job: "Light and airflow without opening the body to dust.",
    material: "Double-glazed acrylic, flush-fit",
    spec: "900 × 450 mm, insect screen",
    chapter: "doors",
    anchor: [-0.9, floorY + 1.65, hz + 0.02],
    from: [0, 0.6, 1.4],
    explode: [0, 0, 0.7],
    meshes: [1, -1].map((s) => ({ shape: { k: "box", s: [0.9, 0.45, 0.02] }, p: [-0.9, floorY + 1.6, s * (hz + 0.012)] as V3, m: "glass" as Mat } as MeshSpec)),
  });

  /* ---------------- 07 Systems ---------------- */
  parts.push({
    id: "lights",
    name: "LED lighting",
    job: "Tail, brake, indicator and side-marker lights, plus a work light over the door.",
    material: "Sealed LED units",
    spec: "IP67, 12 V, SANS 1046 compliant",
    chapter: "systems",
    anchor: [-hx - 0.04, floorY + 0.2, hz - 0.12],
    from: [-0.6, 0.8, 0],
    explode: [-0.5, 0, 0.3],
    meshes: [
      ...[1, -1].flatMap((s) => [
        { shape: { k: "box", s: [0.03, 0.16, 0.22] }, p: [-hx - 0.06, floorY + 0.18, s * (hz - 0.16)], m: "ledRed" } as MeshSpec,
        { shape: { k: "box", s: [0.06, 0.04, 0.012] }, p: [hx - 0.1, roofY - 0.08, s * (hz + 0.014)], m: "ledAmber" } as MeshSpec,
        { shape: { k: "box", s: [0.06, 0.04, 0.012] }, p: [-hx + 0.1, roofY - 0.08, s * (hz + 0.014)], m: "ledAmber" } as MeshSpec,
      ]),
      { shape: { k: "box", s: [0.6, 0.02, 0.05] }, p: [doorX, roofY - 0.12, hz + 0.04], m: "ledWhite" },
    ],
  });
  parts.push({
    id: "harness",
    name: "Wiring harness",
    job: "One continuous loom from the 13-pin plug to every light, fused and labelled.",
    material: "Automotive cable in split conduit",
    spec: "13-pin, sealed connectors",
    chapter: "systems",
    anchor: [hx + 0.6, coupleH + 0.04, -0.12],
    from: [0, -0.6, 0],
    explode: [0, -0.6, -0.4],
    meshes: [
      {
        shape: {
          k: "tube",
          pts: [
            [coupX - 0.1, coupleH + 0.02, -0.08],
            [hx - 0.2, railY + 0.01, -railZ + 0.04],
            [-hx + 0.15, railY + 0.01, -railZ + 0.04],
            [-hx - 0.04, floorY + 0.18, -hz + 0.16],
          ],
          r: 0.012,
        },
        m: "wire",
      },
    ],
  });
  if (cfg.rack)
    parts.push({
      id: "rack",
      name: "Roof rack",
      job: "Bolts through to the frame, not the skin. Carries a rooftop tent or solar.",
      material: "Galvanised steel, powder-coated",
      spec: "150 kg dynamic load",
      chapter: "systems",
      anchor: [hx - 0.6, roofY + 0.12, hz - 0.1],
      from: [0, 1.6, 0],
      explode: [0, 2.0, 0],
      meshes: [
        ...[1, -1].map((s) => ({ shape: { k: "box", s: [L - 0.6, 0.035, 0.04] }, p: [0, roofY + 0.1, s * (hz - 0.12)] as V3, m: "powder" as Mat } as MeshSpec)),
        ...lin(-hx + 0.4, hx - 0.4, 5).flatMap((x) => [
          { shape: { k: "box", s: [0.04, 0.035, bodyW - 0.2] }, p: [x, roofY + 0.1, 0] as V3, m: "powder" as Mat } as MeshSpec,
          ...[1, -1].map((s) => ({ shape: { k: "box", s: [0.04, 0.1, 0.04] }, p: [x, roofY + 0.05, s * (hz - 0.12)] as V3, m: "powder" as Mat } as MeshSpec)),
        ]),
      ],
    });
  if (cfg.solar)
    parts.push({
      id: "solar",
      name: "Solar panel",
      job: "Keeps the lithium battery topped up off-grid.",
      material: "Monocrystalline, tempered glass",
      spec: "200 W, MPPT controller",
      chapter: "systems",
      anchor: [-0.4, roofY + 0.16, 0],
      from: [0, 2.2, 0],
      explode: [0, 2.6, 0],
      meshes: [{ shape: { k: "box", s: [1.6, 0.035, 1.0] }, p: [-0.4, roofY + 0.14, 0], m: "solar" }],
    });

  return parts;
}

/**
 * Tare (kg): the sum of every part's real mass (geometry × material, see mass.ts) plus 12% for
 * fixings, paint and fittings. Precomputed by scripts/gen-tare.ts into tare.json so this stays tiny.
 */
export function tareKg(cfg: TrailerConfig): number {
  const t = (TARE as Record<string, number>)[buildKey(cfg)];
  if (t) return t;
  return Math.round(620 + cfg.length * 140 + (cfg.axles === 2 ? 160 : 0) + (cfg.solar ? 14 : 0) + (cfg.rack ? 38 : 0));
}

export function overallLength(cfg: TrailerConfig): number {
  if (cfg.kind === "offroad") return cfg.length + OFF.drawbar + 0.2;
  if (cfg.kind === "gooseneck") return cfg.length + GN.neck + 0.1;
  return cfg.length + 1.35 + 0.18;
}

/* =====================================================================================
 * Off-road camper: high clearance, long drawbar, single axle on long-travel suspension.
 * ===================================================================================== */
export const OFF = { bodyW: 1.6, floorY: 0.84, roofY: 1.86, railY: 0.72, railZ: 0.5, wheelR: 0.39, tyreW: 0.27, trackZ: 0.98, coupleH: 0.62, drawbar: 1.65 };

function buildOffroad(cfg: TrailerConfig): Part[] {
  const L = cfg.length;
  const hx = L / 2;
  const { bodyW, floorY, roofY, railY, railZ, wheelR, tyreW, trackZ, coupleH, drawbar } = OFF;
  const hz = bodyW / 2;
  const coupX = hx + drawbar;
  const ax = axlePositions(cfg)[0];
  const bodyH = roofY - floorY;
  const parts: Part[] = [];
  const sides = [1, -1] as const;

  parts.push({
    id: "rails", name: "Main rails", job: "The backbone: they carry the body, the water and you, over every corrugation.", material: "Hot-dip galvanised steel", spec: "100 × 50 × 4 mm RHS",
    chapter: "chassis", weld: true, anchor: [hx - 0.3, railY, railZ], from: [0, 3, 0], explode: [0, -0.5, 0],
    meshes: sides.map((s) => ({ shape: { k: "box", s: [L + 0.1, 0.1, 0.05] }, p: [0, railY, s * railZ] as V3, m: "galv" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "cross", name: "Cross members", job: "Keep the rails square and take the twist when one wheel drops into a hole.", material: "Hot-dip galvanised steel", spec: `${Math.round(L / 0.6) + 1} × 75 × 50 mm`,
    chapter: "chassis", weld: true, anchor: [0, railY, 0], from: [0, 2.4, 0], explode: [0, -0.8, 0],
    meshes: lin(-hx + 0.05, hx - 0.05, Math.round(L / 0.6) + 1).map((x) => ({ shape: { k: "box", s: [0.05, 0.075, bodyW - 0.06] }, p: [x, railY + 0.01, 0] as V3, m: "galv" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "drawbar", name: "Long drawbar", job: "Long enough that the trailer clears the bakkie on tight turns and steep break-overs.", material: "Hot-dip galvanised steel", spec: `100 × 50 × 4 mm RHS, ${drawbar.toFixed(2).replace(".", ",")} m`,
    chapter: "chassis", weld: true, anchor: [hx + 0.8, coupleH + 0.05, 0.3], from: [2.4, 1.2, 0], explode: [1.0, 0, 0],
    meshes: sides.map((s) => ({ shape: { k: "beam", a: [hx - 0.2, railY, s * railZ], b: [coupX - 0.14, coupleH, s * 0.05], s: [0.1, 0.05] }, m: "galv" } as MeshSpec)),
  });
  parts.push({
    id: "coupler", name: "Articulating coupling", job: "Turns through 360° so the trailer and the bakkie can each twist on rough tracks without breaking the hitch.", material: "Forged steel, poly bush", spec: "3 500 kg rated, off-road articulating",
    chapter: "chassis", anchor: [coupX, coupleH, 0], from: [1.6, 0.6, 0], explode: [0.7, 0.2, 0],
    meshes: [
      { shape: { k: "box", s: [0.28, 0.12, 0.13] }, p: [coupX, coupleH, 0], m: "galv" },
      { shape: { k: "cyl", r: 0.065, h: 0.11, axis: "y" }, p: [coupX + 0.15, coupleH, 0], m: "poly" },
    ],
  });
  parts.push({
    id: "jockey", name: "Jockey wheel", job: "Holds the nose level at camp and winds the coupling onto the ball.", material: "Galvanised clamp, pneumatic wheel", spec: "Ø 250 mm, 500 kg",
    chapter: "chassis", anchor: [coupX - 0.6, 0.35, 0.24], from: [0, 1.5, 1.2], explode: [0, -0.2, 0.6],
    meshes: [
      { shape: { k: "cyl", r: 0.03, h: 0.66, axis: "y" }, p: [coupX - 0.6, 0.5, 0.22], m: "galv" },
      { shape: { k: "tyre", r: 0.125, w: 0.08 }, p: [coupX - 0.6, 0.125, 0.22], m: "rubber" },
    ],
  });
  parts.push({
    id: "jerry", name: "Jerry-can holders", job: "Carry 40 litres of extra fuel low and forward, where the weight helps the nose.", material: "Galvanised steel frames", spec: "2 × 20 L, lockable",
    chapter: "systems", anchor: [hx + 0.45, railY + 0.3, 0.3], from: [1.2, 1.2, 0], explode: [0.6, 0.6, 0],
    meshes: sides.flatMap((s) => [
      { shape: { k: "box", s: [0.36, 0.48, 0.18] }, p: [hx + 0.45, railY + 0.3, s * 0.22], m: "accent", kg: 4.5 } as MeshSpec,
      { shape: { k: "box", s: [0.38, 0.04, 0.2] }, p: [hx + 0.45, railY + 0.04, s * 0.22], m: "galv" } as MeshSpec,
    ]),
  });
  // running gear: long-travel trailing arms, twin shocks, discs
  parts.push({
    id: "susp0", name: "Long-travel suspension", job: "Each wheel moves on its own trailing arm with twin shocks, so the body stays level when the track doesn't.", material: "Galvanised arms, nitrogen shocks", spec: "2 × trailing arm, 280 mm travel",
    chapter: "running", weld: true, anchor: [ax + 0.3, 0.55, -railZ - 0.1], from: [0, -1.4, 0], explode: [0, -0.35, 0],
    meshes: sides.flatMap((s) => [
      { shape: { k: "beam", a: [ax + 0.62, railY - 0.06, s * (railZ + 0.03)], b: [ax, wheelR, s * (trackZ - 0.2)], s: [0.08, 0.06] }, m: "galv" } as MeshSpec,
      { shape: { k: "coil", a: [ax + 0.1, wheelR + 0.06, s * (trackZ - 0.26)], b: [ax + 0.2, railY + 0.05, s * (railZ + 0.06)], r: 0.06, wire: 0.012, turns: 7 }, m: "accent" } as MeshSpec,
      { shape: { k: "rod", a: [ax - 0.1, wheelR + 0.05, s * (trackZ - 0.26)], b: [ax - 0.02, railY + 0.05, s * (railZ + 0.06)], r: 0.024 }, m: "rim" } as MeshSpec,
      { shape: { k: "cyl", r: 0.045, h: 0.14, axis: "z" }, p: [ax, wheelR, s * (trackZ - 0.14)], m: "galv" } as MeshSpec,
    ]),
  });
  parts.push({
    id: "brakes0", name: "Disc brakes", job: "Overrun discs stop the trailer pushing the bakkie on steep descents; electric where the trailer outweighs the vehicle.", material: "Vented disc, galvanised caliper", spec: "Ø 300 mm, overrun or electric",
    chapter: "running", anchor: [ax, wheelR + 0.15, trackZ - 0.05], from: [0, 0, 1.4], explode: [0, 0, 0.45],
    meshes: sides.flatMap((s) => [
      { shape: { k: "cyl", r: 0.15, h: 0.028, axis: "z" }, p: [ax, wheelR, s * (trackZ - 0.06)], m: "brake" } as MeshSpec,
      { shape: { k: "box", s: [0.1, 0.07, 0.06] }, p: [ax + 0.11, wheelR + 0.09, s * (trackZ - 0.06)], m: "accent" } as MeshSpec,
    ]),
  });
  sides.forEach((s) =>
    parts.push({
      id: `wheel0${s > 0 ? "L" : "R"}`, name: "Wheel & tyre", job: "Same size and stud pattern as your bakkie, so one spare fits both.", material: "Alloy rim, all-terrain tyre", spec: "265/75 R16, 6 × 139.7",
      chapter: "wheels", anchor: [ax, wheelR * 2, s * trackZ], from: [0, 0.2, s * 2.2], explode: [0, 0, s * 0.8], wheel: { x: ax, side: s },
      meshes: [
        { shape: { k: "tyre", r: wheelR, w: tyreW }, p: [ax, wheelR, s * trackZ], m: "rubber" },
        { shape: { k: "cyl", r: 0.21, h: tyreW * 0.82, axis: "z" }, p: [ax, wheelR, s * trackZ], m: "rim" },
        { shape: { k: "cyl", r: 0.05, h: tyreW * 0.9, axis: "z" }, p: [ax, wheelR, s * trackZ], m: "galv" },
      ],
    }),
  );
  parts.push({
    id: "guards", name: "Mudguards", job: "Keep stones off the body and double as a step to reach the roof.", material: "3 mm aluminium checker plate", spec: "Flat-top, 300 mm wide",
    chapter: "wheels", anchor: [ax, wheelR * 2 + 0.12, trackZ + 0.15], from: [0, 1.5, 0], explode: [0, 0.5, 0.4],
    meshes: sides.map((s) => ({ shape: { k: "box", s: [wheelR * 2 + 0.3, 0.006, 0.3] }, p: [ax, wheelR * 2 + 0.1, s * trackZ] as V3, m: "checker" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "floor", name: "Floor", job: "Marine ply under checker plate: stiff, quiet and easy to hose out.", material: "18 mm marine ply, 2 mm checker plate", spec: "Rated 400 kg/m²",
    chapter: "frame", anchor: [-0.3, floorY, 0], from: [0, 2.2, 0], explode: [0, 0.4, 0],
    meshes: [{ shape: { k: "box", s: [L, 0.02, bodyW - 0.02] }, p: [0, floorY - 0.012, 0], m: "ply" }],
  });
  parts.push({
    id: "tank", name: "Water tank", job: "Underslung between the rails, low and centred over the axle so full or empty it doesn't change the balance.", material: "Food-grade polyethylene", spec: "100 L, stone-guarded",
    chapter: "frame", anchor: [ax, railY - 0.18, 0], from: [0, -1.2, 0], explode: [0, -1.1, 0],
    meshes: [{ shape: { k: "box", s: [0.9, 0.2, railZ * 2 - 0.1] }, p: [ax, railY - 0.16, 0], m: "poly" }],
  });
  parts.push({
    id: "tub", name: "Body tub", job: "A sealed, dust-proof box for clothes, bedding and the fridge. Bonded panels on a welded frame.", material: "Aluminium composite on SHS frame", spec: "Dust-sealed, IP-rated latches",
    chapter: "skin", anchor: [0.2, floorY + bodyH * 0.6, hz + 0.01], from: [0, 0, 2.4], explode: [0, 0, 1.2],
    meshes: [
      ...sides.map((s) => ({ shape: { k: "box", s: [L, bodyH, 0.012] }, p: [0, floorY + bodyH / 2, s * (hz + 0.006)] as V3, m: "powder" as Mat } as MeshSpec)),
      { shape: { k: "box", s: [0.012, bodyH, bodyW] }, p: [hx, floorY + bodyH / 2, 0], m: "powder" },
      { shape: { k: "box", s: [0.012, bodyH, bodyW] }, p: [-hx, floorY + bodyH / 2, 0], m: "powder" },
      { shape: { k: "box", s: [0.36, 0.5, bodyW - 0.1] }, p: [hx + 0.18, floorY + 0.12, 0], m: "checker", shell: 0.003 },
    ],
  });
  parts.push({
    id: "lid", name: "Roof & rooftop tent", job: "A hard-shell tent that opens in a minute and folds down to 230 mm, with the bed made inside.", material: "Aluminium roof, ABS shell", spec: "2 × 1.4 m bed, 230 mm folded",
    chapter: "skin", anchor: [-0.2, roofY + 0.2, -0.3], from: [0, 2.6, 0], explode: [0, 1.6, 0],
    meshes: [
      { shape: { k: "box", s: [L + 0.02, 0.012, bodyW + 0.02] }, p: [0, roofY + 0.006, 0], m: "alu" },
      { shape: { k: "box", s: [Math.min(L - 0.2, 2.2), 0.23, bodyW - 0.1] }, p: [-0.1, roofY + 0.13, 0], m: "poly" },
    ],
  });
  parts.push({
    id: "kitchen", name: "Slide-out kitchen", job: "Slides out on the side away from the road: stove, sink and drawers at standing height.", material: "Stainless steel on locking runners", spec: "2-burner, 150 kg runners",
    chapter: "doors", anchor: [hx - 0.75, floorY + 0.45, -hz - 0.35], from: [0, 0, -1.6], explode: [0, 0, -0.9],
    meshes: [
      { shape: { k: "box", s: [1.1, 0.12, 0.6] }, p: [hx - 0.75, floorY + 0.5, -hz - 0.28], m: "alu", shell: 0.0012 },
      { shape: { k: "box", s: [1.1, 0.35, 0.5] }, p: [hx - 0.75, floorY + 0.25, -hz - 0.23], m: "alu", shell: 0.0012 },
    ],
  });
  parts.push({
    id: "door", name: "Rear door", job: "Lifts on gas struts for the fridge slide and the main storage.", material: "Aluminium composite on SHS frame", spec: "Gas-strut, two-point lock",
    chapter: "doors", anchor: [-hx - 0.02, floorY + bodyH * 0.6, 0.4], from: [-1.8, 0, 0], explode: [-1, 0, 0],
    hinge: { origin: [-hx - 0.03, roofY - 0.02, 0], axis: [0, 0, 1], open: -1.3 },
    meshes: [{ shape: { k: "box", s: [0.03, bodyH - 0.08, bodyW - 0.1] }, p: [-hx - 0.03, floorY + bodyH / 2, 0], m: "powder" }],
  });
  parts.push({
    id: "battery", name: "Lithium battery box", job: "Runs the fridge, lights and pump for days off-grid. Sits forward and low for balance.", material: "Lithium iron phosphate, sealed box", spec: "200 Ah, DC-DC charger",
    chapter: "systems", anchor: [hx + 0.1, floorY + 0.55, 0], from: [1.2, 0.8, 0], explode: [0.6, 0.6, 0],
    meshes: [{ shape: { k: "box", s: [0.3, 0.25, 0.5] }, p: [hx - 0.25, floorY + 0.14, 0.4], m: "poly", kg: 24 }],
  });
  parts.push({
    id: "spare", name: "Spare wheel", job: "A full-size spare on the back, the same as the bakkie's.", material: "Alloy rim, all-terrain tyre", spec: "265/75 R16",
    chapter: "systems", anchor: [-hx - 0.2, floorY + 0.4, 0], from: [-1.6, 0.6, 0], explode: [-0.8, 0, 0],
    meshes: [{ shape: { k: "tyre", r: wheelR, w: tyreW }, p: [-hx - 0.17, floorY + 0.45, 0], rot: [0, Math.PI / 2, 0], m: "rubber" }],
  });
  parts.push({
    id: "lights", name: "LED lighting", job: "Tail, stop, indicator and marker lights, plus the awning light over the kitchen.", material: "Sealed LED units", spec: "IP67, 12 V",
    chapter: "systems", anchor: [-hx - 0.04, floorY + 0.15, hz - 0.12], from: [-0.6, 0.8, 0], explode: [-0.5, 0, 0.3],
    meshes: [
      ...sides.map((s) => ({ shape: { k: "box", s: [0.03, 0.14, 0.2] }, p: [-hx - 0.04, floorY + 0.14, s * (hz - 0.16)] as V3, m: "ledRed" as Mat } as MeshSpec)),
      { shape: { k: "box", s: [0.8, 0.02, 0.05] }, p: [hx - 0.75, roofY - 0.06, -hz - 0.04], m: "ledWhite" },
    ],
  });
  parts.push({
    id: "harness", name: "Wiring harness", job: "One sealed loom from the 13-pin plug to every light and the battery charger.", material: "Automotive cable in split conduit", spec: "13-pin, Anderson plug",
    chapter: "systems", anchor: [hx + 0.7, coupleH + 0.04, -0.12], from: [0, -0.6, 0], explode: [0, -0.6, -0.4],
    meshes: [{ shape: { k: "tube", pts: [[coupX - 0.12, coupleH + 0.02, -0.08], [hx - 0.2, railY + 0.01, -railZ + 0.04], [-hx + 0.15, railY + 0.01, -railZ + 0.04], [-hx - 0.04, floorY + 0.14, -hz + 0.16]], r: 0.012 }, m: "wire" }],
  });
  if (cfg.solar)
    parts.push({
      id: "solar", name: "Solar panel", job: "Tops up the lithium battery while you're parked.", material: "Monocrystalline, tempered glass", spec: "200 W, MPPT",
      chapter: "systems", anchor: [hx - 0.5, roofY + 0.3, 0], from: [0, 2.2, 0], explode: [0, 2.4, 0],
      meshes: [{ shape: { k: "box", s: [0.7, 0.03, bodyW - 0.2] }, p: [hx - 0.5, roofY + 0.27, 0], m: "solar" }],
    });
  return parts;
}

/* =====================================================================================
 * Gooseneck toy hauler: a raised neck reaches over the bakkie's load bed to a ball hitch.
 * ===================================================================================== */
export const GN = { bodyW: 2.0, floorY: 0.8, roofY: 3.05, railY: 0.68, railZ: 0.66, wheelR: 0.38, tyreW: 0.27, trackZ: 1.06, neck: 2.2, neckFloor: 1.58, ballY: 0.98 };

function buildGooseneck(cfg: TrailerConfig): Part[] {
  const L = cfg.length;
  const hx = L / 2;
  const { bodyW, floorY, roofY, railY, railZ, wheelR, tyreW, trackZ, neck, neckFloor, ballY } = GN;
  const hz = bodyW / 2;
  const nx1 = hx + neck; // front of the neck
  const postX = hx + neck - 0.6;
  const axles = axlePositions(cfg);
  const bodyH = roofY - floorY;
  const parts: Part[] = [];
  const sides = [1, -1] as const;

  parts.push({
    id: "rails", name: "Main rails", job: "Carry the deck and the load from the axles up to the neck.", material: "Hot-dip galvanised steel", spec: "200 × 75 × 6 mm channel",
    chapter: "chassis", weld: true, anchor: [0, railY, railZ], from: [0, 3.2, 0], explode: [0, -0.5, 0],
    meshes: sides.map((s) => ({ shape: { k: "box", s: [L + 0.1, 0.2, 0.075] }, p: [0, railY - 0.03, s * railZ] as V3, m: "galv" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "neckframe", name: "Neck frame", job: "Lifts the front of the trailer over the bakkie's tailgate and carries the hitch load into the rails.", material: "Hot-dip galvanised steel", spec: "150 × 75 mm RHS, gusseted",
    chapter: "chassis", weld: true, anchor: [hx + 0.4, (railY + neckFloor) / 2, railZ], from: [2.2, 1.6, 0], explode: [1.0, 0.6, 0],
    meshes: sides.flatMap((s) => [
      { shape: { k: "beam", a: [hx - 0.4, railY, s * railZ], b: [hx + 0.35, neckFloor - 0.08, s * railZ], s: [0.15, 0.075] }, m: "galv" } as MeshSpec,
      { shape: { k: "box", s: [neck - 0.3, 0.15, 0.075] }, p: [hx + 0.2 + (neck - 0.3) / 2, neckFloor - 0.08, s * railZ], m: "galv" } as MeshSpec,
    ]),
  });
  parts.push({
    id: "cross", name: "Cross members", job: "Tie the rails and the neck square so the trailer tracks straight behind the bakkie.", material: "Hot-dip galvanised steel", spec: `${Math.round(L / 0.6) + 4} × 100 × 50 mm`,
    chapter: "chassis", weld: true, anchor: [0, railY, 0], from: [0, 2.6, 0], explode: [0, -0.8, 0],
    meshes: [
      ...lin(-hx + 0.05, hx - 0.3, Math.round(L / 0.6) + 1).map((x) => ({ shape: { k: "box", s: [0.05, 0.1, bodyW - 0.06] }, p: [x, railY + 0.03, 0] as V3, m: "galv" as Mat } as MeshSpec)),
      ...lin(hx + 0.4, nx1 - 0.1, 3).map((x) => ({ shape: { k: "box", s: [0.05, 0.1, bodyW - 0.06] }, p: [x, neckFloor - 0.08, 0] as V3, m: "galv" as Mat } as MeshSpec)),
    ],
  });
  parts.push({
    id: "post", name: "Gooseneck post & coupler", job: "Drops from the neck to a ball in the bakkie's load bed, over its rear axle, where the bakkie carries weight best.", material: "Forged steel, galvanised tube", spec: "Ø 2 5/16\" ball, 9 000 kg rated, adjustable height",
    chapter: "chassis", weld: true, anchor: [postX, (ballY + neckFloor) / 2, 0.15], from: [0, 1.8, 0], explode: [0, 1.0, 0],
    meshes: [
      { shape: { k: "box", s: [0.14, neckFloor - 0.12 - ballY, 0.14] }, p: [postX, (neckFloor - 0.12 + ballY) / 2 + 0.04, 0], m: "galv" },
      { shape: { k: "cyl", r: 0.07, h: 0.1, axis: "y" }, p: [postX, ballY + 0.02, 0], m: "poly" },
      { shape: { k: "beam", a: [postX + 0.05, neckFloor - 0.15, 0], b: [postX + 0.4, neckFloor - 0.15, 0], s: [0.08, 0.1] }, m: "galv" },
    ],
  });
  parts.push({
    id: "legs", name: "Landing legs", job: "Two drop legs hold the neck up when you drive the bakkie out from under it.", material: "Galvanised telescopic legs, winch", spec: "2 × 5 000 kg, crank or 12 V",
    chapter: "chassis", anchor: [hx + 0.5, 0.6, hz], from: [0, 1.4, 1.2], explode: [0, -0.2, 0.6],
    meshes: sides.flatMap((s) => [
      { shape: { k: "box", s: [0.08, neckFloor - 0.2, 0.08] }, p: [hx + 0.5, (neckFloor - 0.2) / 2 + 0.1, s * (hz - 0.05)], m: "galv" } as MeshSpec,
      { shape: { k: "box", s: [0.22, 0.03, 0.22] }, p: [hx + 0.5, 0.02, s * (hz - 0.05)], m: "galv" } as MeshSpec,
    ]),
  });
  axles.forEach((ax, i) => {
    parts.push({
      id: `susp${i}`, name: `Suspension, ${i === 0 ? "front" : "rear"} pair`, job: "Torsion-rubber axles: no springs to break, and a soft ride for bikes or horses inside.", material: "Galvanised torsion axle", spec: "2 × 3 000 kg torsion axle",
      chapter: "running", weld: true, anchor: [ax + 0.3, 0.5, -railZ - 0.1], from: [0, -1.4, 0], explode: [0, -0.35, 0],
      meshes: [
        { shape: { k: "box", s: [0.1, 0.1, trackZ * 2 - 0.45] }, p: [ax + 0.12, railY - 0.18, 0], m: "galv" },
        ...sides.map((s) => ({ shape: { k: "beam", a: [ax + 0.12, railY - 0.18, s * (trackZ - 0.24)], b: [ax, wheelR, s * (trackZ - 0.15)], s: [0.07, 0.06] }, m: "galv" } as MeshSpec)),
      ],
    });
    parts.push({
      id: `brakes${i}`, name: `Electric brakes, ${i === 0 ? "front" : "rear"}`, job: "Worked from the bakkie's cab, so the trailer brakes with you, not after you.", material: "Electric drum brakes", spec: "12\" electric drums, in-cab controller",
      chapter: "running", anchor: [ax, wheelR + 0.15, trackZ - 0.05], from: [0, 0, 1.4], explode: [0, 0, 0.45],
      meshes: sides.map((s) => ({ shape: { k: "cyl", r: 0.16, h: 0.06, axis: "z" }, p: [ax, wheelR, s * (trackZ - 0.08)] as V3, m: "brake" as Mat } as MeshSpec)),
    });
    sides.forEach((s) =>
      parts.push({
        id: `wheel${i}${s > 0 ? "L" : "R"}`, name: "Wheel & tyre", job: "Load-rated light-truck tyres for the extra weight a gooseneck carries.", material: "Steel rim, LT tyre", spec: "235/85 R16 LT, 10-ply",
        chapter: "wheels", anchor: [ax, wheelR * 2, s * trackZ], from: [0, 0.2, s * 2.2], explode: [0, 0, s * 0.8], wheel: { x: ax, side: s },
        meshes: [
          { shape: { k: "tyre", r: wheelR, w: tyreW }, p: [ax, wheelR, s * trackZ], m: "rubber" },
          { shape: { k: "cyl", r: 0.21, h: tyreW * 0.82, axis: "z" }, p: [ax, wheelR, s * trackZ], m: "rim" },
        ],
      }),
    );
  });
  const g0 = Math.max(...axles) + wheelR + 0.08;
  const g1 = Math.min(...axles) - wheelR - 0.08;
  parts.push({
    id: "guards", name: "Mudguards", job: "Tandem guards that keep stones off the body and the load.", material: "3 mm aluminium checker plate", spec: "Flat-top, 340 mm wide",
    chapter: "wheels", anchor: [(g0 + g1) / 2, wheelR * 2 + 0.1, trackZ + 0.17], from: [0, 1.5, 0], explode: [0, 0.5, 0.4],
    meshes: sides.map((s) => ({ shape: { k: "box", s: [g0 - g1, 0.006, 0.3] }, p: [(g0 + g1) / 2, wheelR * 2 + 0.07, s * (trackZ + 0.01)] as V3, m: "checker" as Mat } as MeshSpec)),
  });
  parts.push({
    id: "floor", name: "Deck & neck floor", job: "Checker plate over marine ply on the main deck; the neck floor becomes a bedroom or tack room.", material: "18 mm marine ply, 2 mm checker plate", spec: "Rated 450 kg/m², 8 tie-downs",
    chapter: "frame", anchor: [-0.6, floorY, 0], from: [0, 2.2, 0], explode: [0, 0.4, 0],
    meshes: [
      { shape: { k: "box", s: [L, 0.018, bodyW - 0.02] }, p: [0, floorY - 0.014, 0], m: "ply" },
      { shape: { k: "box", s: [L - 0.04, 0.004, bodyW - 0.08] }, p: [0, floorY, 0], m: "checker" },
      { shape: { k: "box", s: [neck, 0.02, bodyW - 0.02] }, p: [hx + neck / 2, neckFloor, 0], m: "ply" },
    ],
  });
  parts.push({
    id: "cage", name: "Body frame", job: "A welded SHS cage that carries the skin, the roof and the bunk above the neck.", material: "Galvanised SHS", spec: "50 × 50 × 2 mm, studs every 600 mm",
    chapter: "frame", weld: true, anchor: [0.6, roofY - 0.1, hz], from: [0, 3.5, 0], explode: [0, 1.1, 0],
    meshes: [
      ...lin(-hx + 0.03, hx - 0.03, Math.round(L / 0.6) + 1).flatMap((x) => sides.map((s) => ({ shape: { k: "box", s: [0.05, bodyH, 0.05] }, p: [x, floorY + bodyH / 2, s * (hz - 0.03)] as V3, m: "galv" as Mat } as MeshSpec))),
      ...sides.map((s) => ({ shape: { k: "box", s: [L + neck, 0.05, 0.05] }, p: [neck / 2, roofY - 0.02, s * (hz - 0.03)] as V3, m: "galv" as Mat } as MeshSpec)),
    ],
  });
  parts.push({
    id: "sides", name: "Side panels", job: "One continuous skin from the ramp to the nose, bonded so it stays quiet at speed.", material: "3 mm aluminium composite", spec: "Powder-coated, your colour",
    chapter: "skin", anchor: [0.4, floorY + 1.4, hz + 0.01], from: [0, 0, 2.6], explode: [0, 0, 1.3],
    meshes: sides.flatMap((s) => [
      { shape: { k: "box", s: [L, bodyH, 0.012] }, p: [0, floorY + bodyH / 2, s * (hz + 0.006)], m: "powder" } as MeshSpec,
      { shape: { k: "box", s: [neck, roofY - neckFloor, 0.012] }, p: [hx + neck / 2, (roofY + neckFloor) / 2, s * (hz + 0.006)], m: "powder" } as MeshSpec,
    ]),
  });
  parts.push({
    id: "nose", name: "Nose & roof", job: "A sloped nose cuts the wind over the bakkie's cab; the roof is one piece, crowned to shed water.", material: "Aluminium composite", spec: "Walk-on roof, sloped nose",
    chapter: "skin", anchor: [nx1, (roofY + neckFloor) / 2, 0.4], from: [2.4, 0, 0], explode: [1.4, 0.8, 0],
    meshes: [
      { shape: { k: "box", s: [0.012, roofY - neckFloor, bodyW + 0.024] }, p: [nx1, (roofY + neckFloor) / 2, 0], m: "powder" },
      { shape: { k: "box", s: [L + neck + 0.02, 0.012, bodyW + 0.03] }, p: [neck / 2, roofY + 0.006, 0], m: "powder" },
      { shape: { k: "box", s: [neck - 0.05, 0.012, bodyW] }, p: [hx + neck / 2, neckFloor - 0.012, 0], m: "powder" },
    ],
  });
  const rampH = bodyH - 0.06;
  parts.push({
    id: "ramp", name: "Rear ramp door", job: "Drops to a loading ramp for bikes, quads or a side-by-side, and seals shut as the back wall.", material: "Galvanised frame, checker-plate face", spec: "500 kg rated, spring-assisted",
    chapter: "doors", anchor: [-hx - 0.02, floorY + 1.2, 0.5], from: [-2.2, 0, 0], explode: [-1.2, 0, 0],
    hinge: { origin: [-hx - 0.02, floorY, 0], axis: [0, 0, 1], open: 1.86 },
    meshes: [
      { shape: { k: "box", s: [0.05, rampH, bodyW - 0.02] }, p: [-hx - 0.025, floorY + rampH / 2, 0], m: "powder" },
      { shape: { k: "box", s: [0.006, rampH - 0.1, bodyW - 0.12] }, p: [-hx - 0.052, floorY + rampH / 2, 0], m: "checker" },
    ],
  });
  parts.push({
    id: "door", name: "Side door", job: "Kerb-side entry into the living space, with a fold-down step.", material: "Aluminium composite on SHS frame", spec: "750 × 1 900 mm, two-point lock",
    chapter: "doors", anchor: [hx - 1.2, floorY + 1.0, hz + 0.03], from: [0, 0, 1.6], explode: [0, 0, 0.9],
    hinge: { origin: [hx - 1.2 + 0.375, 0, hz + 0.02], axis: [0, 1, 0], open: 1.4 },
    meshes: [{ shape: { k: "box", s: [0.75, 1.9, 0.03] }, p: [hx - 1.2, floorY + 0.05 + 0.95, hz + 0.02], m: "powder" }],
  });
  parts.push({
    id: "windows", name: "Windows", job: "Light and airflow in the living space and over the bed in the neck.", material: "Double-glazed acrylic", spec: "Flush-fit, insect screens",
    chapter: "doors", anchor: [hx + neck / 2, roofY - 0.5, hz + 0.02], from: [0, 0.6, 1.4], explode: [0, 0, 0.7],
    meshes: sides.flatMap((s) => [
      { shape: { k: "box", s: [1.0, 0.45, 0.02] }, p: [-0.6, floorY + 1.6, s * (hz + 0.012)], m: "glass" } as MeshSpec,
      { shape: { k: "box", s: [0.9, 0.4, 0.02] }, p: [hx + neck / 2, roofY - 0.5, s * (hz + 0.012)], m: "glass" } as MeshSpec,
    ]),
  });
  parts.push({
    id: "lights", name: "LED lighting", job: "Tail, stop, indicator and clearance lights for a long, tall trailer, plus the awning light.", material: "Sealed LED units", spec: "IP67, 12 V",
    chapter: "systems", anchor: [-hx - 0.04, floorY + 0.2, hz - 0.12], from: [-0.6, 0.8, 0], explode: [-0.5, 0, 0.3],
    meshes: [
      ...sides.map((s) => ({ shape: { k: "box", s: [0.03, 0.16, 0.22] }, p: [-hx - 0.06, floorY + 0.18, s * (hz - 0.16)] as V3, m: "ledRed" as Mat } as MeshSpec)),
      ...sides.flatMap((s) => [-hx + 0.1, 0, nx1 - 0.1].map((x) => ({ shape: { k: "box", s: [0.06, 0.04, 0.012] }, p: [x, roofY - 0.08, s * (hz + 0.014)] as V3, m: "ledAmber" as Mat } as MeshSpec))),
      { shape: { k: "box", s: [0.7, 0.02, 0.05] }, p: [hx - 1.2, roofY - 0.12, hz + 0.04], m: "ledWhite" },
    ],
  });
  parts.push({
    id: "harness", name: "Wiring harness", job: "Runs from a bed-mounted 7-pin plug up the post to every light and the brake magnets.", material: "Automotive cable in split conduit", spec: "7-pin, brake-controller ready",
    chapter: "systems", anchor: [postX, ballY + 0.25, -0.12], from: [0, -0.6, 0], explode: [0, -0.6, -0.4],
    meshes: [{ shape: { k: "tube", pts: [[postX, ballY + 0.1, -0.09], [postX - 0.1, neckFloor - 0.15, -0.3], [hx, railY + 0.02, -railZ + 0.05], [-hx + 0.15, railY + 0.02, -railZ + 0.05], [-hx - 0.04, floorY + 0.18, -hz + 0.16]], r: 0.012 }, m: "wire" }],
  });
  if (cfg.solar)
    parts.push({
      id: "solar", name: "Solar panels", job: "Charge the house battery for lights, fans and the fridge at the track.", material: "Monocrystalline, tempered glass", spec: "2 × 200 W, MPPT",
      chapter: "systems", anchor: [-0.6, roofY + 0.1, 0], from: [0, 2.2, 0], explode: [0, 2.6, 0],
      meshes: [-1.2, 0.6].map((x) => ({ shape: { k: "box", s: [1.6, 0.035, 1.0] }, p: [x, roofY + 0.06, 0] as V3, m: "solar" as Mat } as MeshSpec)),
    });
  return parts;
}
