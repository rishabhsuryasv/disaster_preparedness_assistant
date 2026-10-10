// Slow-network checks with Chrome DevTools throttling (Slow 3G = 400 kbps, 400 ms RTT; Fast 3G = 1.6 Mbps, 150 ms) + 4x CPU slowdown,
// plus Chrome's own PWA installability verdict. The local server gzips like Netlify. Run: node tests/e2e/perf3g.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startServer, launch, launchPersistent, check, done, PHONE } from "./helpers.mjs";

const { server, url } = await startServer((req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  if (!p.startsWith("/api/")) return false;
  // the live-alert proxy is deliberately SLOW here (6s) to prove it never delays the offline features
  setTimeout(() => { res.writeHead(200, { "Content-Type": "application/json" }); res.end(p === "/api/sachet" ? '{"items":[]}' : '{"name":"x","levels":[]}'); }, 6000);
  return true;
});
const browser = await launch();
const PROFILES = { "Slow 3G": { latency: 400, down: (400 * 1024) / 8 }, "Fast 3G": { latency: 150, down: (1600 * 1024) / 8 } };

async function measure(name, net) {
  const ctx = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: net.latency, downloadThroughput: net.down, uploadThroughput: net.down });
  let bytes = 0, reqs = 0;
  cdp.on("Network.loadingFinished", e => { bytes += e.encodedDataLength; reqs++; });
  const t0 = Date.now();
  await page.goto(url + "/index.html", { waitUntil: "commit" });
  await page.waitForSelector("#country", { timeout: 60000 }); // first-launch screen is interactive
  const first = Date.now() - t0;
  const firstBytes = bytes;
  await page.selectOption("#country", "IN"); await page.selectOption("#state", "Tamil Nadu"); await page.click("main button.btn");
  await page.waitForSelector("a[href='#/hazard/flood']");
  await page.waitForFunction(() => document.getElementById("net").textContent.includes("✓"), null, { timeout: 90000 }); // SW finished caching on this slow link
  const cachedAt = Date.now() - t0;
  const t1 = Date.now(); bytes = 0;
  await page.reload({ waitUntil: "commit" });
  await page.waitForSelector("a[href='#/hazard/flood']", { timeout: 30000 });
  const repeat = Date.now() - t1;
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await ctx.close();
  return { first, firstBytes, cachedAt, repeat };
}

for (const [name, net] of Object.entries(PROFILES)) {
  const r = await measure(name, net);
  console.log(`INFO ${name}: first interactive ${r.first} ms (${Math.round(r.firstBytes / 1024)} KB over the wire), fully cached after ${r.cachedAt} ms, repeat visit ${r.repeat} ms`);
  const budget = name === "Slow 3G" ? { first: 10000, repeat: 3000 } : { first: 5000, repeat: 2000 };
  check(`${name}: first visit interactive within ${budget.first} ms`, r.first <= budget.first, r.first + " ms");
  check(`${name}: payload under 150 KB on first visit`, r.firstBytes < 150 * 1024, Math.round(r.firstBytes / 1024) + " KB");
  check(`${name}: repeat visit (service worker) within ${budget.repeat} ms even though /api takes 6 s`, r.repeat <= budget.repeat, r.repeat + " ms");
}

// ---- installability as judged by Chrome itself
// Persistent (non-incognito) profile: Playwright's default temporary contexts are "incognito" and can never be installable.
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "dpa-install-"));
const ctx = await launchPersistent(profileDir);
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto(url + "/index.html");
await page.waitForFunction(() => document.getElementById("net").textContent.includes("✓"), null, { timeout: 20000 });
const cdp = await ctx.newCDPSession(page);
await cdp.send("Page.enable");
const manifest = await cdp.send("Page.getAppManifest");
const inst = await cdp.send("Page.getInstallabilityErrors");
check("Chrome parses the manifest without errors", manifest.errors.length === 0, JSON.stringify(manifest.errors));
check("Chrome reports NO installability errors (installable PWA)", inst.installabilityErrors.length === 0, JSON.stringify(inst.installabilityErrors));
await ctx.close(); await browser.close(); server.close(); fs.rmSync(profileDir, { recursive: true, force: true }); done();
