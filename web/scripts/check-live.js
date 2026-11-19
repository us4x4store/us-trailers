// Live site smoke check (no screenshots): console errors, canvases, layout overflow, at laptop and phone size.
const { chromium, devices } = require("playwright");
const url = process.argv[2] || "https://us-trailers.vercel.app/";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, ctxOpts] of [["laptop 1440", { viewport: { width: 1440, height: 900 } }], ["iPhone 13", devices["iPhone 13"]]]) {
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
    const t0 = Date.now();
    await page.goto(url, { waitUntil: "load" });
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(4000);
    const film = await page.evaluate(() => ({ canvases: document.querySelectorAll("canvas").length, overflowX: document.documentElement.scrollWidth > innerWidth, h1: document.querySelector("h1")?.textContent }));
    await page.evaluate(() => document.getElementById("drive").scrollIntoView());
    await page.waitForTimeout(9000);
    const drive = await page.evaluate(() => ({ canvases: document.querySelectorAll("canvas").length, speed: [...document.querySelectorAll("#drive b")].slice(0, 1).map((b) => b.textContent)[0], nose: [...document.querySelectorAll("#drive b")].find((b) => /kg/.test(b.textContent))?.textContent, overflowX: document.documentElement.scrollWidth > innerWidth }));
    console.log(JSON.stringify({ device: name, loadMs, film, drive, errors: [...new Set(errors)].slice(0, 5) }));
    await ctx.close();
  }
  await browser.close();
})();
