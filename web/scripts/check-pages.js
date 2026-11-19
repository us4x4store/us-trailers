// Every page at laptop + phone size: console errors, horizontal overflow, elements wider than the
// viewport, broken internal links, and the timeline / FAQ interactions. No screenshots.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
const PAGES = ["/", "/toy-haulers", "/gooseneck-fifth-wheel-trailers", "/off-road-trailers", "/modifications-and-upgrades", "/faq", "/privacy", "/nope"];
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const links = new Set();
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const path of PAGES) {
      const page = await browser.newPage({ viewport: vp, isMobile: vp.width < 600, hasTouch: vp.width < 600 });
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 140)));
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(path === "/" ? 2500 : 800);
      const r = await page.evaluate(() => {
        const W = innerWidth;
        const wide = [];
        document.querySelectorAll("body *").forEach((el) => {
          const b = el.getBoundingClientRect();
          if (b.width && (b.right > W + 1 || b.left < -1) && getComputedStyle(el).position !== "fixed") {
            let clipped = false;
            for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === "hidden" || o === "clip" || o === "auto") { const pb = p.getBoundingClientRect(); if (pb.right <= W + 1 && pb.left >= -1) { clipped = true; break; } } }
            if (!clipped) wide.push(`${el.tagName.toLowerCase()}.${String(el.className.baseVal ?? el.className).split(" ")[0].slice(0, 30)} [${Math.round(b.left)},${Math.round(b.right)}]`);
          }
        });
        const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
        const ids = new Set([...document.querySelectorAll("[id]")].map((e) => e.id));
        const badHash = hrefs.filter((h) => h.startsWith("#") && h.length > 1 && !ids.has(h.slice(1)));
        return { overflowX: document.documentElement.scrollWidth > W, wide: [...new Set(wide)].slice(0, 4), hrefs, badHash, h1: document.querySelector("h1")?.textContent?.slice(0, 40), title: document.title.slice(0, 50) };
      });
      r.hrefs.filter((h) => h.startsWith("/")).forEach((h) => links.add(h));
      let extra = "";
      if (path === "/") {
        // timeline: jump to week 10 and read the stage
        await page.evaluate(() => document.getElementById("process").scrollIntoView());
        const s = page.locator("#process input[type=range]");
        await s.focus(); for (let k = 0; k < 8; k++) await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(300);
        extra += " timeline@10=" + (await page.locator("#process h3").textContent());
      }
      if (path === "/faq") {
        const before = await page.locator("details[open]").count();
        await page.locator("details summary").nth(2).click();
        extra += ` faqOpen ${before}->${await page.locator("details[open]").count()}`;
      }
      console.log(`${vp.width} ${path.padEnd(32)} overflow=${r.overflowX} wide=${JSON.stringify(r.wide)} badHash=${JSON.stringify(r.badHash)} errors=${JSON.stringify([...new Set(errors)].slice(0, 3))}${extra}`);
      await page.close();
    }
  }
  // internal links resolve
  const ctx = await browser.newContext();
  const bad = [];
  for (const h of links) {
    const [p, hash] = h.split("#");
    const res = await ctx.request.get(base + (p || "/"));
    if (res.status() !== 200) bad.push(`${h} -> ${res.status()}`);
    if (hash) {
      const html = await res.text();
      if (!html.includes(`id="${hash}"`)) bad.push(`${h} -> missing #${hash}`);
    }
  }
  console.log("internal links checked:", links.size, "broken:", JSON.stringify(bad));
  await browser.close();
})();
