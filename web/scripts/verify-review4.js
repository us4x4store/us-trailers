// Checks the fixes from review 4 in a live browser. No screenshots.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
const PAGES = ["/", "/toy-haulers", "/gooseneck-fifth-wheel-trailers", "/off-road-trailers", "/modifications-and-upgrades", "/faq", "/privacy"];
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const out = {};
  // 1. overflow at 375
  const se = await browser.newPage({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  out.overflow375 = {};
  for (const p of PAGES) {
    await se.goto(base + p, { waitUntil: "load" });
    await se.waitForTimeout(400);
    out.overflow375[p] = await se.evaluate(() => document.documentElement.scrollWidth);
  }
  // 2. menu focus trap
  await se.goto(base + "/", { waitUntil: "load" });
  await se.click("[aria-controls=menu]");
  await se.waitForTimeout(200);
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    await se.keyboard.press("Tab");
    seen.add(await se.evaluate(() => (document.activeElement.closest("#menu") ? "menu" : document.activeElement.getAttribute("aria-controls") === "menu" ? "toggle" : "OUTSIDE:" + document.activeElement.textContent.slice(0, 20))));
  }
  out.menuTabStops = [...seen];
  await se.keyboard.press("Escape");
  // 3. tow check blank
  await se.goto(base + "/#towcheck", { waitUntil: "load" });
  out.towEmpty = await se.evaluate(async () => {
    const i = document.querySelector("#towcheck input[inputmode], #towcheck input[type=number]") || document.querySelector("section input[type=number]");
    if (!i) return "no input found";
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(i, "-5"); i.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    return i.closest("section").innerText.match(/Waiting for numbers[^\n]*\n?[^\n]*/)?.[0] || "NO PROMPT";
  });
  // 4. desktop: hero inert, film counter, configurator gooseneck, form
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  d.on("pageerror", (e) => (out.err = (out.err || []).concat(String(e))));
  await d.goto(base + "/", { waitUntil: "networkidle" });
  await d.evaluate(() => window.scrollTo(0, 2500));
  await d.waitForTimeout(800);
  out.heroInertMidFilm = await d.evaluate(() => [...document.querySelectorAll("section a, section button")].filter((b) => b.closest("[inert]")).length);
  const filmH = await d.evaluate(() => document.querySelector("section").offsetHeight - innerHeight);
  for (const f of [0.5, 0.9, 0.99]) {
    await d.evaluate((y) => window.scrollTo(0, y), Math.round(filmH * f));
    await d.waitForTimeout(900);
    out["tb@" + f] = await d.evaluate(() => document.querySelector("[class*=_tb]")?.innerText.replace(/\n/g, " "));
  }
  await d.goto(base + "/?build=G60-A2-C0-R0-S1#design", { waitUntil: "networkidle" });
  await d.waitForTimeout(1500);
  out.designGooseneck = await d.evaluate(() => (document.querySelector("#design").innerText.match(/GVM[^\n]*\n?[^\n]*/) || [""])[0] + " | " + (document.querySelector("#design").innerText.match(/Overrun[^\n]*/) || [""])[0]);
  out.viewBox = await d.evaluate(() => { const v = document.querySelector("#design canvas")?.parentElement; while (v && !String(v.className).includes("view")) { /* climb */ return null; } });
  out.designCanvas = await d.evaluate(() => { const c = document.querySelector("#design canvas"); if (!c) return "none"; const b = c.getBoundingClientRect(); return [Math.round(b.height), innerHeight, getComputedStyle(c.closest("[class*=_view]") || c).position]; });
  await d.goto(base + "/#enquire", { waitUntil: "load" });
  out.attachDefault = await d.evaluate(() => [...document.querySelectorAll("#enquire input[type=checkbox]")].map((c) => (c.closest("label")?.innerText || "").slice(0, 24) + "=" + c.checked));
  await d.fill("#name", "Thandi Mokoena");
  await d.fill("#phone", "082 555 0101");
  await d.check("#consent");
  await d.waitForTimeout(3300);
  await d.click("text=Send my brief");
  await d.waitForSelector("#enquire-offline", { timeout: 15000 });
  await d.waitForTimeout(300);
  out.offlineFocus = await d.evaluate(() => document.activeElement.id + " | submit=" + document.querySelector("#enquire button[type=submit]").textContent);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
