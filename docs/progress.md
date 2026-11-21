# Progress

_Last updated: 2026-11-19 (session 1)_

## Done
- Project folder `us-trailers/` created; brief saved as `CLAUDE.md` with Justin's standing rule (no screenshots, use the live browser).
- Cloud environment network opened so the browser can reach outside sites.
- Next.js 16 (App Router, TS, Tailwind 4) scaffolded in `web/`; installed three, R3F, Drei, Rapier, GSAP, Lenis, Motion, zod.
- Vercel CLI 66 installed (logged out; `vercel deploy --temporary` works without login).
- Local git repo initialised on `main`.

## Also done
- Phase 1 market research (`research/market.md`) and Phase 2 design research, 47 sites (`research/design.md`), summarised in `docs/research.md`.
- Question batch 1 sent to Justin (`docs/questions-for-justin.md`).
- Phase 3: three live creative directions published for decision 1: https://claude.ai/artifact/LGchJgx46qgHrZoeDJzZeZ (source `design/directions.html`). Recommended: 1, Drawing Office.

## Built (session 1, continued)
- Parametric trailer model (`web/src/trailer/model.ts`): 27 named parts in metres, each with job, material and spec (example specs until Justin confirms).
- 'Sketch to steel' scroll film: blueprint draws itself, parts fly in by chapter, weld sparks with gravity, callouts with leader lines, bill of materials, hold-to-explode, ramp and lights.
- Physics test rig: towed by a kinematic tow ball through a spherical joint, ray-cast suspension per wheel, tar / corrugations / rocks, strappable loads, live nose weight, GVM, licence code and 100 km/h rule.
- Verified numerically in a live browser (`web/scripts/inspect-film.js`, `web/scripts/test-physics.js`): no console errors; contact points match the road to ~1.5 mm; static sag 51–55 mm; nose weight 8.7% empty, 9.2% loaded; coupler tracks the tow ball exactly.

## Built (session 2)
- Live configurator (#design): length 3.6–6.0 m, single/tandem, 6 colours, rack, solar; live 3D rebuild, weights, licence, indicative rand range (EXAMPLE pricing in `web/src/trailer/pricing.ts`), shareable `?build=` codes.
- Enquiry brief form (#enquire): server action with zod, honeypot + timing trap, attached build, POPIA consent. Delivers by email via Resend once `ENQUIRY_TO` and `RESEND_API_KEY` are set on Vercel; until then visitors get an honest 'not connected yet' message with a copy button.
- Tested on live site at 1440 and 390: no console errors.

## Built (session 2, continued)
- Home now: film → test rig → What we build (4 drawing sheets) → How a commission works (12-week scrubber, EXAMPLE timeline) → Design yours → FAQ (6) → Enquire.
- Static type pages: /toy-haulers, /gooseneck-fifth-wheel-trailers, /off-road-trailers, /modifications-and-upgrades (drawings, who it's for, how we build it, rules, FAQ, JSON-LD).
- /faq: full towing-law FAQ from the NRTR + WC 2026 fees, FAQPage JSON-LD. Sitemap, robots, footer.
- Checked live at 1440 and 390: no console errors, no overflow, all routes 200, unknown routes 404.
- Not built on purpose: Builds/portfolio (needs Justin's real builds; no invented clients).

## Polish pass (session 2)
- Review 1 (docs/review-1.md): no section at 9. Fixed: honest rig numbers (static nose weight by moment balance), sticky 3D + compact price dock on phones, phone menu, film 700svh with 'Custom trailers' H1 + Get a price + Skip, callout avoids text, 12px type minimum + contrast, long copy in proportional face, 44px tap targets, reduced motion in 3D, share images, /faq H1, 404, /privacy (POPIA draft), contact config + WhatsApp button (pending number), SITE_URL setting.
- Live Lighthouse mobile, home: performance 96, accessibility 100, best practices 100, SEO 100 (was 69 perf). Type pages 98–100.
- 3D film now starts on first interaction; drawing poster is the first frame.
- Not testable here: Safari/iPhone and Firefox (only Chromium in this environment).
- Review 2 (docs/review-2.md): film ~9 across the board. Fixed: form keeps input + short first step + focus to errors; rig loose-load detection, clamps, reset, thicker colliders, HUD, fits one screen; handover contrast; blueprint process section; type-page sheets + per-type share images; menu dialog.
- Live Lighthouse mobile after review 2: home 96/100/100/100, /toy-haulers 96/100/100/100.
- Still open from review 2 (needs Justin): privacy responsible party, contact details, real photos.

## Round 3 (session 2)
- 'Can I tow it?' checker (src/content/towrules.ts, reg 99/151/292-293), on home and /faq; verified on 6 known cases and in the browser.
- Trailer sheets draw themselves on scroll (RevealDrawing); static with reduced motion.
- Designer: day/dusk/night with LEDs and awning work light (luminance 193 -> 151 -> 40; tail lights read red).
- Live Lighthouse mobile home: 92-95 performance over three runs, 100 a11y/BP/SEO; /faq 99.

## Round 4 (session 3)
- AR 'See it in your driveway': /api/ar/<build>.usdz (iPhone Quick Look) and .glb (Android Scene Viewer), generated server-side at real size (6.42 x 2.50 x 2.96 m for a 4.8 m tandem), 1.0 MB GLB / 3.2 MB USDZ, cached a year. QR on desktop. NOT yet tested on a real phone: needs Justin.
- Optional synthesised sound (off by default, remembered): weld, clank, ramp hiss, road noise.
- Phone nav fits 375 px; 'Get a price' moves to the menu under 400 px.
- Live Lighthouse mobile home: 96 / 100 / 100 / 100.
- Review 3 (docs/review-3.md) fixed: one towing-rules source (towCheck) for rig, configurator and part copy; shared builds reach the enquiry; tow check GCM/blank fields/EB-only offer/sticky phone result/reg 293 heavy limit; film card hidden at intro/handover; rig peak g, 7-10% band, shifted loads; sticky type-page CTA; 13 px labels, 52 px phone H1; poster lettering; home FAQ links.
- Live Lighthouse mobile after review 3: home 97/100/100/100, /toy-haulers 100/100/100/100.
- To confirm with Justin/legal: reg 293 100 km/h sign wording and the >9 000 kg 80 km/h case.

## Round 5 (session 3)
- Vercel Web Analytics live (page views). Conversion events wired through web/src/lib/track.ts: enquiry_submitted, build_shared, ar_opened, tow_check, film_finished, rig_driven, whatsapp_click, get_price_click. Custom events need Vercel Pro (account is Hobby).
- docs/brand.md written in full.
- Launch kit for Justin: https://claude.ai/artifact/PScxQ1StFoFQbfjQ15zrkQ (source design/launch-kit.html): needs checklist, shot list, Google Business Profile steps.

## Round 6 (session 3)
- Placeholder contacts live (content/contact.ts, flagged): WhatsApp 27210000000, 021 000 0000, hello@ustrailers.co.za; privacy responsible party placeholder.
- Six concept renders generated in Figma (file 'US Trailers – concept renders'), captioned 'Concept render': photo band + type page photos. Unsplash blocks this environment (401), so no stock photos.
- New kinds: off-road camper and gooseneck toy hauler, part by part. Real part masses (src/trailer/mass.ts), tare = sum x 1.12 (tare.json via scripts/gen-tare.ts). Gooseneck 2.44 m wide.
- Designer: type switch, physics teardown with per-part mass, tap-to-inspect, reassemble. Film builds any kind.
- Live Lighthouse mobile home: 92 / 100 / 100 / 100.

## Round 7 (session 4)
- Test rig tows all three types. Each has its own rig spec (web/src/components/drive/rigSpec.ts): coupler, wheels, and part mass boxes from real volumes. Springs are shared per wheel. Results from scripts/test-physics.js:
  - toy hauler: 8.6% on the hitch, about 53 mm sag
  - off-road camper: 9.4%, about 52 mm sag
  - gooseneck: 22.1%, about 45 mm sag
  - hitch gap 0, no NaN on any type
- Enquiry form always completes. With the inbox not connected it offers "Send on WhatsApp" and "Email it", both with the full brief filled in, plus "Copy my brief". Tested with scripts/test-offline.js.
- Fourth independent review running.

## Round 8 (session 4)
- One journey. Pick your tow vehicle in the test rig (six common SA bakkies and SUVs, typical figures in web/src/content/vehicles.ts). Licence, brakes, speed and the rated and GCM checks use it, and the tow checker fills from the same choice.
- A "Your rig" card shows code, speed, hitch % and ✓/✕. "Send this rig with my brief" attaches it to the enquiry and the email.
- Share links: /b/<build code>, 312 prerendered. Each unfurls on WhatsApp and socials with its own drawing card (/api/og/<code>), then opens the designer with that build loaded.
- Phone dock: WhatsApp + Get a price bar after the film. It hides over the film, the form, the footer and any section with its own price bar. Laptops keep the single button.
- Reduced motion: the film is 300svh instead of 700svh.
- Tests: scripts/test-journey.js, scripts/verify-review4.js, check-pages, test-offline all pass.

## Round 9 (session 4)
- Film finale, the handover at dusk:
  - The trailer's own light does the work: red tail-light wash and warm cabin light spilling down the open ramp. Real point lights on laptops; painted ground pools only on phones.
  - A Karoo ridge line rises on the horizon.
  - A "Built." card shows parts, kg and mm. "Share this build" sends the /b/ link. The parts list and chapter heading step aside.
- Verified by WebGL pixel reads (glow present: about 390 red and 620 warm sampled pixels) and layout boxes at 1440, 390 and 375: no overlap with the trailer.

## Live
- https://us-trailers.vercel.app (Vercel project `us-trailers`, account cbuitendach2005-6763). Deploy: `cd web && vercel deploy --prod`.
- Session moved to cloud environment `us-trailers` (allow-listed: vercel.com, api.vercel.com, mcp.vercel.com, Google Fonts, us-trailers.vercel.app). The broken Vercel key stays on the old Default environment.
- Vercel plugin installed for Claude Code; Vercel MCP still needs sign-in via /mcp.

## In progress
- Waiting on Justin: direction choice (decision 1) and answers to batch 1.

## Next
- After the choice: full brand system in `docs/brand.md`, then the site plan (decision 2).

## Blocked
- Nothing technical. Waiting on Justin for real details (see questions-for-justin.md).
