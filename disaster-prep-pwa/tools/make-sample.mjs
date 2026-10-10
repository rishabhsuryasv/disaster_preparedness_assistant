// Builds sample-alerts.json (a SAVED COPY of real data, used only for demos when live feeds are down).
// Usage: node tools/make-sample.mjs <path-to-saved-rss.xml> <savedAtISO>
// The ThinkHazard block is the real Tamil Nadu response read on 2026-10-10 ~05:56 GMT (before the site went down).
import fs from "node:fs";
import { parseSachet } from "../netlify/functions/api.mjs";
import { relevantAlerts } from "../alerts.js";

const [file, savedAt] = process.argv.slice(2);
if (!file || !savedAt) { console.error("usage: node tools/make-sample.mjs rss.xml 2026-10-10T06:15:00Z"); process.exit(1); }
const all = parseSachet(fs.readFileSync(file, "utf8"));
const tn = relevantAlerts(all, { state: "Tamil Nadu", district: "" });
const ids = new Set(tn.map(a => a.id));
const rest = all.filter(a => !ids.has(a.id)).slice(0, 25);
const out = {
  label: "SAMPLE - saved copy of real SACHET data and ThinkHazard levels. Not live. For demos only.",
  savedAt,
  source: "SACHET (NDMA) https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml",
  items: [...tn.map(({ level, ...a }) => a), ...rest],
  hazard: {
    name: "Tamil Nadu, India",
    reportUrl: "https://thinkhazard.org/en/report/1508-india-tamil-nadu",
    levels: [
      { id: "FL", type: "River flood", level: "High" },
      { id: "UF", type: "Urban flood", level: "Medium" },
      { id: "CF", type: "Coastal flood", level: "High" },
      { id: "CY", type: "Cyclone", level: "High" }
    ]
  }
};
fs.writeFileSync(new URL("../sample-alerts.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log("wrote sample-alerts.json: " + out.items.length + " items (" + tn.length + " for Tamil Nadu)");
