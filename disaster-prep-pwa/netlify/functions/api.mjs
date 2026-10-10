// Tiny CORS proxy + cache for two public sources the browser cannot call directly (no CORS headers):
//   GET /api/sachet                          -> parsed SACHET (NDMA) CAP-RSS feed as small JSON
//   GET /api/hazard?state=..&district=..     -> ThinkHazard flood / cyclone levels for the area
// Verified 2026-10-10: neither upstream sends Access-Control-Allow-Origin.
// Optional env (defaults are the real endpoints): SACHET_FEED_URL, THINKHAZARD_BASE.
// Netlify Functions v2 (Request -> Response). `handle` is exported so tests can call it without Netlify.

const DEFAULT_SACHET = "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml";
const DEFAULT_TH = "https://thinkhazard.org";
const MAX_ITEMS = 150;

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" };

function json(status, body, cache) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache || "no-store", ...CORS }
  });
}

class UpstreamError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// Retries only FAST failures (HTTP 404/5xx, connection errors): ThinkHazard was observed flapping 404,404,200 on
// consecutive requests (2026-10-10). A timeout is never retried, so total time stays within the function limit.
const RETRYABLE = s => s === 404 || s >= 500;
async function getText(fetchImpl, url, accept, { attempts = 3, timeout = 4000 } = {}) {
  let last;
  for (let i = 0; i < attempts; i++) {
    let res;
    try {
      res = await fetchImpl(url, { signal: AbortSignal.timeout(timeout), headers: { Accept: accept, "User-Agent": "disaster-prep-pwa-proxy/1.0" } });
    } catch (e) {
      if (e && e.name === "TimeoutError") throw new UpstreamError("upstream_timeout", String(e.message));
      last = new UpstreamError("upstream_unreachable", String(e && e.message));
      continue;
    }
    if (res.ok) return res.text();
    last = new UpstreamError("upstream_status_" + res.status, "HTTP " + res.status);
    if (!RETRYABLE(res.status)) break;
  }
  throw last;
}

// ---------- SACHET RSS ----------
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (m, g) => {
    if (g[0] === "#") {
      const cp = g[1] === "x" ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : "";
    }
    return ENTITIES[g];
  });
}
function tag(block, name) {
  const m = block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">"));
  if (!m) return "";
  let v = m[1].trim();
  const cdata = v.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  v = cdata ? cdata[1] : decodeEntities(v);
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

// Throws UpstreamError("malformed_feed") if the body is not an RSS feed (e.g. an HTML error page).
export function parseSachet(xml) {
  if (typeof xml !== "string" || !/<rss[\s>]/.test(xml) || !/<channel[\s>]/.test(xml)) throw new UpstreamError("malformed_feed", "not an RSS feed");
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || [];
  const items = [];
  for (const b of blocks.slice(0, MAX_ITEMS)) {
    const title = tag(b, "title");
    const guid = tag(b, "guid");
    const link = tag(b, "link");
    if (!title || !guid) continue; // skip broken items instead of failing the whole feed
    const author = tag(b, "author");
    const agency = (author.match(/\(([^)]+)\)/) || [])[1] || "";
    const t = Date.parse(tag(b, "pubDate"));
    items.push({
      id: guid.slice(0, 80),
      title: title.slice(0, 600),
      category: tag(b, "category").slice(0, 30),
      agency: agency.slice(0, 80),
      link: /^https:\/\/sachet\.ndma\.gov\.in\//.test(link) ? link : "",
      pubDate: Number.isNaN(t) ? null : new Date(t).toISOString()
    });
  }
  if (blocks.length > 0 && items.length === 0) throw new UpstreamError("malformed_feed", "no usable items");
  return items;
}

// ---------- ThinkHazard ----------
const WANTED = { FL: "River flood", UF: "Urban flood", CF: "Coastal flood", CY: "Cyclone" };
const SAFE_Q = /^[\p{L}\p{M}0-9 .'()-]{1,60}$/u;

export function pickDivision(list, state, district) {
  const eq = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();
  const rows = Array.isArray(list) ? list : [];
  if (district) { const d = rows.find(r => r.admin2 && eq(r.admin2, district) && (!state || eq(r.admin1, state))); if (d) return d; }
  return rows.find(r => !r.admin2 && eq(r.admin1, state)) || null;
}

async function hazard(fetchImpl, env, state, district) {
  const base = (env.THINKHAZARD_BASE || DEFAULT_TH).replace(/\/$/, "");
  const search = async q => JSON.parse(await getText(fetchImpl, base + "/en/administrativedivision?q=" + encodeURIComponent(q), "application/json")).data;
  let division = null;
  if (district) division = pickDivision(await search(district), state, district);
  if (!division) division = pickDivision(await search(state), state, "");
  if (!division) throw new UpstreamError("no_match", "area not found in ThinkHazard");
  // Only follow report links that stay on the configured ThinkHazard host (never an arbitrary URL from upstream data).
  if (!String(division.url || "").startsWith(base + "/")) throw new UpstreamError("bad_upstream_url", "unexpected report url");
  let report;
  try { report = JSON.parse(await getText(fetchImpl, division.url + ".json", "application/json")); }
  catch (e) { if (e instanceof UpstreamError) throw e; throw new UpstreamError("malformed_report", "report is not JSON"); }
  if (!Array.isArray(report)) throw new UpstreamError("malformed_report", "report is not a list");
  const levels = [];
  for (const r of report) {
    const id = r && r.hazardtype && r.hazardtype.mnemonic;
    if (WANTED[id]) levels.push({ id, type: WANTED[id], level: String((r.hazardlevel && r.hazardlevel.title) || "No data").slice(0, 30) });
  }
  return {
    source: "ThinkHazard (GFDRR)", code: division.code,
    name: [division.admin2, division.admin1, division.admin0].filter(Boolean).join(", "),
    reportUrl: division.url, levels, fetchedAt: new Date().toISOString()
  };
}

// ---------- router ----------
export async function handle(request, env = {}, fetchImpl = fetch) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "GET") return json(405, { error: "method_not_allowed" });
  try {
    if (url.pathname.endsWith("/sachet")) {
      const xml = await getText(fetchImpl, env.SACHET_FEED_URL || DEFAULT_SACHET, "application/rss+xml, application/xml, text/xml");
      const items = parseSachet(xml);
      return json(200, { source: "SACHET (NDMA)", feedUrl: env.SACHET_FEED_URL || DEFAULT_SACHET, fetchedAt: new Date().toISOString(), count: items.length, items }, "public, max-age=120, s-maxage=120");
    }
    if (url.pathname.endsWith("/hazard")) {
      const state = (url.searchParams.get("state") || "").trim();
      const district = (url.searchParams.get("district") || "").trim();
      if (!SAFE_Q.test(state) || (district && !SAFE_Q.test(district))) return json(400, { error: "bad_request", message: "state required (max 60 letters); district optional" });
      return json(200, await hazard(fetchImpl, env, state, district), "public, max-age=3600, s-maxage=86400");
    }
    return json(404, { error: "not_found" });
  } catch (e) {
    if (e instanceof UpstreamError) return json(e.code === "no_match" ? 404 : 502, { error: e.code, message: e.message });
    return json(500, { error: "internal_error" }); // never leak internals
  }
}

export default async (request) => handle(request, (typeof process !== "undefined" && process.env) || {});
export const config = { path: ["/api/sachet", "/api/hazard"] };
