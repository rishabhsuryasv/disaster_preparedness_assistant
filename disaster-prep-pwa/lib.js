// Small helpers: safe DOM builder, storage, translation. No innerHTML anywhere (XSS-safe by construction).
import { UI } from "./data.js";

export function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith("aria-") && typeof v === "boolean") { n.setAttribute(k, String(v)); continue; }
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : String(v));
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    n.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return n;
}

// ---- storage (localStorage, never throws) ----
const mem = {};
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return key in mem ? mem[key] : fallback; }
  },
  set(key, val) {
    mem[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  },
  remove(key) { delete mem[key]; try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
};

// ---- settings ----
export const SETTINGS_KEY = "dpa.settings";
export function defaultLang() {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("ta") ? "ta" : "en";
}
export const settings = {
  data: null,
  load() {
    const s = store.get(SETTINGS_KEY, null);
    this.data = s && typeof s === "object" ? s : { lang: defaultLang(), country: "", state: "", onboarded: false };
    return this.data;
  },
  update(patch) { this.data = { ...this.data, ...patch }; store.set(SETTINGS_KEY, this.data); }
};

// ---- translation ----
// tx(obj) -> { text, fallback }. Never returns blank or a raw key.
export function tx(obj) {
  const lang = settings.data ? settings.data.lang : "en";
  if (obj && typeof obj === "object") {
    if (obj[lang]) return { text: obj[lang], fallback: false };
    if (obj.en) return { text: obj.en, fallback: lang !== "en" };
  }
  return { text: typeof obj === "string" ? obj : "", fallback: false };
}
// t("key") -> DOM-safe string; fallback marked "[EN]" visibly.
export function t(key) {
  const entry = UI[key];
  if (!entry) { console.warn("missing UI key", key); return "…"; } // never show a raw key
  const r = tx(entry);
  return r.fallback ? r.text + " [EN]" : r.text;
}
// tn(obj) -> node: text with a visible [EN] badge when falling back to English.
export function tn(obj) {
  const r = tx(obj);
  return r.fallback ? el("span", {}, r.text, " ", el("span", { class: "badge" }, "EN")) : r.text;
}
