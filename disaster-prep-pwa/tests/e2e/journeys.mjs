// QA journeys J1-J3, J6, J7 + persistence across a REAL browser close/reopen + CRUD + language matrix + sources everywhere.
// Run: node tests/e2e/journeys.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startServer, launch, launchPersistent, watchConsole, check, done, PHONE } from "./helpers.mjs";

const apiStub = (req, res) => { // alerts are covered elsewhere; keep this run quiet and deterministic
  const p = new URL(req.url, "http://x").pathname;
  if (!p.startsWith("/api/")) return false;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(p === "/api/sachet" ? JSON.stringify({ items: [] }) : JSON.stringify({ name: "x", levels: [] }));
  return true;
};
const { server, url } = await startServer(apiStub);
const logs = [];
const U = h => url + "/index.html" + h;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dpa-profile-"));

// ======================= PART A: persistence across closing and reopening the browser =======================
let ctx = await launchPersistent(dir);
let page = ctx.pages()[0] || await ctx.newPage();
watchConsole(page, logs);
await page.goto(U(""));
// J1
await page.selectOption("#country", "IN"); await page.selectOption("#state", "Tamil Nadu"); await page.click("main button.btn");
await page.waitForSelector("a[href='#/hazard/flood']");
await page.click("nav a[href='#/contacts']");
await page.waitForSelector("a[href='tel:1070']");
check("J1 first launch -> country/state -> contacts -> tel:1070 link", (await page.getAttribute("a[href='tel:1070']", "href")) === "tel:1070");
// J2 + checklist CRUD (create, read, update, delete)
await page.goto(U("#/hazard/flood/during"));
await page.check("#chk-f-d1"); await page.check("#chk-f-d2"); await page.check("#chk-f-d4");
let prog = (await page.textContent("main p.src")).trim();
check("checklist CREATE: 3 ticked -> '3 of 7 done'", prog === "3 of 7 done", prog);
await page.uncheck("#chk-f-d2");
prog = (await page.textContent("main p.src")).trim();
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("dpa.checks")));
check("checklist DELETE: unticking removes it from storage and progress", prog === "2 of 7 done" && !("f-d2" in stored) && stored["f-d1"] && stored["f-d4"], prog + " " + JSON.stringify(stored));
// J3: profile create -> read -> update
await page.goto(U("#/profile"));
await page.fill("#name", "Anbu"); await page.fill("#household", "4"); await page.fill("#district", "Chennai");
await page.fill("#contactName0", "Amma"); await page.fill("#contactPhone0", "98765 43210");
await page.fill("#contactName1", "Appa"); await page.fill("#contactPhone1", "+91 91234-56789");
await page.check("#w-children"); await page.check("#w-pets");
await page.check("input[name=meds][value=yes]"); await page.check("input[name=vehicle][value=no]");
await page.click("#save-profile");
await page.waitForSelector("#delete-data");
let body = await page.textContent("main");
check("profile CREATE+READ: summary shows name, 2 contacts, tailored groups", body.includes("Anbu") && body.includes("Amma") && body.includes("Appa") && body.includes("Children in your household") && body.includes("Pets") && body.includes("Regular medicines") && !body.includes("Elderly person in your household"));
const tels = await page.$$eval("main a[href^='tel:']", as => as.map(a => a.getAttribute("href")));
check("profile contact tel: links are normalised", tels.includes("tel:9876543210") && tels.includes("tel:+919123456789"), tels.join(" "));
await page.click("a[href='#/profile?edit=1']");
await page.waitForSelector("#save-profile");
check("profile UPDATE: edit form is pre-filled", (await page.inputValue("#name")) === "Anbu" && (await page.inputValue("#household")) === "4" && (await page.isChecked("#w-pets")));
await page.fill("#household", "7"); await page.check("#w-elderly"); await page.uncheck("#w-pets");
await page.click("#save-profile"); await page.waitForSelector("#delete-data");
body = await page.textContent("main");
const groupTitles = await page.$$eval("main h3", hs => hs.map(h => h.textContent));
check("profile UPDATE saved: household 7, elderly group added, pets group removed", body.includes("Household size: 7") && groupTitles.includes("Elderly person in your household") && !groupTitles.includes("Pets"), groupTitles.join(" / "));
// language persisted
await page.click("#langs button[lang=ta]");
await page.waitForFunction(() => document.getElementById("title").textContent !== "Disaster Prep");
await page.waitForFunction(() => document.getElementById("net").textContent.includes("✓"), null, { timeout: 15000 });
await ctx.close(); // === browser closed ===

ctx = await launchPersistent(dir); // === browser reopened, same profile on disk ===
page = ctx.pages()[0] || await ctx.newPage();
watchConsole(page, logs);
await page.goto(U(""));
await page.waitForSelector("a[href='#/hazard/flood']");
check("after REOPEN: no onboarding, Tamil language persisted", (await page.textContent("#title")) === "பேரிடர் தயார்நிலை");
await page.goto(U("#/hazard/flood/during"));
await page.waitForSelector("#chk-f-d1");
check("after REOPEN: checklist state intact (d1 ticked, d2 unticked, d4 ticked)", (await page.isChecked("#chk-f-d1")) && !(await page.isChecked("#chk-f-d2")) && (await page.isChecked("#chk-f-d4")));
await page.goto(U("#/profile"));
await page.waitForSelector("#delete-data");
body = await page.textContent("main");
check("after REOPEN: profile intact (household 7 edit survived)", body.includes("Anbu") && body.includes(": 7"));
// DELETE
await page.click("#delete-data");
await page.click("#confirm-delete");
await page.waitForSelector("[role=status]");
const after = await page.evaluate(() => ({ p: localStorage.getItem("dpa.profile"), c: localStorage.getItem("dpa.checks"), s: localStorage.getItem("dpa.settings") }));
check("profile DELETE: profile + checklist progress gone, language/country kept", after.p === null && after.c === null && after.s && JSON.parse(after.s).lang === "ta", JSON.stringify({ p: after.p, c: after.c }));
await ctx.close();
fs.rmSync(dir, { recursive: true, force: true });

// ======================= PART B: fresh context journeys =======================
const browser = await launch();
const context = await browser.newContext({ ...PHONE, serviceWorkers: "allow" });
await context.addInitScript(() => { if (!localStorage.getItem("dpa.settings")) localStorage.setItem("dpa.settings", JSON.stringify({ lang: "en", country: "IN", state: "Tamil Nadu", onboarded: true })); });
page = await context.newPage();
watchConsole(page, logs);

// J6: Emergency mode in <= 2 taps from anywhere, usable one-handed
for (const from of ["#/home", "#/hazard/cyclone/before", "#/settings", "#/contacts", "#/profile"]) {
  await page.goto(U(from)); await page.waitForSelector("main > *");
  await page.tap("nav a[href='#/emergency']");
  const ok = await page.waitForSelector(".em a.btn.huge", { timeout: 3000 }).then(() => true, () => false);
  check(`J6 Emergency reachable in 1 tap from ${from}`, ok);
}
const geo = await page.$$eval(".em a.btn.huge", as => as.map(a => { const b = a.getBoundingClientRect(); return { h: b.height, w: b.width, bottom: b.bottom, tel: a.getAttribute("href") }; }));
check("J6 call buttons are huge (>=76px high, >=300px wide) with valid tel: links", geo.length >= 3 && geo.every(g => g.h >= 76 && g.w >= 300 && /^tel:\+?\d+$/.test(g.tel)), geo.map(g => g.tel + ":" + Math.round(g.h)).join(" "));
check("J6 first call button visible without scrolling (above the nav bar)", geo[0].bottom < 740 - 56);
check("J6 top-5 actions shown, each with a source link", (await page.$$eval(".em .top5 li", ls => ls.length === 5 && ls.every(l => l.querySelector("a[href^='https://']")))));

// J7 invalid inputs in the real UI
await page.goto(U("#/profile"));
await page.fill("#name", "<b>x</b><script>window.__x=1</script>"); // short enough to pass the length rule
await page.fill("#household", "3"); await page.fill("#contactName0", "<img src=x onerror=window.__x=1>"); await page.fill("#contactPhone0", "98765 43210");
await page.check("input[name=meds][value=no]"); await page.check("input[name=vehicle][value=no]");
await page.click("#save-profile"); await page.waitForSelector("#delete-data");
check("J7 <script>/<img onerror> in text fields render as inert text (no element, no execution)",
  (await page.evaluate(() => window.__x === undefined)) && (await page.$$eval("main script, main img, main b", n => n.length)) === 0 && (await page.textContent("main h3")).includes("<script>"));
await page.click("a[href='#/profile?edit=1']"); await page.waitForSelector("#save-profile");
for (const [phone, label] of [["abc", "letters"], ["12", "too short"], ["9".repeat(30), "too long"], ["98765-43210; DROP TABLE", "injection"], ["", "empty"]]) {
  await page.fill("#contactPhone0", phone);
  await page.click("#save-profile");
  const errs = await page.$$eval(".err", es => es.map(e => e.textContent).filter(Boolean).join(" | "));
  const stillForm = await page.isVisible("#save-profile");
  check(`J7 phone ${label} rejected with a message`, stillForm && /phone|name and a phone|contact/i.test(errs), errs.slice(0, 80));
}
await page.fill("#name", ""); await page.click("#save-profile");
check("J7 empty required name rejected", (await page.$$eval(".err", es => es.map(e => e.textContent).join(" "))).includes("required"));
await page.fill("#name", "x".repeat(61)); await page.click("#save-profile");
check("J7 over-long name rejected", (await page.$$eval(".err", es => es.map(e => e.textContent).join(" "))).includes("Too long"));
// first-launch form: cannot continue without a country
const c2 = await browser.newContext({ ...PHONE });
const p2 = await c2.newPage(); watchConsole(p2, logs);
await p2.goto(U("")); await p2.click("main button.btn");
check("J7 first launch: 'Continue' without a country does not proceed", await p2.isVisible("#country") && !(await p2.$("a[href='#/hazard/flood']")));
await c2.close();

// ---- language matrix: switch on every screen; tel/source unchanged; no fallback badges/missing keys
const routes = ["#/home", "#/hazard/flood/before", "#/hazard/flood/during", "#/hazard/flood/after", "#/hazard/cyclone/before", "#/hazard/cyclone/during", "#/hazard/cyclone/after", "#/contacts", "#/emergency", "#/profile", "#/settings", "#/alerts"];
const snap = () => page.evaluate(() => ({
  tel: [...document.querySelectorAll("a[href^='tel:']")].map(a => a.getAttribute("href")),
  src: [...document.querySelectorAll(".src a, a.src")].filter(a => (a.getAttribute("href") || "").startsWith("https://")).map(a => a.textContent.trim() + "|" + a.getAttribute("href")),
  nums: [...document.querySelectorAll("a[href^='tel:']")].map(a => a.textContent.replace(/[^\d+\-]/g, "")),
  fallback: [...document.querySelectorAll(".badge")].filter(b => b.textContent.trim() === "EN").length,
  ph: /\{[a-z]+\}/.test(document.getElementById("app").innerText),
  tamilChars: /[஀-௿]/.test(document.getElementById("app").innerText)
}));
await page.goto(U("#/profile")); await page.waitForSelector("#delete-data"); // a saved profile exists from J7, so tailored groups render too
let langBad = [];
for (const r of routes) {
  await page.goto(U(r)); await page.waitForSelector("main > *");
  await page.click("#langs button[lang=en]"); const en = await snap();
  await page.click("#langs button[lang=ta]"); await page.waitForTimeout(100); const ta = await snap();
  const sameTel = JSON.stringify(en.tel) === JSON.stringify(ta.tel) && JSON.stringify(en.nums) === JSON.stringify(ta.nums);
  const sameSrc = JSON.stringify(en.src) === JSON.stringify(ta.src);
  if (!sameTel || !sameSrc || ta.fallback || ta.ph || en.ph || !ta.tamilChars) langBad.push(r + JSON.stringify({ sameTel, sameSrc, fb: ta.fallback, ph: ta.ph, tam: ta.tamilChars }));
  // survive refresh
  await page.reload(); await page.waitForSelector("main > *");
  if ((await page.textContent("#title")) !== "பேரிடர் தயார்நிலை") langBad.push(r + " lang lost on refresh");
}
check("language toggle on all " + routes.length + " screens: tel numbers + source labels/URLs unchanged, no [EN] fallbacks, no raw {placeholders}, Tamil shown, persists on refresh", langBad.length === 0, langBad.join(" ; "));

// ---- sources everywhere (English)
await page.click("#langs button[lang=en]");
const missingSrc = [];
for (const r of ["#/hazard/flood/before", "#/hazard/flood/during", "#/hazard/flood/after", "#/hazard/cyclone/before", "#/hazard/cyclone/during", "#/hazard/cyclone/after"]) {
  await page.goto(U(r)); await page.waitForSelector(".item");
  const m = await page.evaluate(() => ({
    items: [...document.querySelectorAll(".item")].filter(i => !i.querySelector(".src a[href^='https://']")).length,
    cards: [...document.querySelectorAll("section.card")].filter(i => !i.querySelector(".src a[href^='https://']")).length
  }));
  if (m.items || m.cards) missingSrc.push(r + JSON.stringify(m));
}
await page.goto(U("#/contacts")); await page.waitForSelector("section.card");
const cm = await page.$$eval("section.card", cs => cs.filter(c => !c.querySelector(".src a[href^='https://']") || !(c.querySelector(".badge"))).length);
if (cm) missingSrc.push("contacts missing source/verification badge: " + cm);
check("every checklist item, safety card and contact shows a source link (+ verified/unverified badge on contacts)", missingSrc.length === 0, missingSrc.join(" ; "));
const nonIndia = await browser.newContext({ ...PHONE });
const p3 = await nonIndia.newPage(); watchConsole(p3, logs);
await p3.addInitScript(() => localStorage.setItem("dpa.settings", JSON.stringify({ lang: "en", country: "BD", state: "", onboarded: true })));
await p3.goto(U("#/contacts")); await p3.waitForSelector("main h2");
const bd = await p3.textContent("main");
check("non-India country: 'Not yet verified' + official agency link, no invented numbers", bd.includes("Not yet verified") && (await p3.$("a[href='https://ddm.gov.bd']")) !== null && (await p3.$$("a[href^='tel:']")).length === 0);
await nonIndia.close();

const real = logs.filter(m => !/Failed to load resource/.test(m));
check("no console errors/warnings across all journeys", real.length === 0, real.join(" | "));
await browser.close(); server.close(); done();
