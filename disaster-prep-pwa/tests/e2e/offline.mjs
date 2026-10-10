// J1 + J2 + J3(part) + J4: first launch, online once, then true offline (Chrome network emulation) - reload and fresh tab.
// Run: node tests/e2e/offline.mjs
import { startServer, launch, watchConsole, check, done, PHONE } from "./helpers.mjs";

// This test is about the offline shell, so /api answers with valid EMPTY payloads (alerts are covered in alerts.mjs).
const { server, url } = await startServer((req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  if (!p.startsWith("/api/")) return false;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(p === "/api/sachet" ? JSON.stringify({ items: [] }) : JSON.stringify({ name: "x", levels: [] }));
  return true;
});
const browser = await launch();
const context = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
const page = await context.newPage();
const logs = [];
watchConsole(page, logs);

// ---- J1: first launch -> choose country/state -> contacts -> tel links
await page.goto(url + "/index.html");
await page.selectOption("#country", "IN");
await page.selectOption("#state", "Tamil Nadu");
await page.click("main button.btn");
await page.waitForSelector("a[href='#/hazard/flood']");
check("J1 first launch lands on home after setup", true);
await page.click("nav a[href='#/contacts']");
await page.waitForSelector("a[href='tel:1070']");
const tels = await page.$$eval("main a[href^='tel:']", as => as.map(a => a.getAttribute("href")));
check("J1 contacts show correct tel: links", ["tel:1070", "tel:1077", "tel:+911126701728", "tel:+919711077372"].every(t => tels.includes(t)), tels.join(" "));
const cardsMissingSource = await page.$$eval("main section.card", cs => cs.filter(c => !c.querySelector(".src a")).length);
check("J1 every contact card shows a source link", cardsMissingSource === 0);

// ---- service worker installs and precaches
await page.waitForFunction(() => document.getElementById("net").textContent.includes("offline use"), null, { timeout: 15000 });
check("SW active and 'Saved for offline use' shown", true);
const cached = await page.evaluate(async () => (await (await caches.open((await caches.keys())[0])).keys()).map(r => new URL(r.url).pathname));
check("cache holds shell files", ["/index.html", "/app.js", "/data.js", "/profile.js", "/styles.css", "/manifest.json"].every(f => cached.includes(f)), cached.length + " entries");

// ---- J2 (online part): tick two flood "during" items
await page.goto(url + "/index.html#/hazard/flood/during");
await page.waitForSelector("#chk-f-d1");
await page.check("#chk-f-d1");
await page.check("#chk-f-d3");

// ---- J3 (online part): save a profile
await page.goto(url + "/index.html#/profile");
await page.fill("#name", "Anbu");
await page.fill("#household", "4");
await page.fill("#contactName0", "Amma");
await page.fill("#contactPhone0", "98765 43210");
await page.check("#w-elderly");
await page.check("input[name=meds][value=yes]");
await page.check("input[name=vehicle][value=no]");
await page.click("#save-profile");
await page.waitForSelector("#delete-data");

// ---- J4: go offline (airplane mode) and reload
await context.setOffline(true);
await page.reload(); // page is on #/profile
await page.waitForSelector("#delete-data");
const netText = await page.textContent("#net");
check("offline indicator shows", netText.includes("Offline - showing saved info"), netText);

const routes = {
  "#/home": "a[href='#/emergency']",
  "#/contacts": "a[href='tel:1070']",
  "#/hazard/flood/before": "#chk-f-b1",
  "#/hazard/cyclone/during": "#chk-c-d1",
  "#/emergency": ".em a.btn.huge",
  "#/profile": "#delete-data",
  "#/settings": "#country"
};
for (const [hash, sel] of Object.entries(routes)) {
  await page.goto(url + "/index.html" + hash);
  const ok = await page.waitForSelector(sel, { timeout: 4000 }).then(() => true, () => false);
  check("offline route renders: " + hash, ok);
}
await page.goto(url + "/index.html#/hazard/flood/during");
await page.waitForSelector("#chk-f-d1");
check("J2 checklist ticks survived offline reload", (await page.isChecked("#chk-f-d1")) && (await page.isChecked("#chk-f-d3")) && !(await page.isChecked("#chk-f-d2")));
check("J2 progress text correct", (await page.textContent("main p.src")).trim() === "2 of 7 done", await page.textContent("main p.src"));
await page.goto(url + "/index.html#/profile");
await page.waitForSelector("#delete-data");
check("J3 profile still there offline; tailored tips present", (await page.textContent("main")).includes("Elderly person in your household"));

// language toggle offline + persists after reload
await page.click("#langs button[lang=ta]");
await page.waitForFunction(() => document.getElementById("title").textContent !== "Disaster Prep");
await page.reload();
await page.waitForSelector("#delete-data");
const taTitle = await page.textContent("#title");
check("language switch works offline and persists after reload", taTitle === "பேரிடர் தயார்நிலை", taTitle);
const noMissing = await page.evaluate(() => !/\[object|undefined|…/.test(document.getElementById("app").innerText));
check("no raw/missing strings visible", noMissing);

// fresh tab while still offline (like reopening the app)
const page2 = await context.newPage();
watchConsole(page2, logs);
await page2.goto(url + "/index.html#/contacts");
check("fresh tab opened offline still works", await page2.waitForSelector("a[href='tel:1070']", { timeout: 4000 }).then(() => true, () => false));

// back online
await context.setOffline(false);
await page.waitForFunction(() => !document.getElementById("net").classList.contains("off"));
check("indicator returns to Online", true);

check("no console errors/warnings during whole run", logs.length === 0, logs.join(" | "));

await browser.close();
server.close();
done();
