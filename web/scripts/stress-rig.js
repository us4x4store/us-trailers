// Worst case on the test rig: rocks, every load, 120 km/h, straps on then off. Reads the visible numbers.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(base + "/", { waitUntil: "load" });
  await page.evaluate(() => document.getElementById("drive").scrollIntoView());
  await page.waitForTimeout(6000);
  await page.getByRole("button", { name: /^Rocks/ }).click();
  await page.waitForTimeout(4000);
  for (const n of [/Quad bike/, /Dirt bike/, /Dirt bike/, /Fill water/]) await page.getByRole("button", { name: n }).click();
  await page.waitForTimeout(5000);
  await page.locator("#speed").fill("120");
  const sample = async (label, secs) => {
    const s = { label, kmh: [], nose: [], g: [], notices: new Set(), travelAllZero: 0 };
    for (let i = 0; i < secs; i++) {
      await page.waitForTimeout(1000);
      const r = await page.evaluate(() => {
        const hud = document.querySelector("#drive [class*=hud]");
        const bs = [...hud.querySelectorAll("b")].map((b) => b.textContent);
        const stat = [...document.querySelectorAll("#drive [class*=stat] b")].map((b) => b.textContent);
        const bars = [...document.querySelectorAll("#drive [class*=bar] em")].map((e) => +e.textContent);
        const notice = document.querySelector("#drive [class*=notice]")?.textContent;
        return { kmh: +bs[0], nose: bs[1], g: +stat[1], bars, notice };
      });
      s.kmh.push(r.kmh); s.nose.push(r.nose); s.g.push(r.g);
      if (r.notice) s.notices.add(r.notice.slice(0, 60));
      if (r.bars.every((b) => b === 0)) s.travelAllZero++;
    }
    const nums = s.nose.map((n) => parseInt(String(n).replace(/[^\d-]/g, ""))).filter(Number.isFinite);
    console.log(JSON.stringify({ label, kmhMax: Math.max(...s.kmh), noseRange: [Math.min(...nums), Math.max(...nums)], gRange: [Math.min(...s.g), Math.max(...s.g)], travelAllZeroSamples: s.travelAllZero, notices: [...s.notices] }));
  };
  await sample("strapped, rocks, 120 km/h", 25);
  await page.getByRole("button", { name: /Straps on/ }).click();
  await sample("unstrapped, rocks, 120 km/h", 25);
  console.log("errors", JSON.stringify(errors));
  await browser.close();
})();
