# US Trailers brand: Drawing Office

_Status: built and live as the working direction. Justin has not formally chosen yet (decision 1 of 3). Everything below is how the site is made today; change it here first, then in code._

## Idea in one line
Every trailer is drawn for one owner before it is built. The site *is* the drawing board: drafting paper, Prussian-blue ink, real dimensions, honest numbers.

**Positioning:** For South Africans who tow something that matters, US Trailers designs and builds one trailer at a time in Cape Town, engineered around your vehicle, your licence code and your load.

**The feeling:** "This is being drawn for me, by people who care about every millimetre and every weld."

## Wordmark
`US·TRAILERS` in Archivo 800 at 125% width, letter-spacing 0.02em, with a dimension bracket underneath (a 1.5 px open box in Prussian ink, 7–10 px deep). Never stretch it, outline it or put it on a busy background. Minimum width 120 px. On dark grounds the bracket turns `#8FA9E0`.

## Colour
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#E6EAE5` | The page. Cool drafting paper, never cream. |
| `--grid` | `#CDD5D0` | 40 px drafting grid (24 px on phones), only behind drawings and sheets. |
| `--ink` | `#1F3B73` | Prussian blue: primary buttons, links, dimensions, the blueprint section. |
| `--graphite` | `#22262A` | Text, rules and borders. |
| `--muted` | `#4F5552` | Secondary text (6.3:1 on paper). Never use opacity to fade text. |
| `--galv` | `#A7AFB2` | Galvanised steel in drawings and 3D. |
| `--red` | `#B8352A` | Revision red: callouts, errors, the selected-part marker. Never a button colour. |
| Dusk | `#1A1F36` | The handover scene and night. Text on it: `#F1EFE8`, ink `#A9C0EE`, red `#FF9A8C`. |
| Blueprint | `#1F3B73` / `#183062` | The one cyanotype section (How a commission works): lines `#E8EEF9`, labels `#A9C0EE`. |

Ratio: about 80% paper, 15% graphite, 5% ink. Red appears only where something needs attention.

## Type
- **Display:** Archivo, variable width. Headlines 800 weight at 112–120% width, line-height 0.9, letter-spacing −0.02em.
  - H1: `clamp(54px, 7.2vw, 104px)` home, `clamp(52px, 6.4vw, 96px)` type pages.
  - Section titles: `clamp(36px, 6vw, 84px)`.
  - Card titles 26–38 px.
- **Drawing voice:** IBM Plex Mono for labels, specs, numbers, buttons. Uppercase labels at 13 px, letter-spacing 0.1–0.14em. Numbers always tabular.
- **Reading voice:** Archivo at 100% width, 16–18 px, line-height 1.55–1.6, for anything longer than a sentence (FAQ answers, type pages, results).
- Minimum size anywhere: 12 px for labels, 13 px for sentences, 16 px for inputs.

## Space and layout
- Gutter `clamp(16px, 3.4vw, 48px)` plus safe-area insets. Sections pad `clamp(72px, 10vh, 120px)` on top; the blueprint section pads more to break the rhythm.
- Everything sits on sheets: 1.5 px graphite borders, square corners, no shadows except the sticky bars on phones.
- Sheets number themselves only when the order means something (Sheet 01–04, Week 0–12, Parts 01–27).
- Tap targets at least 44 × 44 px.

## Drawings
- Side elevations, 1 unit = 1 cm, ground line dash-dot (6 4 1 4).
- Solid graphite for our steel, dashed grey phantom lines for things that aren't ours (the bakkie), Prussian dimensions in mm with ticks, revision-red dashed circles with lettered tags for changes.
- Dimension text uppercase mono: "6 330 OVERALL". On phones the lettering scales up so it stays readable.

## Voice
- Confident, exact, short. Engineering nouns over adjectives: "hot-dip galvanised", "coded welds", "GVM", "tare".
- South African English: bakkie, licence, tyre, colour, roadworthy, rand (R 300 000, thin-space thousands).
- Never: "world-class", "best in class", "premium quality", hype, exclamation marks.
- Always say what happens and what the buyer does next: "Get a price", "Send my brief", "Set off at 40 km/h".
- Rules are explained plainly and sourced (reg numbers), and marked as guidance.
- Anything not yet confirmed by Justin is labelled "example".

## Motion
- One orchestrated moment per section: the film's assembly, the blueprint draw-in, the rig's physics. No decorative motion elsewhere.
- Easing `cubic-bezier(0.22, 1, 0.36, 1)`; UI transitions 0.25–0.6 s; parts settle with a 4% overshoot like being dropped into a jig.
- The 3D only starts on first interaction; the drawing is always the first frame.
- Reduced motion: no flying parts, sparks, parallax, auto-rotate or wave icons; drawings show complete.

## Sound (optional, off by default)
Synthesised: weld crackle, metal clank, ramp-strut hiss, road noise that follows speed and surface. Never autoplay.

## Photography (when real photos arrive)
Golden hour or overcast, never midday glare. The trailer in its real place (driveway, Tankwa road, farm, track), the owner's vehicle hitched. Workshop shots in natural light with real hands and real welds. No stock adventure imagery, no filters, no drone-only shots.
