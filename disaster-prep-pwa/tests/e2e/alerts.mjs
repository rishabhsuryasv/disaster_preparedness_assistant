// J5 + notification permissions + API failure modes, against the REAL proxy code (netlify/functions/api.mjs) behind a local server.
// Modes:  "fixture" = proxy fed by a SYNTHETIC feed (ids start with TEST-, titles start with "TEST FIXTURE") for deterministic checks.
//         "live"    = proxy talking to the REAL SACHET / ThinkHazard upstreams.
//         "down" | "html" | "empty" | "garbage" | "slow" = failure injection at the proxy boundary.
// Run: node tests/e2e/alerts.mjs   (the 8s-timeout case really waits ~9s)
import { startServer, launch, watchConsole, check, done, PHONE } from "./helpers.mjs";
import { handle } from "../../netlify/functions/api.mjs";

let mode = "fixture";
let fixtureItems = [];
let sachetHits = 0;
const rss = items => `<?xml version="1.0"?><rss version="2.0"><channel><title>FIXTURE</title>${items.map(i =>
  `<item><title>${i.title}</title><description/><category>Met</category><link>https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=${i.id}</link><author>controlroom@ndma.gov.in (${i.agency})</author><guid isPermaLink="false">${i.id}</guid><pubDate>${i.pub}</pubDate></item>`).join("")}</channel></rss>`;
const TN1 = { id: "TEST-1", title: "TEST FIXTURE: Heavy rain likely at isolated places over Chennai, Cuddalore, Nagapattinam", agency: "IMD Chennai", pub: "Sat, 10 Oct 2026 06:00:00 GMT" };
const OTHER = { id: "TEST-2", title: "TEST FIXTURE: Thunderstorm over Bikaner, Churu", agency: "IMD Jaipur", pub: "Sat, 10 Oct 2026 06:01:00 GMT" };
const TN2 = { id: "TEST-3", title: "TEST FIXTURE: Cyclone warning for Nagapattinam coast", agency: "IMD Chennai", pub: "Sat, 10 Oct 2026 07:00:00 GMT" };
const fixtureFetch = async url => {
  if (String(url).includes("rss")) return new Response(rss(fixtureItems));
  if (String(url).includes("administrativedivision")) return new Response(JSON.stringify({ data: [{ code: 1508, admin0: "India", admin1: "Tamil Nadu", url: "https://thinkhazard.org/en/report/1508-india-tamil-nadu" }] }));
  return new Response(JSON.stringify([{ hazardtype: { mnemonic: "CY" }, hazardlevel: { title: "High" } }, { hazardtype: { mnemonic: "FL" }, hazardlevel: { title: "Medium" } }])); // synthetic fixture levels
};

const { server, url } = await startServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (!u.pathname.startsWith("/api/")) return false;
  if (u.pathname === "/api/sachet") sachetHits++;
  (async () => {
    const send = (status, body, type = "application/json") => { res.writeHead(status, { "Content-Type": type }); res.end(body); };
    if (mode === "down") return send(502, JSON.stringify({ error: "upstream_status_500" }));
    if (mode === "html") return send(200, "<html><body>Maintenance</body></html>", "text/html");
    if (mode === "garbage") return send(200, JSON.stringify({ unexpected: true }));
    if (mode === "empty") return send(200, JSON.stringify({ source: "x", count: 0, items: [] }));
    if (mode === "slow") return; // never respond: the client's 8s timeout must save us
    const r = await handle(new Request("http://app.test" + req.url), {}, mode === "fixture" ? fixtureFetch : fetch);
    send(r.status, Buffer.from(await r.arrayBuffer()), "application/json");
  })();
  return true;
});

const browser = await launch();
const NOTIF_STUB = () => {
  window.__notifs = []; window.__perm = "default"; window.__reqResult = "granted";
  window.Notification = class { constructor(title, o) { window.__notifs.push({ title, body: o && o.body }); }
    static get permission() { return window.__perm; }
    static requestPermission() { window.__perm = window.__reqResult === "dismissed" ? "default" : window.__reqResult; return Promise.resolve(window.__perm); } };
};
const context = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
await context.addInitScript(NOTIF_STUB);
const page = await context.newPage();
const logs = [];
watchConsole(page, logs);
const hazardResponses = [];
page.on("response", r => { if (r.url().includes("/api/hazard")) hazardResponses.push(r.status()); });
const netNoise = /Failed to load resource|net::ERR|status of 50/i; // expected browser logs for injected HTTP failures / aborted requests
const text = sel => page.textContent(sel);
const stateLine = () => page.textContent(".statusline").catch(() => "");

// --- setup: Tamil Nadu user, fixture feed with 1 TN alert + 1 other-state alert
fixtureItems = [TN1, OTHER];
await page.goto(url + "/index.html");
await page.selectOption("#country", "IN");
await page.selectOption("#state", "Tamil Nadu");
await page.click("main button.btn");
await page.waitForSelector("a[href='#/hazard/flood']");

// --- J5a: banner appears after background refresh, does not block first paint
await page.waitForSelector("#banner:not([hidden])", { timeout: 8000 });
const banner = await text("#banner");
check("J5 alert banner shown for the user's state", banner.includes("1 alert(s) for Tamil Nadu") && banner.includes("TEST FIXTURE: Heavy rain"), banner.slice(0, 90));
await page.waitForSelector(".alertcard");
check("home shows live-alerts card with count", (await text(".alertcard")).includes("(1)"), (await text(".alertcard")).slice(0, 80));
await page.click(".alertcard");
await page.waitForSelector(".alertitem");
check("alerts page: relevant alert highlighted; other-state alert is under 'Other alerts'", (await page.$$(".alertitem.mine, .alertitem")).length >= 2 && (await page.$$eval("details.others .alertitem", n => n.length)) === 1);
check("shows 'Last updated' time", (await stateLine()).startsWith("Last updated"), await stateLine());
check("honest label: not SMS/push when app closed", (await text("main")).includes("NOT an SMS or push message when the app is closed"));
check("ThinkHazard card (fixture levels) rendered with source link", (await text("main")).includes("Long-term hazard level") && (await text("main")).includes("Cyclone") && (await page.$("a[href='https://thinkhazard.org/en/report/1508-india-tamil-nadu']")) !== null);
check("source link for alert points to sachet.ndma.gov.in", (await page.$$eval(".alertitem a", as => as.every(a => a.href.startsWith("https://sachet.ndma.gov.in/")))));

// --- J5b: API failure modes -> cached alerts + fallback notice, no crash
for (const m of ["down", "html", "garbage", "empty"]) {
  mode = m;
  await page.click("#refresh-alerts");
  await page.waitForFunction(() => document.querySelector(".statusline")?.textContent.startsWith("Could not refresh"), null, { timeout: 5000 }).catch(() => {});
  const line = await stateLine();
  const cachedStillShown = (await page.$$(".alertitem")).length >= 2;
  const bannerStill = await page.isVisible("#banner");
  check(`J5 failure "${m}": notice + saved alerts still shown + banner kept`, line.startsWith("Could not refresh - showing last saved at") && cachedStillShown && bannerStill, line.slice(0, 70));
}

// slow upstream: UI must stay usable, then fall back after ~8s
mode = "slow";
const t0 = Date.now();
await page.click("#refresh-alerts");
await page.click("nav a[href='#/contacts']"); // still navigable while the request hangs
check("J5 app stays responsive while alerts request hangs (contacts opened)", await page.waitForSelector("a[href='tel:1070']", { timeout: 2000 }).then(() => true, () => false));
await page.click("nav a[href='#/home']");
await page.click(".alertcard");
await page.waitForFunction(() => document.querySelector(".statusline")?.textContent.startsWith("Could not refresh"), null, { timeout: 12000 });
const dt = Date.now() - t0;
check("J5 hanging request gives up at ~8s and shows fallback notice", dt >= 7000 && dt < 11500, dt + "ms");

// --- recovery: next good fetch clears the notice
mode = "fixture";
await page.click("#refresh-alerts");
await page.waitForFunction(() => document.querySelector(".statusline")?.textContent.startsWith("Last updated"), null, { timeout: 5000 });
check("recovery: 'Last updated' returns after a good fetch", true);

// --- notification permission matrix (stubbed Notification: tests app logic; real OS prompt NOT TESTED)
check("notifications default: button visible", await page.isVisible("#enable-notif"));
await page.evaluate(() => { window.__reqResult = "dismissed"; });
await page.click("#enable-notif");
check("permission DISMISSED: stays off, button still offered, no notification fired", (await text("main")).includes("Notifications are off") && await page.isVisible("#enable-notif") && (await page.evaluate(() => window.__notifs.length)) === 0);
await page.evaluate(() => { window.__reqResult = "granted"; });
await page.click("#enable-notif");
check("permission GRANTED: message says only while app is open", (await text("main")).includes("only while this app is open"));
fixtureItems = [TN1, OTHER, TN2];
await page.click("#refresh-alerts");
await page.waitForFunction(() => window.__notifs.length > 0, null, { timeout: 5000 }).catch(() => {});
const notifs = await page.evaluate(() => window.__notifs);
check("new relevant alert -> exactly one notification with its text", notifs.length === 1 && notifs[0].body.includes("Cyclone warning for Nagapattinam"), JSON.stringify(notifs).slice(0, 120));
await page.click("#refresh-alerts");
await page.waitForTimeout(800);
check("same alert is NOT notified twice", (await page.evaluate(() => window.__notifs.length)) === 1);
fixtureItems = [TN1, OTHER, TN2, { id: "TEST-4", title: "TEST FIXTURE: Rain over Jaipur", agency: "IMD Jaipur", pub: "Sat, 10 Oct 2026 08:00:00 GMT" }];
await page.click("#refresh-alerts");
await page.waitForTimeout(800);
check("new alert for ANOTHER state is not notified", (await page.evaluate(() => window.__notifs.length)) === 1);

// permission DENIED + UNSUPPORTED in fresh contexts
for (const [name, init, expect] of [
  ["DENIED", () => { window.__perm = "denied"; }, "blocked in your browser settings"],
  ["UNSUPPORTED", () => { delete window.Notification; }, "does not support notifications"]
]) {
  const c2 = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
  await c2.addInitScript(NOTIF_STUB); await c2.addInitScript(init);
  const p2 = await c2.newPage(); const l2 = []; watchConsole(p2, l2);
  await p2.addInitScript(() => localStorage.setItem("dpa.settings", JSON.stringify({ lang: "en", country: "IN", state: "Tamil Nadu", onboarded: true })));
  await p2.goto(url + "/index.html#/alerts");
  await p2.waitForSelector(".statusline");
  const ok = (await p2.textContent("main")).includes(expect) && !(await p2.$("#enable-notif"));
  check(`permission ${name}: clear message, no enable button, page works`, ok && l2.filter(m => !netNoise.test(m)).length === 0, l2.join("|"));
  await c2.close();
}

// --- offline: no network attempts; saved alerts + offline notice; sample works offline
fixtureItems = [TN1, OTHER];
await page.click("#refresh-alerts"); await page.waitForTimeout(500);
await context.setOffline(true);
const hitsBefore = sachetHits;
await page.waitForFunction(() => document.getElementById("net").classList.contains("off"));
await page.click("#refresh-alerts");
await page.waitForFunction(() => document.querySelector(".statusline")?.textContent.startsWith("Offline - showing last saved at"), null, { timeout: 4000 });
check("OFFLINE: notice + saved alerts shown, and NO request made to /api", sachetHits === hitsBefore && (await page.$$(".alertitem")).length >= 2);
await page.goto(url + "/index.html#/alerts?sample=1");
await page.waitForSelector(".samplebanner");
await page.waitForFunction(() => document.querySelector(".alertitem"));
const sb = await text(".samplebanner");
check("OFFLINE sample mode: clearly labelled SAMPLE, real saved alerts + hazard shown", sb.includes("SAMPLE DATA") && sb.includes("Not live") && (await page.$$(".alertitem")).length > 5 && (await text("main")).includes("River flood"), sb.slice(0, 70));
await context.setOffline(false);

// --- LIVE: real proxy -> real SACHET (and real ThinkHazard, which may be down)
mode = "live";
await page.goto(url + "/index.html#/alerts");
await page.click("#refresh-alerts");
await page.waitForFunction(() => document.querySelector(".statusline")?.textContent.startsWith("Last updated") || document.querySelector(".statusline")?.textContent.startsWith("Could not"), null, { timeout: 15000 });
const liveLine = await stateLine();
const liveStored = await page.evaluate(() => JSON.parse(localStorage.getItem("dpa.alerts")));
check("LIVE: real SACHET feed loaded through the proxy into the app", liveLine.startsWith("Last updated") && liveStored.items.length > 10 && !liveStored.items.some(i => i.id.startsWith("TEST-")), liveStored.items.length + " real items; " + liveLine);
await page.waitForTimeout(9000); // let the (forced) hazard refresh finish or time out
const lastHz = hazardResponses[hazardResponses.length - 1];
console.log("INFO live ThinkHazard via proxy: last /api/hazard HTTP status = " + lastHz + (lastHz === 200 ? " (live levels loaded)" : " (ThinkHazard down/unavailable: app kept its saved levels - fallback path exercised, live success NOT TESTED)"));

check("no console errors/warnings/page errors (excluding expected failed-request logs)", logs.filter(m => !netNoise.test(m)).length === 0, logs.filter(m => !netNoise.test(m)).join(" | "));
await browser.close();
server.close();
done();
