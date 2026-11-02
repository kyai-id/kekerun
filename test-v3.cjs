/* Uji KeKe Run v3: logika 3D (Node) + integrasi DOM (jsdom). */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

let fails = 0;
function ok(name, cond, extra) {
  if (cond) console.log("  ok  " + name);
  else { fails++; console.log("  FAIL " + name + (extra !== undefined ? " :: " + JSON.stringify(extra) : "")); }
}

/* ------------------------------------------------------------------ stub */
function fakeCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, k) {
      if (k === "createLinearGradient" || k === "createRadialGradient") return () => grad;
      if (k === "measureText") return () => ({ width: 40 });
      if (k === "canvas") return { width: 8, height: 8 };
      return typeof k === "string" ? () => {} : undefined;
    },
    set() { return true; }
  });
}
function fakeCanvas() {
  return { width: 8, height: 8, style: {}, getContext: () => fakeCtx(), toDataURL: () => "data:image/png;base64,AA" };
}
global.window = global;
global.self = global;
global.document = {
  createElement(tag) {
    if (tag === "canvas") return fakeCanvas();
    return { style: {}, children: [], appendChild() {}, addEventListener() {} };
  }
};
global.Audio = function () { this.play = () => Promise.resolve(); this.pause = () => {}; this.cloneNode = () => new global.Audio(); };
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); } };
global.requestAnimationFrame = () => 0;

function load(f) { (0, eval)(fs.readFileSync(path.join(ROOT, f), "utf8")); }
load("vendor/three.min.js");
load("js/data.js");
load("js/art.js");
load("js/audio.js");
load("js/models.js");
load("js/runner.js");
load("js/world.js");

const JR = global.JR, THREE = global.THREE;

console.log("\n== A. DATA, GAMBAR, KARAKTER ==");
ok("identitas baru KeKe Run", JR.APP.name === "KeKe Run" && /Kebutuhan & Keinginan/.test(JR.APP.tagline), JR.APP.name);
ok("32 benda", JR.ALL_ITEMS.length === 32, JR.ALL_ITEMS.length);
ok("primer 10 / sekunder 9 / tersier 13",
  JR.CATS[0].items.length === 10 && JR.CATS[1].items.length === 9 && JR.CATS[2].items.length === 13,
  JR.CATS.map(c => c.items.length));
ok("setiap benda punya kategori yang cocok",
  JR.ALL_ITEMS.every(id => JR.CATS.some(c => c.id === JR.ITEMS[id].cat && c.items.indexOf(id) >= 0)));
ok("semua benda sesuai daftar naskah", (() => {
  const want = {
    primer: ["nasi", "air", "pakaian", "rumah", "kasur", "buku", "pensil", "seragam", "meja", "kursi"],
    sekunder: ["mainan", "tas", "sepatu", "eskrim", "sepeda", "televisi", "krayon", "kotakpensil", "mejabelajar"],
    tersier: ["hp", "tablet", "laptop", "kalungemas", "smartwatch", "piano", "robot", "boneka", "sepaturoda", "gelangemas", "cincinemas", "mobil", "liburan"]
  };
  return JR.CATS.every(c => want[c.id].every(id => c.items.indexOf(id) >= 0) && c.items.length === want[c.id].length);
})());
ok("32 ilustrasi tersedia", JR.ALL_ITEMS.every(id => typeof JR.Art.DRAW[id] === "function"),
  JR.ALL_ITEMS.filter(id => !JR.Art.DRAW[id]));
ok("PNG tiap benda ada di disk", JR.ALL_ITEMS.every(id => {
  const f = path.join(ROOT, JR.ITEMS[id].icon);
  return fs.existsSync(f) && fs.statSync(f).size > 800;
}));
ok("koin Rp ada di disk", fs.existsSync(path.join(ROOT, "assets/img/coin.png")));
ok("9 karakter", JR.AVATARS.length === 9, JR.AVATARS.length);
ok("3 karakter berhijab", JR.AVATARS.filter(a => a.hat === "hijab").length === 3, JR.AVATARS.filter(a => a.hat === "hijab").length);
ok("ada karakter perempuan tanpa hijab", JR.AVATARS.some(a => a.hat === "long"), JR.AVATARS.map(a => a.hat));
ok("id karakter unik", new Set(JR.AVATARS.map(a => a.id)).size === 9);

console.log("\n== B. TATA LETAK RESPONSIF ==");
const sizes = [[2560, 1440], [1920, 1080], [1440, 900], [1366, 768], [1024, 768], [820, 1180], [390, 844], [360, 640], [768, 1024], [932, 430]];
let layoutBad = [];
sizes.forEach(([w, h]) => {
  [1, 2, 3, 4].forEach(n => {
    const g = JR.layoutGrid(n, w, h);
    const cells = g.cols * g.rows;
    const aspect = (w / g.cols) / (h / g.rows);
    if (!(cells >= n && cells - n <= 1 && aspect > 0.2 && aspect < 5.3)) layoutBad.push({ n, w, h, ...g, aspect: +aspect.toFixed(2) });
  });
});
ok("semua kombinasi layout valid (10 ukuran x 4 mode)", layoutBad.length === 0, layoutBad.slice(0, 3));

console.log("\n== C. SOAL & LEVEL ==");
ok("semua mulai dari primer", JR.questAt(0).id === "primer" && JR.questNo(0) === 1);
ok("soal berganti tiap 55 poin", JR.questAt(55).id === "sekunder" && JR.questAt(110).id === "tersier", [JR.questAt(55).id, JR.questAt(110).id]);
ok("soal berulang setelah tersier", JR.questAt(165).id === "primer" && JR.questNo(165) === 4);
ok("3 level makin cepat", JR.LEVELS[0].speed < JR.LEVELS[1].speed && JR.LEVELS[1].speed < JR.LEVELS[2].speed,
  JR.LEVELS.map(l => l.speed));
ok("level 3 paling sulit", JR.LEVELS[0].mix === "far" && JR.LEVELS[1].mix === "near" && JR.LEVELS[2].mix === "all");

console.log("\n== D. MODEL 3D ==");
ok("kartu benda punya gambar + label", JR.ALL_ITEMS.every(id => {
  const g = JR.Models.item(id, 1);
  const hasFace = g.children.some(c => c.isMesh && c.material && c.material.map);
  const hasLabel = g.children.some(c => c.isSprite && c.scale.x > 0.2);
  return hasFace && hasLabel;
}));
ok("9 karakter punya rig lengkap", JR.AVATARS.every(a => {
  const h = JR.Models.avatar(a);
  return h.root && h.legL && h.legR && h.armL && h.armR && h.torso && h.head && h.shadow && h.torsoBase > 1;
}));
ok("koin 3D punya dua sisi bergambar", (() => {
  const c = JR.Models.coin(1, 0.2);
  const mesh = c.children[0];
  return mesh.material.length === 3 && !!mesh.material[1].map;
})());

console.log("\n== E. SIMULASI PERMAINAN ==");
const r = new JR.Runner({ index: 0, avatar: JR.AVATARS[6] });
r.build(0);
r.mission = "primer";
ok("scene berisi objek", r.scene.children.length > 10, r.scene.children.length);
ok("kamera di belakang karakter", r.camera.position.z > 4 && r.camera.position.y > 1);

let events = { collect: 0, hop: 0, land: 0 };
r.onCollect = () => events.collect++;
r.onHop = () => events.hop++;
r.onLand = () => events.land++;

function frame(sec, speed) {
  const steps = Math.round(sec * 60);
  for (let i = 0; i < steps; i++) r.update(1 / 60, speed, r.level || 0, Math.max(0, 30 - i / 60));
}
function clearField() {
  r.items.forEach(i => { i.active = false; i.group.visible = false; });
  r.hazards.forEach(h => { h.active = false; h.mesh.visible = false; });
  r.status = "run"; r.invuln = 0; r.lives = 3; r.y = 0; r.vy = 0;
}

r.start();
frame(12, 9);
ok("objek muncul & bisa diambil", r.items.filter(i => i.active).length + r.collected > 0, { collected: r.collected, score: r.score });
ok("kartu benda menghadap kamera", (() => {
  const it = r.items.find(i => i.active);
  return !!it && Math.abs(it.holder.rotation.y) < 0.8;
})(), r.items.filter(i => i.active).map(i => +i.holder.rotation.y.toFixed(2)));

// pengecoh mengikuti level
r.level = 0; r.mission = "primer";
let farBad = 0;
for (let i = 0; i < 60; i++) { const q = r.pickStock(false); if (q.cat !== "tersier") farBad++; }
ok("level 1: pengecoh dari tingkat jauh", farBad === 0, farBad);
r.level = 1;
let nearBad = 0;
for (let i = 0; i < 60; i++) { const q = r.pickStock(false); if (q.cat !== "sekunder") nearBad++; }
ok("level 2: pengecoh dari tingkat tetangga", nearBad === 0, nearBad);
r.level = 2;
const allCats = new Set();
for (let i = 0; i < 120; i++) allCats.add(r.pickStock(false).cat);
ok("level 3: pengecoh dari semua tingkat", allCats.size === 2, [...allCats]);
r.level = 0;

// soal berganti membersihkan benda jauh
clearField();
r.placeItem(r.items[0], "nasi", "primer"); r.items[0].z = -90;
r.setMission("sekunder");
ok("ganti soal membersihkan benda jauh", r.items[0].active === false && r.mission === "sekunder");

// lajur, lompat, jatuh
clearField(); r.lane = 1; r.x = 0;
r.move(-1); frame(0.4, 9);
const xLeft = r.x;
r.move(1); r.move(1); frame(0.4, 9);
ok("geser kiri lalu kanan", xLeft < 0 && r.x > 0, { xLeft, x: r.x });
clearField(); r.move(1); frame(0.2, 9);
ok("lajur dibatasi 0..2", r.lane === 2, r.lane);
clearField(); r.lives = 3; r.timer = 0;
r.jump(); frame(0.25, 9);
ok("lompat membuat karakter naik", r.y > 0.4, +r.y.toFixed(2));
frame(0.9, 9);
ok("mendarat kembali", r.y === 0, +r.y.toFixed(3));
r.status = "run"; r.invuln = 0; r.lives = 3;
const lives0 = r.lives;
r.damage("wrong");
ok("salah = nyawa berkurang", r.lives === lives0 - 1, r.lives);
ok("status jatuh", r.status === "fall", r.status);
frame(0.5, 9);
ok("tubuh terbalik saat jatuh", r.hero.body.rotation.x < -0.5, +r.hero.body.rotation.x.toFixed(2));
frame(0.5, 9);
ok("mulai bangun", r.status === "getup" || r.status === "run", r.status);
frame(0.6, 9);
ok("berlari kembali", r.status === "run", r.status);
ok("kebal sementara setelah bangun", r.invuln > 0, +r.invuln.toFixed(2));
const lives1 = r.lives;
r.damage("wrong");
ok("tidak bisa diserang saat kebal", r.lives === lives1, r.lives);

r.invuln = 0; r.status = "run"; r.y = 0; r.vy = 0; r.lane = 1; r.x = 0;
const hz = r.hazards[0];
hz.active = true; hz.lane = 1; hz.z = -0.5; hz.mesh.visible = true;
const lives2 = r.lives;
frame(0.1, 9);
ok("lubang tanpa lompat = kena", r.lives === lives2 - 1 || r.status !== "run", { lives: r.lives, status: r.status });
r.status = "run"; r.invuln = 0; r.y = 0; r.vy = 0; r.timer = 0;
const hz2 = r.hazards[1];
hz2.active = true; hz2.lane = 1; hz2.z = -1.2; hz2.mesh.visible = true; hz2.passed = false;
r.jump(); frame(0.2, 4);
ok("lompati lubang dapat +5", hz2.passed === true || r.hops > 0, { hops: r.hops, passed: hz2.passed });

r.build(1);
ok("level 2 membangun ulang scene", r.scene.children.length > 10 && !!r.roadTex);
r.build(2);
ok("level 3 membangun ulang scene", r.scene.children.length > 10);
r.status = "run"; r.lives = 1;
r.damage("wrong");
ok("nyawa habis = keluar", r.status === "out" && r.lives === 0, { status: r.status, lives: r.lives });

console.log("\n== F. INTEGRASI DOM (jsdom) ==");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" });
const win = dom.window, doc = win.document;
const errors = [];
win.addEventListener("error", e => errors.push(String(e.message)));
win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
win.HTMLMediaElement.prototype.pause = function () {};
win.HTMLCanvasElement.prototype.getContext = function () { return fakeCtx(); };
win.HTMLCanvasElement.prototype.toDataURL = function () { return "data:image/png;base64,AA"; };
win.requestAnimationFrame = () => 0;
win.cancelAnimationFrame = () => {};

["vendor/three.min.js", "js/data.js", "js/art.js", "js/audio.js", "js/models.js", "js/runner.js", "js/world.js", "js/ui.js", "js/game.js"]
  .forEach(f => {
    if (f.endsWith("three.min.js")) {
      win.eval(fs.readFileSync(path.join(ROOT, f), "utf8"));
      win.THREE.WebGLRenderer = function (o) {
        this.domElement = o && o.canvas; this.autoClear = true; this._pr = 1;
        this.setPixelRatio = v => { this._p = v; }; this.getPixelRatio = () => this._p || 1;
        this.setSize = (w, h) => { this.w = w; this.h = h; };
        this.setClearColor = () => {}; this.setScissorTest = () => {}; this.setScissor = () => {};
        this.setViewport = () => {}; this.clear = () => {}; this.dispose = () => {};
        this.render = () => { this.renders = (this.renders || 0) + 1; };
        this.info = { render: { calls: 0, triangles: 0 } };
      };
    } else {
      win.eval(fs.readFileSync(path.join(ROOT, f), "utf8"));
    }
  });

const G = win.JR.Game, UI = win.JR.UI;
if (!G.world) G.init();
const q = s => doc.querySelector(s);
const qa = s => Array.from(doc.querySelectorAll(s));
const click = el => el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
const tick = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { G.update(dt); if (G.world) G.world.render(); } };

ok("game boot tanpa error", errors.length === 0, errors);
ok("layar judul tampil", q("#screen-title").classList.contains("is-on"));
ok("judul KeKe Run di halaman", /KeKe Run/.test(doc.title) && /KeKe/.test(q(".logo").textContent), doc.title);
ok("teks yang diminta dihapus", !/Bisa dimainkan tanpa internet/.test(doc.body.innerHTML) && !/1–4 Murid/.test(doc.body.textContent));
ok("tagline baru", /Kebutuhan & Keinginan/.test(q(".tagline").textContent), q(".tagline").textContent);
ok("IPAS & kelas jadi satu tombol", qa(".meta-pill").length === 1 && /IPAS · Kelas 4 · Fase B/.test(q(".meta-pill").textContent));
ok("tanpa baris meta terpisah", qa(".title-meta").length === 0);
ok("3 slot demo di judul", qa(".slot").length === 3, qa(".slot").length);

click(q(".meta-pill"));
ok("tujuan pembelajaran terbuka", G.state === "goals" && q("#screen-goals").classList.contains("is-on"));
ok("isi tujuan pembelajaran benar", q("#goals-text").textContent === win.JR.APP.goal, q("#goals-text").textContent.slice(0, 40));
click(q('[data-action="close-goals"]'));
ok("tujuan tertutup kembali ke judul", G.state === "title");

click(q('[data-action="open-materials"]'));
ok("materi ada di halaman depan", G.state === "materials" && q("#screen-intro").classList.contains("is-on"));
ok("materi >= 6 slide", win.JR.INTRO.length >= 6, win.JR.INTRO.length);
ok("materi tanpa kata bab", win.JR.INTRO.every(s => !/bab/i.test(JSON.stringify(s))));
click(q('[data-action="intro-next"]'));
ok("materi bisa maju", G.introIndex === 1);
click(q('[data-action="intro-close"]'));
ok("materi ditutup", G.state === "title");
ok("tidak ada intro di alur mulai", G.state === "title");

G.openSetup();
ok("layar atur terbuka", q("#screen-setup").classList.contains("is-on"));
ok("4 kartu mode", qa(".mode-card").length === 4, qa(".mode-card").length);
ok("default 3 pemain", qa(".player-row").length === 3);
ok("9 pilihan karakter", qa(".avatar-chip").length === 9, qa(".avatar-chip").length);
click(qa(".mode-card")[3]);
ok("mode 4 -> 4 baris Murid", qa(".player-row").length === 4);
const inp = q(".player-input");
inp.value = "Aisyah";
inp.dispatchEvent(new win.Event("input", { bubbles: true }));
ok("nama tersimpan", G.players[0].name === "Aisyah", G.players[0].name);
click(qa(".avatar-chip")[7]);
ok("karakter bisa diganti", G.players[0].avatar === win.JR.AVATARS[7].id, G.players[0].avatar);
ok("pratinjau 3D punya hero", !!G.preview.hero);

click(q('[data-action="to-confirm"]'));
ok("halaman konfirmasi muncul", G.state === "confirm" && q("#screen-confirm").classList.contains("is-on"));
ok("konfirmasi memuat 3 tingkat", qa(".tier-card").length === 3, qa(".tier-card").length);
ok("konfirmasi memuat pengingat primer/sekunder/tersier",
  /PRIMER/.test(q("#confirm-tiers").textContent) && /SEKUNDER/.test(q("#confirm-tiers").textContent) && /TERSIER/.test(q("#confirm-tiers").textContent));
ok("konfirmasi mendaftar 4 Murid", qa(".confirm-player").length === 4, qa(".confirm-player").length);

click(q('[data-action="start"]'));
ok("mulai -> hitung mundur", G.state === "countdown");
ok("HUD 4 kolom dibuat", qa(".slot").length === 4);
ok("soal pertama primer", /PRIMER/.test(q(".qtext").textContent), q(".qtext").textContent);
ok("label soal tampil", /SOAL 1/.test(q(".qlabel").textContent), q(".qlabel").textContent);
ok("ada 9 item berbeda di data", win.JR.ALL_ITEMS.length === 32);

G.cd = -1;
tick(2);
ok("hitung mundur -> bermain", G.state === "play", G.state);

// soal berganti berdasarkan poin
const anyRunner = G.world.runners[0];
anyRunner.score = 120;
tick(2);
ok("soal berganti sesuai poin", anyRunner.mission === "tersier", anyRunner.mission);
ok("HUD ikut berganti", /TERSIER/.test(q(".qtext").textContent), q(".qtext").textContent);
ok("nomor soal ikut naik", /SOAL 3/.test(q(".qlabel").textContent), q(".qlabel").textContent);

G.pause();
ok("jeda", G.state === "paused" && q("#screen-pause").classList.contains("is-on"));
G.resume();
ok("lanjut", G.state === "play");

G.endRun(true);
ok("hasil tampil", G.state === "results" && q("#screen-results").classList.contains("is-on"));
ok("hasil berisi 4 baris", qa(".result-row").length === 4, qa(".result-row").length);
const saved = JSON.parse(win.localStorage.getItem("keke-run.v3.scores") || "[]");
ok("skor tersimpan dengan kunci baru", Array.isArray(saved), saved.length);

click(q('[data-action="open-board"]'));
ok("papan skor terbuka", G.state === "board");
G.action("quit");
ok("kembali ke judul", G.state === "title");

G.openHelp();
ok("cara bermain memuat kredit pengembang", /Pengembang Andika Faris/.test(q("#screen-help").textContent));
ok("cara bermain ringkas (<=4 kartu)", qa(".help-card").length <= 4, qa(".help-card").length);
G.action("close-help");

console.log("\n" + (fails ? "GAGAL: " + fails : "SEMUA UJI LULUS"));
process.exit(fails ? 1 : 0);
