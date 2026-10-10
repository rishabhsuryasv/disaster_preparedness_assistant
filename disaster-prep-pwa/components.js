// Shared UI pieces used by several screens.
import { SOURCES } from "./data.js";
import { el, store, t, tn } from "./lib.js";

export const CHECKS_KEY = "dpa.checks";

export function srcLink(key, full) {
  const s = SOURCES[key];
  return el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer" }, full ? s.label : s.short + " ↗");
}

// Tickable checklist with progress bar; state saved in localStorage.
export function checklistBlock(items) {
  const checks = store.get(CHECKS_KEY, {});
  const bar = el("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(items.length) }, el("div", { class: "fill" }));
  const barText = el("p", { class: "src" });
  const drawProgress = () => {
    const done = items.filter(i => checks[i.id]).length;
    barText.textContent = t("progress").replace("{done}", done).replace("{total}", items.length);
    bar.setAttribute("aria-valuenow", String(done));
    bar.firstChild.style.width = Math.round((done / items.length) * 100) + "%";
  };
  const list = items.map(i => {
    const box = el("input", {
      type: "checkbox", id: "chk-" + i.id, checked: !!checks[i.id],
      onchange: e => {
        const now = store.get(CHECKS_KEY, {}); // re-read so two lists on one screen don't overwrite each other
        if (e.target.checked) now[i.id] = true; else delete now[i.id];
        store.set(CHECKS_KEY, now);
        Object.keys(checks).forEach(k => delete checks[k]); Object.assign(checks, now);
        drawProgress();
      }
    });
    return el("div", { class: "item" },
      el("label", { class: "chk", for: "chk-" + i.id }, box, el("span", {}, tn(i.text))),
      el("div", { class: "src" }, t("source") + ": ", srcLink(i.src, false)));
  });
  drawProgress();
  return el("div", {}, barText, bar, list);
}
