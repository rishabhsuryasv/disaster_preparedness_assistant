// Reports the HTTP status of every external URL in data.js (sources, contact sources, agency sites).
// Not part of `npm test` (the network is flaky); run before the demo:  node tools/check-links.mjs
import * as data from "../data.js";

const urls = new Map();
const add = (u, why) => urls.set(u, [...(urls.get(u) || []), why]);
for (const [k, s] of Object.entries(data.SOURCES)) add(s.url, "source:" + k);
for (const c of data.COUNTRIES) { add(c.agency.url, "agency:" + c.code); for (const k of c.contacts) add(k.sourceUrl, "contact:" + k.id); }
add("https://sachet.ndma.gov.in/", "alerts-site");

let bad = 0;
for (const [u, why] of urls) {
  let status = "ERR";
  for (const method of ["HEAD", "GET"]) { // some government sites reject HEAD
    try {
      const r = await fetch(u, { method, redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 link-check" } });
      status = r.status; if (r.ok) break;
    } catch (e) { status = "ERR " + (e.cause && e.cause.code || e.name); }
  }
  const ok = typeof status === "number" && status < 400;
  if (!ok) bad++;
  console.log((ok ? "OK   " : "FAIL ") + String(status).padEnd(10) + u + "   (" + why.join(", ") + ")");
}
console.log(bad ? `\n${bad} link(s) not OK from this machine (could be bot-blocking or cert issues; verify manually)` : "\nall links OK");
