# Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-11-19 | No screenshots, ever. All visual review happens in the live connected browser (DOM, accessibility tree, computed styles, layout boxes, console, network, interaction). | Justin's standing instruction; overrides the brief's screenshot steps. |
| 2026-11-19 | Stack: Next.js App Router + TS, Tailwind, GSAP/ScrollTrigger, Lenis, Motion, R3F + Drei + Rapier. | Fixed by the brief, section 12. |
| 2026-11-19 | Site lives in `web/`; docs and research at repo root. | Keeps the brand/research memory separate from app code. |
| 2026-11-19 | Environment network set to unrestricted. | Research needs dozens of unknown hosts (award sites, competitors, studios); exact-host allowlist isn't workable. |
