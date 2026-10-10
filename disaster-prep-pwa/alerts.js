// Live alerts (SACHET) + long-term hazard level (ThinkHazard), via the /api proxy.
// RULES: never blocks or slows the offline features; every failure falls back to the last saved data; 8s timeout.
import { API_BASE, ALERT_AREAS } from "./data.js";
import { el, store, settings, t } from "./lib.js";
import { loadProfile } from "./profile.js";

export const ALERTS_KEY = "dpa.alerts";
export const HAZARD_KEY = "dpa.hazard";
export const SEEN_KEY = "dpa.seen";
export const TIMEOUT_MS = 8000;
const POLL_MS = 5 * 60 * 1000;

export const alertsState = { status: "idle", error: "", hazardStatus: "idle", newCount: 0 };
const listeners = new Set();
export const onAlertsChange = fn => listeners.add(fn);
const changed = () => listeners.forEach(fn => { try { fn(); } catch (e) { console.warn("alerts listener failed", e && e.message); } });

// ---------- pure helpers (unit-tested in Node) ----------
export class AlertsError extends Error { constructor(code, msg) { super(msg || code); this.code = code; } }

export async function fetchJson(url, fetchImpl = fetch, ms = TIMEOUT_MS) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetchImpl(url, { signal: ctl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new AlertsError("http_" + res.status);
    try { return await res.json(); } catch (e) { throw new AlertsError("bad_json"); }
  } catch (e) {
    if (e instanceof AlertsError) throw e;
    throw new AlertsError(ctl.signal.aborted ? "timeout" : "network", e && e.message);
  } finally { clearTimeout(timer); }
}

const str = (v, n) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n) : "");
// Returns cleaned items; throws AlertsError("malformed") if the payload is not the expected shape.
export function cleanAlerts(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.items)) throw new AlertsError("malformed");
  const items = [];
  for (const i of payload.items) {
    if (!i || typeof i !== "object") continue;
    const id = str(i.id, 80), title = str(i.title, 600);
    if (!id || !title) continue;
    const link = typeof i.link === "string" && /^https:\/\/sachet\.ndma\.gov\.in\//.test(i.link) ? i.link : "";
    items.push({ id, title, agency: str(i.agency, 80), category: str(i.category, 30), link, pubDate: typeof i.pubDate === "string" && !Number.isNaN(Date.parse(i.pubDate)) ? i.pubDate : null });
  }
  if (payload.items.length > 0 && items.length === 0) throw new AlertsError("malformed");
  return items;
}

export function cleanHazard(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.levels)) throw new AlertsError("malformed");
  const levels = payload.levels.filter(l => l && typeof l.id === "string" && typeof l.level === "string").slice(0, 8)
    .map(l => ({ id: str(l.id, 4), type: str(l.type, 40), level: str(l.level, 30) }));
  const url = typeof payload.reportUrl === "string" && /^https:\/\/thinkhazard\.org\//.test(payload.reportUrl) ? payload.reportUrl : "";
  return { name: str(payload.name, 120), reportUrl: url, levels };
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// area = { state, district }. Returns relevant alerts, district matches first, then newest.
export function relevantAlerts(items, area) {
  const state = area && area.state;
  const district = ((area && area.district) || "").trim();
  const cfg = ALERT_AREAS[state];
  if (!state) return [];
  const names = [state, ...((cfg && cfg.names) || [])];
  const agencies = (cfg && cfg.agencies) || [];
  const nameRes = names.map(n => new RegExp("(^|[^\\p{L}])" + esc(n) + "([^\\p{L}]|$)", "iu"));
  const distRe = district ? new RegExp("(^|[^\\p{L}])" + esc(district) + "([^\\p{L}]|$)", "iu") : null;
  const out = [];
  for (const a of items) {
    let level = "";
    if (distRe && distRe.test(a.title)) level = "district";
    else if (nameRes.some(r => r.test(a.title)) || agencies.some(g => (a.agency || "").toLowerCase().includes(g.toLowerCase()))) level = "state";
    if (level) out.push({ ...a, level });
  }
  return out.sort((x, y) => (x.level === y.level ? 0 : x.level === "district" ? -1 : 1) || String(y.pubDate).localeCompare(String(x.pubDate)));
}

// ---------- state ----------
function area() { const p = loadProfile(); return { state: settings.data.state, district: (p && p.district) || "" }; }
export function cachedAlerts() { const r = store.get(ALERTS_KEY, null); return r && Array.isArray(r.items) ? r : null; }
export function cachedHazard() {
  const r = store.get(HAZARD_KEY, null);
  return r && r.data && Array.isArray(r.data.levels) ? r : null;
}
export function currentRelevant() { const c = cachedAlerts(); return c ? relevantAlerts(c.items, area()) : []; }

export function fmtTime(iso) {
  try { return new Date(iso).toLocaleString(settings.data.lang === "ta" ? "ta-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return String(iso); }
}
const fill = (s, o) => Object.entries(o).reduce((acc, [k, v]) => acc.replace("{" + k + "}", v), s);

// ---------- notifications (only while the app is open) ----------
export function notifPermission() {
  try { return typeof Notification === "undefined" ? "unsupported" : Notification.permission; } catch (e) { return "unsupported"; }
}
export async function requestNotifications() {
  if (notifPermission() === "unsupported") return "unsupported";
  try { await Notification.requestPermission(); } catch (e) { /* dismissed or blocked */ }
  changed();
  return notifPermission();
}
function notifyNew(newRel) {
  alertsState.newCount = newRel.length;
  if (notifPermission() !== "granted" || !newRel.length) return;
  try {
    new Notification(t("notifTitle"), { body: newRel[0].title.slice(0, 140) + (newRel.length > 1 ? " (+" + (newRel.length - 1) + ")" : ""), tag: "dpa-alert" });
  } catch (e) { console.warn("notification failed", e && e.message); }
}
function handleNew(items) {
  const seen = store.get(SEEN_KEY, null);
  const ids = items.map(i => i.id);
  if (!Array.isArray(seen)) { store.set(SEEN_KEY, ids.slice(0, 400)); return; } // first ever fetch: don't announce old alerts
  const fresh = relevantAlerts(items, area()).filter(a => !seen.includes(a.id));
  store.set(SEEN_KEY, [...new Set([...ids, ...seen])].slice(0, 400));
  if (fresh.length) notifyNew(fresh);
}

// ---------- fetching ----------
let inFlight = null;
export function refreshAlerts() {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    if (!navigator.onLine) { alertsState.status = "offline"; return; }
    alertsState.status = "loading"; changed();
    try {
      const items = cleanAlerts(await fetchJson(API_BASE + "/sachet"));
      // SACHET normally carries dozens of items; a sudden empty feed is more likely a glitch than "no alerts anywhere",
      // so keep the last saved data instead of wiping real alerts.
      const prev = cachedAlerts();
      if (items.length === 0 && prev && prev.items.length > 0) throw new AlertsError("empty");
      store.set(ALERTS_KEY, { savedAt: new Date().toISOString(), items });
      alertsState.status = "ok"; alertsState.error = "";
      handleNew(items);
    } catch (e) {
      alertsState.status = "error"; alertsState.error = (e && e.code) || "error"; // keep last saved data untouched
    }
  })().finally(() => { inFlight = null; changed(); });
  return inFlight;
}

let hazardFlight = null;
export function refreshHazard(force) {
  if (hazardFlight) return hazardFlight;
  const a = area();
  if (!a.state) return Promise.resolve();
  const key = a.state + "|" + a.district;
  const c = cachedHazard();
  if (!force && c && c.key === key && Date.now() - Date.parse(c.savedAt) < 6 * 3600 * 1000) return Promise.resolve();
  hazardFlight = (async () => {
    if (!navigator.onLine) return;
    try {
      const q = "?state=" + encodeURIComponent(a.state) + (a.district ? "&district=" + encodeURIComponent(a.district) : "");
      store.set(HAZARD_KEY, { key, savedAt: new Date().toISOString(), data: cleanHazard(await fetchJson(API_BASE + "/hazard" + q)) });
      alertsState.hazardStatus = "ok";
    } catch (e) { alertsState.hazardStatus = "error"; }
  })().finally(() => { hazardFlight = null; changed(); });
  return hazardFlight;
}

// Starts background refresh. Deferred so first paint and all offline features are never delayed.
let started = false;
export function startAlertPolling() {
  if (started) return; started = true;
  const run = () => { if (navigator.onLine && document.visibilityState !== "hidden") { refreshAlerts(); refreshHazard(); } };
  setTimeout(run, 800);
  setInterval(run, POLL_MS);
  window.addEventListener("online", run);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") run(); });
}

// ---------- sample (clearly labelled saved copy, for demos when feeds are down) ----------
export async function loadSample() {
  const r = await fetch("./sample-alerts.json");
  const s = await r.json();
  return { savedAt: s.savedAt, items: cleanAlerts(s), hazard: s.hazard ? cleanHazard(s.hazard) : null };
}

// ---------- UI ----------
export function statusLine() {
  const c = cachedAlerts();
  const st = alertsState.status;
  if (st === "loading") return { text: t("refreshing"), warn: false };
  if (!navigator.onLine || st === "offline") return c ? { text: fill(t("offlineSaved"), { time: fmtTime(c.savedAt) }), warn: true } : { text: t("noDataYet"), warn: true };
  if (st === "error") return c ? { text: fill(t("couldNotRefresh"), { time: fmtTime(c.savedAt) }), warn: true } : { text: t("noDataYet"), warn: true };
  return c ? { text: fill(t("lastUpdated"), { time: fmtTime(c.savedAt) }), warn: false } : { text: t("noDataYet"), warn: false };
}

export function bannerInfo() {
  const rel = currentRelevant();
  if (!rel.length) return null;
  const c = cachedAlerts();
  return { text: fill(t("alertsFor"), { n: rel.length, area: area().state }) + ": " + rel[0].title.slice(0, 120), time: c ? fmtTime(c.savedAt) : "" };
}

export function alertsHomeCard() {
  const rel = currentRelevant();
  const s = statusLine();
  return el("a", { class: "btn alt alertcard", href: "#/alerts" },
    el("span", {}, "⚠ " + t("alertsHome") + (settings.data.state && cachedAlerts() ? " (" + rel.length + ")" : "")),
    el("small", { class: s.warn ? "warnline" : "" }, s.text));
}

function alertItem(a, sample) {
  return el("div", { class: "card alertitem" + (a.level === "district" ? " mine" : "") },
    el("p", { class: "atitle" }, a.title),
    el("div", { class: "src" }, [a.agency, a.pubDate ? fmtTime(a.pubDate) : ""].filter(Boolean).join(" · ")),
    el("div", { class: "src" }, t("alertsSource") + (sample ? "" : " "), a.link && !sample ? el("a", { href: a.link, target: "_blank", rel: "noopener noreferrer" }, t("viewOfficial") + " ↗") : null));
}

function hazardCard(h, savedAt, isSample) {
  const LEVEL = { High: "levelHigh", Medium: "levelMedium", Low: "levelLow", "Very low": "levelVeryLow", "No data": "levelNoData" };
  const TYPE = { FL: "hazRiver", UF: "hazUrban", CF: "hazCoastal", CY: "hazCyclone" };
  return el("section", { class: "card" },
    el("h3", {}, t("hazardTitle")),
    h ? el("div", {},
      el("p", { class: "src" }, h.name + (savedAt ? " · " + fill(t("hazardSaved"), { time: fmtTime(savedAt) }) : "") + (isSample ? " · SAMPLE" : "")),
      h.levels.map(l => el("div", { class: "lvlrow" }, el("span", {}, TYPE[l.id] ? t(TYPE[l.id]) : l.type), el("strong", { class: "lvl lvl-" + l.level.replace(/\s/g, "").toLowerCase() }, LEVEL[l.level] ? t(LEVEL[l.level]) : l.level))),
      el("p", { class: "src" }, t("hazardNote")),
      h.reportUrl ? el("p", { class: "src" }, t("source") + ": ", el("a", { href: h.reportUrl, target: "_blank", rel: "noopener noreferrer" }, "ThinkHazard ↗")) : null)
      : el("p", {}, t("hazardUnavailable")));
}

export function viewAlerts(rerender) {
  const sampleMode = /[?&]sample=1/.test(location.hash);
  const a = area();
  const sampleRef = viewAlerts.sample; // loaded asynchronously below
  if (sampleMode && !sampleRef) {
    loadSample().then(s => { viewAlerts.sample = s; rerender(); }).catch(() => { viewAlerts.sample = { savedAt: "", items: [], hazard: null }; rerender(); });
  }
  if (!sampleMode) viewAlerts.sample = null;
  const sample = sampleMode ? viewAlerts.sample : null;
  const cache = sample || cachedAlerts();
  const items = cache ? cache.items : [];
  const rel = relevantAlerts(items, a);
  const relIds = new Set(rel.map(x => x.id));
  const others = items.filter(x => !relIds.has(x.id));
  const s = statusLine();
  const perm = notifPermission();
  const hz = sample ? (sample.hazard ? { data: sample.hazard, savedAt: sample.savedAt } : null) : cachedHazard();

  return el("div", {},
    el("h2", {}, "⚠ " + t("alertsTitle")),
    sampleMode ? el("p", { class: "card samplebanner", role: "status" }, fill(t("sampleLabel"), { time: sample && sample.savedAt ? fmtTime(sample.savedAt) : "…" })) : null,
    sampleMode ? null : el("p", { class: "statusline" + (s.warn ? " warnline" : ""), role: "status" }, s.text),
    sampleMode ? el("a", { class: "btn alt", href: "#/alerts" }, t("leaveSample"))
      : el("button", { class: "btn alt", type: "button", id: "refresh-alerts", onclick: () => refreshAlerts().then(() => refreshHazard(true)) }, alertsState.status === "loading" ? t("refreshing") : "↻ " + t("refresh")),
    el("p", { class: "card" }, t("alertsHonest")),
    // notification control
    el("div", { class: "card" },
      el("p", {}, perm === "granted" ? t("notifGranted") : perm === "denied" ? t("notifDenied") : perm === "unsupported" ? t("notifUnsupported") : t("notifDefault")),
      perm === "default" ? el("button", { class: "btn alt", type: "button", id: "enable-notif", onclick: async () => { await requestNotifications(); rerender(); } }, "🔔 " + t("notifOn")) : null),
    !a.state ? el("p", { class: "card" }, t("pickStateForAlerts"), " ", el("a", { href: "#/settings" }, t("settings"))) : null,
    a.state ? el("h3", {}, fill(t("alertsFor"), { n: rel.length, area: a.state + (a.district ? " / " + a.district : "") })) : null,
    a.state && cache && !rel.length ? el("p", {}, fill(t("noAlertsFor"), { area: a.state })) : null,
    rel.map(x => alertItem(x, !!sample)),
    others.length ? el("details", { class: "others" }, el("summary", {}, t("otherAlerts") + " (" + others.length + ")"), others.slice(0, 30).map(x => alertItem(x, !!sample))) : null,
    el("p", { class: "src" }, t("alertTextNote")),
    a.state ? hazardCard(hz && hz.data, hz && hz.savedAt, !!sample) : null,
    sampleMode ? null : el("p", { class: "src" }, el("a", { href: "#/alerts?sample=1" }, t("useSample"))),
    el("p", { class: "src" }, el("a", { href: "https://sachet.ndma.gov.in/", target: "_blank", rel: "noopener noreferrer" }, "sachet.ndma.gov.in ↗")));
}
