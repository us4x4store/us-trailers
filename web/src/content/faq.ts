/**
 * FAQ, written from the National Road Traffic Regulations (consolidated text, Acts Online) and the
 * Western Cape fee gazette of 20 March 2026. Sources and open questions: research/market.md section 3.
 * Items marked `confirm` depend on US Trailers' own MIB registration and must be confirmed by Justin.
 */
export type Faq = { id: string; q: string; a: string[]; tags: string[]; confirm?: boolean };

export const FAQ: Faq[] = [
  {
    id: "licence",
    q: "Can I tow it on a code B licence?",
    a: [
      "Code B lets you tow a trailer with a GVM (its maximum laden mass) of up to 750 kg. Anything heavier needs code EB.",
      "Most toy haulers, off-road campers, horse boxes and goosenecks are well over 750 kg, so plan on EB. If you only have code B, tell us: we can design a trailer that stays within 750 kg GVM.",
    ],
    tags: ["licence", "toy-haulers", "off-road-trailers", "gooseneck-fifth-wheel-trailers"],
  },
  {
    id: "brakes",
    q: "Does my trailer need brakes?",
    a: [
      "It depends on the trailer's GVM compared with your tow vehicle's tare (its empty mass), under regulation 151.",
      "Up to 750 kg GVM and no more than half your vehicle's tare: a parking brake is enough. Between 750 kg and 3 500 kg GVM: you need a parking brake plus overrun or service brakes, and a service brake you can work from the driver's seat once the trailer's GVM is more than your vehicle's tare.",
      "We spec the brakes for your vehicle when we draw the trailer, so this is settled before any steel is cut.",
    ],
    tags: ["brakes", "toy-haulers", "off-road-trailers", "gooseneck-fifth-wheel-trailers"],
  },
  {
    id: "roadworthy",
    q: "Do I need a roadworthy certificate?",
    a: [
      "Not every year: private light trailers don't need an annual roadworthy.",
      "A roadworthy is needed before a licence disc is issued when a used trailer changes owner, when a trailer has been modified or rebuilt, or when it was built by someone who isn't a registered builder.",
      "A modification to your existing trailer can therefore mean a fresh roadworthy. We tell you upfront if yours will.",
    ],
    tags: ["roadworthy", "modifications-and-upgrades"],
    confirm: true,
  },
  {
    id: "register",
    q: "Does a trailer have to be registered and licensed?",
    a: [
      "Yes. Every trailer must be registered and carry a licence disc, small ones included. There is no exemption for trailers under 750 kg.",
      "In the Western Cape, from 1 July 2026, registration costs R310 and the annual licence is based on the trailer's tare: R174 up to 250 kg, R336 from 751 to 1 000 kg and R612 from 1 251 to 1 500 kg.",
    ],
    tags: ["register", "toy-haulers", "off-road-trailers"],
  },
  {
    id: "speed",
    q: "How fast may I tow?",
    a: [
      "Behind a car or SUV, the normal limits apply: 60 km/h in town, 100 km/h on rural roads and 120 km/h on freeways.",
      "Behind a bakkie it's different. If the bakkie's GVM plus the trailer's GVM comes to more than 3 500 kg, the limit is 100 km/h everywhere and you must show a 100 km/h sign on the back. A double-cab of about 3 000 kg GVM with any trailer over 500 kg GVM is in that group.",
    ],
    tags: ["speed", "off-road-trailers", "toy-haulers"],
  },
  {
    id: "size",
    q: "How big can a trailer be?",
    a: [
      "No wider than 2.5 m and no higher than 4.3 m, load included.",
      "A single-axle trailer can be up to 8 m long, not counting the drawbar. On trailers with more than one axle, the drawbar can be up to 2 m. A bakkie and a gooseneck or fifth-wheel trailer together can be up to 18.5 m long.",
    ],
    tags: ["size", "gooseneck-fifth-wheel-trailers"],
  },
  {
    id: "markings",
    q: "What lights and reflectors are required?",
    a: [
      "Red tail lights and stop lights on each side, amber indicators, a lit number plate, two white reflectors at the front and two red ones at the back.",
      "Every trailer also needs reflective contour tape along the sides and rear. It's the item most often missed on home-built trailers. Ours leave the workshop with all of it fitted.",
    ],
    tags: ["markings", "modifications-and-upgrades"],
  },
  {
    id: "time",
    q: "How long does a build take?",
    a: ["A typical build takes about 12 weeks from signed drawing to handover. Your dates are set in your drawing, and they move only if you change the brief."],
    tags: ["time"],
    confirm: true,
  },
  {
    id: "cost",
    q: "How much does a custom trailer cost?",
    a: [
      "It depends on the size, the axles and the kit. The configurator on our home page gives you a price range as you design.",
      "Your fixed price comes with your drawing, before you pay a deposit.",
    ],
    tags: ["cost"],
  },
  {
    id: "modify",
    q: "Can you modify or upgrade a trailer I already own?",
    a: [
      "Yes. Common jobs are independent suspension, brakes, wiring and lights, racks, water and solar, and turning an open trailer into an enclosed one.",
      "We inspect the trailer first. If the change counts as a modification under the regulations, we tell you before we start what that means for its roadworthy.",
    ],
    tags: ["modifications-and-upgrades"],
  },
];

export const FAQ_NOTE =
  "Summarised from the National Road Traffic Regulations and the Western Cape fee schedule (2026). This is guidance, not legal advice. Your licensing office has the final word.";
