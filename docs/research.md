# Research summary

Full notes: `research/market.md` (Phase 1, market) and `research/design.md` (Phase 2, 47 sites measured live in the browser, no screenshots).

## Market in five lines
- Six buyer types: overlanders (R185k–R900k+), toy-hauler/bike owners (no SA-built toy hauler exists; US import about R950k), horse owners (R77k–R480k), food/coffee operators (R40k–R500k), farmers/contractors, gooseneck/fifth-wheel early adopters.
- Biggest fears: build defects and paperwork (registration, licence code, brakes).
- Cape Town competitors run template sites: catalogue grids, hidden prices, spec dumps, basic forms. Only Vagabond SA shows rand prices with a configurator.
- Gaps nobody owns locally: SA-built toy haulers, goosenecks/fifth-wheels, modifications.
- Searches are type + "for sale" + "south africa"/"cape town", plus price and licence questions. "Bespoke" isn't searched; "custom" is.

## Rules (for the FAQ; verify before publishing)
Every trailer must be registered and licensed. Licence code B covers trailers up to 750 kg GVM; heavier trailers need EB. Brake requirements follow reg 151 (trailer GVM vs tow-vehicle tare). Limits: 2.5 m wide, 4.3 m high, 8 m long for a single-axle trailer. Contour markings are required. A bakkie towing over 3,500 kg combined GVM is limited to 100 km/h (reg 293). Builders who sell must be MIB-registered with NRCS homologation. Details and sources in `research/market.md` section 3.

## Top 10 ideas (ranked by wow × selling power)
1. **Sketch to steel**: scroll turns a pencil sketch into a blueprint, then a steel chassis that assembles part by part, then the finished trailer at dusk. Ends on "Your turn. Start your build."
2. **Live configurator** with a live rand range, a shareable build code, and "Send this build" that fills the enquiry or WhatsApp.
3. **Hold to X-ray**: press and hold to see through the paint to the galvanised chassis, welds and wiring.
4. **Named commissions + "Ask [founder]"** on WhatsApp. "Not a catalogue."
5. **See it in your driveway**: AR at real size (Quick Look USDZ on iPhone, WebXR/Scene Viewer on Android).
6. **Day / dusk / night switch**: night turns on the LEDs under a Karoo star field.
7. **Build timeline scrubber**, Week 1 raw steel to Week 12 handover, from real workshop footage.
8. **"Hitch up" gate** that doubles as the optional sound switch.
9. **The Nine Systems** exploded view on each trailer-type page, one indexable section per system.
10. **One playable physics moment**: drag the trailer over Tankwa corrugations and watch the suspension work.

## Strongest references
- metic.studio/en (X-ray/magnifier, R3F, about 2.9 MB)
- illoca.unseen.co (sketch to 3D to finished)
- oryzo.ai (one hero object, mobile tuning)
- forgeautomotive.co.uk (bespoke vehicle workshop, Website of the Day on about 1.2 MB of JS)
- helderburg.com (tone: "Ask Paul", named commissions, "The Twelve Systems")

## Performance lessons
Award winners ship far less JS than dealer sites (Forge about 1.2 MB vs EarthRoamer about 62 MB). On phones they cap DPR around 1.5 and send lighter scenes. Ad and tracking tags are the cheapest way to lose Lighthouse 90. three.js now prefers WebGPU with a WebGL fallback.
