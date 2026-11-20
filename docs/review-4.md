# Review 4 (independent agent, live browser, no screenshots)

Scores: layout 8, typography 8, colour 7.5, motion 8, wow 8, mobile 6.5, speed 8.5, clarity 8.5, conversion 7.

## Fixed (verified with web/scripts/verify-review4.js)
1. Gooseneck numbers disagreed. Now one example build per type (EXAMPLE_CFG) drives the film, rig, designer and type pages. Gooseneck GVM is capped at 3 500 kg, within a light vehicle's braked rating. Tare is 2 192 kg everywhere.
2. Pages scrolled sideways at 375 px (tow-check grid, type-page spec list, long gooseneck H1). Every page now measures 375.
3. Mobile menu now traps focus (Tab cycles between the close button and the menu links).
4. Hidden hero controls are inert mid-film.
5. Film parts counter holds 27/27 at the end, and the tare counts up part by part.
6. Toy hauler height is 2 800 everywhere. The poster drawing hides when another type is chosen.
7. Enquiry fallback receives focus. The button reads "Update my brief".
8. "Attach my build" is unticked until the visitor designs or opens a build.
9. Designer 3D view is sticky and fits the screen on desktop.
10. Tow checker: re-tested; it shows a "Waiting for numbers" prompt for empty, negative or text input.
12. Type-page hero photo loads eagerly.
13. Rig shows a plain-language sway or squat warning when hitch load leaves the band.
14. Breadcrumb and inline links have bigger tap targets.

## Deferred
- 11: reduced-motion film is still long.
- 15: three.js Clock deprecation warnings.
- Bigger ideas, for the next round:
  - pick your own bakkie, feeding one rig card into the enquiry
  - share images per build code
  - a two-button mobile dock
