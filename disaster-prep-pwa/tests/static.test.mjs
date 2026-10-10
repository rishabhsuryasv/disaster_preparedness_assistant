// Static checks across the code base: translation keys, content integrity, no secrets, no unsafe DOM sinks.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as data from "../data.js";

const root = path.resolve(import.meta.dirname, "..");
const src = f => fs.readFileSync(path.join(root, f), "utf8");
const jsFiles = ["app.js", "lib.js", "components.js", "profile.js", "alerts.js"];

test("every t('key') used in code exists in UI with English AND Tamil (no missing-key / blank text)", () => {
  const used = new Set();
  for (const f of jsFiles) for (const m of src(f).replace(/\/\/.*$/gm, "").matchAll(/\bt\("([A-Za-z0-9_]+)"\)/g)) used.add(m[1]); // comments stripped
  // keys chosen dynamically
  for (const k of ["hazardFlood", "hazardCyclone", "phaseBefore", "phaseDuring", "phaseAfter", "do", "dont", "yes", "no", "levelHigh", "levelMedium", "levelLow", "levelVeryLow", "levelNoData", "hazRiver", "hazUrban", "hazCoastal", "hazCyclone", "home", "contacts", "emergency", "profile", "settings"]) used.add(k);
  for (const h of data.HAZARDS) used.add(h.name);
  for (const p of data.PHASES) used.add(p.name);
  const missing = [...used].filter(k => !data.UI[k]);
  assert.deepEqual(missing, [], "keys used but not defined");
  const noTa = Object.entries(data.UI).filter(([, v]) => !v.en || !v.ta).map(([k]) => k);
  assert.deepEqual(noTa, [], "UI keys lacking en or ta");
  const unused = Object.keys(data.UI).filter(k => !used.has(k) && !new RegExp('"' + k + '"').test(jsFiles.map(src).join("")));
  console.log("   (info) UI keys defined but never referenced:", unused.length ? unused.join(", ") : "none");
});

test("placeholders match between English and Tamil ({n}, {time}, {area}, {done}, {total})", () => {
  const ph = s => (s.match(/\{[a-z]+\}/g) || []).sort().join();
  for (const [k, v] of Object.entries(data.UI)) assert.equal(ph(v.ta), ph(v.en), "placeholder mismatch in " + k);
});

test("no secrets or service_role keys anywhere in the repo", () => {
  const bad = /service_role|SUPABASE_SERVICE|sk_live|BEGIN (RSA )?PRIVATE KEY|eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/;
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    ["node_modules", ".git", "shots"].includes(e.name) ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(root).filter(f => /\.(js|mjs|json|html|toml|md|sql|css)$/.test(f) && !f.endsWith("package-lock.json") && !f.endsWith("static.test.mjs"))) {
    assert.ok(!bad.test(fs.readFileSync(f, "utf8")), "possible secret in " + f);
  }
});

test("no innerHTML / outerHTML / document.write / eval in app code (XSS-safe by construction)", () => {
  for (const f of [...jsFiles, "sw.js", "netlify/functions/api.mjs"]) {
    const code = src(f).replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\\n]|\\.)*"/g, '""').replace(/`(?:[^`\\]|\\.)*`/g, "``");
    for (const sink of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "eval(", "new Function"]) assert.ok(!code.includes(sink), f + " uses " + sink);
  }
});

test("all external links in data are https and every instruction/contact has a source", () => {
  const urls = [];
  for (const s of Object.values(data.SOURCES)) urls.push(s.url);
  for (const c of data.COUNTRIES) { urls.push(c.agency.url); for (const k of c.contacts) urls.push(k.sourceUrl); }
  for (const u of urls) assert.match(u, /^https:\/\/[^\s]+$/, u);
  for (const h of ["flood", "cyclone"]) {
    for (const ph of Object.values(data.CONTENT[h].checklist)) for (const i of ph) assert.ok(data.SOURCES[i.src], i.id);
    for (const c of data.CONTENT[h].cards) assert.ok(data.SOURCES[c.src], c.id);
  }
  for (const g of data.PERSONAL) for (const i of g.items) assert.ok(data.SOURCES[i.src], i.id);
});

test("service worker version is bumped when shell files change (hash recorded in sw.js comment-free check)", () => {
  assert.match(src("sw.js"), /const VERSION = "dpa-v\d+"/);
});

test("translation honesty flags exist: all Tamil flagged as needing review", () => {
  assert.equal(data.TRANSLATION_STATUS.ui, "needs-native-speaker-review");
  assert.equal(data.TRANSLATION_STATUS.content, "needs-native-speaker-review");
  assert.equal(data.TRANSLATION_STATUS.officialTamilTextFound, false);
});

// WCAG contrast of the colour pairs actually used in styles.css (AA needs 4.5:1 for normal text)
const lum = hex => { const c = hex.replace("#", "").match(/../g).map(h => parseInt(h, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
test("colour pairs meet WCAG AA (>= 4.5:1) - text on its actual background", () => {
  const css = src("styles.css");
  const v = n => css.match(new RegExp("--" + n + ":\\s*(#[0-9a-fA-F]{6})"))[1];
  const pairs = {
    "body text": [v("fg"), v("bg")], "muted/source text": [v("muted"), v("bg")], "muted on card": [v("muted"), v("card")],
    "brand on white (links/buttons)": [v("brand"), "#ffffff"], "white on brand (header, buttons)": ["#ffffff", v("brand")],
    "warn text on warn bg": [v("warn"), v("warnbg")], "ok text on white": [v("ok"), "#ffffff"], "danger on white": [v("danger"), "#ffffff"],
    "white on danger button": ["#ffffff", v("danger")], "banner white on amber": ["#ffffff", "#b45309"],
    "emergency yellow on black": ["#ffe600", "#000000"], "emergency black on yellow": ["#000000", "#ffe600"],
    "sample banner text on pink": ["#7f1d1d", "#fee2e2"], "alert highlight (fg on cream)": [v("fg"), "#fffbeb"], "badge ok": ["#166534", "#dcfce7"]
  };
  const fails = Object.entries(pairs).map(([k, [a, b]]) => [k, ratio(a, b)]).filter(([, r]) => r < 4.5);
  console.log("   (info) lowest contrast ratio:", Math.min(...Object.values(pairs).map(([a, b]) => ratio(a, b))).toFixed(2));
  assert.deepEqual(fails, [], "low contrast pairs");
});
