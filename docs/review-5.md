# Review 5 (independent agent, live browser, no screenshots)

Scores: layout 8.5, typography 8.5, colour 8, motion 8.5, wow 8.5, mobile 8.5, speed 9, clarity 8, conversion 7.5.

## Fixed (verified with web/scripts/verify-review5.js plus the earlier suites)
1. Rig, designer and tow checker now share one rules engine (web/src/content/rig.ts, built on towCheck). The rig card judges the real loaded mass and shows "fully loaded" rule warnings as notes. The designer shows the warnings too.
2. One brake answer: "fitted" brakes come from rigRules for the chosen vehicle. Copy in pricing.ts and specs() agrees.
3. Off-road page copy matches the designer:
   - body 2.4–3.6 m
   - 1 500 kg as drawn, with a 750 kg code-B build on request
   - the designer notes the code-B option
4. Gooseneck page copy matches the designer: body 6.0–8.4 m, GVM 3 500 kg, drawing label 6 000.
5. The trailer picked in the film carries to the rig (drive.setKind), the designer (buildStore.suggest, unless the visitor has designed one) and the tow checker.
6. "Send this build" and "Send this rig" move focus to the enquiry heading.
7. The rig card says "Weighing the rig…" until ready. It is no longer a live region.
8. Removed the confusing live hitch number. The text explains the parked figure.
9. The tow checker is seeded from the rig's vehicle and the designed trailer's GVM.
10. Designer Share falls back to a visible link field if the clipboard is refused.
11. Launch gaps:
    - invalid /b/ codes return a true 404 (src/proxy.ts)
    - the home page has a canonical link
    - app icons (/icon, /apple-icon) and a manifest are added
    - unused stock SVGs removed
- The tow-check warning no longer uses role=alert (it announced on page load).

## Deferred
- 12: three.js Clock and Rapier init deprecation warnings (library-internal).
- 13: checkbox rows are already 44 px tall; no change needed.
