// Deployment checks against the REAL deployed site (HTTPS, service worker, installability, offline-after-first-load, proxy, headers, secrets).
// Run: node tests/e2e/deployed.mjs https://your-site.netlify.app
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { launchPersistent, watchConsole, check, done } from "./helpers.mjs";

const base = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https:\/\//.test(base)) { console.error("usage: node tests/e2e/deployed.mjs https://<your-site>"); process.exit(2); }
check("served over HTTPS", base.startsWith("https://"), base);

// ---- headers + proxy over plain HTTP (no browser)
const get = async (p, init) => { const t = Date.now(); const r = await fetch(base + p, init); return { r, ms: Date.now() - t, text: await r.text() }; };
const sw = await get("/sw.js");
check("sw.js served with Cache-Control: no-cache (updates reach users)", /no-cache/.test(sw.r.headers.get("cache-control") || ""), sw.r.headers.get("cache-control"));
check("sw.js content-type is JavaScript", /javascript/.test(sw.r.headers.get("content-type") || ""), sw.r.headers.get("content-type"));
const mf = await get("/manifest.json");
check("manifest.json reachable and valid JSON with icons", mf.r.status === 200 && JSON.parse(mf.text).icons.length >= 2);
const s = await get("/api/sachet");
let sj = {}; try { sj = JSON.parse(s.text); } catch (e) { /* reported below */ }
check("proxy /api/sachet reachable: 200 + items from the real SACHET feed", s.r.status === 200 && Array.isArray(sj.items) && sj.items.length > 0, `${s.r.status} ${sj.count} items in ${s.ms} ms`);
check("proxy sends CORS header", s.r.headers.get("access-control-allow-origin") === "*");
const h = await get("/api/hazard?state=Tamil%20Nadu&district=Chennai");
let hj = {}; try { hj = JSON.parse(h.text); } catch (e) { /* reported below */ }
check("proxy /api/hazard reachable: ThinkHazard levels for Chennai (may legitimately 502 if ThinkHazard is down)", h.r.status === 200 && Array.isArray(hj.levels) && hj.levels.length > 0, `${h.r.status} ${h.r.status === 200 ? hj.levels.map(l => l.id + "=" + l.level).join(" ") : h.text.slice(0, 80)} in ${h.ms} ms`);
const bad = await get("/api/hazard?state=%3Cscript%3E");
check("proxy rejects bad input with 400 (not 500)", bad.r.status === 400, String(bad.r.status));
const nf = await get("/api/nope");
check("unknown /api path does not crash the function (404 JSON or static 404)", nf.r.status === 404, String(nf.r.status));

// ---- no secrets in anything served
let leak = [];
for (const f of ["/index.html", "/app.js", "/data.js", "/lib.js", "/alerts.js", "/profile.js", "/components.js", "/sw.js"]) {
  const t = (await get(f)).text;
  if (/service_role|SUPABASE_SERVICE|sk_live|PRIVATE KEY/.test(t)) leak.push(f);
}
check("no service_role/private keys in served files", leak.length === 0, leak.join(","));
const exposed = [];
for (const f of ["/package.json", "/TODO.md", "/tests/validate.test.mjs", "/node_modules/", "/.git/config", "/netlify/functions/api.mjs"]) {
  const r = await fetch(base + f); const ct = r.headers.get("content-type") || "";
  if (r.status === 200 && !/text\/html/.test(ct)) exposed.push(f); // SPA-style HTML fallbacks are fine; real files are not
}
check("repo-only files are NOT published (tests, package.json, function source)", exposed.length === 0, exposed.join(","));

// ---- real Chrome against the deployed URL
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dpa-deployed-"));
const ctx = await launchPersistent(dir);
const page = ctx.pages()[0] || await ctx.newPage();
const logs = []; watchConsole(page, logs);
await page.goto(base + "/index.html");
await page.selectOption("#country", "IN"); await page.selectOption("#state", "Tamil Nadu"); await page.click("main button.btn");
await page.waitForSelector("a[href='#/hazard/flood']");
await page.waitForFunction(() => document.getElementById("net").textContent.includes("✓"), null, { timeout: 30000 });
const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return r && r.active && r.active.state; });
check("service worker registered and active on the deployed URL", reg === "activated", String(reg));
// banner/alerts: live data through the deployed proxy
await page.goto(base + "/index.html#/alerts");
await page.waitForFunction(() => /Last updated|Could not refresh/.test(document.querySelector(".statusline")?.textContent || ""), null, { timeout: 20000 });
const line = await page.textContent(".statusline");
check("deployed app loads live alerts through the deployed proxy", line.startsWith("Last updated"), line);
const cdp = await ctx.newCDPSession(page);
await cdp.send("Page.enable");
const manifest = await cdp.send("Page.getAppManifest");
const inst = await cdp.send("Page.getInstallabilityErrors");
check("Chrome: manifest has no errors", manifest.errors.length === 0, JSON.stringify(manifest.errors));
check("Chrome: installable PWA on the deployed URL", inst.installabilityErrors.length === 0, JSON.stringify(inst.installabilityErrors));
// offline after first load
await page.goto(base + "/index.html#/hazard/flood/during"); await page.waitForSelector("#chk-f-d1"); await page.check("#chk-f-d1");
await ctx.setOffline(true);
await page.reload(); await page.waitForSelector("#chk-f-d1");
check("OFFLINE after first load on deployed URL: page reloads, tick preserved", await page.isChecked("#chk-f-d1"));
for (const r of ["#/home", "#/contacts", "#/emergency", "#/hazard/cyclone/before", "#/profile", "#/alerts"]) {
  await page.goto(base + "/index.html" + r);
  check("OFFLINE route renders on deployed URL: " + r, await page.waitForSelector("main > *", { timeout: 5000 }).then(() => true, () => false));
}
await ctx.setOffline(false);
const real = logs.filter(m => !/Failed to load resource/.test(m));
check("no console errors/warnings on the deployed site", real.length === 0, real.join(" | "));
await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
done();
