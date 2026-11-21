// Enquiry with the inbox not connected: the visitor must still be able to send the brief in one tap.
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://localhost:3001";
(async () => {
  const browser = await chromium.launch();
  for (const [name, opts] of [["laptop", { viewport: { width: 1440, height: 900 } }], ["iPhone", devices["iPhone 13"]]]) {
    const page = await (await browser.newContext(opts)).newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(base + "/#enquire", { waitUntil: "load" });
    await page.fill("#name", "Thandi Mokoena");
    await page.fill("#phone", "082 555 0101");
    await page.fill("#vehicle", "2021 Ford Ranger");
    await page.check("#consent");
    await page.waitForTimeout(3300);
    await page.click("text=Send my brief");
    await page.waitForSelector("#enquire-offline a", { timeout: 15000 });
    const r = await page.evaluate(() => {
      const box = document.getElementById("enquire-offline");
      return {
        text: box.querySelector("p").textContent.slice(0, 60),
        actions: [...box.querySelectorAll("a,button")].map((a) => {
          const b = a.getBoundingClientRect();
          return { label: a.textContent, href: (a.getAttribute("href") || "").slice(0, 70), hasBrief: decodeURIComponent(a.getAttribute("href") || "").includes("Thandi Mokoena"), w: Math.round(b.width), h: Math.round(b.height) };
        }),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    console.log(name, JSON.stringify(r), "errors", errors);
  }
  await browser.close();
})();
