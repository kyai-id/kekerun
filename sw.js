/* KeKe Run — service worker (offline-first)
 * Semua berkas inti disimpan saat instalasi; permintaan berikutnya dilayani
 * dari cache lebih dulu agar tetap jalan tanpa internet.
 */
const VERSION = "keke-run-v3.0.0";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "js/art.js",
  "js/audio.js",
  "js/data.js",
  "js/fonts.js",
  "js/game.js",
  "js/models.js",
  "js/runner.js",
  "js/ui.js",
  "js/world.js",
  "vendor/three.min.js",
  "assets/css/app.css",
  "assets/img/coin.png",
  "assets/img/items/air.png",
  "assets/img/items/boneka.png",
  "assets/img/items/buku.png",
  "assets/img/items/cincinemas.png",
  "assets/img/items/eskrim.png",
  "assets/img/items/gelangemas.png",
  "assets/img/items/hp.png",
  "assets/img/items/kalungemas.png",
  "assets/img/items/kasur.png",
  "assets/img/items/kotakpensil.png",
  "assets/img/items/krayon.png",
  "assets/img/items/kursi.png",
  "assets/img/items/laptop.png",
  "assets/img/items/liburan.png",
  "assets/img/items/mainan.png",
  "assets/img/items/meja.png",
  "assets/img/items/mejabelajar.png",
  "assets/img/items/mobil.png",
  "assets/img/items/nasi.png",
  "assets/img/items/pakaian.png",
  "assets/img/items/pensil.png",
  "assets/img/items/piano.png",
  "assets/img/items/robot.png",
  "assets/img/items/rumah.png",
  "assets/img/items/sepatu.png",
  "assets/img/items/sepaturoda.png",
  "assets/img/items/sepeda.png",
  "assets/img/items/seragam.png",
  "assets/img/items/smartwatch.png",
  "assets/img/items/tablet.png",
  "assets/img/items/tas.png",
  "assets/img/items/televisi.png",
  "assets/icons/apple-touch-icon-180.png",
  "assets/icons/favicon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/audio/music-main.wav",
  "assets/audio/music-trailer.wav",
  "assets/audio/sfx-click.wav",
  "assets/audio/sfx-coin.wav",
  "assets/audio/sfx-correct.wav",
  "assets/audio/sfx-count.wav",
  "assets/audio/sfx-fall.wav",
  "assets/audio/sfx-go.wav",
  "assets/audio/sfx-jump.wav",
  "assets/audio/sfx-land.wav",
  "assets/audio/sfx-levelup.wav",
  "assets/audio/sfx-lose.wav",
  "assets/audio/sfx-whoosh.wav",
  "assets/audio/sfx-wrong.wav",
  "assets/fonts/OFL.txt",
  "assets/fonts/fredoka.woff2",
  "assets/fonts/nunito.woff2"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match("index.html");
      });
    })
  );
});
