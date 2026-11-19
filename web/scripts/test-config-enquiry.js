// Configurator + enquiry behaviour checks in a live browser (no screenshots).
const { chromium } = require("playwright");
const url = process.argv[2] || "http://localhost:3000/";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport: vp, isMobile: vp.width < 600, hasTouch: vp.width < 600 });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
    await page.goto(url + "?build=L36-A1-C2-R0-S0", { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("design").scrollIntoView());
    await page.waitForTimeout(3000);
    const read = () => page.evaluate(() => {
      const d = document.getElementById("design");
      const price = [...d.querySelectorAll("b")].find((b) => b.textContent.startsWith("R"))?.textContent;
      const code = [...d.querySelectorAll("b")].find((b) => /^L\d/.test(b.textContent))?.textContent;
      const specs = [...d.querySelectorAll("dd")].map((x) => x.textContent);
      const single = [...d.querySelectorAll("button")].find((b) => b.textContent.startsWith("Single"));
      return { code, price, specs, singleDisabled: single?.disabled, canvas: !!d.querySelector("canvas"), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    const r = { shared: await read() };
    await page.getByRole("button", { name: /^6\s?000/ }).click();
    await page.getByRole("button", { name: "Oxide" }).click();
    await page.getByRole("button", { name: /^Roof rack/ }).click();
    await page.waitForTimeout(800);
    r.after = await read();
    // enquiry: empty submit -> errors
    await page.evaluate(() => document.getElementById("enquire").scrollIntoView());
    await page.getByRole("button", { name: "Send my brief" }).click();
    await page.waitForTimeout(1500);
    r.emptyErrors = await page.evaluate(() => [...document.querySelectorAll("#enquire p")].filter((p) => /name|number|agree/i.test(p.textContent) && getComputedStyle(p).color.includes("184")).map((p) => p.textContent));
    r.attachedBuild = await page.evaluate(() => document.querySelector("#enquire input[name=build]")?.value);
    await page.fill("#name", "Test Buyer");
    await page.fill("#phone", "082 123 4567");
    await page.fill("#vehicle", "2022 Toyota Hilux 2.8 GD-6 double cab");
    await page.check("input[name=consent]");
    await page.waitForTimeout(3200);
    await page.getByRole("button", { name: "Send my brief" }).click();
    await page.waitForTimeout(2500);
    r.submit = await page.evaluate(() => document.querySelector("#enquire [role=alert], #enquire [role=status]")?.textContent?.slice(0, 120) || "no status");
    r.errors = [...new Set(errors)].slice(0, 5);
    out[vp.width] = r;
    await page.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
