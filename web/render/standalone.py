"""
One self-contained HTML file of the US Trailers build film, for keeping and opening offline.
Everything is inlined: fonts, styles, the hero still, all 220 frames and the scroll player.

Run from web/:  python3 render/standalone.py out.html
"""
import base64
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1]


def b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def font(name):
    return f"data:font/woff2;base64,{b64(os.path.join(ROOT, '.next/static/media', name))}"


manifest = json.load(open(os.path.join(ROOT, "render/manifest.json")))
film_ts = open(os.path.join(ROOT, "src/content/film.ts")).read()
chapters = [
    {"n": n, "title": t, "line": l, "from": int(f)}
    for n, t, l, f in re.findall(r'\{ n: "(\d+)", title: "([^"]+)", line: "([^"]+)", from: (\d+) \}', film_ts)
]
jobs = dict(re.findall(r'^\s+"?([A-Za-z&,\- ]+?)"?: "([^"]+)",$', film_ts, re.M))
parts = [
    {"name": p["name"].replace(", kerb side", ""), "job": jobs[p["name"]], "start": p["start"], "end": p["end"]}
    for p in manifest["parts"]
    if p["name"] in jobs
]
frames_dir = os.path.join(ROOT, "public/film/d")
frames = [f"data:image/webp;base64,{b64(os.path.join(frames_dir, f'f{i:04d}.webp'))}" for i in range(1, manifest["frames"] + 1)]
hero = f"data:image/webp;base64,{b64(os.path.join(ROOT, 'public/film/hero.webp'))}"

archivo = font("db545dba463279ae-s.p.1cp9-4nby68jc.woff2")
plex = {w: font(n) for w, n in ((400, "73c8302d2fdfe340-s.p.30xqm3yldpj47.woff2"), (500, "9f5be66613d9c872-s.p.27korwsf9c79u.woff2"), (600, "a036da9e181f7bda-s.p.17c61zbdzi3u-.woff2"))}

data = {"frames": frames, "finale": manifest["finale"], "chapters": chapters, "parts": parts}

html = f"""<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#050506">
<title>US Trailers · Built for your toys</title>
<style>
@font-face {{ font-family: Archivo; font-weight: 100 900; font-stretch: 62% 125%; src: url({archivo}) format("woff2"); }}
{''.join(f'@font-face {{ font-family: "Plex Mono"; font-weight: {w}; src: url({u}) format("woff2"); }}' for w, u in plex.items())}
:root {{
  --display: Archivo, "Arial Narrow", system-ui, sans-serif;
  --mono: "Plex Mono", ui-monospace, Menlo, monospace;
  --gutter: max(16px, env(safe-area-inset-left, 0px), clamp(16px, 3.4vw, 48px));
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --rgb: linear-gradient(90deg, #ff4fd8, #8b6bff 45%, #3fd7ff);
  color-scheme: dark;
}}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; background: #050506; color: #f2f1ec; font-family: var(--display); -webkit-font-smoothing: antialiased; }}
a {{ color: inherit; }}
.nav {{ position: fixed; top: 0; left: 0; right: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 18px var(--gutter); mix-blend-mode: difference; }}
.wm {{ font: 800 20px/1 var(--display); font-stretch: 112%; letter-spacing: 0.06em; text-decoration: none; }}
.nav a.cta {{ font: 600 12px/1 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none; padding: 12px 16px; border: 1px solid rgba(255,255,255,.6); }}
.film {{ position: relative; height: 1100svh; }}
.stage {{ position: sticky; top: 0; height: 100svh; overflow: hidden; }}
.poster, canvas {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity .9s var(--ease), transform 1.4s var(--ease); }}
.off {{ opacity: 0; }}
.poster.off {{ transform: scale(1.04); }}
.scrim {{ position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .9s var(--ease);
  background: linear-gradient(to top, rgba(5,5,6,.9) 0%, rgba(5,5,6,.45) 38%, rgba(5,5,6,0) 62%), linear-gradient(to right, rgba(5,5,6,.55), rgba(5,5,6,0) 55%); }}
.ov {{ position: absolute; opacity: 0; transform: translateY(14px); transition: opacity .7s var(--ease), transform .7s var(--ease); pointer-events: none; }}
.show {{ opacity: 1; transform: none; pointer-events: auto; }}
.intro, .end {{ left: var(--gutter); bottom: clamp(96px, 16vh, 180px); max-width: 720px; display: grid; gap: 22px; }}
.kicker {{ margin: 0; font: 600 12px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; color: #a9c0ee; }}
h1 {{ margin: 0; font: 800 clamp(56px, 9.5vw, 168px)/.86 var(--display); font-stretch: 112%; letter-spacing: -.035em; color: #fff; }}
h1 em, .grad {{ font-style: normal; background: var(--rgb); -webkit-background-clip: text; background-clip: text; color: transparent; }}
.lede {{ margin: 0; max-width: 46ch; font: 400 clamp(16px, 1.3vw, 19px)/1.55 var(--display); color: #c9cbcf; }}
.ctas {{ display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }}
.btn {{ min-height: 52px; display: inline-grid; place-items: center; padding: 0 26px; font: 600 13px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; text-decoration: none; background: #f2f1ec; color: #0b0c0e; }}
.ghost {{ background: transparent; color: #f2f1ec; border: 1px solid rgba(242,241,236,.5); }}
.cue {{ font: 500 12px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: #8d9096; }}
.chapter {{ left: var(--gutter); top: clamp(88px, 13vh, 140px); max-width: 460px; display: grid; gap: 10px; }}
.chn {{ font: 600 12px/1 var(--mono); letter-spacing: .22em; color: #a9c0ee; }}
.cht {{ margin: 0; font: 800 clamp(40px, 5.6vw, 92px)/.9 var(--display); font-stretch: 112%; letter-spacing: -.03em; color: #fff; }}
.chl {{ margin: 0; font: 400 15px/1.55 var(--display); color: #b9bcc2; max-width: 40ch; }}
.part {{ right: var(--gutter); bottom: clamp(88px, 13vh, 130px); max-width: 340px; display: grid; gap: 6px; padding-left: 16px; border-left: 2px solid #8b6bff; }}
.part b {{ font: 700 18px/1.2 var(--display); font-stretch: 106%; color: #fff; }}
.part span {{ font: 400 14px/1.5 var(--display); color: #b9bcc2; }}
.endT {{ margin: 0; font: 800 clamp(48px, 7.5vw, 128px)/.9 var(--display); font-stretch: 112%; letter-spacing: -.03em; color: #fff; }}
.meter {{ position: absolute; left: var(--gutter); right: var(--gutter); bottom: 28px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 18px; font: 500 11px/1 var(--mono); letter-spacing: .16em; text-transform: uppercase; color: #8d9096; font-variant-numeric: tabular-nums; }}
.track {{ position: relative; height: 1px; background: rgba(255,255,255,.16); }}
.track i {{ position: absolute; inset: 0; background: var(--rgb); transform-origin: 0 50%; transform: scaleX(0); }}
.track em {{ position: absolute; top: -4px; width: 1px; height: 9px; background: rgba(255,255,255,.4); }}
.marquee {{ overflow: hidden; padding: clamp(28px, 5vh, 56px) 0; border-top: 1px solid rgba(255,255,255,.1); border-bottom: 1px solid rgba(255,255,255,.1); }}
.mt {{ display: flex; width: max-content; animation: slide 48s linear infinite; }}
.mt span {{ display: inline-flex; align-items: center; gap: .5em; padding-right: .5em; font: 800 clamp(44px, 7vw, 120px)/1 var(--display); font-stretch: 112%; letter-spacing: -.03em; text-transform: uppercase; color: transparent; -webkit-text-stroke: 1px rgba(242,241,236,.38); white-space: nowrap; }}
.mt span:nth-child(3n+1) {{ color: #f2f1ec; -webkit-text-stroke: 0; }}
.mt i {{ font-style: normal; font-size: .4em; color: #8b6bff; -webkit-text-stroke: 0; }}
@keyframes slide {{ to {{ transform: translateX(-50%); }} }}
.spec {{ padding: clamp(96px, 13vh, 176px) var(--gutter); display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.4fr); gap: 48px; background: #0a0b0d; }}
.spec h2 {{ margin: 0; font: 800 clamp(40px, 5.6vw, 92px)/.9 var(--display); font-stretch: 112%; letter-spacing: -.03em; }}
.spec dl {{ margin: 0; display: grid; }}
.spec dl div {{ display: grid; grid-template-columns: 180px minmax(0,1fr); gap: 16px; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.1); }}
.spec dt {{ font: 600 12px/1.6 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: #b6a6ff; }}
.spec dd {{ margin: 0; font: 400 18px/1.5 var(--display); color: #d9dade; }}
.close {{ padding: clamp(96px, 13vh, 176px) var(--gutter) 72px; display: grid; gap: 28px; }}
.close h2 {{ margin: 0; font: 800 clamp(48px, 8vw, 140px)/.88 var(--display); font-stretch: 112%; letter-spacing: -.035em; max-width: 14ch; }}
.foot {{ display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 28px var(--gutter); border-top: 1px solid rgba(255,255,255,.1); font: 500 12px/1.4 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: #8d9096; }}
@media (max-width: 760px) {{
  .film {{ height: 900svh; }}
  .intro, .end {{ right: var(--gutter); bottom: 96px; }}
  .chapter {{ top: 84px; right: var(--gutter); }}
  .chl {{ display: none; }}
  .part {{ left: var(--gutter); right: var(--gutter); bottom: 76px; max-width: none; }}
  .meter {{ bottom: 22px; grid-template-columns: minmax(0,1fr); }}
  .meter > span {{ display: none; }}
  .poster {{ object-fit: contain; object-position: 50% 34%; }}
  .spec {{ grid-template-columns: minmax(0,1fr); }}
  .spec dl div {{ grid-template-columns: minmax(0,1fr); gap: 4px; }}
}}
@media (prefers-reduced-motion: reduce) {{ .mt {{ animation: none; }} .ov, .poster, canvas {{ transition: none; }} }}
</style>
</head>
<body>
<header class="nav"><span class="wm">US·TRAILERS</span><a class="cta" href="#contact">Get a price</a></header>
<main>
<section class="film" id="film" aria-label="Watch a US Trailers toy hauler being built, part by part">
  <div class="stage">
    <img class="poster" id="poster" src="{hero}" alt="A gloss-black Texan-style V-nose toy hauler in a dark studio, polished wheels, RGB underglow reflected in the floor">
    <canvas id="cv" class="off" aria-hidden="true"></canvas>
    <div class="scrim" id="scrim"></div>
    <div class="ov intro show" id="intro">
      <p class="kicker">Bespoke Texan-style toy haulers · Cape Town</p>
      <h1>Built for<br><em>your toys.</em></h1>
      <p class="lede">V-nose haulers for ATVs, side-by-sides and bikes. Gloss paint, polished aluminium, RGB from the underglow to the garage. Scroll, and watch one built, part by part.</p>
      <div class="ctas"><a class="btn" href="#contact">Get a price</a><span class="cue">Scroll to build ↓</span></div>
    </div>
    <div class="ov chapter" id="chapter" aria-live="polite"><span class="chn" id="chn"></span><h2 class="cht" id="cht"></h2><p class="chl" id="chl"></p></div>
    <div class="ov part" id="part"><b id="pn"></b><span id="pj"></span></div>
    <div class="ov end" id="end">
      <p class="kicker">Handover</p>
      <h2 class="endT">Yours, built once.</h2>
      <div class="ctas"><a class="btn" href="#contact">Get a price for yours</a><a class="btn ghost" href="#spec">The spec →</a></div>
    </div>
    <div class="meter" aria-hidden="true"><span id="count">00 / {len(parts)} parts</span><div class="track" id="track"><i id="bar"></i></div><span id="mlabel">Chassis</span></div>
  </div>
</section>
<div class="marquee" aria-hidden="true"><div class="mt">{''.join(f'<span>{w}<i>✦</i></span>' for w in ["V-nose", "Gloss black", "Polished aluminium", "RGB underglow", "E-track", "400 kg ramp", "Built in Cape Town"] * 2)}</div></div>
<section class="spec" id="spec">
  <h2>The <span class="grad">spec.</span></h2>
  <dl>
    <div><dt>Body</dt><dd>5.4 m box with an 800 mm Texan V-nose, 2.08 m wide, 2.1 m inside height</dd></div>
    <div><dt>Chassis</dt><dd>Hot-dip galvanised rails and cross members every 400 mm, A-frame tongue, forged coupler and safety chains</dd></div>
    <div><dt>Running gear</dt><dd>Tandem axles on leaf springs, vented discs with red calipers</dd></div>
    <div><dt>Wheels</dt><dd>Mirror-polished six-spoke aluminium, all-terrain tyres, polished stainless radius fenders</dd></div>
    <div><dt>Inside</dt><dd>Marine ply under coin-grip rubber, white lining, two rows of E-track, chrome floor rings</dd></div>
    <div><dt>Finish</dt><dd>Gloss-black bonded panels, polished diamond-plate V-wrap, extruded aluminium trims</dd></div>
    <div><dt>Doors</dt><dd>Spring-assisted ramp rated for a 400 kg ATV, side door with flush lock and drip rail</dd></div>
    <div><dt>Lighting</dt><dd>Addressable RGB underglow, belt-line, roof and garage strips on one app-controlled system; LED clearance and tail lights</dd></div>
  </dl>
</section>
<section class="close" id="contact">
  <p class="kicker">Commission yours</p>
  <h2>Built once. <span class="grad">Built for you.</span></h2>
  <div class="ctas"><a class="btn" href="https://us-trailers.vercel.app/#enquire">Get a price</a><a class="btn ghost" href="https://us-trailers.vercel.app">Visit the full site →</a></div>
</section>
</main>
<footer class="foot"><span>US·TRAILERS · Cape Town</span><span>Rendered build film · concept</span></footer>
<script>
const D = {json.dumps(data, separators=(",", ":"))};
const N = D.frames.length;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const imgs = D.frames.map((s) => {{ const i = new Image(); i.decoding = "async"; i.src = s; return i; }});
let want = 1, drawn = -1;
function fit() {{ const dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); drawn = -1; draw(); }}
function draw() {{
  const img = imgs[want - 1];
  if (!img.complete || !img.naturalWidth) {{ img.onload = () => draw(); return; }}
  if (drawn === want) return;
  const cw = cv.width, ch = cv.height, portrait = ch > cw * 1.1;
  const s = portrait ? (cw / img.naturalWidth) * 1.32 : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s, y = portrait ? ch * 0.46 - h / 2 : (ch - h) / 2;
  ctx.fillStyle = "#050506"; ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - w) / 2, y, w, h);
  if (portrait) {{
    const fade = h * 0.22;
    for (const [y0, y1] of [[y, y + fade], [y + h, y + h - fade]]) {{
      const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "rgba(5,5,6,1)"); g.addColorStop(1, "rgba(5,5,6,0)");
      ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), cw, fade);
    }}
  }}
  drawn = want;
}}
const $ = (id) => document.getElementById(id);
const track = $("track");
D.chapters.forEach((c) => {{ const e = document.createElement("em"); e.style.left = ((c.from - 1) / (N - 1)) * 100 + "%"; track.appendChild(e); }});
let raf = 0;
function update() {{
  const el = $("film"), r = el.getBoundingClientRect(), total = el.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total)), f = 1 + Math.round(p * (N - 1));
  want = f; draw();
  const intro = f < 8, end = f >= D.finale[0] + 20;
  let ci = 0; D.chapters.forEach((c, i) => {{ if (f >= c.from) ci = i; }});
  const ch = D.chapters[ci];
  const part = [...D.parts].reverse().find((q) => f >= q.start && f <= q.end + 10);
  const built = D.parts.filter((q) => f >= q.end).length;
  $("poster").classList.toggle("off", !intro); cv.classList.toggle("off", intro);
  $("scrim").style.opacity = intro || end ? 1 : 0;
  $("intro").classList.toggle("show", intro); $("end").classList.toggle("show", end);
  $("chapter").classList.toggle("show", !intro && !end);
  if ($("cht").textContent !== ch.title) {{ $("chn").textContent = ch.n; $("cht").textContent = ch.title; $("chl").textContent = ch.line; }}
  $("part").classList.toggle("show", !!part && !intro && !end);
  if (part) {{ $("pn").textContent = part.name; $("pj").textContent = part.job; }}
  $("count").textContent = String(built).padStart(2, "0") + " / " + D.parts.length + " parts";
  $("mlabel").textContent = ch.title;
  $("bar").style.transform = "scaleX(" + (f - 1) / (N - 1) + ")";
}}
addEventListener("scroll", () => {{ cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }}, {{ passive: true }});
addEventListener("resize", fit);
fit(); update();
</script>
</body>
</html>
"""
with open(out, "w") as f:
    f.write(html)
print(f"{out}: {os.path.getsize(out) / 1e6:.1f} MB, {len(frames)} frames, {len(chapters)} chapters, {len(parts)} parts")
