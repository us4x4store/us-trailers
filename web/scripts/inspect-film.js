// Live-browser inspection of the assembly film. No screenshots: reads WebGL pixels and DOM boxes.
// Usage: node scripts/inspect-film.js [url] [width] [height]
const { chromium } = require("playwright");

const url = process.argv[2] || "http://localhost:3000/";
const W = +(process.argv[3] || 1440);
const H = +(process.argv[4] || 900);
const POINTS = [0.02, 0.08, 0.17, 0.29, 0.39, 0.5, 0.62, 0.73, 0.83, 0.96];

(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 600, hasTouch: W < 600 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  const KIND = process.argv[5];
  if (KIND) await page.locator("section").first().getByRole("button", { name: new RegExp("^" + KIND) }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("pointerdown")));
  await page.waitForFunction(() => window.__film, null, { timeout: 30000 });
  const total = await page.evaluate(() => document.querySelector("section").offsetHeight - innerHeight);
  const out = [];
  for (const p of POINTS) {
    await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), Math.round(total * p));
    await page.waitForTimeout(500);
    await page.evaluate(() => { const f = window.__film.film; f.ps = f.p; });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const { gl, scene, camera, film } = window.__film;
      gl.render(scene, camera);
      const ctx = gl.getContext();
      const w = ctx.drawingBufferWidth, h = ctx.drawingBufferHeight;
      const px = new Uint8Array(w * h * 4);
      ctx.readPixels(0, 0, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, px);
      const bg = scene.background;
      // sample background colour from a corner pixel instead of trusting tone mapping
      const br = px[(h - 1) * w * 4], bgG = px[(h - 1) * w * 4 + 1], bb = px[(h - 1) * w * 4 + 2];
      let n = 0, minX = w, minY = h, maxX = 0, maxY = 0, lum = 0;
      for (let y = 0; y < h; y += 2)
        for (let x = 0; x < w; x += 2) {
          const i = (y * w + x) * 4;
          const d = Math.abs(px[i] - br) + Math.abs(px[i + 1] - bgG) + Math.abs(px[i + 2] - bb);
          lum += px[i] + px[i + 1] + px[i + 2];
          if (d > 40) {
            n++;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            const yy = h - 1 - y; if (yy < minY) minY = yy; if (yy > maxY) maxY = yy;
          }
        }
      const T = window.__THREE_BOX;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      scene.traverse((o) => {
        if (!o.isMesh || !o.visible || typeof o.userData.partIndex !== "number") return;
        let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) vis = false;
        if (!vis) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        const bbx = o.geometry.boundingBox;
        for (let c = 0; c < 8; c++) {
          const v = { x: c & 1 ? bbx.max.x : bbx.min.x, y: c & 2 ? bbx.max.y : bbx.min.y, z: c & 4 ? bbx.max.z : bbx.min.z };
          const vec = new camera.position.constructor(v.x, v.y, v.z).applyMatrix4(o.matrixWorld).project(camera);
          if (vec.z > 1) continue;
          const sx = (vec.x * 0.5 + 0.5) * innerWidth, sy = (-vec.y * 0.5 + 0.5) * innerHeight;
          x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
        }
      });
      const obj = { x0: Math.round(Math.max(0, x0)), y0: Math.round(Math.max(0, y0)), x1: Math.round(Math.min(innerWidth, x1)), y1: Math.round(Math.min(innerHeight, y1)) };
      const boxes = {};
      document.querySelector("section").querySelectorAll("[class]").forEach((el) => {
        const names = ["intro", "chapter", "bom", "tb", "controls", "end", "card"];
        const tokens = String(el.className).split(/\s+/);
        const cls = names.find((nm) => tokens.some((t) => t === nm || t.endsWith("__" + nm) || t.endsWith("_" + nm)));
        if (!cls) return;
        const cs = getComputedStyle(el);
        if (cs.display === "none" || +cs.opacity < 0.5) return;
        const b = el.getBoundingClientRect();
        if (b.width === 0) return;
        boxes[cls] = [b.left, b.top, b.right, b.bottom].map(Math.round);
      });
      const overlapObj = Object.entries(boxes)
        .filter(([k]) => k !== "card")
        .map(([k, b]) => {
          const ix = Math.min(b[2], obj.x1) - Math.max(b[0], obj.x0), iy = Math.min(b[3], obj.y1) - Math.max(b[1], obj.y0);
          return ix > 0 && iy > 0 ? `${k}:${Math.round((ix * iy) / ((b[2] - b[0]) * (b[3] - b[1])) * 100)}%` : null;
        })
        .filter(Boolean);
      const chapter = document.querySelector("[aria-live] h2")?.textContent;
      const card = document.querySelector("section [class*='cardName']")?.textContent || "";
      return {
        p: +film.ps.toFixed(3),
        chapter,
        card,
        coverage: +((n / ((w * h) / 4)) * 100).toFixed(1),
        object: obj,
        overlapsObject: overlapObj.join(" ") || "none",
        cardOverlap: (() => { const c = boxes.card; if (!c) return "-"; return ["chapter", "bom", "intro"].filter((k) => { const b = boxes[k]; return b && Math.min(b[2], c[2]) - Math.max(b[0], c[0]) > 2 && Math.min(b[3], c[3]) - Math.max(b[1], c[1]) > 2; }).join(",") || "none"; })(),
        cardOff: (() => { const c = boxes.card; return c ? (c[0] < 0 || c[1] < 0 || c[2] > innerWidth || c[3] > innerHeight ? "OFFSCREEN " + c.join(",") : "ok") : "-"; })(),
        boxes,
        avgLum: Math.round(lum / ((w * h) / 4) / 3),
      };
    });
    out.push(r);
  }
  console.log(JSON.stringify({ viewport: `${W}x${H}`, errors: [...new Set(errors)].slice(0, 8), frames: out }, null, 1));
  await browser.close();
})();
