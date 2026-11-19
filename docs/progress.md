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
- Review 2 (fresh reviewer) running.

## Live
- https://us-trailers.vercel.app (Vercel project `us-trailers`, account cbuitendach2005-6763). Deploy: `cd web && vercel deploy --prod`.
- Session moved to cloud environment `us-trailers` (allow-listed: vercel.com, api.vercel.com, mcp.vercel.com, Google Fonts, us-trailers.vercel.app). The broken Vercel key stays on the old Default environment.
- Vercel plugin installed for Claude Code; Vercel MCP still needs sign-in via /mcp.

## In progress
- Waiting on Justin: direction choice (decision 1) and answers to batch 1.

## Next
- After the choice: full brand system in `docs/brand.md`, then the site plan (decision 2).

## Blocked
- **GitHub push**: repo `us4x4store/us-trailers` exists and is connected, but pushes are refused until the Claude GitHub App is installed on it; this session's permission check also blocked a push. Commits are local until then.

