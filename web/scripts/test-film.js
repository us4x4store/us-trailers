// Scroll the rendered build film in a live browser: frames draw, captions follow, nothing errors. No screenshots.
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
(async () => {
  const browser = await chromium.launch();
  for (const [name, opts] of [["laptop", { viewport: { width: 1440, height: 900 } }], ["iPhone", devices["iPhone 13"]]]) {
    const page = await (await browser.newContext(opts)).newPage();
    const errors = [];
    const bad = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("response", (r) => r.status() >= 400 && !/insights/.test(r.url()) && bad.push(r.status() + " " + r.url().slice(-40)));
    await page.goto(base + "/", { waitUntil: "load" });
    await page.waitForTimeout(3500);
    const total = await page.evaluate(() => document.getElementById("film").offsetHeight - innerHeight);
    const out = [];
    for (const p of [0, 0.1, 0.3, 0.5, 0.7, 0.85, 1]) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * p));
      await page.waitForTimeout(1600);
      out.push(
        await page.evaluate(() => {
          const c = document.querySelector("#film canvas");
          const ctx = c.getContext("2d");
          const d = ctx.getImageData(0, 0, c.width, c.height).data;
          let lum = 0, n = 0;
          for (let i = 0; i < d.length; i += 4 * 97) { lum += d[i] + d[i + 1] + d[i + 2]; n++; }
          const vis = (sel) => { const el = document.querySelector(sel); return el && +getComputedStyle(el).opacity > 0.5 ? el.innerText.replace(/\n+/g, " | ").slice(0, 70) : "-"; };
          return { canvas: `${c.width}x${c.height}`, avgLum: Math.round(lum / n / 3), canvasOpacity: getComputedStyle(c).opacity, intro: vis("#film [class*=_intro]"), chapter: vis("#film [class*=_chapter]"), part: vis("#film [class*=_part]"), end: vis("#film [class*=_end]"), meter: document.querySelector("#film [class*=_meter]").innerText.replace(/\n/g, " ") };
        }),
      );
    }
    console.log(name, JSON.stringify({ errors, bad: bad.slice(0, 5), frames: out }, null, 1));
  }
  await browser.close();
})();
