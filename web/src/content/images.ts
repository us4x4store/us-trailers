/**
 * CONCEPT RENDERS, generated in Figma (file "US Trailers – concept renders") from our own trailer
 * designs. Replace each with Justin's real photos when they arrive (see the shot list in the
 * launch kit). Keep the `concept` flag true until then: it shows the "Concept render" caption.
 */
export type SiteImage = { src: string; alt: string; w: number; h: number; concept: boolean };

export const IMAGES = {
  heroToyHauler: { src: "/images/concept/hero-toyhauler-tankwa-v2.jpg", alt: "A graphite tandem toy hauler towed behind a white double-cab along a gravel road in the Tankwa Karoo at sunset, dust trailing from the wheels", w: 1536, h: 864, concept: true },
  offroadDusk: { src: "/images/concept/offroad-cederberg-dusk.jpg", alt: "A compact off-road camper trailer at a Cederberg campsite at dusk, awning light on and kitchen slid out", w: 1536, h: 864, concept: true },
  gooseneck: { src: "/images/concept/gooseneck-cederberg-v2.jpg", alt: "A graphite gooseneck toy hauler hitched into the load bed of a white double-cab on a gravel road below Western Cape mountains", w: 1536, h: 864, concept: true },
  workshop: { src: "/images/concept/workshop-chassis-weld.jpg", alt: "A welder MIG-welding a galvanised trailer chassis on a jig in a Cape Town workshop", w: 1536, h: 864, concept: true },
  weld: { src: "/images/concept/weld-macro.jpg", alt: "Close-up of a MIG weld bead joining two galvanised square tubes", w: 1024, h: 1024, concept: true },
  ramp: { src: "/images/concept/ramp-dirtbike.jpg", alt: "A dirt bike being wheeled up the lowered rear ramp of a toy hauler at a motocross track", w: 1536, h: 864, concept: true },
} satisfies Record<string, SiteImage>;

export const TYPE_IMAGE: Record<string, SiteImage> = {
  "toy-haulers": IMAGES.ramp,
  "gooseneck-fifth-wheel-trailers": IMAGES.gooseneck,
  "off-road-trailers": IMAGES.offroadDusk,
  "modifications-and-upgrades": IMAGES.workshop,
};
