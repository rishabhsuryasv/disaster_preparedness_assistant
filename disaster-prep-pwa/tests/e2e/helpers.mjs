// Shared helpers for end-to-end tests: static server + real Chrome via playwright-core.
import http from "node:http";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

// DPA_ROOT=dist lets the same tests run against the exact folder that gets deployed
const root = process.env.DPA_ROOT ? path.resolve(process.env.DPA_ROOT) : path.resolve(import.meta.dirname, "..", "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

// Optional `hooks(req,res)` returns true if it handled the request (used to fake /api in tests).
export function startServer(hooks) {
  const server = http.createServer((req, res) => {
    if (hooks && hooks(req, res)) return; // hooks may finish the response asynchronously
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/") p = "/index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    const type = TYPES[path.extname(file)] || "application/octet-stream";
    const headers = { "Content-Type": type, "Cache-Control": "no-cache" };
    // gzip text like Netlify does, so size/speed tests are realistic
    if (/gzip/.test(req.headers["accept-encoding"] || "") && /^text\/|json/.test(type)) {
      const body = zlib.gzipSync(fs.readFileSync(file));
      res.writeHead(200, { ...headers, "Content-Encoding": "gzip", "Content-Length": body.length });
      return res.end(body);
    }
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ server, url: "http://127.0.0.1:" + server.address().port })));
}

// Real "close the browser and reopen it": same profile directory on disk.
export async function launchPersistent(dir) {
  for (const channel of ["chrome", "msedge"]) {
    try { return await chromium.launchPersistentContext(dir, { channel, headless: true, ...PHONE, serviceWorkers: "allow" }); } catch (e) { /* try next */ }
  }
  throw new Error("No Chrome/Edge found for Playwright");
}

export async function launch() {
  for (const channel of ["chrome", "msedge"]) {
    try { return await chromium.launch({ channel, headless: true }); } catch (e) { /* try next */ }
  }
  throw new Error("No Chrome/Edge found for Playwright");
}

// Collects console errors/warnings and uncaught page errors.
export function watchConsole(page, sink) {
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") sink.push(m.type() + ": " + m.text()); });
  page.on("pageerror", e => sink.push("pageerror: " + e.message));
}

let failures = 0;
export function check(name, ok, detail) {
  console.log((ok ? "PASS " : "FAIL ") + name + (detail !== undefined ? "  -> " + detail : ""));
  if (!ok) failures++;
}
export function done() { console.log(failures ? "\n" + failures + " FAILED" : "\nALL PASSED"); process.exit(failures ? 1 : 0); }

export const PHONE = { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
