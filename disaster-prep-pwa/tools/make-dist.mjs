// Copies ONLY the files the app needs into dist/ (no tests, node_modules, notes, tools). Netlify publishes dist/.
// The list comes straight from the service worker's precache list, so what is cached offline == what is deployed.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const shell = [...sw.slice(sw.indexOf("const SHELL"), sw.indexOf("];")).matchAll(/"\.\/([^"]+)"/g)].map(m => m[1]);
const files = [...new Set([...shell, "sw.js"])].filter(f => f !== "");

fs.rmSync(dist, { recursive: true, force: true });
for (const f of files) {
  fs.mkdirSync(path.dirname(path.join(dist, f)), { recursive: true });
  fs.copyFileSync(path.join(root, f), path.join(dist, f));
}
console.log("dist/ ready: " + files.length + " files\n  " + files.join("\n  "));
