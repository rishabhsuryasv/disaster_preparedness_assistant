import { UI, LANGS, HAZARDS, PHASES, COUNTRIES, CONTENT, SOURCES } from "./data.js";
import { el, settings, t, tn, tx } from "./lib.js";
import { srcLink, checklistBlock } from "./components.js";
import { viewProfile, personalBlock, loadProfile } from "./profile.js";
import { viewAlerts, alertsHomeCard, startAlertPolling, onAlertsChange, bannerInfo } from "./alerts.js";

const app = document.getElementById("app");
const navEl = document.getElementById("nav");
const langsEl = document.getElementById("langs");
const netEl = document.getElementById("net");

settings.load();

// ---------- chrome: language switcher, online indicator, nav ----------
function renderLangs() {
  langsEl.replaceChildren(...LANGS.map(l =>
    el("button", {
      type: "button", "aria-pressed": settings.data.lang === l.code, lang: l.code,
      onclick: () => setLang(l.code)
    }, l.label)));
}
function setLang(code) {
  settings.update({ lang: code });
  document.documentElement.lang = code;
  renderChrome();
  render(); // instant, no reload
}
let swReady = false; // true once the service worker has cached everything
function renderNet() {
  const on = navigator.onLine;
  netEl.textContent = (on ? t("online") : t("offline")) + (swReady ? " · ✓ " + t("offlineReady") : "");
  netEl.className = "net" + (on ? "" : " off");
}
window.addEventListener("online", renderNet);
window.addEventListener("offline", renderNet);

const NAV = [
  { route: "home", label: "home" },
  { route: "contacts", label: "navContacts" },
  { route: "emergency", label: "emergency", cls: "sos" },
  { route: "profile", label: "profile" },
  { route: "settings", label: "navSettings" }
];
function renderNav(current) {
  navEl.replaceChildren(...NAV.map(n =>
    el("a", { href: "#/" + n.route, class: n.cls, "aria-current": current === n.route ? "page" : null }, t(n.label))));
}
const bannerEl = document.getElementById("banner");
function renderBanner() {
  const b = bannerInfo();
  if (!b) { bannerEl.hidden = true; return; }
  bannerEl.hidden = false;
  bannerEl.textContent = "⚠ " + b.text + (b.time ? " · " + b.time : "");
}
function currentRoute() { return (location.hash.replace(/^#\/?/, "").split("?")[0] || "home").split("/")[0]; }
function renderChrome() {
  renderBanner();
  document.getElementById("title").textContent = t("appTitle");
  document.title = t("appTitle");
  renderLangs();
  renderNet();
}

// ---------- views ----------
function countrySelect(id, value, onchange) {
  return el("select", { id, onchange },
    el("option", { value: "" }, "—"),
    COUNTRIES.map(c => el("option", { value: c.code, selected: c.code === value }, tx(c.name).text)));
}
function stateSelect(countryCode, value) {
  const c = COUNTRIES.find(x => x.code === countryCode);
  const states = c ? c.states : [];
  return el("select", { id: "state", onchange: e => settings.update({ state: e.target.value }) },
    el("option", { value: "" }, t("noState")),
    states.map(s => el("option", { value: s, selected: s === value }, s)));
}

// Used both for first launch and for Settings.
function settingsForm(isFirst) {
  const draft = { country: settings.data.country, state: settings.data.state };
  const stateBox = el("div", {});
  const drawState = () => stateBox.replaceChildren(
    el("label", { for: "state" }, t("chooseState")), stateSelect(draft.country, draft.state));
  drawState();
  const cSel = countrySelect("country", draft.country, e => { draft.country = e.target.value; draft.state = ""; settings.update({ country: draft.country, state: "" }); drawState(); });
  return el("div", {},
    isFirst ? el("p", {}, t("welcome")) : null,
    el("p", { class: "src" }, t("storageNote")),
    el("label", {}, t("chooseLang")),
    el("div", { class: "tabs" }, LANGS.map(l =>
      el("button", { type: "button", "aria-selected": settings.data.lang === l.code, lang: l.code, onclick: () => setLang(l.code) }, l.label))),
    el("label", { for: "country" }, t("chooseCountry")), cSel, stateBox,
    el("button", {
      class: "btn", type: "button",
      onclick: () => {
        const st = document.getElementById("state");
        if (!draft.country) { cSel.focus(); return; }
        settings.update({ country: draft.country, state: st ? st.value : "", onboarded: true });
        if (location.hash === "#/home") render(); else location.hash = "#/home";
      }
    }, t(isFirst ? "continue" : "save")));
}

function viewHome() {
  return el("div", {},
    el("a", { class: "btn danger", href: "#/emergency" }, "🚨 " + t("emergencyMode")),
    el("h2", {}, t("chooseHazard")),
    el("div", { class: "hazards" }, HAZARDS.map(h =>
      el("a", { class: "btn alt", href: "#/hazard/" + h.id }, el("span", { class: "icon", "aria-hidden": "true" }, h.icon), t(h.name)))),
    alertsHomeCard(),
    el("a", { class: "btn alt", href: "#/contacts" }, "📞 " + t("contacts")));
}

function viewHazard(id, phase) {
  const h = HAZARDS.find(x => x.id === id);
  if (!h) return viewHome();
  const ph = PHASES.some(p => p.id === phase) ? phase : "before";
  const items = CONTENT[id].checklist[ph];
  const cards = CONTENT[id].cards.filter(c => c.phase === ph);
  const sources = [...new Set(items.map(i => i.src).concat(cards.map(c => c.src)))];
  return el("div", {},
    el("a", { href: "#/home", class: "src" }, "← " + t("back")),
    el("h2", {}, h.icon + " " + t(h.name)),
    el("div", { class: "tabs", role: "tablist" }, PHASES.map(p =>
      el("button", {
        type: "button", role: "tab", "aria-selected": p.id === ph,
        onclick: () => { location.hash = "#/hazard/" + id + "/" + p.id; }
      }, t(p.name)))),
    settings.data.lang === "ta" ? el("p", { class: "src" }, "⚠ " + t("translationNote")) : null,
    ph === "before" ? personalBlock(loadProfile()) : null,
    el("h3", {}, t("checklist")), checklistBlock(items),
    cards.length ? el("h3", {}, t("safetyCards")) : null,
    cards.map(c => el("section", { class: "card" },
      el("h3", {}, tn(c.title)),
      el("ol", {}, c.steps.map(st => el("li", {}, tn(st)))),
      el("div", { class: "src" }, t("source") + ": ", srcLink(c.src, true)))),
    el("p", { class: "src" }, t("source") + ": ", sources.map((k, i) => [i ? " · " : "", srcLink(k, true)])));
}

function contactCard(c, big) {
  const ok = c.status === "verified";
  return el("section", { class: "card" },
    el("h3", {}, tn(c.name)),
    el("a", { class: "btn" + (big ? " huge" : ""), href: "tel:" + c.tel }, "📞 " + t("call") + " " + c.number),
    el("div", { class: "src" }, t("source") + ": ", el("a", { href: c.sourceUrl, target: "_blank", rel: "noopener noreferrer" }, c.sourceLabel)),
    ok
      ? el("div", { class: "src" }, el("span", { class: "badge ok" }, t("lastVerified") + ": " + c.verified))
      : el("div", { class: "src" }, el("span", { class: "badge" }, "⚠ " + t("unverified")), " ", c.note || ""));
}

function countryOf() { return COUNTRIES.find(c => c.code === settings.data.country); }
function contactsFor(country) {
  return country.contacts.filter(c => !c.state || c.state === settings.data.state)
    .sort((a, b) => (b.state ? 1 : 0) - (a.state ? 1 : 0)); // state numbers first (stable)
}
function agencyBlock(country) {
  return el("div", { class: "card" },
    el("p", {}, t("notYetVerified")),
    el("a", { class: "btn alt", href: country.agency.url, target: "_blank", rel: "noopener noreferrer" }, country.agency.name + " ↗"));
}

function viewContacts() {
  const country = countryOf();
  if (!country) return el("div", {}, el("a", { class: "btn", href: "#/settings" }, t("chooseCountry")));
  const list = contactsFor(country);
  return el("div", {},
    el("h2", {}, t("contacts") + " - " + tx(country.name).text + (settings.data.state ? ", " + settings.data.state : "")),
    list.length ? list.map(c => contactCard(c, false)) : null,
    list.some(c => c.status === "verified") ? null : agencyBlock(country),
    list.length ? el("p", { class: "src" }, el("a", { href: country.agency.url, target: "_blank", rel: "noopener noreferrer" }, country.agency.name + " ↗")) : null);
}

function viewEmergency() {
  const hz = settings.data.hazard || "flood";
  const country = countryOf();
  const calls = country ? contactsFor(country).filter(c => c.em)
    .sort((a, b) => (b.state ? 1 : 0) - (a.state ? 1 : 0) || (a.status === "verified" ? 0 : 1) - (b.status === "verified" ? 0 : 1)) : [];
  return el("div", { class: "em" },
    el("a", { href: "#/home", class: "btn alt" }, "✕ " + t("exitEmergency")),
    el("div", { class: "tabs" }, HAZARDS.map(h =>
      el("button", { type: "button", "aria-pressed": h.id === hz, onclick: () => { settings.update({ hazard: h.id }); render(); } }, h.icon + " " + t(h.name)))),
    el("h2", {}, t("callNow")),
    calls.map(c => el("div", {},
      el("a", { class: "btn huge", href: "tel:" + c.tel }, "📞 " + c.number),
      el("div", { class: "emsub" }, tn(c.name), c.status === "verified" ? null : el("span", { class: "badge" }, " ⚠ " + t("unverified"))))),
    calls.length || !country ? null : agencyBlock(country),
    el("h2", {}, t("top5")),
    el("ol", { class: "top5" }, CONTENT[hz].top5.map(x =>
      el("li", {}, el("strong", { class: x.kind }, t(x.kind === "do" ? "do" : "dont") + ": "), tn(x.text), " ", srcLink(x.src, false)))));
}

function viewStub(key) {
  return el("div", {}, el("h2", {}, t(key)), el("p", {}, t("contentComingSoon")));
}

// ---------- router ----------
function render() {
  const [route, a, b] = (location.hash.replace(/^#\/?/, "").split("?")[0] || "home").split("/");
  if (!settings.data.onboarded && route !== "settings") {
    renderNav("");
    app.replaceChildren(el("h2", {}, t("appTitle")), settingsForm(true));
    return;
  }
  let view;
  switch (route) {
    case "hazard": view = viewHazard(a, b); break;
    case "settings": view = el("div", {}, el("h2", {}, t("settings")), settingsForm(false)); break;
    case "alerts": view = viewAlerts(render); break;
    case "contacts": view = viewContacts(); break;
    case "emergency": view = viewEmergency(); break;
    case "profile": view = viewProfile(render); break;
    default: view = viewHome();
  }
  renderNav(["hazard", "home", "alerts", ""].includes(route) ? "home" : route);
  app.replaceChildren(view);
}
window.addEventListener("hashchange", () => { render(); app.focus(); });
document.documentElement.lang = settings.data.lang;
renderChrome();
render();
// Live alerts: background only, deferred; a failure can never affect the offline features.
onAlertsChange(() => { renderBanner(); if (["home", "alerts"].includes(currentRoute())) render(); });
startAlertPolling();

// Offline support. Registration failure must never break the app.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(e => console.warn("service worker not registered:", e && e.message));
    navigator.serviceWorker.ready.then(() => { swReady = true; renderNet(); }).catch(() => {});
  });
}
