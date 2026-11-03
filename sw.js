// Service worker : l'appli s'ouvre même sans réseau (les données Supabase restent en ligne)
const CACHE = "stock-maison-v11";
const FICHIERS = ["./", "index.html", "css/style.css", "js/app.js", "js/store.js", "config.js",
  "manifest.webmanifest", "icons/icon-192.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Réseau d'abord pour les fichiers de l'appli (pour recevoir les mises à jour), cache en secours.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin || url.host.includes("fonts.g")) {
    e.respondWith(
      fetch(e.request).then((r) => {
        if (r.ok) { const copie = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copie)); }
        return r;
      }).catch(() => caches.match(e.request))
    );
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow("./"))));
});
