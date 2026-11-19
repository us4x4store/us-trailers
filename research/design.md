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

## Part 1: Reference sites (47 measured)

Shorthand used below: **D** = desktop 1440×900, **M** = mobile 390×844 iPhone. "JS" = decoded JavaScript in KB/MB. "GL" = a WebGL context was actually created. Award labels: **CSSDA WOTD** = CSS Design Awards Website of the Day (read from cssdesignawards.com/wotd-award-winners on 19 Nov 2026). **FWA** = The FWA winners feed (thefwa.com, read 19 Nov 2026). **Awwwards** labels come from studio and press sources (Awwwards blocked automated access).

### A. Award-level 3D and experience sites

#### 1. Lusion: lusion.co (studio site; Lusion's Oryzo won Awwwards SOTM Apr 2026 + Developer Award)
- **Evidence:** Virtual scroll: document height = viewport (900 px), with fixed full-screen canvases (D 1440×900 + a 1442×902 post layer). WebGL2, three **r158**, no GSAP/Lenis in globals (own engine). Fonts: **Aeonik** 400/500 + IBM Plex Mono + a custom **LusionMono**. H1 Aeonik 36 px/400 on white `#ffffff`, accent electric blue `#0016ec`, dark `#121416`. Preloader is a numeric counter ("0 0 0 0 0 1"). About 15 `.ogg` UI sound cues (hover, click, focus, page, "glass_broken", cinematic_0–3) + an EXR matcap. JS 1.9 MB D / 3.0 MB M, 116 requests. CTA: **"LET'S TALK"**, in the nav and repeated.
- **What makes it great:** one continuous real-time scene. Sound is designed at the micro level (every hover has a cue), and the mono type reads like an engineering readout.
- **Steal:** a numeric preloader that counts up to a real number (e.g. "kg of steel" or "welds"). Mono font for specs. A tiny, curated set of SFX.
- **Avoid:** virtual scroll (document = 900 px), which hides content from SEO, anchors and native mobile scroll. US Trailers must sell and rank.

#### 2. Immersive Garden: immersive-g.com (studio; Cartier, Girard-Perregaux clients)
- **Evidence:** Nuxt; three **r151** + GSAP + ScrollTrigger + Lenis + Howler. Assets: Draco GLBs (`bg_ultralow_draco.glb` 1.1 MB, `reliefs_low_compressed.glb` 4.6 MB), KTX2 normals (up to 2.1 MB). **AudioContext started** (1). Transition stingers ("Home_To_About_Thunder", "Marble_Crack" loop). Intro loader: "Innovative digital experiences studio, Scroll down". Type: **PS Times** serif 56 px + Helvetica Neue. Palette: near-black `#030303` on bone `#e8e8e8`. 5 custom-cursor elements. Decoded total 25 MB D / 31 MB M.
- **Great because:** marble and stone reliefs under real lighting. It shows that *material* is the story, which suits steel and powder coat.
- **Steal:** a serif + grotesk pairing on bone/near-black, and an "ultralow" background mesh that loads first, followed by the detailed hero.
- **Avoid:** 25 to 31 MB page weight, and an identical heavy mesh on mobile.

#### 3. Locomotive: locomotive.ca (studio; featured work includes **Lightship** RV trailers and **Scout Motors**)
- **Evidence:** three **r165** + GSAP/ScrollTrigger + **Lenis** (`html.lenis`). `barba` and Meshopt/Draco/KTX2 strings in the bundle. Two small WebGL canvases (440×616 D, 170×238 M) rendering rigged GLBs (`ring.compressed.glb` 694 KB, `arnaud-rigged.compressed.glb` 991 KB). View Transition CSS present. A glyph-scramble preloader ("rQE@p#g… Digital-First Design"). Fonts: **LocomotiveNew** 70 px + Helvetica Now Display. Strict black/white palette.
- **Great because:** 3D is used *inside* the editorial layout as small objects, not as a full-screen takeover. Their client list includes an actual trailer maker (Lightship) and an off-road brand (Scout).
- **Steal:** **3D as inline "objects" in cards** (a rotating axle or hitch in a spec card), and a scramble-text loader.
- **Avoid:** the 48 s time to the load event in our run, caused by a heavy video.

#### 4. Unseen Studio: unseen.co (studio; Hubtown Awwwards SOTD Jun 2026; illoca CSSDA WOTD 27 Aug 2026; Route 66 × Expedia FWA 13 Nov 2026)
- **Evidence:** Full-screen WebGL2 "world" built from small room GLBs (chair 196 KB, rooms 8 to 14 KB) + one KTX2 lightmap (879 KB, `room-2.ktx2`). three **r143**, GSAP + ScrollTrigger, Howler, `AudioContext` 1. Letter-by-letter "U N S E E N" loader with a progress bar. **17 cursor elements**. Fonts: **Neue Montreal** + **Saol Display**. Palette: blush `#efded9` / `#f1edeb` / charcoal `#212121`. Nav is numbered "01 Index, 02 Projects, 03 Contact, 04 World".
- **Great because:** many tiny models plus one baked lightmap give a rich room for very few bytes. This is the right pattern for a **workshop scene**.
- **Steal:** **bake the workshop lighting into KTX2 lightmaps** and keep the meshes tiny. A numbered nav.
- **Avoid:** a site that is only a world, with no plain-HTML route.

#### 5. Hubtown: hubtown.co.in (Unseen Studio, **Awwwards SOTD June 2026** per utsubo.com)
- **Evidence:** Nuxt; three **r179**, GSAP/ScrollTrigger, **Lenis**, **Theatre.js** strings (timeline-authored camera), Draco/Meshopt/KTX2. Assets are small: `scene_1.glb` 224 KB, KTX2 terrain normal 730 KB, matcap 11 KB, voronoi/noise KTX2 (58 to 87 KB). Loader: "0% LOADING CONTENT". Fonts: **Grotesk** + **Commit Mono**. Palette: midnight `#020a18` with ice-blue `#d5e0ff`. WhatsApp link present. The load event took 110 s in our run (streaming).
- **Great because:** a monolith over a reflective landscape, with a mouse-reveal shader. It is the clearest proof that a "boring" industry (property) can carry a flagship 3D hero.
- **Steal:** **Theatre.js-authored camera paths** (designers keyframe them visually), procedural noise textures in place of big bitmaps, and a WhatsApp CTA inside a premium site.
- **Avoid:** a canvas-only home with zero H1/H2 in the DOM (we measured none). Bad for SEO.

#### 6. Dogstudio: dogstudio.co (studio; MSI Chicago, Tomorrowland)
- **Evidence:** One Draco GLB (`dog.drc.glb` 840 KB) in a WebGL canvas on desktop (1440×1190). **On mobile, no canvas is created.** It degrades to image and video. `ambience.mp3` with AudioContext started. Type: **GT Sectra Display** 120 px/700 + Heebo/Gilroy. Palette: `#131419` with a red accent `#e43333`. H2: "We Make Good Shit".
- **Steal:** **dropping WebGL on mobile in favour of a designed fallback** is an accepted award-level choice. Use it for low-end phones.
- **Avoid:** a 72 s load event on desktop.

#### 7. Resn: resn.co.nz
- **Evidence:** Raw three via window `THREE`, GSAP, Howler, and **3 AudioContexts**. Eight mixed sound beds ("tunnel", "shapeshifter", "menu_drop_loop", "rollovers_mixdown"). Type: **Fort** Extralight 43 px. Black. Canvas-only, with a single H1 ("Resn · Creative Studio Est. 2004").
- **Steal:** sound mixed by *state* (menu, hover, tunnel) rather than one loop.
- **Avoid:** HubSpot + LinkedIn trackers on a showcase page (5.5 MB JS).

#### 8. Active Theory: activetheory.net (studio; Cyera "Secure the Unknown" CSSDA WOTD 13 Oct 2026; Santioni "Notturno" CSSDA WOTD + WOTM Aug 2026)
- **Evidence:** Served **"Your browser is not supported"** to headless Chromium on both viewports. Even so, its 2.8 MB bundle contains Draco, KTX2, GLTF and **Theatre.js** strings. Font: **nbarchitekt**. Their Cyera microsite (secure-the-unknown.cyera.com) returned the same "not supported" page on mobile (3.2 MB JS, with Draco, KTX2 and GLTF strings). No attempt was made to bypass the check.
- **Lesson:** capability gating is a real pattern, but for a sales site, *never* block. Always fall back to content.

#### 9. Shopify Editions: shopify.com/editions (Awwwards-recognised; utsubo "best three.js sites 2026")
- **Evidence:** **React Three Fiber** + three **r181** + **Lenis** + Draco/Meshopt/KTX2. A single full-screen WebGL2 canvas on D and M with tiny baked GLBs (`records-shelfwall_wTex_ShadowCatcher_BAKED.glb` 129 KB, `Record…glb` **6 KB**). Section H2s are one-word edition names ("Exponential", "Renaissance", "Horizons", "Boring", "Built to Last"). **Inter Variable** only. Greys `#e5e5e5`/`#f4f4f4` + black. JS 4.9 MB.
- **Great because:** each scroll section is a staged beat (enter, hold, exit) on one persistent canvas, with baked shadow-catcher meshes so it needs no real-time shadows.
- **Steal:** **one persistent R3F canvas + baked "ShadowCatcher" planes**, and one-word chapter titles (e.g. "Chassis. Running gear. Body. Finish. Handover.").
- **Avoid:** the TikTok/LinkedIn/Facebook pixels.

#### 10. Hyundai "Your Perfect Partner": hyundaiksa.com/en/mynaghi/yourperfectpartner (**FWA, 17 Nov 2026**, Parallel / INNOCEAN)
- **Evidence:** Next.js + **R3F**, three **r185** (the newest measured), GSAP/ScrollTrigger, Draco + KTX2 + **Meshopt**, WebGPU strings. A 477 KB **proxy image** is shown first (poster), then `pillars-logo.glb` (**33 KB**). **WebGL on desktop, no GL context on mobile** (mobile gets the 2D path). There are three loader layers (`initial-loader-fallback`, preloader, spinner). WhatsApp + tel + **"Request Quotation"** CTA. A car-matching quiz ("find your car like a life partner").
- **Great because:** an *automotive dealer* site won an FWA with a quiz plus light 3D, and still ends in "Request Quotation" and WhatsApp.
- **Steal:** **poster-then-model loading**, a mobile 2D path, and a **"Which trailer are you?" quiz** that pre-fills the configurator and ends in a WhatsApp or quote CTA.
- **Avoid:** a 6 MB JS bundle for a quiz.

#### 11. BMW "Next Move" F3: bmwf3.com (**CSSDA WOTD 5 Nov 2026**, Format-3 reverse pitch)
- **Evidence:** No WebGL. Two large **2D canvases** (1639×1035 D, 449×971 M) for image-sequence scrubbing + **11 videos D / 7 on M**. Lenis, Lottie, Howler, Motion. A **"START ENGINE"** gate (`intro-lock`) unlocks scroll and audio (`start.mp3`, `intro.wav`, `bg-sound.mp3`, `section-switch.wav`). `body{cursor:none}` + custom cursor. Type: **Google Sans Flex** variable 60 px/728 + Space Mono + Permanent Marker. Near-black `#050505` / warm white `#f7f5f2`. Page 27 000 px D / 19 800 px M. Nav: Statement · Opportunity · Solution · Questions · **Schedule a call**. Total 41 MB (video).
- **Great because:** the car experience is told with **canvas image sequences + video**, not 3D, and it still won. The ignition button is a perfect automotive ritual.
- **Steal:** a **"Hitch up" / "Start engine" gate** that is also the sound opt-in. An **image-sequence fallback** for phones. Variable-weight type.
- **Avoid:** a 41 MB page. Our fallback sequence must be AVIF sprites under ~3 MB.

#### 12. Jaguar TCS Racing: jaguarracing.com (**CSSDA nominee, 18 Nov 2026**, Bluestone98; scores UI 8.33 / UX 8.0 / Innovation 8.0)
- **Evidence:** WordPress + **Lenis** + GSAP/ScrollTrigger + three with Draco/KTX2/Meshopt (loaded from unpkg). D: a fixed full-screen 2D canvas; **M: no canvas**. `has-cursor` + `body{cursor:none}`. View Transition CSS. One custom family: **Jaguar Exuberant**. White with dark teal `#11181b` and an electric blue `#1c7ef9`. JS 3.2 MB D / 2.4 MB M (it serves less to phones).
- **Steal:** **a lighter mobile bundle** (−25% JS) and a single bespoke typeface as the brand voice.
- **Avoid:** loading three from unpkg at runtime (supply-chain risk and an extra connection).

#### 13. Forge Automotive: forgeautomotive.co.uk (**CSSDA WOTD 22 Sep 2026**, Joe Ben Taylor / 12 Studio)
- **Evidence:** **Next.js** + **Lenis** + GSAP/ScrollTrigger + **View Transitions CSS**. **No WebGL.** 61 images. **JS 1.17 MB, total 1.7 MB D**: the leanest award winner in the set. Type: an ultra-light serif "**editorial**" 80 to 90 px / weight **200** + **Geist Sans** 10 px/600 uppercase labels. Black `#0c0c0c`/`#161616` with off-white `#f2f1ed`. Copy: "A vehicle should say something before it moves." CTAs: **"Start your project"**, "Explore builds". Nav: Builds · Stock · Contact.
- **Great because:** a bespoke automotive *workshop* (Defender, G63, Urus builds) won with photography, giant thin serif type and smooth transitions. This is our business model exactly.
- **Steal:** the **IA (Builds / Stock / Start your project)**, the thin-serif-plus-tiny-caps type system, View Transitions between builds, and the weight budget.
- **Avoid:** nothing major. It lacks a live 3D wow, which is where we beat it.

#### 14. Heirest: heirest.com (**CSSDA WOTD 4 Sep 2026**, Studio Almond; "100k configurations, 3D models")
- **Evidence:** Shopify + GSAP/ScrollTrigger. **No WebGL on the home page**: the 3D configurator loads only on the product route ("configure this design" CTA). View Transition CSS. A split-panel loading screen (`loading-screen__half--l`). Type: **Moderat** + **Moderat Mono** body text (13 px) + GT Standard. Ivory `#fefdfc` + oxblood `#68001e`. Copy: "Author what others inherit.", "Fine jewellery, authored by you." **But** 677 requests and 10.6 MB JS D / 12.8 MB M (Gorgias, Klaviyo, Clarity, Facebook).
- **Steal:** the **"authored by you"** framing (the client as co-author of a bespoke object), **3D only on the configure route**, and a mono body face for a precise, technical feel.
- **Avoid:** third-party bloat. Every one of those tags fights Lighthouse 90.

#### 15. Oryzo: oryzo.ai (Lusion, **Awwwards SOTM April 2026 + Developer Award**, per utsubo.com and Codrops 13 Apr 2026)
- **Evidence (light probe; the full scroll run exceeded our 150 s budget):** three **"178 - modified by Lusion"** (`__THREE__`), a WebGL2 canvas stack (D: 1440×900 ×3 + 571×734 + 495×495 + 321×321). Unlike lusion.co, **native document scroll**: page height **56 691 px D / 42 317 px M**. **Mobile canvases are 585×996 on a 390×844 viewport, so DPR is clamped to 1.5** (the iPhone reports 3). That is adaptive DPR in production. **JS 2.4 MB D but 1.1 MB M**, so phones get a lighter build. Type: **Halyard Display Variable** H1 at 123 px D / 100 px M + **Literata** variable serif + **DM Mono**. H1 "…ISN'T JUST A COASTER." The closing H2: "We caught your attention with a non-existent product. If we can sell a coaster, imagine wh[at we can do for you]". The nav letters are split for kinetic hover (each letter doubled for a roll effect).
- **Great because:** a mundane object (a cork coaster) gets flagship-device treatment: one object, real material response, inertia and Z-depth camera travel. The joke works because the craft is real.
- **Steal:** **treat a trailer chassis like a supercar**: one hero object, studio lighting, inertia. Clamp DPR to 1.5 on phones, ship a lighter mobile JS build, use native scroll with a long page, and a **split-letter roll hover** on nav items.
- **Avoid:** nothing for the technique. The self-referential joke does not transfer.

### B. Premium overland, camper and bespoke-vehicle sites (direct category references)

#### 16. Helderburg: helderburg.com (bespoke classic Defenders; tone benchmark)
- **Evidence:** WordPress, no WebGL. Type: **Cormorant Garamond** H2 at **104 px / weight 300** + **Manrope** 11 px/600 caps labels. Palette: **bottle green `#0e2a1d` / `#143526`, parchment `#f4efe6` / `#ede6d8`, brass `#c9a76a`**. Nav: Available Defenders · Past Commissions · **The Twelve Systems** · The Colors · The Interiors · **How a Commission Works · Begin a Commission**. CTAs: **"ASK PAUL"**, "Talk with Paul". FAQ as H2 ("The questions most people have."), owner testimonials ("What owners say after they take delivery."). Mobile page 17 100 px (it stacks everything). 43 form inputs, tel link. JS 8.2 MB, mostly ad and CRM pixels (LeadConnector, LinkedIn, DoubleClick).
- **Steal:** **"The Twelve Systems"** (break the product into named systems; ours could be "The 9 Systems of a US Trailer"), **"How a commission works" + "Begin a commission"**, named builds, "Ask [founder]", and the green/parchment/brass luxury palette as one Phase 3 direction.
- **Avoid:** 8 MB of tracking scripts, and a mobile page that is 40% longer than desktop.

#### 17. EarthRoamer: earthroamer.com (luxury expedition vehicles)
- **Evidence:** WordPress/Elementor + GSAP + ScrollTrigger + Lenis (all as globals). View Transition CSS. **No WebGL.** Type: **sonar-sans** 54 px/500. Palette: black + warm stone `#f1eee9`. A three-line staggered hero H2 + GPS coordinates "40.074980, -104.978720" overlaid. CTAs: "BUILD YOUR LTx", "BUILD YOUR SX", "DISCOVER THE DIFFERENCE". Nav: Why EarthRoamer · Legacy · Our Vehicles · **Certified PreRoamed** · Lifestyle · Adventures. **633 requests, ~62 MB decoded JS D (36 MB M), load 31 s.** AdRoll, Bing, DoubleClick, Facebook, YouTube embeds.
- **Steal:** coordinates as a graphic, "Why [brand]" as the first nav item, and a resale/pre-owned programme with a witty name.
- **Avoid:** this is the **performance anti-benchmark** of the study. YouTube iframes and ad pixels on the home page.

#### 18. Living Vehicle: livingvehicle.com (luxury off-grid travel trailers)
- **Evidence:** Lean custom build (1.55 MB JS, 44 requests). No WebGL. View Transition CSS. An "INTRODUCING The LV LINE" intro overlay. **Montserrat** 52 px/600 + **Azonix** display. Off-white `#f7f5f2` / `#efece8`, black `#0e0e0e`, **oxblood text accent `#990000`**. H1 **"Luxury, unplugged."** Sections: "From four generations to the next.", "On the road with owners", **"See it first. Order first."**, "Join LV Insiders", "Pre-owned inventory". CTAs: **"Reserve your place"**, "Talk to us about financing →", "Schedule a visit". Tel in nav.
- **Steal:** the **CTA ladder** (Reserve → Visit → Financing), "Insiders order first" (a waitlist as status), and owner stories.
- **Avoid:** Montserrat. It is generic.

#### 19. Airstream: airstream.com
- **Evidence:** Nuxt + GSAP/ScrollTrigger. No WebGL. **Helvetica Neue LT Pro** 68 px/300 + Bauhaus Soft Display. Warm grey `#efedeb`, `#333333`, taupe `#746a63`. H1 is a sale ("Keep it Real Savings Event"). CTAs: **"BUILD YOURS"**, "Explore products", "Visit your dealer", "Claim your offer". 2.9 MB JS, load 22 s.
- **Steal:** "Build yours" as the persistent primary CTA.
- **Avoid:** discount-led hero copy. It undercuts a bespoke positioning.

#### 20. Bowlus: bowlus.com (riveted-aluminium luxury trailers)
- **Evidence:** WordPress, no WebGL, **Lato** 54 px/300. CTAs: "Configure", **"Build Your Bowlus"**, "Can I customize my Bowlus?", "RV Buyers Guide". H3 benefit grid: "Unmatched Driveability / True Lightness Matters / Bowlus Quality". **167 form inputs** (the configurator is embedded). JS 10.3 MB D vs **0.9 MB M** (it serves a lighter mobile build, but desktop is very heavy).
- **Steal:** an **FAQ framed as the buyer's own question** ("Can I customize my…?") and a buyer's guide as content marketing for SEO.
- **Avoid:** an "Unmatched / Ultimate / Unparalleled" adjective pile.

#### 21. Patriot Campers: patriotcampers.com.au (AU off-road trailers)
- **Evidence:** WordPress. Lato + Poppins + Helvetica. **~58 MB decoded JS D / 38 MB M, 332 requests** (HubSpot ×7 scripts, Woobox, YouTube, DoubleClick). H1 "OFFROAD CAMPER TRAILERS & SUPERTOURERS". Repeated duplicate H2s. CTAs: Find a dealer, Book a viewing, **"FLY 2 BUY"** (they fly interstate buyers in).
- **Steal:** **reviewer proof** (Trail Recon "1 year real world review", "Could this be the world's most capable camper?"), "Fly 2 Buy" (for us: "Collect in Cape Town: we'll host your handover"), and "Floor stock".
- **Avoid:** everything about its build quality as a website. It is the closest *category* competitor style, and it is what US Trailers must look nothing like.

#### 22. Singer Vehicle Design: singervehicledesign.com
- **Evidence:** WordPress, no WebGL, Lottie + GSAP, View Transition CSS. **Söhne Schmal leicht** (compressed) 72 px. Black/white with a single blue `#006a93`. Four H-sections only (the manifesto). Nav: just **"CONNECT"**. CTAs: "Inquire Now", "Discover the collaboration" (Louis Vuitton).
- **Steal:** the **manifesto structure in 3 to 4 mantras**, and a single nav CTA.
- **Avoid:** no specs or process visible. A trailer buyer needs more practical proof.

#### 23. ICON 4x4: icon4x4.com
- **Evidence:** 3.3 MB JS, no WebGL, **Humanist 521 Light**. Title tag: "ICON4x4 • HAND MADE IN LOS ANGELES, CALIFORNIA". Nav: Models (ICON C Series, FJ, BR, TR, **Derelict®**, **Reformer®**, Concepts) · Inventory (Available now / Available projects) · Shop · **Download brand book**.
- **Steal:** **"Available now / Available projects"** (sell builds in progress), and trademark-style series names.

#### 24. Land Rover Defender (US): landroverusa.com/vehicles/defender
- **Evidence:** A WebGL context in an "ImmersiveHero" (with a skeleton loader `DxSkeleton`), GSAP/ScrollTrigger + Lottie. Type: **LandRoverWeb Bold** 38 px + Avenir Next. Navy `#0c121c`. H1 "EMBRACE THE IMPOSSIBLE". CTAs: **"BUILD AND RESERVE"**, "FINISH YOUR BUILD" (resumes a saved configuration), "RESERVE ONLINE", "Test drive". **13 MB JS, 316 requests** (Amplitude, Rudderstack, mPulse, Amazon ads).
- **Steal:** **"Finish your build"**: remember a half-finished configuration and invite the visitor back. **"Build and reserve"**: a deposit/slot reservation flow.
- **Avoid:** an enterprise tag soup.

#### 25. Polestar 4: polestar.com/us/polestar-4
- **Evidence:** No WebGL. 7 videos, 88 images. A single family, **Polestar Unica** (72 px display). Black/white/`#f0f0f0`. 28 sections. View Transition CSS. CTAs: Configure · Test drive · Buy. Long-form spec storytelling ("Battery architecture", "Max DC charging"): each H3 is one spec, with copy, then a number.
- **Steal:** a **spec section where each H3 is one engineering topic + one large number**. Use it on the trailer type pages.

### C. Craft, watch, tool and furniture makers (product storytelling)

#### 26. Ressence: ressencewatches.com
- **Evidence:** Shopify. A **Merlo / Merlo Round** custom family (H1 30 px/300). Black/white + pale steel blue `#d7e5ec` + deep petrol `#00364d`. A `model-viewer` string in the bundle (no element on the home page). 5.6 MB JS. Nav lists every model as a drawing number (TYPE 1 round … TYPE 11) + **Innovation · ROCS · In-house calibres**. H2 "POWERED FROM WITHIN: THE RESSENCE-WERK MOVEMENT".
- **Steal:** a **technology section in the nav** next to the products (for us: "Engineering": chassis, running gear, finishes), and drawing-number naming.

#### 27. Vollebak: vollebak.com ("Clothes from the future")
- **Evidence:** Shopify. **Suisse Intl Condensed** 56 px/700 + **Fractul** + Suisse Mono. White/black with **IKB blue `#0000ff`** and red `#c90000`. 14 videos. "Made To Order" in the nav. Product heads are waiting lists and **bids** ("Enter your bid for the Mycelium Jacket"). 10.6 MB JS, 426 requests.
- **Steal:** "Made to order" as a nav item, an extraordinary spec line per product, and a waitlist/bid for limited builds (e.g. "Next build slot: March 2027").
- **Avoid:** 426 requests.

#### 28. Vitsœ: vitsoe.com (Dieter Rams shelving, "Furniture for thinking people")
- **Evidence:** No WebGL. **Univers Next Pro** 32 px/700 + 14 px/300. Black/white + link blue `#0073b1`. H2 ethos list: **"Against obsolescence / Investing for life / Transcending fashion / Honest pricing / Lifelong service"**, and an essay: "Sufficiency: why Vitsœ doesn't do Black Friday". CTAs: **"How to start"**, "Configure and buy". A separate `rooms.vitsoe.com` planner.
- **Steal:** **"Honest pricing" + "Lifelong service"** as named commitments (warranty, after-sales, resale). A **"How to start"** CTA, which is far softer than "Contact".

#### 29. Teenage Engineering: teenage.engineering
- **Evidence:** Custom **te-20** (weight 100) + TechnoType. Pure black `#000000` with `#f1f2f2`. No headings at all (product-led tiles). A **Rapier** string in the bundle (physics toys on product pages). 2.6 MB JS.
- **Steal:** **playful physics on a product page** (Rapier), plus hairline typography.
- **Avoid:** no H1/H2. Bad for search.

#### 30. Chris Reeve Knives: chrisreeve.com (Boise, Idaho)
- **Evidence:** Shopify, Open Sans only. Models carry **Zulu names** (Inkosi, Umnumzaan, Mnandi, Impinda, Inyoni; Chris Reeve is South African-born). CTAs: "Order form", "Find a dealer". 6.3 MB JS for a near-static page.
- **Steal:** **South African heritage naming used with pride on a global luxury tool**. US Trailers could name its platforms after Cape landmarks or Afrikaans and isiXhosa words (to be validated with Justin).
- **Avoid:** the template Shopify look.

### D. More award and flagship-product references

#### 31. Igloo Inc.: igloo.inc (Abeto; **Awwwards Site of the Year 2024**, still the reference for Draco micro-assets)
- **Evidence:** three **r165** + GSAP/ScrollTrigger. **Eight tiny Draco `.drc` files** (`igloo.drc` 218 KB, `ground` 18 KB, `mountain` 12 KB, `igloo_cage` 6 KB, `intro_particles` 2 KB, `blurrytext` 1 KB). WebGL2 on **both D and M**, AudioContext started. Canvas-only, no headings. JS 1.68 MB total.
- **Steal:** **split the model into many Draco/Meshopt chunks loaded in build order.** The chassis arrives first, so assembly-on-scroll can literally stream as you scroll. Even the *text* is geometry (`blurrytext.drc` 1 KB).
- **Avoid:** zero DOM headings and no non-WebGL path.

#### 32. IVRESS "Spin a Tale": brand.ivress.co.jp (Utsubo; **FWA Site of the Month May 2026**, CSSDA recognised)
- **Evidence:** **A real `webgpu` context was requested on desktop** (falling back to webgl2), three **r182** + Lenis + GSAP/ScrollTrigger + Howler with a **convolution reverb** (`impulse_response.mp3`), AudioContext 1. A **"CLICK TO START"** gate + "SOUND" toggle. A "00%" loader. Type: **Basilia Compress** + Ryumin (Japanese serif) + Josefin Sans. Black `#000203` / warm white `#faf5f0` / pale gold `#feedb5`. Page 20 700 px.
- **Steal:** **WebGPU-first with WebGL fallback via TSL**, plus a reverb impulse response so the workshop SFX sound like they're *in a steel shed* (one 50 KB IR file gives every cue the same room).
- **Avoid:** the mobile run did not complete in our 150 s budget, which is a warning about heavy first loads.

#### 33. Apple AirPods Pro 3: apple.com/airpods-pro (no award; the industry benchmark for scroll product storytelling)
- **Evidence:** **16 videos**, 102 images, a WebGL context, and the `three` string. `html` classes reveal capability flags: `inline-media`, `no-reduced-motion`, `enhanced`, **`no-ar-quicklook`** (feature detection for Quick Look AR), and **1 `rel=ar` link** present. Pinned media (`large-pin-center`), start-frame posters (`overview-welcome-hero-startframe`). **SF Pro**. `#f5f5f7` / `#1d1d1f`. 3.2 MB JS, 26 MB media.
- **Steal:** **start-frame posters for every scrubbed video**, capability classes on `<html>` (reduced-motion, AR support, inline media) that switch the whole page between modes, and **a Quick Look AR link** only shown where supported.

#### 34. Lucid Gravity: lucidmotors.com/gravity
- **Evidence:** Next.js, 7 videos, no WebGL. **Lucid Serif VF + Lucid Sans VF** (variable, custom), H1 serif 72 px. Palette: near-black `#0f0f0f`, sand `#dbd4c5`, **champagne text `#d7be96`**. Prices in the nav ("Pure From $70,900 · Sapphire Fully equipped at $249,000"). CTAs: **"Design Yours"**, "Demo drive", "View inventory / pre-owned". **12.6 MB JS** (Optimizely, Salesforce, TikTok, Reddit, Pinterest, Snap…).
- **Steal:** **"From R…" prices right in the mega-menu**, a custom variable serif + sans pair, and the champagne-on-black luxury palette.
- **Avoid:** the marketing-stack weight.

#### 35. Rivian R2: rivian.com/r2 (flagship adventure-EV product page)
- **Evidence:** Next.js + **React Three Fiber**, three **r184**. **11 canvases with WebGL2** on desktop *and* mobile (sized per section: 1440×900 hero, 1328×396 strips, 358×358 mobile tiles). This is multi-viewport R3F (probably Drei `<View>`/scissor) sharing one context. 17 videos D / **22 on M** (more video on phones). **31 cursor elements.** A custom **"adventureFont"** (H2 44 px/600). Greys `#ebebeb`/black. Sections: "R2 is designed for the adventurous", "Suspension that adapts and reacts", "Take a closer look", "Light the way, wherever you go". CTAs: **"Reserve", "Design yours", "Demo drive"**, and an FAQ link "How can I order or reserve a Rivian?". **12.3 MB JS, 689 requests, 65 MB total D, load event 113 s.**
- **Great because:** real-time 3D appears as *many small embedded viewports* in a normal scrolling page, not a single takeover. This is the right model for US Trailers' spec sections (a rotating axle here, a hitch close-up there) using **one shared WebGL context** (Drei `<View>`), which is mobile-safe because there is one GPU context.
- **Steal:** **Drei `<View>` multi-viewport in a single canvas**, a "Take a closer look" section, and *"Light the way"* (a lighting showcase that maps to our day/dusk/night toggle).
- **Avoid:** 689 requests, 113 s to the load event.

#### 36. Porsche 911 model overview: porsche.com/international/models/911
- **Evidence:** **Astro** islands (`astro-island`), 3.3 MB JS, no WebGL on the overview, CSS View Transitions. **Porsche Next** 43 px. `#f1f1f4` / `#010205` + Porsche blue `#1a44ea`. CTAs: **"Configure"**, "Explore in detail", **"Load saved configuration"**. The page is a variant matrix (911 Carrera / T / S / 4S / GTS / 4 GTS …), and on mobile it stacks to 16 700 px (2.6× desktop).
- **Steal:** **"Load saved configuration"** (a persistent build code), and a variant matrix that maps to our trailer types × sizes.
- **Avoid:** the mobile matrix becoming an endless list. Use a horizontal snap carousel per family.

#### 37. Lando Norris: landonorris.com (OFF+BRAND; Awwwards SOTD; an Awwwards listing page shows a 2025 Site-of-the-Year badge near this entry, but the attribution was ambiguous in search results)
- **Evidence:** **Webflow** + Lenis + GSAP/ScrollTrigger + three **r174** + **Rive** (vector state-machine animations). About 20 canvases on desktop, including several small WebGL2 ones (50×50, 81×43 icons) and two full-screen ones. GLBs are small (`helmet-21.glb` 136 KB, `disco-02` 351 KB, `tracks-06` 466 KB) and lit by **1K HDRIs** (172 to 378 KB, "faded" and "light" variants). Type: **Mona Sans Variable** (200 to 900) + **Brier** display. Palette: paper `#f4f4ed`, dark olive `#282c20`, **neon lime `#d2ff00`** as the single accent. Duplicated H2s ("ON / TRACK / OFF / TRACK") are the kinetic split-text technique. CTA: **"Business enquiries"**. Mobile keeps the *same* ~20-canvas structure (WebGL2, full-screen 390×844 + small icon canvases) at 2.0 MB JS / 12.4 MB total. Load event about 110 s (a long tail of media and HDRs).
- **Great because:** a 3D helmet you can turn, with personality, a single neon accent and a variable font, all on Webflow. This proves a small team can do it.
- **Steal:** **1K HDRI pairs** (a "faded" and a "light" variant) to switch lighting moods cheaply, which is our day/dusk/night. Rive for UI micro-animations (toggles, the sound button). One neon accent on an earthy palette.
- **Avoid:** around 20 canvases and 12 MB on a phone. Use one shared context (Drei `<View>`) instead.

#### 38. illoca: illoca.unseen.co (Unseen Studio, **CSSDA WOTD 27 Aug 2026**)
- **Evidence:** Nuxt + Lenis + GSAP/ScrollTrigger + three **r183** + **Theatre.js** + Draco/Meshopt/KTX2. A WebGL2 canvas on D **and** M. One `scene.glb` (1.28 MB) + small KTX2 layers whose names tell the story: **`floor-plan-hand-drawn.ktx2` → `second-sketch.ktx2` → `floorplan-ai.ktx2` → `facades.ktx2`** (47 to 187 KB each). Type: **F37 Analog** 111 px + Graphik + **Geist Mono** + "Architect Pro" (handwriting) + architect symbol font. Palette: **drafting-paper cream `#eadfc9` / `#fdf8f0`, blueprint blue `#283f7d`**. H2 sequence: "Augmented Sketch, Adaptive Massing, Prompted Plans, Agentic Refinement, Instant Facades". Pricing shown openly.
- **Great because:** the scroll goes **from hand sketch to plan to 3D massing to finished facade**, a design process told as a material transformation on one canvas.
- **Steal (high value):** **"From napkin sketch to steel"**. The scroll starts as a pencil sketch of the client's trailer on drafting paper, becomes a blueprint (blue lines, dimension callouts in mono), then extrudes into the raw-steel 3D chassis, then the finished powder-coated build. It tells *bespoke* (we draw it for you) better than anything else. Drafting-paper and blueprint-blue is a strong Phase 3 palette candidate.

#### 39. metic. "Take a closer look": metic.studio (**CSSDA WOTD 21 Oct 2026**: "Hold to X-ray the page, lift a 3D loupe")
- **Evidence:** **Next.js + React Three Fiber**, three **r186** (very current), GSAP/ScrollTrigger, Lenis. A dedicated **loupe canvas, 324×324 fixed on desktop and 244×244 on mobile** (the loupe survives on phones), plus full-screen WebGL2 layers. `html` classes `has-loupe loupe-live`. **Total page only 2.9 MB, 1.8 MB JS**: the lightest R3F site measured. Type: **Bricolage Grotesque** variable (H1 104 px) + Space Grotesk + **IBM Plex Mono** + Caveat (handwriting notes). Palette: concrete greys `#e9e9e6`/`#f4f4f2`, ink `#121214`, **signal red `#ff3e3e`**. Copy builds up: "From a line to a button. A line. A grid. A layout. A typeface. A colour. A line of code. Online. **Your turn.**" CTAs: "Start a project", "Say hello". Tel link.
- **Great because:** one tactile mechanic (X-ray and loupe) that explains craft, built with *our exact stack*, at a weight that can pass Lighthouse.
- **Steal (high value):** **"X-ray the trailer"**: press and hold (or long-press on mobile) to see through the powder coat to the galvanised chassis, the wiring loom and the weld seams. A **3D loupe** over the material close-ups. The copy pattern **"A sketch. A chassis. An axle. … Your turn."** ends straight in the CTA.

#### 40. INEOS Grenadier South Africa: ineosgrenadier.com/en/za
- **Evidence:** Next.js + ScrollTrigger, no WebGL, 2 videos. A custom **"formula4x4"** display face + **PP Neue Montreal**. `#fafaf9` / black. Nav: Vehicles · Shop · Ownership · Explore · **Grenadier at Work** · **Build a Grenadier** · Book a test drive. Prices in ZAR ("FROM R 1 519 000,00†"). 8.2 MB JS D; mobile total 24 MB (heavier than desktop).
- **Steal:** South African price formatting precedent, **"Grenadier at Work"** (a commercial/fleet path, for us food-truck and contractor buyers), and "Arcane Works" as a named custom division.
- **Avoid:** mobile heavier than desktop.

#### 41. Aevion LiDAR drone by Riotters: drone.riotters.com (**CSSDA WOTD 11 Sep 2026**)
- **Evidence:** Next.js + **React Three Fiber**, three **r183**, Lenis, **Rive**, Draco/Meshopt/KTX2. One terrain GLB (`NewTerreain_006.glb` 1.8 MB) rendered as a live point cloud. **On desktop the canvas is 1392×824 (full-bleed); on mobile it is a contained 390×360 card**: the 3D shrinks to a module rather than taking over the phone. Videos: 8 D vs **2 M**. Type: **Switzer** at **240 px / weight 300** for section H2s ("Gear", "Solutions", "Capabilities", "Software") + **protoMono** 300. Palette: white/`#fdfdfd`, mist `#dde5e9`, slate `#24363f`. Spec copy in the meta: "full-hemisphere LiDAR capture at 240,000 points per second, folding to 42 cm". Nav as features: **Scan · Connection · Compactness**. Total 19.7 MB D / 10.4 MB M.
- **Great because:** a hardware product is explained through its *capabilities* as interactive 3D chapters, and the mobile 3D is deliberately contained.
- **Steal:** **contain the 3D in a card on mobile** (360 px tall) with the copy above and below, rather than a full-screen takeover. Capability chapters named by one noun. Giant 240 px thin section words. **A point-cloud/LiDAR "scan" reveal** of the trailer as a loading state, so the build appears as a scan before the solid mesh streams in. The poster and the wow are the same moment.

#### 42. Eladio Dieste: eladiodieste.com (++hellohello, **CSSDA WOTD 29 Oct 2026**)
- **Evidence:** Next.js + **Lenis** + GSAP/ScrollTrigger, a full-screen **2D canvas** (no WebGL), 1 video, 37 images. **JS only 849 KB**, total 7.8 MB D / **3.9 MB M** (it serves smaller media to phones). A single custom face: H2 at **123 px**, H1 small (17.5 px). Palette: black with warm plaster `#f1ece8` / `#eadfd2`. Bilingual (Spanish/English). Works listed as an index of buildings, with honest "(Próximamente)" placeholders.
- **Great because:** an engineer's brick vaults are told as heritage engineering: structure as beauty, with restraint and speed.
- **Steal:** **"Engineering as heritage"** for the workshop/craft page. Every trailer is a structure, so show load paths, welds and joints the way Dieste's vaults are shown. A small H1 with giant H2s. Mobile media at half the weight.

#### 43. EnduroSat Space Service: endurosat.com/space-service (60FPS, **CSSDA WOTD 31 Oct 2026**; EnduroSat also has a 3D client-facing configurator by Kreativa Studio listed on Awwwards)
- **Evidence:** WordPress + **Swup** page transitions + Lenis + GSAP/ScrollTrigger + three **r171**. One `scene.glb` (**4.0 MB**) in a fixed full-screen WebGL2 canvas on D **and** M. Page 43 600 px with 24 sections. Type: **Magnetik** (300 to 800), H1 95 px/600. Palette: black/`#090d12` + **signal blue `#00a1ff`** + grey `#66717e`. Copy: **"SPACE MISSIONS MADE SIMPLE"**, problem/solution H2s, **"YOUR MISSION IN TWO STEPS: DEFINE / RECEIVE"**, **"WE COVER IT ALL"**: Mission analysis and design → Payload integration and space qualification → Launch and commissioning. CTAs: Contact, Investment inquiry. Load event 116 s (heavy scene).
- **Great because:** a complex, bespoke, high-ticket engineering service is reduced to **two verbs** while one persistent 3D satellite follows the scroll through every stage.
- **Steal:** **"Your trailer in three steps: Define. Build. Tow."** framing on the home page, then a detailed "We cover it all" list (design → engineering → fabrication → galvanising → finishing → roadworthy and registration → handover). A persistent 3D object that travels through the process sections.
- **Avoid:** a 4 MB single GLB on mobile. Split it and use LODs.

#### 44. Numa insulin pump: numa.uprock.pro (Uprock, **CSSDA WOTD 6 Sep 2026**)
- **Evidence:** Lenis + GSAP/ScrollTrigger + Lottie + Howler, **no WebGL**: 8 videos, 89 images. **Figtree** with giant H2s at **225 px/700**. Spec H3s split into number + unit ("72 / hours", "100 / dose", "50"). Ivory `#fffefc` + navy `#010f2b` + cobalt `#2b5cff`. Desktop 20 300 px vs **mobile 9 800 px** (half length on phones). A single CTA: **"Submit pre-order"**.
- **Steal:** **spec numbers as giant typographic events** ("3 500 kg", "12 weeks", "2 axles", in 200 px type) and a mobile page that is deliberately half as long. One CTA verb repeated.

#### 45. Awards Racing: awards.racing (**CSSDA WOTD 25 Sep 2026**: "drift mechanics meets vehicular combat")
- **Evidence:** Nuxt + three **r180** + GSAP + Howler, WebGPU strings, WebGL2 on D and M. **A cube-map EXR environment at 55 to 60 KB per face + a 342 KB `brdf_LUT_512.exr`**: a hand-rolled, tiny IBL. Type: **Druk Wide** 138 px/900. Pure black/white. A grid preloader.
- **Steal:** **"customise your car, then drive it"**: the configurator result becomes playable (tow your configured trailer over a short course). A **tiny cube-map IBL** (about 350 KB total) instead of a 2 to 4 MB HDR on mobile.

#### 46. La Revoltosa: larevoltosa.es (WAKA, **CSSDA WOTD 3 Oct 2026**: "reviving a 1953 Spanish soda brand via Three.js 3D renders and GSAP")
- **Evidence:** WordPress + **Barba** (`data-barba` present, the only measured site still on Barba) + Lenis + GSAP/ScrollTrigger + three **r182**. The fixed 1440×900 canvas did **not** create a GL context on desktop in our run (2D/CSS path), but **WebGL did start on mobile**. Type: **Teko** 105 px + **Vulf Mono**. Palette: **tomato red `#fe3e29`** on cream `#f4f2ea` + `#1a1a1a`. Opening storytelling line: "SETENTA AÑOS EN LOS MISMOS VASOS, EN LAS MISMAS BARRAS…" (seventy years in the same glasses, at the same bars). Mobile JS 5.0 MB vs D 3.9 MB, and mobile total 23.6 MB vs D 8.9 MB (inverted).
- **Steal:** **heritage told in the first sentence** ("Seventy years in the same glasses"). For US Trailers that is the workshop's years, kilometres towed and builds delivered. A condensed display + mono pairing.
- **Avoid:** mobile heavier than desktop.

#### 47. Bruno Simon: bruno-simon.com (2025/26 rebuild of the classic driveable portfolio)
- **Evidence:** three **r187** (the newest release; `__THREE__`=187), **Rapier** physics, Howler, GSAP, Draco/Meshopt/KTX2, WebGPU strings, WebGL2 on D **and** M with an AudioContext. **Dozens of tiny compressed GLBs** (3 to 34 KB each: `bricks`, `fences`, `bushes`, `playgroundVisual`). The nav exposes **input modes (Mouse+Keyboard · Mobile/Tablet · Gamepad)**, "Toggles sound", "Toggles some effects: High" (a quality switch) and "Reset every object". Achievement unlocks ("Unlock at 8 / 15 / 23 / 30 / 38").
- **Steal:** **a visible quality toggle** (High / Low) and a **"Reset"** button for the physics moment. Explicit touch controls on mobile. Lots of tiny meshes instead of one big one. Playful achievements could suit a "Take it off-road" mini-course.
- **Avoid:** zero practical information. Fine for a portfolio, wrong for a sales site.

### E. What the measurements say across the set

| Pattern | Measured in | Takeaway for US Trailers |
|---|---|---|
| **Lenis smooth scroll** | Locomotive, Immersive Garden, Hubtown, Jaguar, Forge, BMW F3, EarthRoamer, Shopify Editions, IVRESS | The default. Use it on desktop. On touch, leave native scroll on. |
| **GSAP + ScrollTrigger** | about 70% of the sites with motion | The scroll-timeline standard. Keep it. |
| **three.js revision** | r143 (Unseen), r151 (IG), r158 (Lusion), r165 (Locomotive, Igloo), r171 (EnduroSat), r174 (Lando), r178 (Oryzo, "modified by Lusion"), r179 (Hubtown), r180 (Awards Racing), r181 (Shopify), r182 (IVRESS, La Revoltosa), r183 (illoca, Riotters), r184 (Rivian), r185 (Hyundai), r186 (metic), r187 (Bruno Simon) | Brand-new agency work is on r179 to r185. Start on r187 and pin it. |
| **R3F (React Three Fiber)** | Shopify Editions, Rivian R2, Hyundai (FWA Nov 2026), metic. (WOTD Oct 2026), Riotters (WOTD Sep 2026) | Validates our stack for commercial product sites. |
| **Draco / Meshopt / KTX2** | in every three.js site measured | Not optional. Use all three. |
| **Theatre.js** | Hubtown, Active Theory bundle | Lets designers author camera paths visually. Worth adopting for the assembly sequence. |
| **WebGPU context created** | IVRESS (FWA SOTM May 2026) | Production-ready with a WebGL fallback. Write materials in TSL. |
| **No WebGL on mobile / contained 3D on mobile** | Dogstudio, Jaguar, Hyundai (no GL on phones); Riotters (3D shrinks to a 390×360 card); Oryzo (DPR clamped to 1.5, mobile JS 1.1 MB vs 2.4 MB) | Award juries accept a designed 2D path on phones. |
| **Image-sequence canvas instead of 3D** | BMW F3 (WOTD), Apple | A valid fallback, and sometimes a valid primary. |
| **Sound** | Lusion (15 cues), IG, Unseen, Resn, Dogstudio, BMW F3, IVRESS (reverb IR), Bruno Simon, Igloo | Almost every studio-made award site has sound. None of the commercial vehicle sites do. Make it opt-in, with a "start engine" style gate. |
| **Page transitions** | CSS View Transitions on Forge, Jaguar, Locomotive, Living Vehicle, EarthRoamer, Singer, Heirest, Polestar, Lucid; Swup on EnduroSat; Barba only on La Revoltosa | View Transitions have largely replaced Barba. Use it with a persistent canvas in the root layout. |
| **Custom cursor** | BMW F3, Jaguar, Unseen (17 elements), Rivian (31), IG | Common on desktop. Use it only as a contextual label. |
| **Display type** | thin serifs at 80 to 104 px / weight 200 to 300 (Forge "editorial", Helderburg Cormorant, Lucid Serif VF, IG PS Times) **or** a compressed/condensed grotesk (Singer Söhne Schmal, Vollebak Suisse Cond, IVRESS Basilia Compress) + **mono for data** (Lusion, Hubtown Commit Mono, Heirest Moderat Mono, BMW Space Mono) | Two directions for Phase 3: "atelier serif" and "engineered condensed". Either way, use a mono for specs. |
| **Palettes** | near-black + bone/parchment is the luxury default (IG, Forge, Lucid, Helderburg, BMW F3), with **one** accent: brass `#c9a76a`, champagne `#d7be96`, oxblood `#68001e`/`#990000`, IKB `#0000ff`, electric `#0016ec` | One accent, used sparingly. |
| **Commercial weight** | EarthRoamer ~62 MB decoded JS, Patriot ~58 MB, Land Rover 13 MB, Lucid 12.6 MB, Rivian 12.3 MB, Heirest 10.6 MB, Vollebak 10.6 MB, vs Forge 1.2 MB, Igloo 1.7 MB, Lusion 1.9 MB | The award winners are *lighter* than the dealer sites. Tag discipline is the cheapest Lighthouse win. |
| **Conversion CTAs** | "Start your project" (Forge), "Ask Paul" / "Begin a commission" (Helderburg), "Reserve your place" (Living Vehicle), "Build and reserve" / "Finish your build" (Land Rover), "Design yours" (Lucid, Rivian), "Request quotation" + WhatsApp (Hyundai FWA), "How to start" (Vitsœ) | Primary: **"Start your build"**. Secondary: **"Ask [founder]" on WhatsApp**. Tertiary: "Finish your build" (saved configuration). |

## Part 2: Premium brand tone study

I read copy live from the brand sites listed (headings, nav and CTA text pulled from the DOM). Quotes are verbatim.

### 2.1 Bespoke vehicle builders (the closest analogue to US Trailers)

| Brand | What they say (verbatim) | Pattern |
|---|---|---|
| **Singer Vehicle Design** (singervehicledesign.com) | "A RELENTLESS PURSUIT OF EXCELLENCE", "EVERYTHING IS IMPORTANT", "LUXURY THROUGH CHOICE: In collaboration with each owner, we focus on what is important to them", "Everything that bears the Singer name is tailored to a personal vision". CTAs: *Inquire Now*, *Connect*. | A manifesto told in mantras of 3 to 5 words. The verb is "connect", never "buy". The car is "reimagined", never "customised". No prices. |
| **Helderburg** (helderburg.com, classic Defender re-engineering) | "The Long Way Is the Point.", "NUMBERS-MATCHING · COACHBUILT FOR MODERN DRIVING · RE-ENGINEERED FROM THE CHASSIS UP", "A record of Helderburgs built for the people who commissioned them. **Not a catalog to choose from. Proof of what is possible.**" Each build has a person's name ("Oliver", "Ragnar", "Nixen") and a colour line. Nav CTA: **"ASK PAUL"** (the founder). Over 100 films, sorted into *The Drive / The Helderburgs / The Questions / From Paul*. Prices shown on ready-built stock ($243,448). | **The single best tone reference for US Trailers.** The founder is a person you can ask. Builds have names. "Past commissions" is used instead of "portfolio". There are two buying paths: commission one, or take a finished build now. |
| **Forge Automotive** (forgeautomotive.co.uk, CSSDA WOTD 22 Sep 2026) | "A vehicle should say something before it moves. Every line, material, and finish is considered." Process pillars: *Identity / Insight / Cohesion*. Capability list: *Bodystyling, Interior, Wheels, Lighting, Exhaust, Protection*. CTA **"Start your project"**. | Shows that a small bespoke workshop can win an award with type, photography and restraint, with no WebGL at all. |
| **ICON 4x4** (icon4x4.com) | "HAND MADE IN LOS ANGELES, CALIFORNIA", "WHAT MOVES YOU?", *Download brand book / brochure*. | Where it's made is the first line on the page. Trademarked model names (FJ44, "Derelict", "Reformer") make the product lines feel like a collection. |
| **EarthRoamer** (earthroamer.com) | A hero that reads in three beats: "WHERE LUXURY MEETS THE LAND… / AND OUR QUALITY TAKES YOU OFF-ROAD… / TO ADVENTURES THAT YOU WILL REMEMBER FOR A LIFETIME." CTAs: *Build your LTx*, *Build your SX*, *Discover the difference*. Hero shows GPS coordinates "40.074980, -104.978720". | Coordinates as a graphic device that says "real place, real workshop". "Certified Pre-Roamed" is a clever name for resale. |
| **Living Vehicle** (livingvehicle.com) | "Luxury, unplugged.", "See it first. Order first.", "Insiders order first.", CTAs *Reserve your place*, *Talk to us about financing →*, *Schedule a visit*. | Two-word headline. Scarcity and access ("Insiders") used instead of discounts. Financing is a polite secondary CTA. |
| **INEOS Grenadier, South Africa** (ineosgrenadier.com/en/za) | "FROM R 1 519 000,00†", "Head off-road, head off-map… **Drag a trailer through a swamp if you like.**", "Arcane Works. Our in-house custom division… Rare. Rigorously refined." CTAs *Build a Grenadier*, *Book a test drive*. | Local precedent for showing ZAR prices as "from R…". Dry British humour. "Arcane Works" is the custom-division naming pattern. |
| **Patriot Campers** (AU) | "UNSTOPPABLE off road camper trailers", *Find your Patriot*, *Compare the range*, *Book a viewing*, third-party reviews ("Could this be the world's most capable camper?"). | Strong proof from reviewers, but capital-letter hype ("UNSTOPPABLE") cheapens it. Avoid. |
| **Airstream** | "Keep it Real Savings Event", "Memories in Motion Experience Every Mile", *Build yours*, *Visit your dealer*. | Dealer-network retail tone. An example of what US Trailers is *not*. |

### 2.2 Watch, knife, furniture and tool makers

- **Ressence** (Shopify, measured): one model name per H2 ("TYPE 10", "TYPE 11"), then a single engineering claim: "POWERED FROM WITHIN: THE RESSENCE-WERK MOVEMENT". The catalogue is named like engineering drawings (TYPE 1 to TYPE 11), and the nav item "Innovation" sits beside the products. *Steal:* name the US Trailers chassis and platform types like drawing numbers (for example "UST-G3 Gooseneck"), with one engineering line each.
- **Vollebak** ("Clothes from the future"): every product has a near-unbelievable spec line ("jackets built from 11 km of copper", "hoodies designed to outlive you"). Waitlists and bids are used instead of "add to cart". *Steal:* one surprising, true spec per part ("3 400 welds", "7 coats", "rated to 3 500 kg").
- **Teenage Engineering, Vitsœ, Chris Reeve** (see the measured entries in Part 1): plain spec tables treated as design objects. Vitsœ's long-standing line, "Live better, with less, that lasts longer", and its planners who come to your home are the bespoke-service model: *a person designs it with you*.
- **Hermès, Ochs und Junior, MB&F**: blocked by bot protection (Cloudflare) in automated sessions. From known public positioning: hands, workbench and maker are named. Hermès's "Hermès Heritage" films and MB&F's "A creative adult is a child who survived" show the craftsperson as the hero, with the product second.

### 2.3 Performance and luxury car makers (tone)

- Porsche, Rivian, Land Rover, Polestar and Lucid (measured in Part 1) use **verbs of agency** in CTAs: *Build yours, Configure, Reserve, Test drive*. Headlines are 2 to 5 words ("Luxury, unplugged." and "The Long Way Is the Point." are the best in the set). Spec "chips" sit under the hero: 3 numbers, each with a unit and a label.
- Racing teams (Jaguar TCS Racing, CSSDA nominee Nov 2026) and BMW F3 (CSSDA WOTD 5 Nov 2026) lean on telemetry design: mono type, data readouts, a **"START ENGINE" gate** (BMW F3's preloader button) that turns on sound and unlocks the site.

### 2.4 Tone-of-voice rules for US Trailers, taken from the study

1. **Sentences of 2 to 5 words for headlines** ("The Long Way Is the Point." / "Luxury, unplugged."). Then one plain, specific sentence. No adjectives in a row.
2. **Engineering nouns, not marketing adjectives**: "hot-dip galvanised chassis", "torsion axles", "3 mm checker plate". This brief already bans "world-class" and "best in class", and every brand above that sounds expensive avoids them.
3. **Builds are commissions with names**: "Built for [first name], Stellenbosch, 2026" and a colour or spec line (from Helderburg). The page is "Past commissions", with the line "Not a catalogue. Proof of what is possible."
4. **A person to ask**: an "Ask [founder name]" CTA beside "Start your build" (Helderburg's "ASK PAUL"; Vitsœ's planners). It turns a form into a conversation and suits WhatsApp-first South African buyers.
5. **Place as proof**: "Built by hand in Cape Town" and workshop GPS coordinates as a graphic motif (ICON's "Hand made in Los Angeles", EarthRoamer's coordinates).
6. **Honest rand pricing**: "From R…" ranges with a dagger footnote (INEOS ZA). Price transparency is rare in SA trailer builders and builds trust.
7. **Dry wit, used sparingly**: "Drag a trailer through a swamp if you like." One line per page at most.

### 2.5 Photography direction (taken from the references)

- **Hero: low, wide, golden-hour, in the landscape.** EarthRoamer, Helderburg and Living Vehicle all shoot the vehicle small in a big landscape at dawn or dusk. For Cape Town that means the Cederberg, Tankwa Karoo, Chapman's Peak, the West Coast fynbos and a Sutherland night sky for the night lighting state.
- **Craft close-ups at macro scale**: weld beads, sparks, powder-coat texture, hands on tools. Hermès, Grand Seiko and Forge Automotive all frame hands and material with nothing else in shot.
- **Studio "object" shots on seamless dark or bone backgrounds** for the configurator and spec pages (Ressence, Teenage Engineering). These match the 3D renders, so the photography and the WebGL scene feel like one world.
- **People with names**: the owner at handover, the welder with a first name. Every bespoke maker that sounds expensive shows the maker.
- **Film over carousels**: Helderburg (100+ films) and EarthRoamer ("See us in action") use video as proof. A shot list should include 6 to 10-second silent loops (sparks, a ramp dropping, a hitch locking) for section backgrounds.

## Part 3: Technique notes for 2026

### 3.1 The platform in November 2026 (verified this session)

- **three.js r187** (npm `three@0.187.0`, 30 Oct 2026). `WebGPURenderer` is the recommended renderer and falls back to WebGL 2 automatically. WebGPU is on by default in Chrome, Edge, **Safari 26+ (including iOS)** and Firefox (Windows and Apple Silicon). r183 renamed `PostProcessing` to `RenderPipeline` and replaced `Clock` with `Timer`. r186 added a Gaussian-splatting addon, a `SunLight` with cascaded shadows, and *removed* `PCFSoftShadowMap`. r187 rebuilt PMREM for better image-based lighting. Source: utsubo.com "Three.js in 2026" (updated 6 Nov 2026).
  - **Implication:** write custom materials in **TSL** (three's shading language) rather than raw GLSL, so the same shader runs on WebGPU and WebGL. Check R3F and Drei compatibility with WebGPURenderer at build time. With R3F the renderer is passed through `gl={async (props)=>{const r=new WebGPURenderer(props); await r.init(); return r}}`. If any Drei helper breaks, stay on WebGLRenderer for v1, because the visual difference for one hero object is small.
- **What the measured sites ship:** three's revision global `__THREE__` showed **r185** on Hyundai *Your Perfect Partner* (FWA, Nov 2026, R3F + Draco + KTX2 + Meshopt), **r165** on Locomotive, **r158** on Lusion, and **r151** on Immersive Garden. Studios keep old, stable revisions once their pipeline works. A bleeding-edge revision is not an award requirement.
- **Safari 27 (14 Sep 2026)** brought the **HTML `<model>` element** to iOS, iPadOS and macOS. It takes USDZ *or* glTF `<source>` children and an `environmentmap` HDR, and it rotates natively with no renderer. It is Safari only, so it needs a fallback. WGSL `clip_distances` also arrived, which makes cutaway and section views cheap on iPhone WebGPU (source: cinevva.com news, 17 Sep 2026, citing WebKit's Safari 27 notes).
- **View Transitions:** same-document transitions work in Chrome, Edge, Safari 18+ and Firefox 144+. **Cross-document** (`@view-transition { navigation: auto }`) works in Chromium and Safari 18.2+, but Firefox support was still listed as pending in the 2026 sources found (Interop 2026 focus area). Measured: CSS View Transition rules were present on Forge Automotive, Jaguar TCS Racing, Locomotive, Living Vehicle and EarthRoamer, so it is now the normal transition layer. No measured site used Barba-style takeovers, except that a `barba` string still ships in Locomotive's bundle.
- **WebXR AR on iPhone: still none.** iOS Safari has no WebXR Device API. AR on iPhone means **Quick Look with USDZ** (`<a rel="ar" href="x.usdz">` or `<model-viewer ios-src>`). Android Chrome supports `immersive-ar` (ARCore) and **Scene Viewer**. `<model-viewer>` covers all of these: `ar ar-modes="webxr scene-viewer quick-look"`.

### 3.2 Scroll storytelling and smooth scroll

- **Measured stack among award sites:** GSAP + ScrollTrigger + Lenis is the default. Lenis was found on Locomotive, Immersive Garden, Jaguar Racing, Forge Automotive, BMW F3 and EarthRoamer, with `html.lenis` classes present. Lusion and Immersive Garden use a **virtual scroll**: document height equals viewport height (900 px), and the WebGL canvas is fixed and drives everything. Do *not* copy that for a selling site. It breaks find-in-page, anchors, SEO landmarks and the native mobile feel.
- **Pattern to use:** native document scroll + Lenis (desktop only, or `syncTouch:false` on touch) + ScrollTrigger timelines that scrub a **single** R3F scene in a `position:fixed` canvas. HTML copy panels scroll over it. This is how Oryzo (Lusion, Awwwards SOTM April 2026) gives "a hero object with weight and inertia and a camera that moves through Z depth".
- **The CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) are now in Chromium and Safari 26. Use them for cheap, off-main-thread reveals (text, image masks, progress bars), and keep GSAP for the 3D timeline only. This cuts JS and keeps INP low.
- **Single RAF:** run Lenis, GSAP's ticker and R3F's frameloop (`frameloop="demand"` when idle) from one requestAnimationFrame (`gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`, and drive R3F `advance()` from the same tick). This is the architecture Codrops described for Trionn (Jul 2026) to coordinate GSAP, three, Lenis and Web Audio.

### 3.3 Exploded views and part-by-part assembly

- **Data-driven parts:** export one glTF with **named nodes** (`chassis`, `axle_L`, `drawbar`, `ramp`, …) and custom `extras` (name, job, material, spec). Each node gets an `assembled` transform and an `exploded` transform (offset along a per-part vector). One ScrollTrigger timeline lerps a 0 to 1 `explode` uniform per part, staggered by *build order*. That gives assembly (1 to 0 in build order) and the exploded view (0 to 1 all together) from one rig.
- **Labels:** Drei `<Html>` anchors are cheap on desktop. On mobile, swap to a bottom sheet listing the active part (pinned), so there is no overlapping DOM. The active part is highlighted with a rim/fresnel TSL node and the other parts dimmed to 30%.
- **Cutaways:** with Safari 27's WGSL `clip_distances` and three's `clippingPlanes`, a section plane can sweep through the trailer to show the chassis rails inside the body: an "X-ray" moment like metic.studio's "hold to X-ray the page" (CSSDA WOTD 21 Oct 2026).
- **Exploded diagrams that rank:** render the exploded state once to a static SVG/PNG poster with labels. It is the LCP image and SEO content, and the reduced-motion version.

### 3.4 Real-time configurators: what exists for vehicles and trailers, and how they do on phones

- **Measured / observed:** Heirest (CSSDA WOTD 4 Sep 2026: "100k configurations, 3D models") is the newest award-level configurator, but it is **heavy**: ~10.6 MB decoded JS desktop, 12.8 MB mobile. Airstream, EarthRoamer ("Build your LTx/SX"), INEOS ("Build a Grenadier"), Porsche and Rivian all link to configurators. Most automotive ones are 2D image-swap (pre-rendered angles from a render farm), *not* real-time, because image swaps are reliable on phones.
- Published case studies (three.js forum "Performance-focused real-time car configurator", Hon Tran's car-configurator write-up) report the usual failure modes: >20 s first load from uncompressed models, <10 fps on mid phones, and memory leaks from undisposed materials on option swaps.
- **Approach for US Trailers:** a **hybrid**. Real-time R3F for *shape* options (length, axle count, body type, ramp/door, racks: geometry toggles on a pre-built modular rig, no runtime CSG) and *material* options (paint/powder coat colour via uniform; galvanised / checker / timber via KTX2 texture sets loaded on demand). Everything is driven by a tiny JSON schema that also computes the **rand price range** and **GVM/tare estimate**, so a licence-code hint can show ("over 3 500 kg GCM → Code EB/C1E", to be confirmed in the Phase 1 rules research). Each configuration is serialised to the URL (`?b=…`) so it is shareable, and it pre-fills the enquiry form and a WhatsApp deep link.
- **Phone rules:** one draw-call-budgeted model (<150 k triangles, <60 draw calls, instanced fasteners), 1K KTX2 textures on mobile and 2K on desktop, no real-time shadows on mobile (baked AO + contact-shadow plane), DPR clamped to `[1, 1.5]`, and `PerformanceMonitor` from Drei to step down.

### 3.5 Physics

- **Rapier (`@react-three/rapier`) is WASM**, about 1 to 1.5 MB. Load it *only* inside the interaction that needs it (the hitch moment, the suspension-over-rough-ground demo) via `next/dynamic` + `Suspense`. Do not include it in the home-page bundle.
- **Use cheap fakes for most "physics":** suspension travel is a damped spring on a heightfield sample (a dozen lines of maths, no engine). The ramp drop and door swing are GSAP with `elastic`/`back` easing or a spring from Motion. Save Rapier for one *playable* moment (for example, drag the trailer over corrugations or tip-test a load). Awards Racing (CSSDA WOTD 25 Sep 2026, "drift mechanics") and Bruno Simon's driveable portfolio show that playability is what gets shared.

### 3.6 Custom shaders and material close-ups

- **Materials to build in TSL:** powder coat (clearcoat + fine orange-peel normal), hot-dip galvanised (spangle texture + anisotropic sheen), weld bead (tiling normal/height along a curve via `TubeGeometry`), checker plate (normal map + roughness variation), and marine ply / teak (KTX2 albedo). `MeshPhysicalMaterial` in r187 adds the EON rough-diffuse BRDF, which makes powder coat look right.
- **Lighting states:** day / dusk / night as three HDRI or **PMREM** environment presets and tone-mapping exposure. Night turns on the emissive LED strips, the 12 V interior lights and a Sutherland star field. Bake light maps per state for mobile.
- **Hover "loupe":** metic.studio's 3D loupe and Hubtown's mouse-reveal (Unseen Studio, Awwwards SOTD Jun 2026) show the shader-reveal pattern: a cursor-driven mask uncovers the raw-steel/primer layer under the finish. It tells the build story in one gesture.

### 3.7 Kinetic and variable type, cursor, transitions

- **Measured type:** Google Sans Flex variable (BMW F3), a serif/sans pairing with an ultra-thin display serif at 80 to 90 px / weight 200 (Forge Automotive "editorial" + Geist Sans), PS Times + Helvetica (Immersive Garden), Aeonik + a custom mono (Lusion), Suisse Intl Condensed (Vollebak). The current award look is **one expressive display face + one mono for specs/telemetry**.
- **Variable axes to animate:** weight/width on scroll velocity (Lenis `velocity`), and a mono "readout" that ticks up spec numbers (kg, mm, rand).
- **Cursor:** custom cursors are still common (BMW F3 `body{cursor:none}` + `custom-cursor`; Jaguar `has-cursor`; Immersive Garden 5 cursor elements), but they are desktop-only and must keep native focus outlines. Use a *contextual* cursor label ("Drag to rotate", "Hold to explode"), not a decorative blob.
- **Transitions:** CSS View Transitions (cross-document in Chromium/Safari) for route changes, plus a shared-element morph from a build card to the build page hero (`view-transition-name`). The persistent R3F canvas stays mounted in the App Router `layout.tsx`, so the trailer never reloads between pages.

### 3.8 Sound design

- **Measured:** Lusion loads ~15 small `.ogg` cues (hover, click, page, "glass_broken") and Immersive Garden uses Howler with transition stingers ("Home_To_About_Thunder", "Marble_Crack" loop). BMW F3 gates the site behind **"START ENGINE"**, which unlocks Web Audio within the browser's autoplay rules (bg loop, section-switch, UI clicks).
- **US Trailers:** sound **off by default** with a visible toggle (and remembered in `localStorage` with try/catch). Cues: steel clank on part snap-in, ratchet on the hitch, gravel crunch on the physics demo, a low workshop ambience. All cues together should be <200 KB (Opus/ogg + AAC fallback for old Safari), lazy-loaded after the first toggle.

### 3.9 AR "see it in your driveway"

- `<model-viewer>` (Google, web component, ~200 KB gz) with `ar ar-modes="webxr scene-viewer quick-look"` + `ios-src="build.usdz"`. Generate the USDZ from the same glTF (Blender USD export or `usdzconvert`), **real-world scale in metres** so a 6 m trailer sits at 6 m in the driveway. On iOS 27 Safari, progressive-enhance with `<model>` for an inline view.
- Generate the AR file **per configuration** server-side, or cache the top 20 combos as pre-built USDZ files. Generating USDZ at runtime from the configurator is possible with three's `USDZExporter` on the client. That is fine on modern iPhones for a <5 MB model.
- **Selling hook:** the "View in your driveway" button sits next to "Send this build". Every AR session ends with a share or enquiry prompt.

### 3.10 Performance playbook: Lighthouse mobile 90+ with heavy 3D

The measured reality check: the heaviest sites in the set are weighed down by marketing tags, not 3D. EarthRoamer: 633 requests, ~62 MB decoded JS on desktop. Patriot Campers: ~58 MB decoded JS. Vollebak: 426 requests. Meanwhile Lusion ships its whole WebGL studio in ~1.9 MB decoded JS, and Forge Automotive won WOTD on ~1.2 MB.

1. **Poster first.** The LCP element is an `<img>` (AVIF, `fetchpriority="high"`, sized, preloaded) rendered from the exact R3F camera angle of the scene's first frame. The canvas fades in over it only after the model is ready, so there is no layout shift and no blank state. The LCP never depends on WebGL.
2. **Lazy 3D.** `next/dynamic(() => import('./Scene'), { ssr:false })` is mounted on `requestIdleCallback` *after* LCP, or on first interaction / IntersectionObserver. Lighthouse measures the poster, and users get the 3D.
3. **Assets:** gltf-transform pipeline: `dedup → prune → weld → simplify (mobile LOD) → meshopt (or Draco) → KTX2 (ETC1S for colour, UASTC for normals)`. Budget: <2.5 MB model + textures on mobile, <5 MB desktop. Serve from the Vercel CDN with immutable caching. Set up the Draco/Basis transcoders in a worker.
4. **Adaptive quality:** DPR `min(devicePixelRatio, 1.5)` on mobile, Drei `<PerformanceMonitor>` / `<AdaptiveDpr>` to step down. No post-processing on mobile beyond tone mapping. Pause the render loop when off-screen (`frameloop="demand"` + `invalidate()` on scroll).
5. **Detect capability:** `navigator.gpu`, `deviceMemory < 4`, `hardwareConcurrency < 4`, `connection.saveData` / effectiveType 2g–3g → serve the **video/image-sequence fallback** (an H.265/AV1 scrub video or a 60-frame AVIF sprite driven by ScrollTrigger).
6. **Reduced motion:** `prefers-reduced-motion: reduce` → no Lenis, no scroll-scrubbed camera. Show the exploded-view poster with labelled callouts and step buttons ("Next part"), and keep the configurator usable with instant (non-animated) updates.
7. **JS budget:** route-split GSAP/ScrollTrigger and three so they never ship to /faq, /contact or legal. Lenis is ~4 KB. Do not ship Rapier or model-viewer until requested. One analytics tag (Vercel Analytics). No chat widgets on first load (Vollebak loads Gorgias, Klaviyo, Elevar and Facebook, which is part of why it reaches 426 requests).
8. **Fonts:** at most 2 families, variable, `font-display: swap`, subset Latin, self-hosted via `next/font`.
9. **Measure on a real mid-range Android** (Moto G-class) and an iPhone 12-class phone, not only Lighthouse. Set an INP target under 200 ms, and keep heavy work off the main thread (KTX2/Draco workers, OffscreenCanvas where available).

## Part 4: Top 10 ideas to steal for US Trailers

Ranked by **wow × selling power**. Each idea lists its source references.

1. **"From sketch to steel" scroll-assembly hero.** The page opens on a pencil sketch of a trailer on drafting paper. Scroll turns it into a blueprint (blue linework, mono dimension callouts), then streams in the raw-steel chassis part by part (cross members, axles, wheels, floor, body, doors, ramp, lights), then cross-fades to the finished powder-coated build parked in the Cederberg at dusk. Every part snaps in with its name, job and one true spec, and the sequence ends on **"Your turn. Start your build."** *(illoca, Oryzo, Igloo chunked Draco, metic copy rhythm)*
2. **Live configurator that prices in rand and ends in an enquiry.** Type, length, axles, finish, options update the 3D model live and show a "From R… to R…" range plus estimated tare/GVM. A shareable build code (`?b=…`) allows **"Finish your build"** later. **"Send this build"** pre-fills the form and a WhatsApp message. *(Land Rover "Finish your build", Porsche "Load saved configuration", Heirest, Lucid prices in nav, INEOS ZA rand pricing)*
3. **Hold to X-ray.** Press and hold (long-press on phones) anywhere on the trailer to see through the paint to the hot-dip galvanised chassis, weld seams and wiring loom. A 3D loupe magnifies weld beads and checker plate. One gesture proves the build quality every competitor only claims. *(metic. CSSDA WOTD Oct 2026, Hubtown mouse-reveal)*
4. **Named commissions + "Ask [founder]" on WhatsApp.** Builds are shown as "Past commissions", each named for its owner and place ("Built for Pieter, Riebeek-Kasteel, 2026"), with a story, specs and a film. "Not a catalogue. Proof of what is possible." A persistent **"Ask [name]"** WhatsApp CTA sits beside "Start your build". "Available now / In the workshop" lists builds you can reserve before they're finished. *(Helderburg, ICON, Forge "Builds / Stock")*
5. **"See it in your driveway" AR at real scale.** `<model-viewer>` with Quick Look (USDZ) on iPhone and Scene Viewer / WebXR on Android, using the *configured* trailer. The AR session ends with "Send this build". It is the most screenshot-able and shareable moment for a phone audience. *(Apple `rel=ar` + `no-ar-quicklook` feature classes, Safari 27 `<model>`)*
6. **Day / dusk / night switch.** Three HDRI/PMREM states. Night switches on the LED strips, tail lights and 12 V interior, under a Sutherland star field. It sells the lighting options and makes a strong social-media clip. *(Lando Norris 1K HDRI pairs, Rivian "Light the way, wherever you go")*
7. **Build timeline scrubber.** A horizontal scrubber from "Week 1: raw steel" to "Week 12: handover" with real workshop footage and photos at each stage (cut, jig, weld, galvanise, coat, wire, fit-out, test, handover). It answers "how long?" and "can I trust you?" in one interaction, and doubles as the How It Works page. *(Shopify Editions staged beats, BMW F3 canvas image sequences, Helderburg "How a commission works")*
8. **"Hitch up" gate as the sound opt-in.** An optional ritual on the first visit: drag the coupler onto the tow ball. The latch *clunks*, the site unlocks and sound turns on: subtle steel, ratchet and gravel cues with a workshop-shed reverb. Sound stays off for anyone who skips. *(BMW F3 "START ENGINE", IVRESS "CLICK TO START" + impulse-response reverb, Lusion micro-SFX)*
9. **"The Nine Systems" exploded view.** On each trailer-type page, an **Explode** control floats the trailer into its named systems (chassis, running gear, coupling, body, doors and ramp, electrical, water and gas, storage, finish), each with a spec page, then snaps it back together. It suits SEO (one indexable section per system) and is fed by the same part data as idea 1. *(Helderburg "The Twelve Systems", Rivian multi-viewport "Take a closer look", Polestar spec H3s)*
10. **One playable physics moment: "Take it off-road".** Drag the trailer over Tankwa corrugations and a rock step. The suspension articulates (spring maths, with Rapier loaded only here), the load stays put, and a mono readout shows axle travel. It is shareable proof of off-road engineering. *(Awards Racing, Teenage Engineering's Rapier toys, Bruno Simon's driveable portfolio)*

*Honourable mention:* a **"Which trailer are you?" quiz** that produces a share card and pre-fills the configurator *(Hyundai "Your Perfect Partner", FWA Nov 2026)*. Good for TikTok and Instagram campaigns later.

### What we deliberately avoid (from the measurements)
- Virtual-scroll, canvas-only pages with no H1/H2 (Lusion, Hubtown, Igloo). US Trailers keeps native scroll and real HTML for SEO and accessibility.
- Marketing-tag bloat: EarthRoamer ~62 MB decoded JS and 633 requests, Patriot ~58 MB, Land Rover 13 MB. Budget: **<300 KB JS for first load on mobile**, with 3D loaded after LCP.
- Blocking browsers ("not supported", Active Theory) or forcing a gate before content. Every gate is skippable.
- Discount-led and adjective-stacked copy (Airstream sale hero; Patriot "UNSTOPPABLE"; Bowlus "Unmatched / Ultimate / Unparalleled").

## Sources and gaps

- **Measured live via Playwright (19 Nov 2026):** all 47 numbered sites above. The raw JSON for each run is in the session scratchpad (`out/*.json`). It was not committed, because it holds third-party page data.
- **Award listings read live:** cssdesignawards.com/wotd-award-winners (pages 1 to 5, WOTD Aug to Nov 2026), thefwa.com winners feed (Oct to Nov 2026).
- **Web sources:** utsubo.com "8 Best Three.js Websites of 2026" (updated 24 Sep 2026: Oryzo SOTM Apr 2026, IVRESS FWA SOTM May 2026, Hubtown SOTD Jun 2026, Primland SOTD Feb 2026, Sleep Well SOTD Jan 2026); utsubo.com "Three.js in 2026" (r187, 30 Oct 2026); cinevva.com news on Safari 27 `<model>` and WGSL clip distances (17 Sep 2026); Codrops on Lusion (13 Apr 2026) and the Trionn GSAP/three/Lenis/Web Audio architecture (15 Jul 2026; the article body sat behind a bot check); Chrome Developers "View transitions in 2025"; caniuse cross-document view transitions; Mozilla/WebKit Interop 2026 posts; three.js forum configurator write-ups.
- **Not reachable from this environment:** awwwards.com (HTTP 502 to automated clients), godly.website (DNS), land-book.com / siteinspire.com (bot checks), hermes.com, mbandf.com, snowpeak.com, ochsundjunior.swiss (Cloudflare/DataDome), expedia.com/route66 (FWA 13 Nov 2026, "Bot or Not?" page), Active Theory and their Cyera microsite ("browser not supported" to headless Chromium), taxaoutdoors.com ("This store is unavailable"), lightshiprv.com (script error in our extractor), sleep-well-creatives.com and orvae.undreamstudio.com (exceeded the 150 s budget). WebFetch could not resolve several hosts, so articles were read through the Playwright proxy instead. No bot protection was bypassed.
- **Caveat on byte counts:** decoded (uncompressed) sizes on a CPU-only headless Chromium (SwiftShader WebGL), so load times are pessimistic compared with real GPUs. Use them for relative comparison only.
