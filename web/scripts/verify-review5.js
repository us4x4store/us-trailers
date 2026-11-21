// Review-5 fixes in a live browser: one rules answer everywhere, film choice carries forward,
// focus lands on the form, tow checker seeded. No screenshots.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const out = {};
  out.towSeed = await page.evaluate(() => ["preset", "tare", "trailerGvm"].map((k) => document.getElementById("tow-check-" + k)?.value));
  // choose off-road in the film
  await page.locator("section").first().getByRole("button", { name: /^Off-road/ }).click();
  await page.waitForTimeout(800);
  out.afterFilmPick = await page.evaluate(() => ({
    rig: [...document.querySelectorAll("#drive [aria-pressed=true]")].map((b) => b.textContent.slice(0, 20)),
    design: document.querySelector("#design")?.innerText.match(/Build\s*\n?\s*([LOG]\d+[^\s]*)/)?.[1],
    towTrailer: document.getElementById("tow-check-trailerGvm")?.value,
  }));
  // brakes, the same answer in rig and designer for the default Hilux + off-road
  await page.locator("#design").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  out.designBrakes = await page.evaluate(() => (document.querySelector("#design").innerText.match(/BRAKES\s*\n?\s*([^\n]*)/i) || [])[1]);
  out.designCheck = await page.evaluate(() => (document.querySelector("#design").innerText.match(/CHECK\s*\n?\s*([^\n]*)/i) || [])[1]);
  await page.locator("#drive").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !/weighing/i.test(document.querySelector("[class*=rigCard]")?.innerText || "weighing"), null, { timeout: 90000 });
  out.rigBrakes = await page.evaluate(() => (document.querySelector("#drive").innerText.match(/Fitted for this vehicle: ([^.]*)/) || [])[1]);
  // gooseneck behind a Hilux: GCM warning in rig and designer
  await page.locator("#drive").getByRole("button", { name: /^Gooseneck/ }).click();
  await page.waitForFunction(() => /needs a look|✕|✓/.test(document.querySelector("[class*=rigCard]")?.innerText || "") && !/weighing/i.test(document.querySelector("[class*=rigCard]").innerText), null, { timeout: 90000 });
  out.rigGooseneck = await page.evaluate(() => document.querySelector("[class*=rigCard]").innerText.replace(/\n+/g, " | ").slice(0, 400));
  await page.click("text=Send this rig with my brief");
  await page.waitForTimeout(1500);
  out.focusAfterRig = await page.evaluate(() => document.activeElement.tagName + "#" + document.activeElement.id + " in enquire=" + !!document.activeElement.closest("#enquire"));
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
