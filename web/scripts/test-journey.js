// One journey: pick a bakkie in the rig -> tow checker fills -> rig card -> attached to the brief.
// Plus share card, share page and the phone dock. No screenshots.
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const out = {};
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.locator("#drive").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => /your rig/i.test(document.querySelector("#drive")?.innerText || ""), null, { timeout: 30000 });
  await page.selectOption("#drive-vehicle", "fortuner");
  await page.waitForFunction(() => !/weighing/i.test(document.querySelector("[class*=rigCard]")?.innerText || "weighing"), null, { timeout: 60000 });
  out.rigCard = await page.evaluate(() => document.querySelector("[class*=rigCard]").innerText.replace(/\n/g, " | "));
  out.towFilled = await page.evaluate(() => ({ preset: document.querySelector("#tow-check-preset")?.value, tare: document.querySelector("#tow-check-tare")?.value, rating: document.querySelector("#tow-check-towRating")?.value }));
  await page.click("text=Send this rig with my brief");
  await page.waitForTimeout(1200);
  out.enquireRig = await page.evaluate(() => document.querySelector("#enquire input[name=rig]")?.value || "NONE");
  out.errors = errors;
  // share card + page
  const og = await page.request.get(base + "/api/og/G60-A2-C0-R0-S1");
  out.og = [og.status(), og.headers()["content-type"], (await og.body()).length];
  const bad = await page.request.get(base + "/api/og/nonsense");
  out.ogBad = [bad.status(), bad.headers()["content-type"]];
  const html = await (await page.request.get(base + "/b/G60-A2-C0-R0-S1")).text();
  out.shareMeta = (html.match(/<meta property="og:(title|image)"[^>]*>/g) || []).map((m) => m.slice(0, 140));
  await page.goto(base + "/b/G60-A2-C0-R0-S1");
  await page.waitForURL(/build=G60/, { timeout: 10000 });
  out.redirect = page.url();
  // phone dock
  const ph = await (await browser.newContext(devices["iPhone 13"])).newPage();
  await ph.goto(base + "/", { waitUntil: "load" });
  await ph.waitForTimeout(1800);
  const dock = () => ph.evaluate(() => { const d = [...document.querySelectorAll("div")].find((x) => getComputedStyle(x).position === "fixed" && [...x.children].some((a) => a.textContent === "WhatsApp us")); if (!d) return "none"; const b = d.getBoundingClientRect(); return { visible: +getComputedStyle(d).opacity > 0.5 && b.top < innerHeight, inert: d.inert, h: Math.round(b.height), btns: [...d.querySelectorAll("a")].map((a) => a.textContent + ":" + Math.round(a.getBoundingClientRect().width) + "x" + Math.round(a.getBoundingClientRect().height)) }; });
  out.dockOnFilm = await dock();
  for (const id of ["drive", "enquire"]) {
    await ph.evaluate((id) => { const el = document.getElementById(id); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 200); }, id);
    await ph.waitForTimeout(2500);
    out["dockAt_" + id] = await dock();
  }
  await ph.goto(base + "/faq", { waitUntil: "load" });
  await ph.waitForTimeout(1800);
  out.dockFaq = await dock();
  out.faqWidth = await ph.evaluate(() => document.documentElement.scrollWidth);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
