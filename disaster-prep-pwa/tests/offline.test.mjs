// Guards the offline requirement: every file the app loads must be in the service worker precache list.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const sw = read("sw.js");
const shell = [...sw.slice(sw.indexOf("const SHELL"), sw.indexOf("];")).matchAll(/"(\.\/[^"]*)"/g)].map(m => m[1]);

test("every SHELL entry exists on disk", () => {
  for (const f of shell) {
    if (f === "./") continue;
    assert.ok(fs.existsSync(path.join(root, f)), "missing file in SHELL: " + f);
  }
});

test("every local JS import / html asset / manifest icon is precached", () => {
  const needed = new Set(["./index.html", "./manifest.json"]);
  for (const f of fs.readdirSync(root).filter(n => n.endsWith(".js") && n !== "sw.js")) {
    for (const m of read(f).matchAll(/from\s+"(\.\/[^"]+)"/g)) needed.add(m[1]);
    needed.add("./" + f);
  }
  for (const m of read("index.html").matchAll(/(?:href|src)="([^"#:]+)"/g)) needed.add("./" + m[1].replace(/^\.\//, ""));
  for (const ic of JSON.parse(read("manifest.json")).icons) needed.add("./" + ic.src);
  for (const f of needed) assert.ok(shell.includes(f), "not precached (would break offline): " + f);
});

test("sw does not cache the live-alert proxy or cross-origin requests", () => {
  assert.match(sw, /\/api\//);
  assert.match(sw, /url\.origin !== self\.location\.origin/);
});

test("manifest is installable: name, start_url, standalone, 192+512 icons that exist", () => {
  const m = JSON.parse(read("manifest.json"));
  assert.ok(m.name && m.short_name && m.start_url && m.display === "standalone");
  const sizes = m.icons.map(i => i.sizes);
  assert.ok(sizes.includes("192x192") && sizes.includes("512x512"));
  for (const i of m.icons) {
    const buf = fs.readFileSync(path.join(root, i.src));
    assert.equal(buf.subarray(1, 4).toString(), "PNG");
    const w = buf.readUInt32BE(16);
    assert.equal(`${w}x${w}`, i.sizes);
  }
});
