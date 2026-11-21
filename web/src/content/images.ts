/**
 * CONCEPT RENDERS, generated in Figma (file "US Trailers – concept renders") from our own trailer
 * designs. Replace each with Justin's real photos when they arrive (see the shot list in the
 * launch kit). Keep the `concept` flag true until then: it shows the "Concept render" caption.
 */
export type SiteImage = { src: string; alt: string; w: number; h: number; concept: boolean };

export const IMAGES = {
  heroToyHauler: { src: "/images/concept/texan-vnose-dusk.jpg", alt: "A gloss-black Texas-style V-nose toy hauler at an ATV track at dusk, polished checker plate on the nose, polished wheels and RGB underglow lighting the gravel", w: 1536, h: 864, concept: true },
  offroadDusk: { src: "/images/concept/offroad-cederberg-dusk.jpg", alt: "A compact off-road camper trailer at a Cederberg campsite at dusk, awning light on and kitchen slid out", w: 1536, h: 864, concept: true },
  gooseneck: { src: "/images/concept/gooseneck-cederberg-v2.jpg", alt: "A graphite gooseneck toy hauler hitched into the load bed of a white double-cab on a gravel road below Western Cape mountains", w: 1536, h: 864, concept: true },
  workshop: { src: "/images/concept/workshop-chassis-weld.jpg", alt: "A welder MIG-welding a galvanised trailer chassis on a jig in a Cape Town workshop", w: 1536, h: 864, concept: true },
  weld: { src: "/images/concept/weld-macro.jpg", alt: "Close-up of a MIG weld bead joining two galvanised square tubes", w: 1024, h: 1024, concept: true },
  ramp: { src: "/images/concept/texan-ramp-night.jpg", alt: "A red ATV on the lowered checker-plate ramp of a gloss-black toy hauler at night, the garage lit in violet and cyan RGB with E-track on the walls", w: 1536, h: 864, concept: true },
} satisfies Record<string, SiteImage>;

export const TYPE_IMAGE: Record<string, SiteImage> = {
  "toy-haulers": IMAGES.ramp,
  "gooseneck-fifth-wheel-trailers": IMAGES.gooseneck,
  "off-road-trailers": IMAGES.offroadDusk,
  "modifications-and-upgrades": IMAGES.workshop,
};
