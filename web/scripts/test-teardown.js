// Designer: switch kinds, take the trailer apart with physics, inspect a part, reassemble. No screenshots.
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3000";
(async () => {
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  await page.goto(base + "/?build=G72-A2-C0-R0-S1#design", { waitUntil: "load" });
  await page.evaluate(() => document.getElementById("design").scrollIntoView());
  await page.waitForFunction(() => window.__cfg, null, { timeout: 90000 });
  await page.waitForTimeout(2500);
  const panel = () => page.evaluate(() => {
    const d = document.getElementById("design");
    return { code: [...d.querySelectorAll("b")].find((b) => /^[LOG]\d/.test(b.textContent))?.textContent, price: [...d.querySelectorAll("b")].find((b) => b.textContent.startsWith("R"))?.textContent, specs: [...d.querySelectorAll("dd")].map((x) => x.textContent.slice(0, 40)) };
  });
  const out = { gooseneck: await panel() };
  await page.locator("#design").getByRole("button", { name: /^Off-road/ }).click();
  await page.waitForTimeout(1500);
  out.offroad = await panel();
  // geometry bounds in the scene (meshes only)
  const sceneBox = () => page.evaluate(() => {
    const { scene } = window.__cfg; let min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9], n = 0;
    scene.traverse((o) => { if (!o.isMesh || !o.visible || o.geometry.type === "CircleGeometry" || o.geometry.type === "PlaneGeometry") return; let v = true; for (let q = o; q; q = q.parent) if (!q.visible) v = false; if (!v) return; n++; o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); min = min.map((m, i) => Math.min(m, b.min.getComponent(i))); max = max.map((m, i) => Math.max(m, b.max.getComponent(i))); });
    return { meshes: n, x: [+min[0].toFixed(2), +max[0].toFixed(2)], y: [+min[1].toFixed(2), +max[1].toFixed(2)], z: [+min[2].toFixed(2), +max[2].toFixed(2)] };
  });
  out.assembled = await sceneBox();
  await page.getByRole("button", { name: "Take it apart" }).click();
  await page.waitForTimeout(12000);
  out.apart = await sceneBox();
  // click on a part: project the centre of some visible mesh to the screen and click there
  const pt = await page.evaluate(() => {
    const { scene, camera, gl, THREE } = window.__cfg; const r = gl.domElement.getBoundingClientRect();
    const rc = new THREE.Raycaster();
    for (let gy = 0.2; gy <= 0.8; gy += 0.05) for (let gx = 0.2; gx <= 0.8; gx += 0.05) {
      rc.setFromCamera(new THREE.Vector2(gx * 2 - 1, -(gy * 2 - 1)), camera);
      const hit = rc.intersectObjects(scene.children, true).find((h) => h.object.visible);
      if (hit && typeof hit.object.userData.piece === "number") return { x: r.left + gx * r.width, y: r.top + gy * r.height };
    }
    return null;
  });
  if (pt) { await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(800); }
  out.picked = await page.evaluate(() => { const p = document.querySelector("#design [class*=picked]"); return p ? p.textContent.slice(0, 120) : null; });
  await page.getByRole("button", { name: "Put it back together" }).click();
  await page.waitForTimeout(6000);
  out.back = await sceneBox();
  out.button = await page.evaluate(() => [...document.querySelectorAll("#design button")].find((b) => /apart|together|Reassembl/.test(b.textContent))?.textContent);
  out.errors = [...new Set(errors)].slice(0, 5);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
