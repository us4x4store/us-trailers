/**
 * Trailer-type pages. Slugs follow the search clusters in research/market.md section 4.
 * Engineering points describe how US Trailers designs each type; component brands and
 * ratings are EXAMPLES until Justin confirms (questions batch 1, Q6).
 */
export type TypePage = {
  slug: string;
  short: string;
  title: string; // <title>
  description: string; // meta description
  h1: string;
  intro: string;
  forWho: string[];
  points: { h: string; p: string }[];
  rules: string[];
  faq: string[]; // FAQ ids
  drawing: "toyhauler" | "gooseneck" | "offroad" | "modify";
};

export const TYPES: TypePage[] = [
  {
    slug: "toy-haulers",
    short: "Toy haulers",
    title: "Toy haulers built in South Africa | US Trailers, Cape Town",
    description:
      "Custom enclosed toy haulers for bikes, quads and side-by-sides, built to order in Cape Town. Rear ramp door, tie-down floor, galvanised chassis. Not one for sale off a floor: one drawn for you.",
    h1: "Toy haulers, built here.",
    intro:
      "A garage on wheels for your bikes, quad or side-by-side, with somewhere to sleep, cook or work at the far end of the road. Nobody in South Africa builds them, so people import them. We draw yours around what you ride and what you tow with.",
    forWho: ["Motocross and enduro riders", "Quad and side-by-side owners", "Jet-ski families", "Race teams that need a mobile pit"],
    points: [
      { h: "A ramp that's also the back wall", p: "The rear door drops to a gentle loading angle, rated for a 300 kg quad, and seals shut as a wall when you close it." },
      { h: "A floor that holds the load", p: "Marine ply under checker plate, with recessed tie-down points placed for your machines, so the straps pull straight down." },
      { h: "Balanced on the tow ball", p: "We position the axles so the coupling carries 7–10% of the loaded weight. That stops sway without squashing your bakkie's rear springs." },
      { h: "Living space if you want it", p: "Fold-down bunks, a galley, water and solar, all fitted to the frame rather than screwed into the skin." },
    ],
    rules: ["Most enclosed toy haulers are over 750 kg GVM, so you'll need a code EB licence.", "Over 750 kg GVM, the trailer must have brakes. We size them to your vehicle."],
    faq: ["licence", "brakes", "speed", "register"],
    drawing: "toyhauler",
  },
  {
    slug: "gooseneck-fifth-wheel-trailers",
    short: "Gooseneck & fifth-wheel",
    title: "Gooseneck & fifth-wheel trailers, South Africa | US Trailers",
    description:
      "Custom gooseneck and fifth-wheel trailers for horses, toy haulers, living quarters and heavy equipment, built in Cape Town and engineered to your bakkie's load bed.",
    h1: "Goosenecks & fifth-wheels.",
    intro:
      "Hitching over the rear axle instead of behind the bumper puts the weight where the bakkie can carry it. You can take more weight, turn tighter and get much less sway. They're common in America and rare here. We design the hitch, the bed mounting and the trailer together.",
    forWho: ["Horse owners who want living quarters", "Toy-hauler buyers who need more space", "Farmers moving heavy equipment", "Long-distance touring"],
    points: [
      { h: "Hitch and bed as one system", p: "The coupling mounts through to the bakkie's chassis, not the load bin. We check its rating against your vehicle's GCM before anything is drawn." },
      { h: "Tight turns, no bumper strike", p: "We work out the swing clearance against your cab and tailgate from your vehicle's measurements." },
      { h: "Room over the neck", p: "The raised front section is a bedroom, a tack room or a storage deck, whichever you need most." },
      { h: "Within the length limits", p: "A bakkie and a semi-trailer together may be up to 18.5 m long. We fit the layout inside that." },
    ],
    rules: [
      "Bakkie plus trailer, measured by GVM, will almost always be over 3 500 kg, which means 100 km/h maximum and a 100 km/h sign on the back.",
      "The front overhang of a semi-trailer may not exceed 1.8 m.",
    ],
    faq: ["licence", "size", "speed", "brakes"],
    drawing: "gooseneck",
  },
  {
    slug: "off-road-trailers",
    short: "Off-road trailers",
    title: "Custom off-road trailers built in Cape Town | US Trailers",
    description:
      "Custom off-road and overland camping trailers built in Cape Town: independent suspension, articulating coupling, galvanised chassis. Designed for your 4x4, your licence code and the roads you actually take.",
    h1: "Off-road trailers, drawn for your route.",
    intro:
      "Corrugations, river crossings and two weeks without a town. An off-road trailer earns its keep where the tar ends, so we start with where you're going and build backwards from there.",
    forWho: ["Overlanders heading north", "Families who camp off-grid", "Hunters and anglers", "4x4 clubs and tour operators"],
    points: [
      { h: "Each wheel works on its own", p: "Trailing arms with coil-overs let each wheel follow the ground. You can watch it working in the test rig on our home page." },
      { h: "A coupling that twists", p: "An articulating off-road coupling turns through 360°, so the trailer and the vehicle can each twist without straining the hitch." },
      { h: "Built for the weighbridge", p: "We design to a target tare from day one, so the trailer stays inside your vehicle's towing limit and, if you need it, the code-B limit." },
      { h: "Water, power, kitchen", p: "Underslung water tanks, lithium power with solar, and a kitchen that slides out on the side away from the traffic." },
    ],
    rules: [
      "Every trailer, small ones included, must be registered and licensed.",
      "A trailer of up to 750 kg GVM can be towed on code B. We can design to that limit.",
    ],
    faq: ["licence", "brakes", "speed", "register", "markings"],
    drawing: "offroad",
  },
  {
    slug: "modifications-and-upgrades",
    short: "Modifications & upgrades",
    title: "Trailer modifications & upgrades, Cape Town | US Trailers",
    description:
      "Upgrade the trailer you already own: independent suspension, brakes, wiring and LED lights, racks, water, solar and enclosed conversions. Cape Town workshop, roadworthy-aware.",
    h1: "Make your trailer better.",
    intro:
      "Plenty of good trailers are let down by one weak part, such as the suspension, the wiring or the brakes. We find it and fix it, and we tell you upfront if the change means a fresh roadworthy.",
    forWho: ["Trailers that sway, bottom out or crack", "Upgrading to independent suspension", "Adding brakes for a heavier load", "Turning an open trailer into a closed one"],
    points: [
      { h: "Inspection first", p: "We put the trailer on the weighbridge and check the chassis, the welds, the bearings and the wiring before quoting." },
      { h: "Suspension & brakes", p: "Independent suspension kits, matched shocks, and override or electric brakes sized to the trailer's GVM." },
      { h: "Wiring done once", p: "A new sealed harness from plug to tail light, with LED lights, contour tape and an information plate." },
      { h: "Racks, water, solar", p: "Bolted to the frame, never just to the skin, and weighed afterwards so you know the new tare." },
    ],
    rules: [
      "A modified or rebuilt trailer needs a roadworthy before a new licence disc is issued.",
      "Contour (reflective) tape along the sides and rear is compulsory on every trailer.",
    ],
    faq: ["modify", "roadworthy", "markings", "brakes"],
    drawing: "modify",
  },
];

export const typeBySlug = (slug: string) => TYPES.find((t) => t.slug === slug);
