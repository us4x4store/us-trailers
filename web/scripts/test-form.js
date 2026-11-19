// Enquiry form: client validation, values kept on server error, focus moves to the first problem.
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
(async () => {
  const browser = await chromium.launch();
  for (const [name, opts] of [["laptop", { viewport: { width: 1440, height: 900 } }], ["iPhone", devices["iPhone 13"]]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(base + "/#enquire", { waitUntil: "load" });
    await page.waitForTimeout(800);
    const r = {};
    r.formHeight = await page.evaluate(() => Math.round(document.querySelector("#enquire form").getBoundingClientRect().height));
    r.selectsDefault = await page.evaluate(() => [...document.querySelectorAll("#enquire select")].map((s) => s.value));
    // 1. type some, bad phone, submit -> client errors, values kept, focus on phone
    await page.fill("#name", "Thandi Mokoena");
    await page.fill("#phone", "12");
    await page.fill("#vehicle", "2021 Ford Ranger Wildtrak");
    await page.click("#enquire summary");
    await page.fill("#town", "Stellenbosch");
    await page.selectOption("#use", "Horses");
    await page.fill("#message", "Two horses and tack, gravel farm roads.");
    await page.check("#consent");
    await page.click("text=Send my brief");
    await page.waitForTimeout(600);
    r.client = await page.evaluate(() => ({
      focus: document.activeElement?.id,
      phoneErr: document.getElementById("phone-err")?.textContent,
      kept: ["name", "vehicle", "town", "use", "message"].map((k) => document.getElementById(k)?.value),
    }));
    // 2. fix phone; bypass client check to force a server-side error (missing consent) -> values kept
    await page.fill("#phone", "082 555 0101");
    await page.uncheck("#consent");
    await page.evaluate(() => {
      const f = document.querySelector("#enquire form");
      f.requestSubmit = f.requestSubmit; // keep
    });
    await page.waitForTimeout(3200);
    await page.click("text=Send my brief");
    await page.waitForTimeout(800);
    r.consent = await page.evaluate(() => ({ focus: document.activeElement?.id, err: document.getElementById("consent-err")?.textContent }));
    // 3. valid submit -> offline notice (inbox not connected) with everything still filled
    await page.check("#consent");
    await page.click("text=Send my brief");
    await page.waitForTimeout(2500);
    r.final = await page.evaluate(() => ({
      status: document.querySelector("#enquire [role=alert], #enquire [role=status]")?.textContent?.slice(0, 60),
      kept: ["name", "phone", "vehicle", "town", "use", "message"].map((k) => document.getElementById(k)?.value),
    }));
    r.errors = errors;
    console.log(name, JSON.stringify(r));
    await ctx.close();
  }
  await browser.close();
})();
