# Review 3: independent review of us-trailers.vercel.app (20 Nov 2026)

Method: live browser inspection only, no screenshots. Playwright Chromium with SwiftShader at 1440×900, iPhone 13 (390×664), iPhone SE (320×568) and Pixel 7. I read the DOM, computed styles, layout boxes, console and network, and clicked through every control. 3D was judged on structure and behaviour, not frame rate. I did not score down the known gaps (no photos, example prices, no contact numbers, email not connected, privacy responsible party pending).

## 1. Scores

| Section | Layout | Type | Colour | Motion | Wow | Mobile | Speed | Clarity |
|---|---|---|---|---|---|---|---|---|
| Film (hero + assembly) | 8 | 8 | 9 | 8 | 8 | **6** | 9 | 8 |
| Test rig (#drive) | 8 | 8 | 9 | 7 | 8 | 7 | 8 | **6** |
| What we build (#types) | 8 | 8 | 9 | 7 | 6 | 8 | 9 | 8 |
| Process (#process) | 9 | 8 | 9 | 8 | 7 | 8 | 9 | 9 |
| Design yours (#design) | 8 | 8 | 9 | 8 | 8 | 8 | 8 | **6** |
| Tow check (#tow-check) | 8 | 8 | 9 | 6 | 7 | **6** | 10 | 7 |
| FAQ (#faq) | 8 | 8 | 9 | 7 | 5 | 8 | 10 | 7 |
| Enquire (#enquire) | 8 | 8 | 9 | 7 | 6 | 8 | 10 | 7 |
| Type pages + /faq | 8 | 8 | 9 | 6 | 5 | 7 | 10 | 8 |

What is strong: the brand system holds together. Paper #E6EAE5, graphite #22262A and Prussian #1F3B73 are used throughout, and no text failed WCAG AA (I checked every visible text node against its real background). The 3D loads only on first interaction. The home page sends about 378 KB before you interact (227 KB JS, 120 KB fonts) and 1.5 MB after a full scroll. LCP is 0.8 s on the phone profile and CLS is 0.000 on every page. There are no console errors (only a THREE.Clock deprecation warning). Focus rings show on every control (2 px, red). The mobile menu is a proper modal: focus moves in, Esc closes it and focus returns to the button. Reduced motion is respected. On mobile the test-rig viewport and the configurator view and price dock are sticky. AR works: Quick Look and Scene Viewer links are correct, the .glb measures 6.42 × 2.96 × 2.5 m and sits on y = 0, the .usdz uses metersPerUnit 1, and a bogus code returns 404. Share copies `/?build=…#design`, and opening that link restores the configurator.

## 2. What is under 9, with evidence and the fix

### Film
- **Mobile 6. The part label covers the end CTA.** iPhone 13 at 92% progress: the label card `[data-card]` sits at 100,400→350,548 and the end block "Get a price for yours / Now tow it" at 16,437→374,544. They overlap by 107 px, and the card has an opaque paper background, so it hides the main CTA. At 99% the card (40,400→290,514) still covers it. On desktop at 99% the card (40,636→310,750) overlaps the end block (48,719→452,768). At 92% it overlaps the title block (card 1130–1400 × 636–767, title block 1080–1392 × 700–826).
  **Fix:** add `.end` and `.tb` to `film.avoid` (it currently holds only the chapter and BOM). Hide the label when `isEnd` is true (`opacity:0`), or clamp the label above `.end`'s top.
- **iPhone SE: hero CTAs collide with the controls.** At 320 px the two CTAs wrap. "Skip the build ↓" lands at y≈482–530 while the "Hold to explode" bar covers 460–504.
  **Fix:** keep `.controls` hidden while `isIntro` is true (`hidden={!ready || isIntro}`), or stack the CTAs full width below 360 px.
- **The poster's dimension text is unreadable on phones.** The poster SVG is 343×452 with viewBox 840×460, so "6 330 OVERALL" renders 40×5 px on iPhone 13 and 33×4 px on SE. The same happens on the type pages, where text set at 26 px renders 14 px tall.
  **Fix:** on screens up to 760 px, use a tighter viewBox or a separate mobile poster, so that the dimension text ends up at 11 px or more.
- **Control buttons wrap on phones.** At the end chapter the three buttons are 114×50 with two-line labels; on SE they are 91×62.
  **Fix:** below 400 px, shorten the labels ("Explode", "Ramp", "Lights") and add `white-space:nowrap`.
- **Type 8.** UI copy is almost all 12 px mono: chapter lines 14 px, part card 12–13 px, BOM 12 px. On mobile the H1 is 46 px and the section H2s are 42 px, so the hero barely outranks the sections.
  **Fix:** set the mobile H1 to `clamp(52px,14vw,64px)` and keep H2s at 36 px. Raise chapter lines to 15–16 px and card text to 13–14 px.
- **Motion 8, wow 8.** Every viewport gets a 700svh film (6,300 px on desktop, 4,648 px on iPhone), and the 27-part BOM list is the only thing that changes on the right.
  **Fix:** cut it to about 500svh, or add a scrub snap per chapter. Make one chapter (wheels or the ramp) do something physical, not just fly parts in.

### Test rig
- **Clarity 6. The brakes contradict the site's own calculator.** The rig and the configurator say "Brakes: Required. Fitted: override discs" for a 3,000 kg GVM trailer behind a double-cab (the calculator's default tare is 2,100 kg). With those numbers, `#tow-check` says "Parking brake + service brakes you work from the driver's seat … overrun brakes alone aren't enough", which is reg 151 as the site's own research reads it. A compliance-led brand cannot ship this contradiction.
  **Fix:** for any trailer GVM above the tow vehicle's tare, spec and label driver-operated electric or electronic brakes in the rig, the configurator (`trailer/pricing.ts` `brakes`) and the disc-brake part copy. Pick one term, "overrun", and use it everywhere: the site mixes "override" and "overrun".
- **Negative hitch load.** The readout showed "Live hitch load on this road: -31 kg" at 16 km/h on tar. A buyer reads that as a bug.
  **Fix:** clamp the display at 0 and call negative values "lifting".
- **Floor g barely moves.** It read 0.99–1.01 g on tar, corrugations and rocks alike at 40 km/h, while the roll angle swung ±8°.
  **Fix:** show the peak over a 1 s window, not a smoothed value, or remove the readout.
- **Nose-weight guidance doesn't match its own gauge.** The copy says "Aim for 7–10%", but the green band covers 35–70% of a 17% scale, which is 6–12%.
  **Fix:** move the band to left `41%`, width `18%`.
- **The 120 km/h warning doesn't pair with the speed.** Over 100 km/h the warning appears, but the simulated speed keeps climbing (the readout passed 62 km/h while the slider sat at 120). Reset leaves the slider at 120.
  **Fix:** make Reset return the slider to 0 or 40.
- **Mobile 7.** The viewport is sticky but only 356×279, which is 42% of the screen. Load buttons are 70 px tall because their labels wrap.
  **Fix:** make the viewport 50–55svh, put the load buttons in a horizontal scroller with one-line labels, and collapse the readouts (605 px tall) behind "Show the numbers".
- **Motion 7.** "Straps off" over rocks for 5 s produced no "come loose" notice in my run.
  **Fix:** make the failure happen quickly and reliably (within about 2 s on rocks above 30 km/h). That moment is the share-worthy beat.

### What we build
- **Wow 6, motion 7.** There are four sheet cards (671×429/524) with line drawings and nothing else: no price, no spec line on the card, no hover beyond the link.
  **Fix:** add "From R…" (labelled as an example), the GVM range and the licence code to each card. Draw the lines in on hover. Add a small loop in each drawing, such as the ramp or the gooseneck pivot.
- **Type 8.** Card labels are 12 px.
  **Fix:** set the sheet number and meta to 13 px.

### Process
- **Type 8.** Twelve 12 px mono labels, and the ticks are 12 px uppercase.
  **Fix:** ticks to 13 px.
- **Wow 7, motion 8.** The slider (1,286×44) and the 9 ticks work; arrow keys and End move through weeks 2→6→12. But the content swaps rather than animates.
  **Fix:** morph the blueprint between stages (draw-on, a moving week marker). Put the YOU line in a contrasting chip so the buyer's duties stand out.
- **Mobile 8.** The stage title is 28 px and the "Week 2 of 12" label is 13 px.
  **Fix:** make the week the large number. It is the message.

### Design yours
- **Clarity 6. A shared build is lost in the enquiry.** Opening `/?build=L42-A1-C2-R0-S1` sets the configurator to L42, but the enquiry form still attaches the default "L48-A2-C0-R1-S1 … (the example on this page)". I checked before and after scrolling, and it only syncs after the visitor clicks an option. That breaks the share → send loop.
  **Fix:** in `Enquire.tsx`'s subscribe effect, call `f()` once right after `buildStore.listeners.add(f)`. The configurator's mount effect runs first, so the form misses that first update.
- **The brakes and licence specs are not legally accurate.** `pricing.ts` returns "Not required" for GVM ≤750 kg, but reg 151 always needs at least a parking brake, and overrun or service brakes above half the tow vehicle's tare. Above 750 kg it always says "override discs" (see the test rig).
  **Fix:** add a "Your tow vehicle" chip that defaults to "Double-cab bakkie, tare 2 100 kg" and use `towCheck()` for these rows, so every section uses one set of rules.
- **Disabled state.** At 6.0 m the "Single" button is skipped in tab order, which is good, but there is no visible reason next to it.
  **Fix:** add "Needs 4.2 m or shorter", using `aria-disabled` plus a hint.
- **Type 8.** There are 43 text nodes at 12 px in this section.
  **Fix:** option labels to 13–14 px and sub-labels to 12 px.
- **Day/Dusk/Night.** The buttons toggle `aria-pressed`, but nothing else on the page changes: the section background stays rgb(230,234,229).
  **Fix:** tint the section with the lighting state as well (a dusk wash, or the dark stage at night), so the change reads across the whole page.

### Tow check
- **Clarity 7. No GCM check.** A Hilux (GVM 3,210) with a 3,000 kg trailer gives a combined 6,210 kg. Most SA double-cabs have a GCM of about 5,850–6,000 kg (reg 239), and that is the most common real-world failure. The calculator says nothing about it.
  **Fix:** add an optional "GCM (owner's manual)" field and warn when bakkie GVM plus trailer GVM exceeds it. Explain that actual masses count.
- **A cleared field snaps to 0.** Clearing "Vehicle tare" sets the value to 0 straight away. The result then reads "The trailer is heavier than your vehicle's tare".
  **Fix:** keep `""` in state and show "Enter your tare" instead of a result.
- **Wrong CTA for heavy vehicles.** The "Only have code B? Ask us for a 750 kg build" CTA also shows for EC1 vehicles (F-250, GVM 4,500 kg). A 750 kg build gives them C1, not B.
  **Fix:** show it only when the vehicle itself is B-class.
- **Mobile 6.** The section is 1,838 px tall. Inputs sit at y = 406–823 and the result card starts at y = 989, so the answer is never on screen while you type.
  **Fix:** add a sticky one-line result bar on mobile ("EB · service brakes · 100 km/h").
- **Motion 6.** The result changes instantly and `aria-live` re-reads the whole block on every keystroke.
  **Fix:** animate the licence-code change. Make only the summary line `aria-live`.
- **Check before publishing:** the "Show a 100 km/h sign on the back" claim, and the >9,000 kg case ("Check with your licensing office"; reg 293 sets 80 km/h there). Confirm both against the reg 293 text.

### FAQ (home)
- **Wow 5, clarity 7. It's a dead end.** There are six `<details>` (the first is open), no links, and no CTA. Price, warranty, deposit and delivery are not covered, though they are what buyers ask first. /faq has "How much does a custom trailer cost?" but the home FAQ does not.
  **Fix:** swap in the price question and a warranty question. End with "All towing questions →/faq" and "Ask about your vehicle →#enquire".
- **Motion 7.** Details open with no transition.
  **Fix:** animate the height with `interpolate-size` or a grid-rows transition, and rotate the + mark.

### Enquire
- **Clarity 7.** See the shared-build bug above.
- **Focus is lost after a send.** After a valid submit, the "offline" alert renders but `document.activeElement` is `BODY`.
  **Fix:** focus the status panel (`tabIndex=-1`, `.focus()`), as is already done for the first error. The error state correctly focuses `#phone` and keeps every value.
- **Wow 6, motion 7.** The form is a standard stack (labels 12 px, hints 13 px). There is no step-by-step progress, and nothing echoes the drawing.
  **Fix:** make the attached build a mini title block with a thumbnail of the drawing. Animate a "sheet stamped" moment on success. Show the reply promise ("one working day") beside the button.

### Type pages + /faq
- **Mobile 7.** The first CTA on /toy-haulers sits at y = 658 on a 664 px screen, just below the fold. The next one is at 4,288 px of 5,111. There is nothing sticky.
  **Fix:** put a CTA row right under the lede, and add a slim sticky "Get a price · Design one" bar on mobile type pages.
- **Wow 5, motion 6.** Each page has one SVG drawing and about 430 words. There is no 3D, no configurator embed and no example price.
  **Fix:** embed the configurator preset to that type (`?build=` preset), add an example price band, and put an exploded drawing with call-outs for each section of "How we build it".
- **Consistency.** /toy-haulers has no "Read the towing laws" link (the other three do). "Override brakes" appears on /modifications-and-upgrades.
  **Fix:** align the links and the brake term.
- **/faq structure.** The questions are `<summary>` text with no headings (the page outline is just H1 plus one H2).
  **Fix:** wrap each question in an `<h3>` inside its summary to help SEO and screen-reader navigation.

## 3. Top 10 fixes, ranked by impact

1. **Make the brakes and licence rules agree everywhere.** The rig and configurator say "override discs" for a 3,000 kg trailer behind a 2,100 kg-tare bakkie, while the site's own Tow check says that needs driver-operated service brakes. Run every section through `towCheck()`, fix "Not required" for builds ≤750 kg, and use one term, "overrun".
2. **Pass a shared build to the enquiry.** `?build=` loads into the configurator but the form attaches the default L48. The fix is one line in the `Enquire.tsx` effect: call `f()` once after subscribing.
3. **Stop the film's label card from covering the end CTA.** It overlaps by 107 px on iPhone 13 and also on desktop at 99%. Hide the label on the end chapter, or add `.end` and `.tb` to `film.avoid`.
4. **Add a GCM field and warning to Tow check.** Add a sticky result bar on mobile, and stop a cleared field snapping to 0.
5. **Mobile sales path on type pages.** Put a CTA above the fold and a sticky "Get a price" bar. Add example "from" prices to the type pages and the #types cards.
6. **Type scale.** Raise the 12 px mono UI text to 13–14 px and body mono to 15–16 px. Set the mobile H1 to at least 52 px, against 36 px H2s.
7. **Credible test-rig numbers.** Clamp the negative hitch load, show peak g, match the nose band to the 7–10% copy, and make "come loose" fire reliably so the moment can be shared.
8. **Phone legibility of the drawings.** The dimension text renders 4–5 px on phones. Add a mobile viewBox or poster so it renders at 11 px or more.
9. **Turn the home FAQ into a path, not a dead end.** Add price and warranty questions, a link to /faq and an enquiry CTA. Animate the opening.
10. **Small control and focus fixes.** Keep the controls hidden during the intro (the SE overlap), stop the button labels wrapping, focus the status panel after a send, explain the disabled "Single" option, and make Day/Dusk/Night change the section too.
