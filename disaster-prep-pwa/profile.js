// Profile: validation (pure, testable in Node), storage, personalised items, and the screen.
import { COUNTRIES, PERSONAL } from "./data.js";
import { el, store, settings, t, tn, tx } from "./lib.js";
import { checklistBlock, CHECKS_KEY } from "./components.js";

export const PROFILE_KEY = "dpa.profile";
export const LIMITS = { name: 60, district: 60, contactName: 60, household: 30, maxContacts: 3 };

const CONTROL = /[\u0000-\u001f\u007f]/g;
export const cleanText = s => String(s == null ? "" : s).replace(CONTROL, " ").replace(/\s+/g, " ").trim();

// Returns normalised phone ("+91..." or digits) or null if invalid.
export function normalisePhone(raw) {
  const s = String(raw == null ? "" : raw).trim();
  if (!/^\+?[\d\s-]+$/.test(s)) return null;
  const digits = s.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return (s.startsWith("+") ? "+" : "") + digits;
}

// input: { name, country, state, district, household, children, elderly, disability, pets, meds, vehicle, contacts:[{name,phone}] }
// returns { ok, errors: { fieldKey: {key, n?} }, clean }
export function validateProfile(input) {
  const errors = {};
  const inp = input || {};
  const clean = {
    v: 1,
    name: cleanText(inp.name),
    country: String(inp.country || ""),
    state: cleanText(inp.state),
    district: cleanText(inp.district),
    household: Number(String(inp.household == null ? "" : inp.household).trim()),
    children: inp.children === true, elderly: inp.elderly === true, disability: inp.disability === true, pets: inp.pets === true,
    meds: inp.meds === "yes" || inp.meds === "no" ? inp.meds : "",
    vehicle: inp.vehicle === "yes" || inp.vehicle === "no" ? inp.vehicle : "",
    contacts: []
  };
  if (!clean.name) errors.name = { key: "errRequired" };
  else if (clean.name.length > LIMITS.name) errors.name = { key: "errTooLong", n: LIMITS.name };
  if (!COUNTRIES.some(c => c.code === clean.country)) errors.country = { key: "errRequired" };
  if (clean.district.length > LIMITS.district) errors.district = { key: "errTooLong", n: LIMITS.district };
  if (!Number.isInteger(clean.household) || clean.household < 1 || clean.household > LIMITS.household) errors.household = { key: "errHousehold" };
  if (!clean.meds) errors.meds = { key: "errRequired" };
  if (!clean.vehicle) errors.vehicle = { key: "errRequired" };
  const rows = Array.isArray(inp.contacts) ? inp.contacts.slice(0, LIMITS.maxContacts) : [];
  rows.forEach((r, i) => {
    const name = cleanText(r && r.name);
    const phoneRaw = String((r && r.phone) == null ? "" : r.phone).trim();
    if (!name && !phoneRaw) return;
    if (!name || !phoneRaw) { errors["contact" + i] = { key: "errPair" }; return; }
    if (name.length > LIMITS.contactName) { errors["contactName" + i] = { key: "errTooLong", n: LIMITS.contactName }; return; }
    const phone = normalisePhone(phoneRaw);
    if (!phone) { errors["contactPhone" + i] = { key: "errPhone" }; return; }
    clean.contacts.push({ name, phone });
  });
  if (!errors.contact0 && !errors.contactName0 && !errors.contactPhone0 && clean.contacts.length === 0) errors.contact0 = { key: "errContactMin" };
  return { ok: Object.keys(errors).length === 0, errors, clean };
}

export function loadProfile() {
  const p = store.get(PROFILE_KEY, null);
  return p && typeof p === "object" && p.v === 1 ? p : null;
}
export function saveProfile(clean) {
  return store.set(PROFILE_KEY, { ...clean, updated: new Date().toISOString() });
}
export function deleteLocalData() {
  store.remove(PROFILE_KEY);
  store.remove(CHECKS_KEY);
}

// Personalised items: one group per condition that applies.
export function personalGroups(p) {
  if (!p) return [];
  const on = { elderly: p.elderly, disability: p.disability, children: p.children, pets: p.pets, meds: p.meds === "yes", vehicle: p.vehicle === "yes" };
  return PERSONAL.filter(g => on[g.key]);
}
export function personalBlock(p) {
  const groups = personalGroups(p);
  if (!groups.length) return null;
  return el("div", {},
    el("h3", {}, t("forYou")),
    el("p", { class: "src" }, t("forYouHint") + " " + t("readyNote")),
    groups.map(g => el("div", { class: "card" }, el("h3", {}, tn(g.title)), checklistBlock(g.items))));
}

// ---------- screen ----------
function errText(e) { return e ? t(e.key).replace("{n}", e.n == null ? "" : e.n) : ""; }

function field(id, labelKey, input, errors) {
  const e = errors[id];
  return el("div", {}, el("label", { for: id }, t(labelKey)), input,
    el("div", { class: "err", id: "err-" + id, role: "alert" }, errText(e)));
}

function yesNo(name, labelKey, value, errors) {
  const e = errors[name];
  const radio = v => el("label", { class: "chk" }, el("input", { type: "radio", name, value: v, checked: value === v }), el("span", {}, t(v)));
  return el("fieldset", { class: "fs" }, el("legend", {}, t(labelKey)), radio("yes"), radio("no"),
    el("div", { class: "err", role: "alert" }, errText(e)));
}

export function viewProfile(rerender) {
  const saved = loadProfile();
  const params = new URLSearchParams((location.hash.split("?")[1] || ""));
  if (saved && params.get("edit") !== "1") return viewSummary(saved, rerender);
  const form = viewForm(saved, rerender);
  return !saved && params.get("deleted") === "1" ? el("div", {}, viewProfileEmpty(), form) : form;
}

function viewForm(saved, rerender) {
  const d = saved || { name: "", country: settings.data.country, state: settings.data.state, district: "", household: "", children: false, elderly: false, disability: false, pets: false, meds: "", vehicle: "", contacts: [] };
  const box = el("div", {});
  const draw = (errors, data) => {
    const v = data || d;
    const country = COUNTRIES.find(c => c.code === v.country);
    const cSel = el("select", { id: "country", onchange: e => { const cur = readForm(); cur.country = e.target.value; cur.state = ""; draw({}, cur); } },
      el("option", { value: "" }, "—"), COUNTRIES.map(c => el("option", { value: c.code, selected: c.code === v.country }, tx(c.name).text)));
    const sSel = el("select", { id: "state" }, el("option", { value: "" }, t("noState")),
      (country ? country.states : []).map(s => el("option", { value: s, selected: s === v.state }, s)));
    const who = [["children", "fChildren"], ["elderly", "fElderly"], ["disability", "fDisability"], ["pets", "fPets"]];
    const rows = [0, 1, 2].map(i => {
      const c = (v.contacts || [])[i] || { name: "", phone: "" };
      return el("div", { class: "card" },
        field("contactName" + i, "fContactName", el("input", { type: "text", id: "contactName" + i, maxlength: "120", autocomplete: "off", value: c.name }), errors),
        field("contactPhone" + i, "fContactPhone", el("input", { type: "tel", id: "contactPhone" + i, maxlength: "30", inputmode: "tel", autocomplete: "off", value: c.phone }), errors),
        el("div", { class: "err", role: "alert" }, errText(errors["contact" + i])));
    });
    // NB: native replaceChildren stringifies arrays/null, so wrap everything in el() which flattens them.
    box.replaceChildren(el("div", {},
      el("p", {}, t("profileIntro")),
      el("p", { class: "card" }, "🔒 " + t("privacyDevice")),
      field("name", "fName", el("input", { type: "text", id: "name", maxlength: "120", autocomplete: "name", value: v.name }), errors),
      field("country", "chooseCountry", cSel, errors),
      el("label", { for: "state" }, t("chooseState")), sSel,
      field("district", "fDistrict", el("input", { type: "text", id: "district", maxlength: "120", value: v.district }), errors),
      field("household", "fHousehold", el("input", { type: "number", id: "household", min: "1", max: "30", inputmode: "numeric", value: v.household }), errors),
      el("fieldset", { class: "fs" }, el("legend", {}, t("fWho")),
        who.map(([k, lk]) => el("label", { class: "chk" }, el("input", { type: "checkbox", id: "w-" + k, checked: !!v[k] }), el("span", {}, t(lk))))),
      yesNo("meds", "fMeds", v.meds, errors),
      yesNo("vehicle", "fVehicle", v.vehicle, errors),
      el("h3", {}, t("fContacts")), rows,
      Object.keys(errors).length ? el("p", { class: "err", role: "alert" }, "⚠ " + t("errFix")) : null,
      el("button", { class: "btn", type: "button", id: "save-profile", onclick: onSave }, t("save"))));
  };
  function readForm() {
    const val = id => { const n = document.getElementById(id); return n ? n.value : ""; };
    const radio = name => { const n = document.querySelector('input[name="' + name + '"]:checked'); return n ? n.value : ""; };
    return {
      name: val("name"), country: val("country"), state: val("state"), district: val("district"), household: val("household"),
      children: !!document.getElementById("w-children")?.checked, elderly: !!document.getElementById("w-elderly")?.checked,
      disability: !!document.getElementById("w-disability")?.checked, pets: !!document.getElementById("w-pets")?.checked,
      meds: radio("meds"), vehicle: radio("vehicle"),
      contacts: [0, 1, 2].map(i => ({ name: val("contactName" + i), phone: val("contactPhone" + i) }))
    };
  }
  function onSave() {
    const raw = readForm();
    const r = validateProfile(raw);
    if (!r.ok) { draw(r.errors, raw); const first = box.querySelector(".err:not(:empty)"); if (first) first.scrollIntoView({ block: "center" }); return; }
    saveProfile(r.clean);
    settings.update({ country: r.clean.country, state: r.clean.state, onboarded: true });
    location.hash = "#/profile";
    rerender();
  }
  draw({});
  return el("div", {}, el("h2", {}, t("profile")), box);
}

function viewSummary(p, rerender) {
  const country = COUNTRIES.find(c => c.code === p.country);
  const confirmBox = el("div", {});
  const askDelete = () => confirmBox.replaceChildren(el("div", { class: "card", role: "alertdialog" },
    el("p", {}, t("deleteConfirm")),
    el("button", { class: "btn danger", type: "button", id: "confirm-delete", onclick: () => { deleteLocalData(); document.dispatchEvent(new CustomEvent("dpa:deleted")); location.hash = "#/profile?deleted=1"; rerender(); } }, t("deleteYes")),
    el("button", { class: "btn alt", type: "button", onclick: () => confirmBox.replaceChildren() }, t("cancel"))));
  return el("div", {},
    el("h2", {}, t("profile")),
    el("p", { class: "src" }, "🔒 " + t("privacyDevice")),
    el("div", { class: "card" },
      el("h3", {}, p.name),
      el("p", {}, [country ? tx(country.name).text : "", p.state, p.district].filter(Boolean).join(", ")),
      el("p", {}, t("summaryHousehold") + ": " + p.household),
      el("h3", {}, t("summaryContacts")),
      p.contacts.map(c => el("a", { class: "btn alt", href: "tel:" + c.phone }, "📞 " + c.name + " · " + c.phone))),
    personalBlock(p) || el("p", {}, t("noProfileYet")),
    el("a", { class: "btn", href: "#/profile?edit=1" }, t("edit")),
    el("button", { class: "btn danger", type: "button", id: "delete-data", onclick: askDelete }, t("deleteData")),
    confirmBox);
}

export function viewProfileEmpty() {
  return el("div", {}, el("p", { class: "card", role: "status" }, t("deletedMsg")));
}
