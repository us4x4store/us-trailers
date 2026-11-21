import { IMAGES, type SiteImage } from "./images";

/**
 * EXAMPLE COMMISSIONS. Illustrative builds, written from the kind of briefs Cape Town buyers bring us,
 * shown until Justin's real client builds (with permission and photos) replace them.
 * Each `code` is a real build code: the page reads its specs from the same model as the designer.
 */
export type Build = {
  slug: string;
  title: string;
  where: string;
  code: string | null;
  image: SiteImage;
  need: string;
  design: string;
  build: string;
  result: string;
  extras: string[];
};

export const BUILDS: Build[] = [
  {
    slug: "tankwa-toy-hauler",
    title: "A garage for two bikes and a quad",
    where: "Durbanville to the Tankwa Karoo",
    code: "L54-A2-C0-R1-S1",
    image: IMAGES.ramp,
    need: "A family that rides the Tankwa and northern Cape every school holiday. Two dirt bikes, a quad, fuel and spares, and somewhere dry to sleep when the wind comes up. Their old open trailer shook the bikes loose on corrugations, twice.",
    design: "A 5.4 m tandem toy hauler, so the quad sits ahead of the axles and the bikes behind it. Ten rated D-rings let each bike strap in three ways. The ramp is drawn for the quad's 290 kg and doubles as a porch at camp. Two fold-down bunks sit above the bikes, and the fuel lives outside the cabin in a vented locker.",
    build: "A galvanised 100 × 50 mm chassis, jigged square to within 3 mm on the diagonals. Leaf springs with shackles greased from outside, and a roof rack carrying the spare and a solar panel feeding a 100 Ah lithium battery.",
    result: "Hitch load set at 8.6% with the quad aboard, so it tracks straight on the R355. It was weighed at the weighbridge, and the tare is on the information plate.",
    extras: ["Two fold-down bunks", "Vented fuel locker", "10 rated D-rings", "Ramp porch with legs"],
  },
  {
    slug: "cederberg-camper",
    title: "A camper that keeps up with a Hilux",
    where: "Cape Town to the Cederberg",
    code: "O30-A1-C2-R0-S1",
    image: IMAGES.offroadDusk,
    need: "A couple who camp most weekends in the Cederberg and want to reach the back sites. Their brief: a trailer that goes where the bakkie goes, a kitchen that is up in five minutes, and water for four days.",
    design: "A 3.0 m off-road camper on independent coil-over trailing arms, with an articulating coupling that turns through 360°. The kitchen slides out on the side away from the road. 80 litres of water are slung under the floor, between the axles and low down.",
    build: "Fynbos-green powder coat over galvanised steel, a stainless kitchen on 150 kg runners, a rear door on gas struts for the fridge slide, and LED lights sealed to IP67.",
    result: "690 kg tare, 1 500 kg GVM, within the Hilux's towing rating with room to spare. The wheels match the bakkie, so one spare fits both.",
    extras: ["Slide-out kitchen", "80 L underslung water", "Fridge slide", "Matching wheels and spare"],
  },
  {
    slug: "ceres-gooseneck",
    title: "A gooseneck for the farm and the track",
    where: "A fruit farm outside Ceres",
    code: "G72-A2-C1-R0-S1",
    image: IMAGES.gooseneck,
    need: "A farmer who moves quads and spraying kit between blocks in the week and races enduro at weekends. The bumper-pull trailer he had pushed the bakkie around on the passes.",
    design: "A 7.2 m gooseneck that hitches over the bakkie's rear axle, so the bakkie carries the weight instead of being levered by it. The gooseneck ball mounts through the load bed to the chassis. The lower deck takes the quads; the upper deck has a sleeping area for race weekends.",
    build: "A twin-rail chassis with a boxed neck, electric disc brakes with an in-cab controller, landing legs for parking off the bakkie, and a Prussian-blue skin.",
    result: "Stable on the Gydo Pass with two quads aboard. A 100 km/h sign on the back, as the law asks of a combination this heavy.",
    extras: ["Through-bed gooseneck ball", "Electric brakes, in-cab controller", "Landing legs", "Upper-deck sleeping area"],
  },
  {
    slug: "car-trailer-rebuild",
    title: "A tired car trailer, rebuilt for bikes",
    where: "Somerset West",
    code: null,
    image: IMAGES.workshop,
    need: "A 2009 flatbed with rusted cross members, worn bushes and lights that worked when they felt like it. The owner wanted to keep the chassis and turn it into a covered bike carrier.",
    design: "We stripped it to the chassis rails, measured the rust and drew new cross members, a raised floor and a lockable canopy for two bikes. It kept its GVM, so the paperwork stays simple.",
    build: "New galvanised cross members welded in, new bushes and bearings, a sealed LED harness labelled at both ends, and a canopy on a steel frame with a drop-down tail.",
    result: "Back through roadworthy first time, with a new weighbridge slip and an updated information plate.",
    extras: ["New cross members", "Sealed LED harness", "Lockable canopy", "Roadworthy passed"],
  },
];
