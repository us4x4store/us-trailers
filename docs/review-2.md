# Review 2: independent review of the live site

Reviewed: https://us-trailers.vercel.app on 2026-11-19. I had not seen the site before this review and did not read review-1.
Method: Playwright Chromium (SwiftShader WebGL) at 1440×900 and iPhone 13 (390×664). I inspected the live DOM, computed styles, layout boxes, console, network and Resource Timing, and used the page by clicking, scrolling, tabbing and filling in the form. I also ran one load with slow-4G and 4× CPU throttling, plus a reduced-motion pass. I took no screenshots.
Not scored down, as agreed: no real photos yet, example prices, specs and timelines, missing contact details, and enquiry email not yet connected.

## 1. Scores

| Section | Layout | Type | Colour | Motion | Wow | Mobile | Speed | Message |
|---|---|---|---|---|---|---|---|---|
| Film (hero + assembly) | 9 | 9 | **7** | 9 | 9 | **8** | 9 | 9 |
| Test rig (#drive) | **7** | **8** | **8** | **8** | 9 | **6** | **7** | **5** |
| What we build (#types) | **8** | 9 | **8** | **7** | **6** | **8** | 10 | 9 |
| Process (#process) | **8** | **8** | **8** | **7** | **7** | **6** | 10 | 9 |
| Design yours (#design) | 9 | **8** | **8** | **8** | **8** | **7** | **8** | 9 |
| FAQ (#faq) | 9 | 9 | **8** | **8** | **6** | 9 | 10 | 9 |
| Enquire (#enquire) | **8** | **8** | **8** | **7** | **6** | **6** | 9 | **6** |
| Type pages + /faq (+ /privacy, 404) | **8** | **8** | **7** | **6** | **5** | **8** | 10 | **8** |

Overall: the film is close to award level, and so is the idea of a towing test rig. The rest of the page is a well-made, quiet one-colour document with one serious form bug and a physics readout that can show nonsense.

## 2. What is wrong, with evidence, and the exact fix

### Film
- **Colour, 7. The handover state fails contrast.** At chapter 08 the stage turns dusk (#1A1F36), but some overlay elements keep their light-mode colours:
  - The chapter number `.chn` stays ink rgb(31,59,115): **1.49:1**.
  - The scale-bar labels "0 / Raw steel / Handover" and the track border stay graphite rgb(34,38,42): **1.07:1**, so they are invisible.
  - `.scaleFill` stays ink on dusk.
  - The active BOM line in red #b8352a on dusk is **2.77:1**.
  - **Fix:** in `.stage:has(.end)`, also set `.chn{color:#b4bacb}`, `.scaleLabels{color:var(--fg-on-stage)}`, `.scaleTrack{border-color:var(--fg-on-stage)}`, `.scaleTrack i{background:var(--fg-on-stage)}` and `.scaleFill{background:#f1efe8}`. On dusk, use a lighter red (about #e0675c, which clears 4.5:1) for `[data-active]`.
- **Mobile, 8.**
  - "Hold to explode" shows in the first phone view (y=556) before the 3D has loaded. While only the poster is up, it does nothing.
  - Part cards use 12px mono for sentence-length text ("Trailing arms pivot from the chassis…").
  - The film takes 4 648px (7 screens) of scrolling on a phone before anything else appears.
  - Reduced motion keeps the full 7-screen 3D scroll; only pointer parallax is switched off.
  - **Fix:** hide `.controls` until `ready`. Make `.cardJob` 13px with line-height 1.5. On phones with reduced motion, compress the film to about 4 screens, or show the 8 chapters as stacked poster frames.

### Test rig
- **Message, 5. The live readouts break.** After I set off at 40, chose Rocks, and added a quad, two dirt bikes and water (straps on):
  - Nose weight read **169 672 kg (8 141.7 %)**, rising to **348 718 kg** and then **1 327 213 kg (59 892 %)**.
  - The speed readout showed **193 km/h** while the slider was at 120.
  - Floor g read **6.24**, and all four suspension-travel bars read **0** (wheels in the air).
  - This ran on a slow, software-rendered GPU, but a hot phone or a background tab can drop frames the same way. A section titled "real physics" that tells an engineer the nose weight is 1.3 million kg damages trust in the builder.
  - **Fix:**
    - Work out the *parked static* nose weight from the configuration (each load's deck slot × mass), not from live body positions. Today a load that comes loose and is left behind sends `comX` off to infinity.
    - Detect a loose load (distance from deck over 0.5 m) and show "Load came loose: straps off" instead of a number.
    - Clamp the displayed km/h to the tow speed ±10%, g to 0–3 and nose weight to 0–40%.
    - Cap Rapier substeps per frame. If the frame rate stays under 20 fps for 2 s, drop to the lite scene, or pause and show "Tap to resume".
- **Layout, 7.** On desktop, the rig viewport and panel are each **1 168px tall in a 900px window**, and the viewport is not sticky (`position: relative`). The nose-weight and GVM meters sit below the fold while the road is half out of view. **Fix:** make the viewport `position: sticky; top: 88px; height: calc(100vh - 112px)`. Set the panel in two columns (controls | readouts) so that everything fits within 900px.
- **Mobile, 6.**
  - The 3D viewport is a 356×279 sticky strip above a **1 168px** panel, so the readouts you are meant to watch scroll away under it.
  - The lede says "The numbers **on the right**…", but on a phone they are below.
  - **Fix:** use a 50vh viewport (about 330px) with a sticky three-number strip under it (km/h, nose %, mass/GVM). Put the full meters in a collapsible "All readouts" section. Change the copy to "The numbers alongside…".
- **Speed, 7.** Coming near #drive loads a single **800 KB** JS chunk (`0zddvt6oo4z9k.js`, Rapier) on top of a 280 KB three.js chunk. The whole page after scrolling transfers 1.50 MB. **Fix:** use the non-compat Rapier build (separate .wasm, streamed and compiled), or start preloading it during the film's idle time once the film is past 60%.
- **Type, 8.** Every label in the panel is 12px uppercase mono (17 + 20 + 9 instances), including whole sentences in the meter notes. **Fix:** keep 12px uppercase for labels only. Notes go to 13–14px sentence case.
- **Motion, 8.** Pressing a camera button snaps the camera with no transition. **Fix:** ease between Chase, Wheel and Side over about 600ms.

### What we build (#types)
- **Wow, 6. Motion, 7.** Four static side-elevation sheets in the same style, on the same paper. Nothing here pays off the drawing metaphor the film set up. **Fix:** draw each sheet's lines in with `stroke-dashoffset` as it enters. On hover or tap, overlay its key dimension and its licence code. Use a different accent per sheet (for example horse box versus quad loads drawn as ghost outlines).
- **Layout, 8. Colour, 8. Mobile, 8.** The section has the same `72px/64px` padding and the same `rgb(230,234,229)` background as drive, process, design, FAQ and enquire. The layout is "mono eyebrow + 84px Archivo heading + 15px mono lede" six times over. **Fix:** see top-10 #6.

### Process (#process)
- **Mobile, 6.** The stage tick list is `display:none` on phones. The phone gets a 324px slider with 13 stops (about 25px each) and no stage names, so you cannot see the shape of the 12 weeks. **Fix:** under 760px, replace the slider with a vertical stepper (9 rows, the current one expanded). Or keep the slider but show "prev | current | next" stage names under the thumb.
- **Wow, 7. Motion, 7.** The drawing does not change as the weeks advance. **Fix:** link the week to the drawing's state, for example from raw rails to welded to painted, reusing the film's part data.
- **Type, 8.** The desktop tick labels are 16px mono caps, and "WE MEASURE" and "YOUR DRAWING" are only 7px apart. **Fix:** 13px, with labels on alternating lines above and below.

### Design yours (#design)
- **Mobile, 7.**
  - The "Example pricing, incl. VAT. Your final price comes with your drawing." line is `display:none` on phones. The price in the sticky dock then reads as a quote.
  - The top "Share" button is **62×36**.
  - The 3D view is only 239px tall.
  - **Fix:** put "Example price" under the price in `.dock`, make Share at least 44px, and give the view at least 300px.
- **Type, 8. Colour, 8.** The disabled "Single" axle is opacity 0.35 with no reason given (no title, no `aria-describedby`). **Fix:** "Single axle: bodies up to 4 200 mm. Choose a shorter body to switch." Link it with `aria-describedby`.
- **Wow, 8. Motion, 8.** Changing length or axles swaps the price instantly. **Fix:** tween the numbers (tabular figures are already set) and show a dimension line on the 3D when the length changes.
- **Speed, 8.** The configurator scene loads on scroll; this is fine. Preload it when #process enters view.

### FAQ (#faq)
- **Wow, 6. Motion, 8. Colour, 8.** Plain details/summary on paper. **Fix:** link the answers to the rig. For example, "Does my trailer need brakes?" could show a small 750 kg / tare gauge driven by the configurator's current build, with a "See it in the test rig" link. A 12px progress hairline on open would also help.

### Enquire (#enquire)
- **Message, 6. Mobile, 6. A critical conversion bug.** The form posts to a server action with `noValidate`. When validation fails, **every field is wiped**. I typed name, town, a message and a "Mainly for" choice, entered a bad phone number and pressed SEND MY BRIEF. After the round trip: `name=""`, `town=""`, `message=""`, and `use` was back to "Bikes or quads". Focus went to `BODY` and not to the first error. A phone buyer who mistypes one digit loses their whole brief.
  - **Fix:** validate on the client first (on blur, plus on submit). On a server error, return the submitted values in the action state and render them as `defaultValue`s, or key the form so React 19 does not reset it. Move focus to the first `[aria-invalid=true]`.
- **Mobile.** The form is **1 765px** tall with 9 fields plus a message. Two selects are pre-filled with guesses ("Bikes or quads", "Within 6 months"), which will skew your lead data. **Fix:** step 1 asks only for name, phone and what you'll tow. Show the rest as "Add detail (optional)". Start selects on a blank "Choose…".
- **Type, 8.** Field labels are 12px caps mono with a 14px label box. Checkboxes are 24×24. **Fix:** labels 13px, checkbox hit area at least 44px through the label.
- **Wow, 6. Motion, 7.** This is the one place you ask for money, and it looks like the other sections. **Fix:** turn it into the title block of the visitor's own drawing sheet, for example "DWG UST-0xx · Client: [name as you type]", with their attached build shown as the sheet thumbnail. The brand concept then ends on the visitor.
- **Layout, 8. Colour, 8.** It shares the paper colour and padding of every other section; see #6.

### Type pages, /faq, /privacy, 404
- **Wow, 5. Motion, 6.**
  - Each type page has one static SVG elevation, and on a phone it sits at **y=655 in a 664px viewport**, so the first screen has no visual.
  - At 308×139 on a phone it is a thumbnail.
  - None of the 3D or configurator work appears on these pages, which are the SEO landing pages.
  - **Fix:** move the drawing above the lede on phones at full width (at least 360px tall), animate its lines in, and add the configurator preset to that type ("Start from this sheet" with `?build=` prefilled).
- **Colour, 7.** All four types share the same paper and ink, so a visitor cannot tell gooseneck from toy hauler at a glance. **Fix:** give each type a sheet colour accent (for example a red revision cloud, a blue-print variant, or a dusk sheet for off-road).
- **Message, 8.**
  - /toy-haulers says "**Nobody in South Africa builds them, so people import them.**" That is an unverifiable claim and competitors can disprove it. **Fix:** "Few are built here, so most are imported."
  - The pages run about 360–385 words, which is thin for "custom toy hauler South Africa". **Fix:** add a spec table (typical L × W × GVM, licence, brakes), an example price band, a build time, and 2–3 type-specific FAQs, to reach about 800 words.
- **SEO and polish.**
  - All four type pages use the same `/opengraph-image`. **Fix:** a per-type OG image showing that sheet's drawing.
  - The 404 page's `<title>` is the home title. **Fix:** "Drawing not found | US Trailers".
  - /privacy names no responsible party or Information Officer, which POPIA s.55 needs. Add a slot now, labelled as waiting on the owner.

### Global (applies across sections)
- **Mobile menu.** It has no `role="dialog"` or `aria-modal`, the body is not scroll-locked (`overflow: visible`), and focus is not trapped. It does put focus on Close and closes on Escape, which is good. The menu has both "Tow it" and "Towing laws", which are confusingly alike. Rename them to "Test rig" and "Towing laws".
- **Keyboard.** Focus rings are good (2px red on every stop). However, several focused elements stayed off-screen when tabbing (rig "Jerry can", "Fill water tank", Sheet 03/04, FAQ summary). Lenis is fighting the browser's native focus scrolling. **Fix:** on `focusin`, call `lenis.scrollTo(el, {offset:-120})` when the element is outside the viewport.
- **Performance is good where it matters.** With slow 4G and 4× CPU: first contentful paint 1.3 s, initial transfer **372 KB** (222 KB JS), and load at 3.0 s. The 3D only loads after the first interaction. No console errors on any page; only three.js deprecation warnings (`THREE.Clock`, Rapier init params).

## 3. Top 10 fixes, ranked by impact

1. **Stop the enquiry form wiping fields on a failed submit.** Validate on the client, keep values on server errors, and focus the first error. This is a direct lead loss on phones.
2. **Make the test-rig readouts impossible to break.** Base static nose weight on the config, detect loose loads, clamp the displays, and fall back to lite or pause at low fps. 1.3 million kg on a "real physics" engineering panel destroys credibility.
3. **Make the test rig fit the screen.** Desktop: a sticky full-height viewport and a two-column panel, so it fits in 900px. Phone: a 50vh viewport with a sticky km/h, nose % and GVM strip. Fix "on the right".
4. **Fix the handover contrast** for the chapter number, scale bar, labels and active BOM line on dusk. These are currently 1.07–2.77:1.
5. **Shorten the enquiry form for phones** to name, phone and what you tow, with the rest optional. Remove the pre-guessed selects. Make it the visitor's own drawing title block.
6. **Break the one-colour monotony after the film.** Six sections share the same paper background, the same 72/64 padding and the same eyebrow, heading and lede pattern. Put #drive or #process on dusk or Prussian drafting film. Add one full-bleed drawing moment between #types and #process. Vary the vertical rhythm (for example 120 / 64 / 160).
7. **Raise the type pages to the home page's level.** Put the drawing above the fold on phones, animate it, add "Start from this sheet" into the configurator, add a spec table and price band, use per-type OG images, and remove the "Nobody in South Africa builds them" claim.
8. **Mobile process:** replace the hidden-ticks slider with a vertical stepper, or show the stage names around the thumb.
9. **Mobile configurator honesty and usability:** show "Example price" in the dock, make Share at least 44px, give the view at least 300px, and explain the disabled Single axle.
10. **Accessibility and polish:**
    - mobile menu as a dialog with scroll lock;
    - Lenis focus-into-view;
    - 13px minimum for sentence text (part cards, rig notes, form labels);
    - 404 `<title>`;
    - POPIA responsible-party slot;
    - hide "Hold to explode" until the 3D is ready;
    - pre-fetch Rapier during the film, or use the non-compat .wasm build to cut the 800 KB chunk.
