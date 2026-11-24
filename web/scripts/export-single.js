// The whole US Trailers website as ONE html file that opens offline.
// Loads every page of the production build in a real browser, takes the rendered page content,
// inlines every stylesheet, font and image as data, gives each page its own section with an
// anchor menu, and swaps in plain scripts for the parts that need the server.
// Usage (prod server running): node scripts/export-single.js http://localhost:3001 ../download/US-Trailers-website.html
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const base = process.argv[2] || "http://localhost:3001";
const out = process.argv[3] || "../download/US-Trailers-website.html";
const PAGES = [
  ["/", "home", "Home"],
  ["/toy-haulers", "toy-haulers", "Toy haulers"],
  ["/gooseneck-fifth-wheel-trailers", "gooseneck", "Goosenecks"],
  ["/off-road-trailers", "off-road", "Off-road"],
  ["/modifications-and-upgrades", "upgrades", "Upgrades"],
  ["/builds", "builds", "Builds"],
  ["/how-it-works", "how-it-works", "How it works"],
  ["/workshop", "workshop", "The workshop"],
  ["/faq", "faq", "Towing laws & FAQ"],
  ["/contact", "contact", "Contact"],
  ["/privacy", "privacy", "Privacy"],
  ["/terms", "terms", "Terms"],
];
const slugOf = Object.fromEntries(PAGES.map(([p, s]) => [p, s]));
const MIME = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml", woff2: "font/woff2", ico: "image/x-icon" };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cache = new Map();
  const dataUri = async (url) => {
    const abs = new URL(url, base).href;
    if (cache.has(abs)) return cache.get(abs);
    const r = await page.request.get(abs);
    const buf = await r.body();
    let type = (r.headers()["content-type"] || "").split(";")[0];
    if (!type || type === "application/octet-stream") type = MIME[abs.split("?")[0].split(".").pop()] || "application/octet-stream";
    const d = `data:${type};base64,${buf.toString("base64")}`;
    cache.set(abs, d);
    return d;
  };

  const css = new Map();
  const sections = [];
  let footer = "";
  let filmClasses = null;
  let htmlClass = "";

  for (const [route, slug] of PAGES) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    // stylesheets, in document order, de-duplicated
    for (const href of await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href))) {
      if (!css.has(href)) css.set(href, (await page.request.get(href)).text().then((t) => ({ href, t })));
    }
    if (route === "/") {
      filmClasses = await page.evaluate(() => {
        const names = new Set();
        for (const sh of document.styleSheets) {
          try {
            for (const r of sh.cssRules) (r.selectorText || "").match(/\.[\w-]+/g)?.forEach((c) => names.add(c.slice(1)));
          } catch {}
        }
        const find = (suffix) => [...names].find((n) => n.endsWith("_" + suffix));
        return { show: find("show"), posterOff: find("posterOff"), canvasOff: find("canvasOff"), scrimOn: find("scrimOn") };
      });
      footer = await page.evaluate(() => document.querySelector("footer")?.outerHTML || "");
      // next/font switches the typefaces on with classes on <html>
      // only the font classes: "has-cursor" would hide the pointer, and there is no custom cursor offline
      htmlClass = await page.evaluate(() => [...document.documentElement.classList].filter((c) => c.endsWith("_variable")).join(" "));
    }
    const html = await page.evaluate(
      ({ slug, route }) => {
        const main = document.querySelector("main").cloneNode(true);
        main.querySelectorAll("script, noscript").forEach((e) => e.remove());
        // the preloader, the reveal state and the live canvases do not belong in a saved copy
        main.querySelectorAll("[class*='_pre ']").forEach((e) => e.remove());
        main.querySelectorAll(".rv").forEach((e) => e.classList.remove("rv", "rv-in"));
        if (route === "/contact") main.querySelector("#enquire")?.remove();
        // the 3D designer needs the server: in the saved copy it is a showcase card with a link, no dead controls
        const design = main.querySelector("#design");
        if (design) {
          design.innerHTML = `<div class="offline-design">
            <div class="offline-design-copy">
              <p class="offline-eyebrow">Design yours</p>
              <h2>Pick the length, the axles, the colour and the RGB.</h2>
              <p>The live designer builds your trailer in 3D as you choose: body length, single or tandem, seven paint colours, roof rack, solar, and day, dusk or night lighting. Then it sends the build with your enquiry.</p>
              <div class="offline-chips"><span>3.6 to 6.0 m</span><span>Single or tandem</span><span>Gloss black</span><span>Polished wheels</span><span>RGB lighting</span><span>Roof rack</span><span>Solar</span></div>
              <a class="offline-btn" href="https://us-trailers.vercel.app/#design" target="_blank" rel="noopener">Open the 3D designer</a>
            </div>
            <img data-offline-hero src="/film/hero.webp" alt="A gloss-black Texan-style V-nose toy hauler in a dark studio, polished wheels, RGB underglow">
          </div>`;
        }
        // the tow checker needs the app to recalculate: leave it out of the saved copy
        main.querySelectorAll("#tow-check").forEach((e) => e.remove());
        // ids: every page but home gets its own prefix so nothing collides in one document
        if (slug !== "home") {
          const ids = new Set([...main.querySelectorAll("[id]")].map((e) => e.id));
          main.querySelectorAll("[id]").forEach((e) => (e.id = slug + "-" + e.id));
          main.querySelectorAll("[for],[aria-labelledby],[aria-describedby],[aria-controls]").forEach((e) => {
            for (const a of ["for", "aria-labelledby", "aria-describedby", "aria-controls"]) {
              const v = e.getAttribute(a);
              if (v) e.setAttribute(a, v.split(" ").map((x) => (ids.has(x) ? slug + "-" + x : x)).join(" "));
            }
          });
          main.querySelectorAll('a[href^="#"]').forEach((a) => {
            const t = a.getAttribute("href").slice(1);
            if (ids.has(t)) a.setAttribute("href", "#" + slug + "-" + t);
          });
        }
        return main.innerHTML;
      },
      { slug, route },
    );
    sections.push({ slug, html });
  }

  // ---- links: site pages become anchors, everything server-side points at the live site
  const live = "https://us-trailers.vercel.app";
  const fixLinks = (h) =>
    h.replace(/href="([^"]*)"/g, (m, href) => {
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return m;
      const [p, hash] = href.split("#");
      const pathOnly = p.split("?")[0] || "/";
      if (pathOnly.startsWith("/b/")) return `href="${live}${href}"`;
      if (slugOf[pathOnly] !== undefined) {
        if (hash) return `href="#${pathOnly === "/" ? hash : slugOf[pathOnly] + "-" + hash}"`;
        return `href="#page-${slugOf[pathOnly]}"`;
      }
      return `href="${live}${href}"`;
    });

  // ---- images: every src and srcset becomes data
  const inlineImages = async (h) => {
    const urls = new Set();
    h.replace(/(?:src|srcSet|srcset)="([^"]+)"/g, (m, v) => {
      v.split(",").forEach((part) => {
        const u = part.trim().split(" ")[0];
        if (u && !u.startsWith("data:") && !u.startsWith("http")) urls.add(u.replace(/&amp;/g, "&"));
      });
    });
    for (const u of urls) await dataUri(u);
    // srcset collapses to its largest candidate, inlined as src
    h = h.replace(/\s(?:srcSet|srcset)="([^"]+)"/g, (m, v) => {
      // the candidate nearest 1920 px wide: sharp on laptops without bloating the file
      const cands = v.split(",").map((p) => p.trim().split(" ")).map(([u, w]) => [u, parseInt(w) || 0]);
      const fit = cands.filter(([, w]) => w && w <= 2048).sort((a, b) => b[1] - a[1])[0] || cands[cands.length - 1];
      const best = fit[0].replace(/&amp;/g, "&");
      return best.startsWith("data:") ? "" : ` data-best="${best}"`;
    });
    h = h.replace(/\ssizes="[^"]*"/g, "");
    return h.replace(/(src|data-best)="([^"]+)"/g, (m, attr, v) => {
      const u = v.replace(/&amp;/g, "&");
      if (u.startsWith("data:") || u.startsWith("http")) return m;
      const d = cache.get(new URL(u, base).href);
      return d ? `${attr === "data-best" ? "data-src-best" : "src"}="${d}"` : m;
    });
  };

  const sectionsHtml = [];
  for (const s of sections) {
    let h = fixLinks(s.html);
    h = await inlineImages(h);
    // prefer the largest srcset candidate over next/image's small default
    h = h.replace(/src="data:[^"]*"([^>]*?)data-src-best="(data:[^"]*)"/g, 'src="$2"$1');
    h = h.replace(/\sdata-src-best="[^"]*"/g, "");
    sectionsHtml.push(`<div class="offline-page" id="page-${s.slug}">${h}</div>`);
  }
  let foot = await inlineImages(fixLinks(footer));

  // ---- styles, with fonts and any url() inlined
  let styles = "";
  for (const { href, t } of await Promise.all([...css.values()])) {
    let text = t;
    const urls = [...new Set([...text.matchAll(/url\(([^)"']+)\)/g)].map((m) => m[1]))];
    for (const u of urls) {
      const abs = new URL(u, href).href;
      text = text.split(`url(${u})`).join(`url(${await dataUri(abs)})`);
    }
    styles += text + "\n";
  }

  // ---- the film: all frames inline, driven by a plain script using the site's own classes
  const N = 220;
  const frames = [];
  const framesM = [];
  for (let i = 1; i <= N; i++) {
    frames.push(await dataUri(`/film/d/f${String(i).padStart(4, "0")}.webp`));
  }
  const hero = await dataUri("/film/hero.webp");
  const heroM = await dataUri("/film/hero-m.webp");
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "../render/manifest.json"), "utf8"));
  const filmTs = fs.readFileSync(path.join(__dirname, "../src/content/film.ts"), "utf8");
  const chapters = [...filmTs.matchAll(/\{ n: "(\d+)", title: "([^"]+)", line: "([^"]+)", from: (\d+) \}/g)].map((m) => ({ n: m[1], title: m[2], line: m[3], from: +m[4] }));
  const jobs = Object.fromEntries([...filmTs.matchAll(/^\s+"?([A-Za-z&,\- ]+?)"?: "([^"]+)",$/gm)].map((m) => [m[1], m[2]]));
  const parts = manifest.parts.filter((p) => jobs[p.name]).map((p) => ({ name: p.name.replace(", kerb side", ""), job: jobs[p.name], start: p.start, end: p.end }));

  const stagesTs = fs.readFileSync(path.join(__dirname, "../src/content/process.ts"), "utf8");
  const stages = [...stagesTs.matchAll(/\{ week: (\d+), title: "([^"]+)", what: "([^"]+)", you: "([^"]+)" \}/g)].map((m) => ({ week: +m[1], title: m[2], what: m[3], you: m[4] }));
  const nav = `<header class="offline-nav"><a class="offline-wm" href="#page-home">US·TRAILERS</a>
<details class="offline-menu"><summary>Menu</summary><nav>${PAGES.map(([, s, label]) => `<a href="#page-${s}">${label}</a>`).join("")}</nav></details>
<a class="offline-cta" href="#enquire">Get a price</a></header>`;

  const offlineCss = `
html { scroll-behavior: smooth; }
.offline-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 60; display: flex; align-items: center; gap: 16px; padding: 14px var(--gutter); background: rgba(10,11,13,.72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.offline-wm { font: 800 20px/1 var(--display); font-stretch: 112%; letter-spacing: .06em; color: var(--graphite); text-decoration: none; margin-right: auto; }
.offline-cta { font: 600 12px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; text-decoration: none; padding: 12px 16px; background: var(--graphite); color: var(--paper); }
.offline-menu { position: relative; }
.offline-menu summary { list-style: none; cursor: pointer; font: 600 12px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; padding: 12px 16px; border: 1px solid var(--line-strong); color: var(--graphite); }
.offline-menu summary::-webkit-details-marker { display: none; }
.offline-menu nav { position: absolute; right: 0; top: calc(100% + 8px); display: grid; min-width: 240px; padding: 8px; background: var(--surface); border: 1px solid var(--line); }
.offline-menu nav a { padding: 12px 14px; color: var(--graphite); text-decoration: none; font: 600 15px/1.2 var(--display); }
.offline-menu nav a:hover { background: rgba(182,166,255,.12); }
.offline-page { scroll-margin-top: 64px; }
.offline-design { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 40px; align-items: center; }
.offline-design-copy { display: grid; gap: 18px; min-width: 0; }
.offline-design h2 { margin: 0; font: 800 clamp(36px, 4.6vw, 72px)/.95 var(--display); font-stretch: 112%; letter-spacing: -.02em; color: var(--graphite); }
.offline-design p { margin: 0; max-width: 52ch; font: 400 18px/1.55 var(--display); color: var(--muted); }
.offline-eyebrow { font: 600 12px/1 var(--mono) !important; letter-spacing: .16em; text-transform: uppercase; color: var(--ink) !important; }
.offline-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.offline-chips span { padding: 9px 12px; border: 1px solid var(--line-strong); font: 500 12px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--graphite); }
.offline-btn { justify-self: start; min-height: 52px; display: inline-grid; place-items: center; padding: 0 24px; background: var(--ink); color: var(--paper); font: 600 13px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; text-decoration: none; }
.offline-design img { width: 100%; height: auto; display: block; }
@media (max-width: 860px) { .offline-design { grid-template-columns: minmax(0, 1fr); } }
/* no scripts (file previews, some in-app viewers): the film is just its hero screen */
html:not(.js) #film { height: auto !important; }
html:not(.js) #film > div { position: relative !important; }
html:not(.js) #film canvas, html:not(.js) #film [class*='_meter'] { display: none !important; }
.offline-page + .offline-page { border-top: 1px solid var(--line); }
.offline-page main, .offline-page > * { scroll-margin-top: 64px; }
[id] { scroll-margin-top: 72px; }
`;

  const filmScript = `
(() => {
  const C = ${JSON.stringify(filmClasses)};
  const FD = ${JSON.stringify(frames)};
  // always the full-quality frames: only the frames near the playhead are kept in memory anyway
  const F = FD;
  const CH = ${JSON.stringify(chapters)};
  const P = ${JSON.stringify(parts)};
  const FIN = ${JSON.stringify(manifest.finale)};
  const film = document.getElementById("film");
  if (!film) return;
  const N = F.length;
  const q = (s) => film.querySelector(s);
  const cv = q("canvas"), poster = q("picture img"), scrim = q("[class*='_scrim']");
  const intro = q("[class*='_intro']"), chapter = q("[class*='_chapter']"), part = q("[class*='_part']"), end = q("[class*='_end']");
  const meter = q("[class*='_meter']"), bar = q("[class*='_track'] i");
  const ctx = cv.getContext("2d");
  // only frames near the playhead are kept as images, so phones never hold the whole film in memory
  const imgs = new Array(N).fill(null);
  const get = (k) => { if (!imgs[k]) { const i = new Image(); i.decoding = "async"; i.src = F[k]; imgs[k] = i; } return imgs[k]; };
  function window_(k) {
    for (let j = Math.max(0, k - 12); j <= Math.min(N - 1, k + 12); j++) get(j);
    for (let j = 0; j < N; j++) if (imgs[j] && Math.abs(j - k) > 40) imgs[j] = null;
  }
  let want = 1, drawn = -1;
  function draw() {
    window_(want - 1);
    const img = get(want - 1);
    if (!img.complete || !img.naturalWidth) { img.onload = draw; return; }
    if (drawn === want) return;
    const cw = cv.width, ch = cv.height, portrait = ch > cw * 1.1;
    const s = portrait ? (cw / img.naturalWidth) * 1.32 : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s, y = portrait ? ch * 0.46 - h / 2 : (ch - h) / 2;
    ctx.fillStyle = "#050506"; ctx.fillRect(0, 0, cw, ch); ctx.drawImage(img, (cw - w) / 2, y, w, h);
    if (portrait) { const fade = h * 0.22; for (const [y0, y1] of [[y, y + fade], [y + h, y + h - fade]]) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "rgba(5,5,6,1)"); g.addColorStop(1, "rgba(5,5,6,0)"); ctx.fillStyle = g; ctx.fillRect(0, Math.min(y0, y1), cw, fade); } }
    drawn = want;
  }
  function fit() { const dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); drawn = -1; draw(); }
  const tog = (el, cls, on) => el && cls && el.classList.toggle(cls, on);
  function update() {
    const r = film.getBoundingClientRect(), total = film.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total)), f = 1 + Math.round(p * (N - 1));
    want = f; draw();
    const isIntro = f < 8, isEnd = f >= FIN[0] + 20;
    let ci = 0; CH.forEach((c, i) => { if (f >= c.from) ci = i; });
    const c = CH[ci];
    const pt = [...P].reverse().find((x) => f >= x.start && f <= x.end + 10);
    tog(poster, C.posterOff, !isIntro); tog(cv, C.canvasOff, isIntro); tog(scrim, C.scrimOn, isIntro || isEnd);
    tog(intro, C.show, isIntro); tog(end, C.show, isEnd); tog(chapter, C.show, !isIntro && !isEnd);
    intro && (intro.inert = !isIntro); end && (end.inert = !isEnd);
    if (chapter) { const [n, t, l] = chapter.children; if (t && t.textContent !== c.title) { n.textContent = c.n; t.textContent = c.title; l && (l.textContent = c.line); } }
    tog(part, C.show, !!pt && !isIntro && !isEnd);
    if (part && pt) part.innerHTML = "<b>" + pt.name + "</b><span>" + pt.job + "</span>";
    if (meter) { const sp = meter.querySelectorAll(":scope > span"); const built = P.filter((x) => f >= x.end).length; sp[0] && (sp[0].textContent = String(built).padStart(2, "0") + " / " + P.length + " parts"); sp[1] && (sp[1].textContent = c.title); }
    if (bar) bar.style.transform = "scaleX(" + (f - 1) / (N - 1) + ")";
  }
  let raf = 0;
  addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", fit);
  fit(); update();
})();

// the build timeline: drag the slider or tap a step
(() => {
  const S = ${JSON.stringify(stages)};
  const LAST = S[S.length - 1].week;
  const sec = document.getElementById("process");
  if (!sec) return;
  const range = sec.querySelector('input[type="range"]');
  const now = sec.querySelector("[aria-live]");
  const wk = now && now.querySelector("span"), h3 = now && now.querySelector("h3"), dds = now ? now.querySelectorAll("dd") : [];
  const label = sec.querySelector("p[aria-hidden] span"), labelB = sec.querySelector("p[aria-hidden] b");
  const ticks = [...sec.querySelectorAll("ol li")];
  function set(week) {
    let idx = 0; S.forEach((st, i) => { if (week >= st.week) idx = i; });
    const st = S[idx];
    if (range) { range.value = week; range.setAttribute("aria-valuetext", "Week " + week + ": " + st.title); }
    if (wk) wk.textContent = "Week " + week;
    if (h3) h3.textContent = st.title;
    if (dds[0]) dds[0].textContent = st.what;
    if (dds[1]) dds[1].textContent = st.you;
    if (label) label.textContent = "Week " + week + " of " + LAST;
    if (labelB) labelB.textContent = st.title;
    ticks.forEach((li, i) => li.toggleAttribute("data-on", i <= idx));
  }
  range && range.addEventListener("input", () => set(+range.value));
  ticks.forEach((li, i) => li.querySelector("button")?.addEventListener("click", () => set(S[i].week)));
})();
// the enquiry form: offline, it becomes a WhatsApp or email message with everything filled in
document.querySelectorAll("#enquire form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const lines = [];
    for (const [k, v] of fd.entries()) if (v && !["t", "company", "consent"].includes(k)) lines.push(k + ": " + v);
    const text = "Hi US Trailers, here's my trailer brief:\\n\\n" + lines.join("\\n");
    location.href = "mailto:hello@ustrailers.co.za?subject=" + encodeURIComponent("Trailer brief") + "&body=" + encodeURIComponent(text);
  });
});
`;

  let homeHtml = sectionsHtml[0];
  // the picture's phone source: inline it too
  // the full-resolution hero on every screen
  homeHtml = homeHtml.replace(/<source media="\(max-width: 760px\)"[^>]*>/, "");
  sectionsHtml[0] = homeHtml;

  const doc = `<!doctype html>
<html lang="en-ZA" class="${htmlClass}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0A0B0D">
<script>document.documentElement.classList.add("js")</script>
<title>US Trailers · Bespoke Texan-style toy haulers, Cape Town</title>
<meta name="description" content="Bespoke Texan-style toy haulers for ATVs, side-by-sides and bikes, built in Cape Town. Saved copy of the US Trailers website.">
<style>${styles}${offlineCss}</style>
</head>
<body>
${nav}
${sectionsHtml.join("\n")}
${foot}
<script>${filmScript}</script>
</body>
</html>`;
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, doc);
  console.log(`${out}: ${(doc.length / 1e6).toFixed(1)} MB, ${sections.length} pages, ${cache.size} inlined files`);
  await browser.close();
})();
