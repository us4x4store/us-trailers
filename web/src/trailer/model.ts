/**
 * The US Trailers parametric trailer model.
 * One source of truth for the assembly film, exploded view, physics rig and configurator.
 * Units: metres. Axes: +X towards the coupler (front), +Y up, +Z to the kerb (left) side.
 * Ground is y = 0.
 *
 * Specs below are example specs for the concept build (marked EXAMPLE in the UI copy)
 * until Justin confirms his real components.
 */

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

export type MeshSpec = { shape: Shape; p?: V3; rot?: V3; m: Mat };

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

export type TrailerConfig = {
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
  // axle group sits behind centre so the coupler carries roughly 7–10% nose weight
  const L = cfg.length;
  const centre = -L * 0.12;
  return cfg.axles === 2 ? [centre + 0.45, centre - 0.45] : [centre];
}

export function buildTrailer(cfg: TrailerConfig = DEFAULT_CONFIG): Part[] {
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
      job: "Override braking: the trailer brakes itself when the bakkie slows, so it never pushes.",
      material: "Vented disc, galvanised caliper",
      spec: "Ø 300 mm discs, mechanical override",
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
      { shape: { k: "box", s: [0.4, 0.5, bodyW - 0.1] }, p: [hx + 0.2, floorY + 0.25, 0], m: "checker" },
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

/** Tare estimate from the config (kg). Calibrated to SA toy-hauler market weights (example). */
export function tareKg(cfg: TrailerConfig): number {
  return Math.round(620 + cfg.length * 140 + (cfg.axles === 2 ? 160 : 0) + (cfg.solar ? 14 : 0) + (cfg.rack ? 38 : 0));
}

export function overallLength(cfg: TrailerConfig): number {
  return cfg.length + 1.35 + 0.18;
}
