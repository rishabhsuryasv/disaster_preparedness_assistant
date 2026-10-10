import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { relevantAlerts, cleanAlerts, cleanHazard, fetchJson, AlertsError, TIMEOUT_MS } from "../alerts.js";

const sample = JSON.parse(fs.readFileSync(new URL("../sample-alerts.json", import.meta.url), "utf8"));
const A = (id, title, agency = "") => ({ id, title, agency, category: "Met", link: "", pubDate: "2026-10-10T05:00:00.000Z" });

test("timeout constant is the specified ~8s", () => assert.equal(TIMEOUT_MS, 8000));

test("relevance on REAL saved feed: Tamil Nadu districts are found; other states' alerts are not", () => {
  const tn = relevantAlerts(sample.items, { state: "Tamil Nadu", district: "" });
  assert.ok(tn.length >= 5, "expected several TN alerts in the saved real feed, got " + tn.length);
  assert.ok(tn.some(a => /Cuddalore/.test(a.title)), "the Cuddalore/Nagapattinam alert must be matched by district name");
  assert.ok(!tn.some(a => /Sahibganj|Bikaner/.test(a.title)), "Jharkhand/Rajasthan alerts must not match Tamil Nadu");
});

test("district match ranks first; unknown state yields nothing; word boundaries respected", () => {
  const items = [A("1", "Heavy rain over Salem and Erode"), A("2", "Rain over Cuddalore"), A("3", "Salamander festival in Salemba")];
  const r = relevantAlerts(items, { state: "Tamil Nadu", district: "Cuddalore" });
  assert.deepEqual(r.map(x => x.id + ":" + x.level), ["2:district", "1:state"]);
  assert.deepEqual(relevantAlerts(items, { state: "", district: "" }), []);
  assert.equal(relevantAlerts([A("9", "Salemba news")], { state: "Tamil Nadu", district: "" }).length, 0, "'Salemba' must not match 'Salem'");
});

test("agency match: IMD Chennai alert with no place names still matches Tamil Nadu", () => {
  const r = relevantAlerts([A("1", "Gusty winds likely", "IMD Chennai"), A("2", "Gusty winds likely", "IMD Patna")], { state: "Tamil Nadu", district: "" });
  assert.deepEqual(r.map(x => x.id), ["1"]);
});

test("regex-special characters in a user district cannot break or hijack matching", () => {
  assert.doesNotThrow(() => relevantAlerts([A("1", "rain")], { state: "Tamil Nadu", district: ".*(" }));
  assert.equal(relevantAlerts([A("1", "rain over Chennai")], { state: "Kerala", district: ".*" }).length, 0);
});

test("cleanAlerts: valid, malformed shapes, partial junk, link allow-list, empty list ok", () => {
  assert.deepEqual(cleanAlerts({ items: [] }), []);
  for (const bad of [null, undefined, "x", 5, {}, { items: "no" }, { items: [null, 1, {}] }, { items: [{ id: "", title: "t" }] }]) {
    assert.throws(() => cleanAlerts(bad), e => e instanceof AlertsError && e.code === "malformed", "should reject " + JSON.stringify(bad));
  }
  const r = cleanAlerts({ items: [{ id: "1", title: "ok\u0000", link: "javascript:alert(1)" }, null, { id: "2", title: "t2", link: "https://sachet.ndma.gov.in/x", pubDate: "garbage" }] });
  assert.equal(r.length, 2); assert.equal(r[0].link, "", "javascript: link must be dropped"); assert.equal(r[0].title, "ok");
  assert.equal(r[1].link, "https://sachet.ndma.gov.in/x"); assert.equal(r[1].pubDate, null);
});

test("cleanHazard: shape check, report URL allow-list", () => {
  assert.throws(() => cleanHazard({}), e => e.code === "malformed");
  assert.throws(() => cleanHazard(null), e => e.code === "malformed");
  const h = cleanHazard({ name: "TN", reportUrl: "https://evil.example/x", levels: [{ id: "CY", type: "Cyclone", level: "High" }, { id: 5 }] });
  assert.equal(h.reportUrl, ""); assert.equal(h.levels.length, 1);
});

test("fetchJson: success, http error, bad JSON, network error, and TIMEOUT (hanging server aborted)", async () => {
  const ok = async () => new Response(JSON.stringify({ a: 1 }), { status: 200 });
  assert.deepEqual(await fetchJson("x", ok, 100), { a: 1 });
  await assert.rejects(fetchJson("x", async () => new Response("no", { status: 503 }), 100), e => e.code === "http_503");
  await assert.rejects(fetchJson("x", async () => new Response("<html>", { status: 200 }), 100), e => e.code === "bad_json");
  await assert.rejects(fetchJson("x", async () => { throw new TypeError("fetch failed"); }, 100), e => e.code === "network");
  const hang = (url, { signal }) => new Promise((_, rej) => signal.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))));
  const t0 = Date.now();
  await assert.rejects(fetchJson("x", hang, 60), e => e.code === "timeout");
  assert.ok(Date.now() - t0 < 1000, "must abort promptly");
});
