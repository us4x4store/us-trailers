# Independent review 1: us-trailers.vercel.app

Reviewed 2026-11-19 in headless Chromium through Playwright, at 1440×900 and with the iPhone 13 profile (390×664). Everything was checked by reading the live DOM: computed styles, layout boxes, scroll states, interactions, console and network. No screenshots were taken. WebGL ran on SwiftShader at 1.3 fps, so 3D was judged by its structure and behaviour, not by its frame rate. The scripts are in `/tmp/claude-0/-home-user-us-trailers/838a597c-3d19-56e3-b0c8-b0d28286bbce/scratchpad/review/`.

**Overall:** the concept is strong and has its own identity. The scroll-driven assembly with a bill of materials, the physics rig and the configurator that carries its build into the enquiry form are all things people would share. It is not at 9 yet. The biggest gaps are on phones and in how the site sells, not in the art direction:

- There is no way to phone, WhatsApp or email.
- On phones, the 3D view scrolls out of sight while you use its controls.
- The film is 11 screens long before you learn what the company builds.
- The rig's readouts show wrong numbers.
- The main thread is heavy.

## 1. Scores

| Section | Layout | Type | Colour | Motion | Wow | Mobile | Speed | Clarity |
|---|---|---|---|---|---|---|---|---|
| Film (assembly) | 8 | 8 | 8 | 8 | 9 | 6 | 6 | 7 |
| Test rig (#drive) | 7 | 7 | 8 | 8 | 9 | 5 | 6 | 6 |
| What we build (#types) | 8 | 8 | 8 | 7 | 6 | 8 | 9 | 8 |
| Process (#process) | 8 | 7 | 7 | 7 | 6 | 7 | 9 | 8 |
| Design yours (#design) | 8 | 7 | 8 | 8 | 8 | 5 | 7 | 7 |
| FAQ (#faq) | 8 | 7 | 8 | 7 | 5 | 8 | 9 | 9 |
| Enquire (#enquire) | 7 | 7 | 8 | 6 | 5 | 6 | 9 | 6 |
| Type pages and /faq | 7 | 7 | 8 | 5 | 5 | 7 | 9 | 7 |

Console: no errors on any page. There is one warning: `THREE.Clock: This module has been deprecated`.

## 2. What is wrong (every score under 9)

### Film

- **Mobile (6)**
  - The part card covers the chapter text on phones. This happened at 3 of the 9 checkpoints:
    - 30% progress: the card spans y 217–361 and the chapter text spans y 80–233.
    - 50%: card at y 133–262.
    - 72%: card at y 159–270.
    - **Fix:** clamp the projected card position so it stays below `chapter.getBoundingClientRect().bottom + 12`. Or, on screens ≤760px, dock the card at a fixed spot above the controls (around y 420) and keep only the leader line moving.
  - On desktop the card covers the bill of materials at 20% and 83% (card x 1130–1400, list x 1181–1392). **Fix:** clamp the card's x to `bom.left - cardWidth - 16`.
  - On phones the film is 7,304px tall, and the first section after it (#types) starts at y 9,109, about 14 screens down. **Fix:** cut the film to about 650svh (`.film { height: 1100svh }` today) and add a visible "Skip the build ↓" link next to "Hold to explode".
- **Speed (6)**
  - With mobile emulation (4× CPU throttle, 1.6 Mbps), blocking time after first paint added up to about 3.1s. The longest tasks were 1,694 ms, 709 ms and 337 ms, all while the 3D scene mounted. The page itself is light: first paint and LCP at 1.4s, layout shift 0.001. But `FilmScene` mounts in the first `requestIdleCallback`, which also pulls in a 782 KB (decoded) three/rapier chunk on first load. SwiftShader makes these numbers worse, but the 1.7s task is mostly geometry built in JavaScript (`buildPartGeometry`) and shader compiles, and a real phone has to do those too.
  - **Fix:**
    - Mount the 3D on the first scroll or pointer event, not on idle.
    - Bake the parts to Draco/Meshopt glTF instead of building them at runtime.
    - Call `gl.compile(scene, camera)` behind the poster before fading it out.
    - Split rapier into its own chunk that only the drive section loads.
- **Clarity (7)**
  - The phone's first screen says "Drawn for you. Built once." The word "trailer" appears only in a 12px eyebrow, and the lede (13.5px) talks about "one being built".
  - **Fix:** put the product in the large type, for example "Trailers drawn for you. Built once.", or make the lede start "Custom toy haulers, off-road and gooseneck trailers…".
  - The handover CTA "Now tow it →" sends people to a simulator, not to the enquiry. **Fix:** add a second CTA there, "Start yours →", linking to #enquire.
- **Layout and typography (8)**
  - The bill of materials uses 10.5px text. Parts not yet built are `#7a817d` on paper, a contrast of **3.28:1**, and their numbers sit at 0.6 opacity, about **1.92:1**.
  - The title block is 10px. The scale-bar labels are 10px.
  - **Fix:** minimum 12px; unbuilt parts at least `#5d6460` (≥4.5:1); remove the 0.6 opacity on the numbers.
  - On the poster frame, the desktop H1 (x 48–608, y 174–361) runs over the front of the drawing (drawing x ≈440–1078, y ≈295–604). On phones the lede (to y ≈323) overlaps the drawing (y ≈292–387). **Fix:** move the poster or 3D trailer to the right and down while the intro is on screen: SVG inset `22% 4% 12% 38%` on desktop, and start the drawing at y ≥ 340 on phones.
- **Motion (8)**
  - With reduced motion turned on, the 3D film still flies parts in with an overshoot ease (`easeSettle`), and the test rig drives on its own. Only Lenis and the CSS transitions are switched off.
  - **Fix:** when `prefers-reduced-motion: reduce` is set, step through the chapters as static states with a crossfade and no fly-ins, and start the rig paused with a Play button.
  - Tabbing from the nav into the film puts focus on "Hold to explode" and scrolls to the end of the film (scrollY 9,354). Keyboard users skip the whole story. **Fix:** add a "Next chapter" button that is reachable with Tab.

### Test rig

- **Clarity (6)**
  - **Bug:** before the simulation sends its first reading, the panel says "0 / 3 000 kg · Tare 1 504 kg + payload **-1 504 kg**" and nose weight "0 kg (0.0%)" in the red bad state. **Fix:** in `driveState.ts`, start `readout.gross` at TARE and the nose weight at the static value.
  - **Bug:** nose weight is worked out as gross minus the live spring forces (`s.nose += (gross - wheelN/9.81 - s.nose)*0.35`), so it jumps around. Readings seen:
    - On tar with no load: 6, 63, 71, 86, 109, 127 and 132 kg (0.4% to 8.8%). The meter keeps switching in and out of red.
    - After adding a quad: **−306 kg (−17.1%)** on desktop and **650 kg (36.2%)** on mobile.
    - A buyer would read this as "this trailer is unsafe".
    - **Fix:** work out static nose weight from where the loads sit, by moment balance about the axle group. Show the live spring loads only in the suspension bars.
  - "Floor g" and "Pitch / roll" mean nothing to a buyer. **Fix:** show one plain line, for example "Bikes stay put: floor movement ±0.1 g", and fold the rest away.
- **Mobile (5)**
  - The 3D view is at y 7,604–8,016 (356×412) and the control panel is 1,017px tall underneath it. When you tap "Rocks" (panel at y ≈7,760+), most of the view has already scrolled off. **Fix:** make `.viewport` sticky on screens ≤960px (`position: sticky; top: 66px; height: 42svh`). Let the panel scroll beneath it, or turn the road, load and speed controls into one horizontal row of chips under the view.
  - The speed slider is 32px tall, so it is hard to grab. **Fix:** make the slider 44px tall.
  - The camera buttons (63×44) have 11px labels. **Fix:** use 12px labels on the camera buttons.
- **Typography (7)**
  - Readout labels are 10px. Road notes are 10px at 0.75 opacity. "Drag to look around" is 10px at 0.7 opacity. **Fix:** 12px minimum, no opacity on text, and use colour tokens for the muted text instead.
- **Layout (7)**
  - The header sits 28px above a 961px-tall rig, so the 84px H2 crowds the content. The same 28px gap is used in every section. **Fix:** make the header-to-content gap 56–72px on desktop.
- **Speed (6)**
  - In headless Chromium the scene took 12s to mount. The section mounts when it comes within 120% of the viewport, which on phones means while the film is still running. **Fix:** load rapier only when the section is near, and release the film's renderer once you scroll past it.

### What we build

- **Wow (6), motion (7)**
  - The four sheets are static drawings.
  - **Fix:** when a sheet scrolls into view, draw it in with a `stroke-dashoffset` reveal and slide in its dimension lines. On hover or press, show the three key specs (length, GVM, licence code). This costs almost nothing and continues the film's idea of drawings coming to life.
- **Layout (8)**
  - The card rows have different heights: 428 / 428 on the first row and 537 / 537 on the second. On phones the cards are 274 / 300 / 274 / 409px. **Fix:** give the drawing area a fixed aspect ratio so every card is the same height.
- **Typography and colour (8)**
  - The "SHEET 0x" labels are 11px ink. This is acceptable, but use 12px everywhere for consistency.

### Process

- **Typography (7), colour (7)**
  - The week-marker buttons are 10px text at 0.55 opacity, which works out to **3.37:1** contrast, and they are 46–125 × **27px**. **Fix:** 12px at full colour, 44px tall hit areas (the padding can be invisible).
  - The faded drawing behind is 0.27 opacity and decorative, which is fine.
- **Mobile (7)**
  - On phones the step buttons are hidden, leaving only a 324×32 slider. **Fix:** make the slider 44px tall and show the current step as a large label above it, for example "Week 3 · Chassis".
- **Wow (6), motion (7)**
  - Moving the slider swaps the text. **Fix:** tie it to the same trailer drawing so it builds up week by week, with the parts done so far filled in.

### Design yours

- **Mobile (5)**
  - The 3D preview (356×371) is not sticky. With the colour swatches centred on screen, the preview's bottom edge is at y 61, under the 66px fixed nav, so you cannot see the colour you just picked. The price sits below all the controls. **Fix:** make the view sticky on phones (`top: 66px; height: 38svh`). Pin a one-line bar to the bottom with the price range and "Send this build".
- **Clarity (7)**
  - Only a toy hauler can be configured, yet "Design one now" on the gooseneck and off-road pages links to `/#design`. **Fix:** add a Type control, or at least hide or rename the button on pages for other types. Also pass `?build=` presets from each type page.
  - "L48-A2-C0-R1-S1" is shown as a code with nothing explaining it. **Fix:** label it "Build code (share or quote this)".
- **Typography (7)**
  - The swatch name and field labels are 11px. The "mm" units are 10px at 0.75 opacity. The disabled "Single" option is 0.26–0.35 opacity and does not say why it is off. **Fix:** 12px minimum, and add a note: "Single axle: up to 4 200 mm".
- **Speed (7)**
  - The configurator brings a second WebGL context. **Fix:** reuse one renderer (share the canvas via a view or scissor), or dispose the film's renderer before this one mounts.

### FAQ

- **Typography (7)**
  - Answers are 15px Plex Mono at about 62 characters per line on desktop, and 14px at about 31 characters per line on phones. Mono at that size makes long legal answers hard to read. The source note is 11px.
  - **Fix:** set FAQ answers (and all body text over about 3 lines) in a proportional face, or Plex Sans, at 16–17px with 1.6 line height. Keep mono for labels and data.
- **Wow (5), motion (7)**
  - It is a plain accordion. **Fix:** in each answer, add a small licence-code or brake-rule diagram drawn in the drawing-office style, plus "Check my vehicle →", which pre-fills the enquiry with the licence field.

### Enquire

- **Clarity (6)**
  - **Selling blocker:** there are **0** `tel:`, `wa.me` or `mailto:` links on any page. A South African buyer on a phone expects WhatsApp. **Fix:** a sticky WhatsApp button and a phone link in the nav on phones and on every type page (needs Justin's number now).
  - The CTA "Start your drawing" is studio jargon. **Fix:** "Get a price" or "Start my build (free quote)".
  - The consent line mentions POPIA, but there is no privacy page or link. **Fix:** publish `/privacy` and link it from the consent label.
- **Mobile (6)**
  - The form is 1,312px tall: 9 fields plus a textarea, with 11px labels. Checkboxes are 20×20. **Fix:**
    - Show only name, phone and "what will tow it" first. Put the rest behind "Add details (optional)".
    - Labels at 13px.
    - Checkbox hit areas of 44px.
- **Motion (6)**
  - Submitting an empty form shows the errors, but focus stays on `BODY`. **Fix:** after an error, move focus to the first `[aria-invalid=true]` field and scroll it into view.
- **Layout (7)**
  - The bottom padding is 80px here but 56–64px in other sections. Every section uses the same 90px top padding and 28px gap below the header. **Fix:** set one scale, for example a 128 / 96 section rhythm on desktop and a 72 gap after the header.
- **Wow (5)**
  - Sending the configurator build fills the form well (the checkbox is ticked and it scrolls to #enquire). **Fix:** show the attached build as a small title-block "drawing" next to the form, so the form feels like the last sheet of the set.

### Type pages and /faq

- **Typography (7)**
  - H2s are 44px with `letter-spacing: normal`, while the home H2s use −0.02em with expanded width. The closing H2 is 64px with normal tracking. **Fix:** share one H2 token across all pages.
  - **/faq has no H1**: its only heading is an H2, "Licences, brakes, roadworthy.". **Fix:** make it an H1.
- **Motion (5), wow (5)**
  - The type pages are fully static, with no reuse of the 3D work. **Fix:** a type-specific drawing that draws itself in. For goosenecks, a short loop of the hitch articulating.
- **Mobile (7)**
  - The hero is 800–865px tall on a 664px screen, with the drawing under the CTAs. Footer links are 163×34 and breadcrumb links 85×11. **Fix:** make footer and breadcrumb links at least 44px tall.
- **Clarity (7)**
  - No page has an `og:image`, and the Twitter card type is `summary`. Sharing is the whole point of this site. **Fix:** generate an OG image for each page with `opengraph-image.tsx` (the sheet drawing and the H1).
  - `/nope` shows the default Next.js 404 ("404: This page could not be found."). **Fix:** make an on-brand `not-found.tsx` page.
  - **Fix:** link the gooseneck, off-road and modifications pages to the right configurator preset (see Design yours).
- **Layout (7)**
  - Desktop nav links have 12px-tall hit areas. **Fix:** pad them to 44px.
  - **Phones have no navigation menu.** `header nav` is `display: none` and there is no menu button. Type pages are only reachable from the footer. **Fix:** add a 44px menu button that opens a full-screen sheet of the drawings.

## 3. Top 10 fixes, ranked by impact

1. **Add real contact paths.** Add a WhatsApp button, a `tel:` link and email on every page; there are none today. Rename the CTA from "Start your drawing" to plain words, such as "Get a price". This is blocked on Justin's number and should be asked for now.
2. **Make the 3D view sticky on phones in the test rig and Design yours.** Today the view is off-screen (bottom edge at y 61) while you tap its controls. Pin a bottom bar with the price and "Send this build".
3. **Shorten the film and make what you sell clear sooner.** Cut it from 1100svh to about 650svh. Add "Skip the build ↓". Put "trailers" in the H1 or the first line of the lede. Add a "Start yours" CTA at handover.
4. **Fix the rig's readouts.** Start them from tare instead of "payload −1 504 kg". Use static nose weight from moment balance, not live spring forces, which gave −306 kg and 36%.
5. **Cut main-thread cost.** Mount the 3D on the first interaction, use pre-baked compressed glTF instead of runtime geometry, warm shaders behind the poster, keep rapier out of the first-load chunk, and use one shared WebGL renderer. Today blocking time is about 3.1s throttled, with one 1.7s task.
6. **Add a mobile navigation menu.** Today it is 0 links and no button.
7. **Set a minimum text size and contrast.**
   - 12px minimum, 13px for form labels.
   - No opacity on text.
   - Fix bill-of-materials text at 3.28:1 and 1.92:1, and process labels at 3.37:1.
   - Set FAQ answers and long body text in a proportional face at 16px.
8. **Handle reduced motion properly.** Show the film as static chapter steps and start the rig paused. Today both still animate.
9. **Fix film callout collisions.** Clamp the part card away from the chapter text (3 of 9 checkpoints on phones) and the bill of materials (2 of 11 on desktop). Move the trailer off the H1 on the intro frame.
10. **Finish launch basics and type-page parity.**
    - `og:image` on every page.
    - H1 on /faq.
    - An on-brand 404 page.
    - `/privacy` (POPIA), linked from the consent label.
    - 44px tap targets: footer links, process markers, sliders, checkboxes, nav.
    - Configurator presets matching each type page.
