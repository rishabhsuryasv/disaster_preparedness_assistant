// Service worker: precache the whole app shell + content so everything works offline after one visit.
// BUMP `VERSION` whenever any file below changes (a changed sw.js is what triggers the update).
const VERSION = "dpa-v2";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./lib.js",
  "./data.js",
  "./components.js",
  "./profile.js",
  "./alerts.js",
  "./sample-alerts.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("dpa-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // external sites: network only
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/.netlify/")) return; // live alerts proxy: never cached here
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      if (req.mode === "navigate") return caches.match("./index.html"); // hash-routed single page
      return fetch(req);
    })
  );
});
