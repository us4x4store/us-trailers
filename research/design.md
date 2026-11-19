# US Trailers: Phase 2 design research

Research date: 19 November 2026. Written in stages while the research ran.

## How this was done

No screenshots were taken. Each reference site was loaded in a real headless Chromium through Playwright (`/tmp/claude-0/.../scratchpad/inspect.js`, kept outside the repo) at **1440×900 desktop** and **390×844 iPhone 13 (Mobile Safari user agent, touch)**. The script scrolled the whole page (wheel events on desktop so Lenis and virtual scrollers respond, `scrollBy` on mobile) and recorded these from the live DOM:

- title, meta description, H1 to H3 copy, navigation labels and CTA wording
- loaded webfonts (`document.fonts`) and the computed font family, size and weight of H1, H2 and body text
- dominant background colours (weighted by area) and text colours (weighted by character count)
- `<canvas>` elements and the context types requested. `getContext` was hooked before page scripts ran, so `webgl`/`webgl2` here means the site really started a GPU context.
- library fingerprints, found by searching every JS response body for signature strings (three's `WebGLRenderer`/`__THREE__` revision, GSAP, ScrollTrigger, Lenis, Locomotive, Barba, Swup, Pixi, OGL, Spline, Rive, Lottie, Howler, Rapier, Draco, KTX2, Meshopt, GLTFLoader, model-viewer, `startViewTransition`, WebGPU, R3F, Theatre.js, Motion), plus window globals (`__THREE__`, `gsap`, `Lenis`, `__NEXT_DATA__`, `__NUXT__`, `Webflow`, `Shopify`)
- 3D, texture and audio assets fetched (`.glb`, `.ktx2`, `.drc`, `.exr`, `.hdr`, `.mp3`, `.ogg`, `.wav`)
- full-screen overlays present 1.2 s after DOMContentLoaded (preloaders), custom-cursor classes, `body{cursor:none}`, View Transition CSS rules, `data-barba`, `<model-viewer>`, `rel=ar` links
- decoded bytes of JS and of everything else, request count, time to the `load` event, and page height on desktop and mobile

**Caveats.** Byte counts are *decoded* sizes, not gzip/brotli transfer sizes, so read them as relative weight. A library flag means "its signature string appears in a shipped bundle". That proves the code shipped, not that it ran on that page. The headless browser identifies itself, so a few sites served a "browser not supported" page or a bot check. Those are marked, and I did not try to get around them. Awwwards (502s), Godly (DNS) and Land-book/Siteinspire (Cloudflare/Vercel bot checks) refused automated visits. Award status comes from the CSS Design Awards WOTD archive and The FWA winners feed, both read live, and from studio and press sources found by web search.

