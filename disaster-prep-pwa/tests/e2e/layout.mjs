// 360px layout sweep: every screen x {en, ta}: no horizontal overflow, tap targets >= 44px, no missing strings, no console noise.
// Also saves screenshots to tests/e2e/shots/ for eyeballing. Run: node tests/e2e/layout.mjs
import fs from "node:fs";
import { startServer, launch, watchConsole, check, done, PHONE } from "./helpers.mjs";

const { server, url } = await startServer((req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  if (!p.startsWith("/api/")) return false;
  res.writeHead(502, { "Content-Type": "application/json" }); res.end('{"error":"test"}'); return true; // alerts come from the saved SAMPLE here
});
const browser = await launch();
const context = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
const page = await context.newPage();
const logs = [];
watchConsole(page, logs);
fs.mkdirSync(new URL("./shots/", import.meta.url), { recursive: true });

const profile = { v: 1, name: "அன்பு", country: "IN", state: "Tamil Nadu", district: "Chennai", household: 5, children: true, elderly: true, disability: true, pets: true, meds: "yes", vehicle: "yes", contacts: [{ name: "அம்மா", phone: "+919876543210" }] };
await page.addInitScript(p => {
  if (!localStorage.getItem("dpa.settings")) {
    localStorage.setItem("dpa.settings", JSON.stringify({ lang: "en", country: "IN", state: "Tamil Nadu", onboarded: true }));
    localStorage.setItem("dpa.profile", JSON.stringify(p));
  }
}, profile);

const routes = ["#/home", "#/hazard/flood/before", "#/hazard/flood/during", "#/hazard/flood/after", "#/hazard/cyclone/before", "#/hazard/cyclone/during", "#/hazard/cyclone/after",
  "#/contacts", "#/emergency", "#/profile", "#/profile?edit=1", "#/settings", "#/alerts", "#/alerts?sample=1"];
await page.goto(url + "/index.html");
for (const lang of ["en", "ta"]) {
  await page.evaluate(l => { const s = JSON.parse(localStorage.getItem("dpa.settings")); s.lang = l; localStorage.setItem("dpa.settings", JSON.stringify(s)); }, lang);
  for (const r of routes) {
    await page.goto(url + "/index.html" + r);
    await page.reload();
    await page.waitForSelector("main > *");
    if (r.includes("sample")) await page.waitForSelector(".alertitem");
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const over = [...document.querySelectorAll("main *, header *, nav *, #banner")].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > W + 1 || b.left < -1); }).map(e => e.tagName + "." + e.className).slice(0, 3);
      const small = [...document.querySelectorAll("a.btn,button,nav a,label.chk,select,input[type=text],input[type=tel],input[type=number],summary,#banner")]
        .filter(e => { const b = e.getBoundingClientRect(); return b.height > 0 && b.height < 43.5; }).map(e => (e.id || e.textContent).trim().slice(0, 18));
      // text spilling out of its own box (clipped/overlapping labels) - box-overflow checks miss this
      const clipped = [...document.querySelectorAll("a, button, summary, label, h1, h2, h3, legend, #banner, .badge, .lvlrow span")]
        .filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== "inline").map(e => (e.id || e.textContent).trim().slice(0, 18));
      const txt = document.getElementById("app").innerText;
      return { W, over, small, clipped, hscroll: document.documentElement.scrollWidth > W, bad: /\[object|undefined|\bnull\b|…$/m.test(txt) };
    });
    const ok = m.W === 360 && !m.over.length && !m.hscroll && !m.small.length && !m.clipped.length && !m.bad;
    check(`${lang} ${r}`, ok, ok ? "" : JSON.stringify(m));
    if (["#/home", "#/alerts?sample=1", "#/emergency", "#/profile"].includes(r)) await page.screenshot({ path: new URL(`./shots/${lang}-${r.replace(/[#/?=]/g, "_")}.png`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"), fullPage: false });
  }
}
check("no console errors/warnings", logs.filter(m => !/Failed to load resource/.test(m)).length === 0, logs.filter(m => !/Failed to load resource/.test(m)).join(" | "));
await browser.close(); server.close(); done();
