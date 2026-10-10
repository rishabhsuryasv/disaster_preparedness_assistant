// Proxy tests. Fake-upstream tests use clearly synthetic data. The LIVE test hits the real SACHET and ThinkHazard.
// Run live too:  node --test tests/proxy.test.mjs   (live tests are skipped automatically if the network is unreachable)
import test from "node:test";
import assert from "node:assert/strict";
import { handle, parseSachet, decodeEntities, pickDivision } from "../netlify/functions/api.mjs";

const req = (p, method = "GET") => new Request("https://app.test" + p, { method });
const fakeFetch = (routes) => async (url) => {
  const key = Object.keys(routes).find(k => String(url).includes(k));
  if (!key) throw new Error("unexpected url " + url);
  const r = routes[key];
  if (r instanceof Error) throw r;
  return new Response(r.body, { status: r.status || 200 });
};
const rss = (items, extra = "") => `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>${extra}${items}</channel></rss>`;
const item = (id, title, author = "controlroom@ndma.gov.in (IMD Chennai)") =>
  `<item><title>${title}</title><description/><category>Met</category><link>https://sachet.ndma.gov.in/cap_public_website/FetchXMLFile?identifier=${id}</link><author>${author}</author><guid isPermaLink="false">${id}</guid><pubDate>Sat, 10 Oct 2026 05:55:57 GMT</pubDate></item>`;

test("parseSachet: normal feed, entities, CDATA, agency, link allow-list", () => {
  const items = parseSachet(rss(
    item("1", "Rain &amp; thunder over Chennai &lt;now&gt;") +
    item("2", "<![CDATA[Cyclone <b>warning</b>]]>") +
    `<item><title>x</title><link>https://evil.example/x</link><guid>3</guid></item>`));
  assert.equal(items.length, 3);
  assert.equal(items[0].title, "Rain & thunder over Chennai <now>");
  assert.equal(items[0].agency, "IMD Chennai");
  assert.equal(items[0].pubDate, "2026-10-10T05:55:57.000Z");
  assert.equal(items[1].title, "Cyclone <b>warning</b>");
  assert.equal(items[2].link, "", "non-SACHET links must be dropped");
});

test("parseSachet: empty feed is valid; malformed / HTML / non-string are errors", () => {
  assert.deepEqual(parseSachet(rss("")), []);
  for (const bad of ["<html><body>403 Forbidden</body></html>", "", "not xml at all", null, undefined, "<rss><channel>"]) {
    if (bad === "<rss><channel>") { assert.deepEqual(parseSachet(bad), []); continue; } // truncated but has rss+channel -> zero items
    assert.throws(() => parseSachet(bad), e => e.code === "malformed_feed", "should reject " + String(bad).slice(0, 20));
  }
});

test("parseSachet: broken items skipped; all-broken is an error; capped at 150; control chars stripped", () => {
  const ok = parseSachet(rss(`<item><title></title><guid>1</guid></item>` + item("2", "good\u0000\u0007 title")));
  assert.equal(ok.length, 1); assert.equal(ok[0].title, "good title");
  assert.throws(() => parseSachet(rss(`<item><title></title></item>`)), e => e.code === "malformed_feed");
  const many = parseSachet(rss(Array.from({ length: 400 }, (_, i) => item("id" + i, "t" + i)).join("")));
  assert.equal(many.length, 150);
});

test("decodeEntities handles numeric refs and rejects invalid code points", () => {
  assert.equal(decodeEntities("&#65;&#x42;&amp;&#0;&#1114112;"), "AB&");
});

test("GET /api/sachet success shape", async () => {
  const r = await handle(req("/api/sachet"), {}, fakeFetch({ "rss_india.xml": { body: rss(item("1", "Alert one")) } }));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("access-control-allow-origin"), "*");
  const b = await r.json();
  assert.equal(b.count, 1); assert.equal(b.items[0].id, "1"); assert.ok(b.fetchedAt);
});

test("SACHET failures map to 502 JSON, never a crash: 500, 403 HTML page, timeout, unreachable, malformed", async () => {
  const cases = {
    "http 500": [{ body: "boom", status: 500 }, "upstream_status_500"],
    "http 403": [{ body: "<html>no</html>", status: 403 }, "upstream_status_403"],
    "html 200": [{ body: "<html><body>Maintenance</body></html>" }, "malformed_feed"],
    "timeout": [Object.assign(new Error("t"), { name: "TimeoutError" }), "upstream_timeout"],
    "unreachable": [new Error("ECONNREFUSED"), "upstream_unreachable"]
  };
  for (const [name, [resp, code]] of Object.entries(cases)) {
    const r = await handle(req("/api/sachet"), {}, fakeFetch({ "rss_india.xml": resp }));
    assert.equal(r.status, 502, name);
    assert.equal((await r.json()).error, code, name);
  }
});

test("retry: flapping upstream (404,404,200) is absorbed; persistent 404 fails after 3 attempts; 403 and timeouts are not retried", async () => {
  const seq = list => { let n = 0; return async () => { n++; const r = list[Math.min(n - 1, list.length - 1)]; if (r instanceof Error) throw r; return new Response(r.body, { status: r.status }); }; };
  const counted = (f) => { const w = async (...a) => { w.calls++; return f(...a); }; w.calls = 0; return w; };
  let f = counted(seq([{ body: "x", status: 404 }, { body: "x", status: 404 }, { body: rss(item("1", "ok")), status: 200 }]));
  let r = await handle(req("/api/sachet"), {}, f);
  assert.equal(r.status, 200); assert.equal(f.calls, 3);
  f = counted(seq([{ body: "x", status: 404 }]));
  r = await handle(req("/api/sachet"), {}, f);
  assert.equal(r.status, 502); assert.equal(f.calls, 3);
  f = counted(seq([{ body: "no", status: 403 }]));
  r = await handle(req("/api/sachet"), {}, f); assert.equal(f.calls, 1, "403 must not be retried");
  f = counted(seq([Object.assign(new Error("t"), { name: "TimeoutError" })]));
  r = await handle(req("/api/sachet"), {}, f); assert.equal(f.calls, 1, "timeout must not be retried"); assert.equal((await r.json()).error, "upstream_timeout");
  f = counted(seq([new Error("ECONNRESET"), new Error("ECONNRESET"), { body: rss(""), status: 200 }]));
  r = await handle(req("/api/sachet"), {}, f); assert.equal(r.status, 200); assert.equal(f.calls, 3);
});

test("missing env vars -> defaults used; SACHET_FEED_URL override respected", async () => {
  let seen;
  const f = async url => { seen = String(url); return new Response(rss("")); };
  await handle(req("/api/sachet"), {}, f);
  assert.equal(seen, "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml");
  await handle(req("/api/sachet"), { SACHET_FEED_URL: "https://example.test/feed.xml" }, f);
  assert.equal(seen, "https://example.test/feed.xml");
});

test("method / path handling", async () => {
  assert.equal((await handle(req("/api/sachet", "POST"), {}, fakeFetch({}))).status, 405);
  assert.equal((await handle(req("/api/sachet", "OPTIONS"), {}, fakeFetch({}))).status, 204);
  assert.equal((await handle(req("/api/nope"), {}, fakeFetch({}))).status, 404);
});

const TH = "https://thinkhazard.org";
const thRoutes = (over = {}) => ({
  "administrativedivision?q=Chennai": { body: JSON.stringify({ data: [{ code: 70242, admin0: "India", admin1: "Tamil Nadu", admin2: "Chennai", url: TH + "/en/report/70242-india-tamil-nadu-chennai" }] }) },
  "administrativedivision?q=Tamil%20Nadu": { body: JSON.stringify({ data: [{ code: 1508, admin0: "India", admin1: "Tamil Nadu", url: TH + "/en/report/1508-india-tamil-nadu" }] }) },
  "70242-india-tamil-nadu-chennai.json": { body: JSON.stringify([{ hazardtype: { mnemonic: "FL", hazardtype: "River flood" }, hazardlevel: { mnemonic: "HIG", title: "High" } }, { hazardtype: { mnemonic: "EQ" }, hazardlevel: { title: "Medium" } }, { hazardtype: { mnemonic: "CY" }, hazardlevel: { title: "Medium" } }]) },
  "1508-india-tamil-nadu.json": { body: JSON.stringify([{ hazardtype: { mnemonic: "CY" }, hazardlevel: { title: "High" } }]) },
  ...over
});

test("GET /api/hazard: district match, state fallback, only flood+cyclone kept", async () => {
  let r = await handle(req("/api/hazard?state=Tamil%20Nadu&district=Chennai"), {}, fakeFetch(thRoutes()));
  let b = await r.json();
  assert.equal(r.status, 200); assert.equal(b.name, "Chennai, Tamil Nadu, India");
  assert.deepEqual(b.levels.map(l => l.id + ":" + l.level), ["FL:High", "CY:Medium"]);
  r = await handle(req("/api/hazard?state=Tamil%20Nadu"), {}, fakeFetch(thRoutes()));
  b = await r.json(); assert.equal(b.code, 1508); assert.deepEqual(b.levels.map(l => l.id), ["CY"]);
  // district unknown -> falls back to the state
  r = await handle(req("/api/hazard?state=Tamil%20Nadu&district=Chennai"), {}, fakeFetch(thRoutes({ "administrativedivision?q=Chennai": { body: JSON.stringify({ data: [] }) } })));
  assert.equal((await r.json()).code, 1508);
});

test("hazard: bad input 400, no match 404, upstream down/malformed 502, foreign report URL refused", async () => {
  for (const q of ["", "?state=", "?state=" + "a".repeat(61), "?state=<script>", "?state=Tamil%20Nadu&district=%3Cb%3E", "?state=a%0Ab"]) {
    assert.equal((await handle(req("/api/hazard" + q), {}, fakeFetch(thRoutes()))).status, 400, "should 400: " + q);
  }
  let r = await handle(req("/api/hazard?state=Atlantis"), {}, fakeFetch({ "administrativedivision?q=Atlantis": { body: JSON.stringify({ data: [] }) } }));
  assert.equal(r.status, 404); assert.equal((await r.json()).error, "no_match");
  r = await handle(req("/api/hazard?state=Tamil%20Nadu"), {}, fakeFetch(thRoutes({ "administrativedivision?q=Tamil%20Nadu": new Error("down") })));
  assert.equal(r.status, 502);
  r = await handle(req("/api/hazard?state=Tamil%20Nadu"), {}, fakeFetch(thRoutes({ "1508-india-tamil-nadu.json": { body: "<html>oops</html>" } })));
  assert.equal(r.status, 502); assert.equal((await r.json()).error, "malformed_report");
  r = await handle(req("/api/hazard?state=Tamil%20Nadu"), {}, fakeFetch(thRoutes({ "1508-india-tamil-nadu.json": { body: "{}" } })));
  assert.equal((await r.json()).error, "malformed_report");
  r = await handle(req("/api/hazard?state=Tamil%20Nadu"), {}, fakeFetch(thRoutes({ "administrativedivision?q=Tamil%20Nadu": { body: JSON.stringify({ data: [{ admin1: "Tamil Nadu", url: "https://evil.example/x" }] }) } })));
  assert.equal((await r.json()).error, "bad_upstream_url");
});

test("pickDivision prefers exact admin2 within the right state", () => {
  const rows = [{ admin1: "Kerala", admin2: "Chennai", code: 1 }, { admin1: "Tamil Nadu", admin2: "Chennai", code: 2 }];
  assert.equal(pickDivision(rows, "Tamil Nadu", "chennai").code, 2);
  assert.equal(pickDivision(null, "x", ""), null);
});

// ---------------- LIVE (real upstreams, real network) ----------------
const online = await fetch("https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml", { signal: AbortSignal.timeout(10000) }).then(r => r.ok, () => false);
// ThinkHazard has been observed DOWN (whole site 404 "page not found", 2026-10-10 ~06:30 GMT). Its live test is skipped, never faked.
const thUp = await fetch("https://thinkhazard.org/en/administrativedivision?q=Tamil", { signal: AbortSignal.timeout(10000) }).then(r => r.ok, () => false);

test("LIVE: real SACHET feed parses to non-empty, well-formed items", { skip: !online && "SACHET unreachable from this machine" }, async () => {
  const r = await handle(req("/api/sachet"), {});
  const b = await r.json();
  assert.equal(r.status, 200, JSON.stringify(b).slice(0, 200));
  assert.ok(b.count > 0, "feed empty");
  for (const i of b.items) { assert.ok(i.id && i.title, "bad item"); assert.ok(i.link === "" || i.link.startsWith("https://sachet.ndma.gov.in/")); }
  console.log("   live SACHET items:", b.count, "| sample:", b.items[0].title.slice(0, 60));
});

test("LIVE: real ThinkHazard Tamil Nadu + Chennai flood/cyclone levels", { skip: !thUp && "NOT TESTED: ThinkHazard is down/unreachable right now (404 or timeout)" }, async () => {
  for (const q of ["?state=Tamil%20Nadu", "?state=Tamil%20Nadu&district=Chennai"]) {
    const r = await handle(req("/api/hazard" + q), {});
    const b = await r.json();
    assert.equal(r.status, 200, JSON.stringify(b).slice(0, 200));
    assert.ok(b.levels.some(l => l.id === "CY") && b.levels.some(l => l.id === "FL"), "missing CY/FL");
    console.log("   live ThinkHazard", b.name, b.levels.map(l => l.id + "=" + l.level).join(" "));
  }
});
