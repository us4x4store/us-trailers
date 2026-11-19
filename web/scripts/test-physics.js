// Numeric physics checks in the live browser (no screenshots).
const { chromium } = require("playwright");
const url = process.argv[2] || "http://localhost:3000/";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.getElementById("drive").scrollIntoView());
  await page.waitForFunction(() => window.__drive && window.__drive.body, null, { timeout: 60000 });
  const R = {};
  // 1. heightfield orientation vs visual height function
  await page.waitForTimeout(3000);
  R.heightfield = await page.evaluate(() => {
    const { vc, heightAt, drive } = window.__drive;
    const out = [];
    for (let i = 0; i < vc.numWheels(); i++) {
      const c = vc.wheelContactPoint(i);
      out.push(c ? { contact: [+c.x.toFixed(2), +c.y.toFixed(4), +c.z.toFixed(2)], road: +heightAt(c.x, c.z, drive.surface).toFixed(4), inContact: vc.wheelIsInContact(i) } : null);
    }
    return out;
  });
  // 2. static sag + nose weight on tar, parked
  await page.evaluate(() => { window.__drive.drive.targetKmh = 0; });
  await page.getByRole("button", { name: /^Tar/ }).click();
  await page.waitForFunction(() => window.__drive && window.__drive.drive.surface === "tar" && window.__drive.vc, null, { timeout: 30000 });
  await page.evaluate(() => { window.__drive.drive.targetKmh = 0; });
  await page.waitForTimeout(5000);
  R.parked = await page.evaluate(() => ({ ...window.__drive.drive.readout, y: +window.__drive.body.translation().y.toFixed(4), mass: +window.__drive.body.mass().toFixed(0) }));
  // 3. bounce test: push the body down and sample its height at 60 Hz via physics steps
  R.bounce = await page.evaluate(async () => {
    const { body } = window.__drive;
    const y0 = body.translation().y;
    body.applyImpulse({ x: 0, y: -body.mass() * 0.6, z: 0 }, true);
    const ys = [];
    const t0 = performance.now();
    await new Promise((res) => {
      const tick = () => { ys.push([performance.now() - t0, body.translation().y - y0]); if (performance.now() - t0 < 4000) requestAnimationFrame(tick); else res(); };
      tick();
    });
    // zero crossings (after removing tiny noise) -> frequency; peaks -> damping
    let cross = [];
    for (let i = 1; i < ys.length; i++) if (Math.sign(ys[i][1]) !== Math.sign(ys[i - 1][1]) && Math.abs(ys[i][1] - ys[i - 1][1]) > 1e-4) cross.push(ys[i][0]);
    const half = cross.length > 2 ? (cross[cross.length - 1] - cross[0]) / (cross.length - 1) : null;
    const peaks = [];
    for (let i = 1; i < ys.length - 1; i++) if (Math.abs(ys[i][1]) > Math.abs(ys[i - 1][1]) && Math.abs(ys[i][1]) >= Math.abs(ys[i + 1][1]) && Math.abs(ys[i][1]) > 0.002) peaks.push(+ys[i][1].toFixed(4));
    return { minDip: +Math.min(...ys.map((v) => v[1])).toFixed(4), crossings: cross.length, hz: half ? +(1000 / (2 * half)).toFixed(2) : null, peaks: peaks.slice(0, 6), samples: ys.length };
  });
  // 4. drive 60 km/h on corrugations for ~20 s, track tow/coupler separation and extremes
  await page.getByRole("button", { name: /^Corrugations/ }).click();
  await page.waitForFunction(() => window.__drive.drive.surface === "gravel", null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__drive.drive.targetKmh = 60; });
  R.drive = await page.evaluate(async () => {
    const d = window.__drive;
    let maxSep = 0, minT = 1e9, maxT = -1e9, maxRoll = 0, maxPitch = 0, nan = false, teleports = 0, lastX = d.body.translation().x, maxKmh = 0, gMin = 9, gMax = 0;
    const t0 = performance.now();
    await new Promise((res) => {
      const tick = () => {
        const b = d.body.translation(), q = d.body.rotation(), t = d.tow.translation();
        // coupler world position
        const cx = 3.75, cy = 0.55;
        const qv = new (window.__film?.camera.position.constructor || Object)(cx, cy, 0);
        // rotate coupler by body quaternion (manual)
        const ix = q.w * cx + q.y * 0 - q.z * cy, iy = q.w * cy + q.z * cx - q.x * 0, iz = q.w * 0 + q.x * cy - q.y * cx, iw = -q.x * cx - q.y * cy - q.z * 0;
        const wx = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y, wy = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z, wz = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
        const sep = Math.hypot(b.x + wx - t.x, b.y + wy - t.y, b.z + wz - t.z);
        if (sep > maxSep) maxSep = sep;
        const r = d.drive.readout;
        r.travel.forEach((v) => { minT = Math.min(minT, v); maxT = Math.max(maxT, v); });
        maxRoll = Math.max(maxRoll, Math.abs(r.roll)); maxPitch = Math.max(maxPitch, Math.abs(r.pitch)); maxKmh = Math.max(maxKmh, r.kmh);
        gMin = Math.min(gMin, r.g); gMax = Math.max(gMax, r.g);
        if (![b.x, b.y, b.z].every(Number.isFinite)) nan = true;
        if (b.x < lastX - 30) teleports++;
        lastX = b.x;
        if (performance.now() - t0 < 20000) requestAnimationFrame(tick); else res();
      };
      tick();
    });
    const b = d.body.translation();
    return { maxCouplerSeparation_m: +maxSep.toFixed(3), travelRange_mm: [minT, maxT], maxRoll, maxPitch, maxKmh, g: [gMin, gMax], nan, teleports, finalZ: +b.z.toFixed(3), finalY: +b.y.toFixed(3) };
  });
  // 5. loads: stop, add quad + 2 bikes + water, check they sit inside and nose weight moves
  await page.evaluate(() => { window.__drive.drive.targetKmh = 0; });
  await page.waitForTimeout(4000);
  const before = await page.evaluate(() => window.__drive.drive.readout.noseKg);
  await page.getByRole("button", { name: /Quad bike/ }).click();
  await page.getByRole("button", { name: /Dirt bike/ }).click();
  await page.getByRole("button", { name: /Dirt bike/ }).click();
  await page.getByRole("button", { name: /Fill water tank/ }).click();
  await page.waitForTimeout(6000);
  R.loads = await page.evaluate((before) => {
    const d = window.__drive;
    const b = d.body.translation(), q = d.body.rotation();
    const inside = [];
    d.world.forEachRigidBody((rb) => {
      if (!rb.userData || !rb.userData.load) return;
      const p = rb.translation();
      // to trailer space (ignore small rotation)
      inside.push({ x: +(p.x - b.x).toFixed(2), y: +(p.y - b.y).toFixed(2), z: +(p.z - b.z).toFixed(2) });
    });
    return { noseBefore: before, after: d.drive.readout, loads: inside };
  }, before);
  R.errors = [...new Set(errors)].slice(0, 6);
  console.log(JSON.stringify(R, null, 1));
  await browser.close();
})();
