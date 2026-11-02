/* KeKe Run — data & konfigurasi
 * Semua angka permainan, palet, soal, dan materi belajar ada di sini.
 */
(function (root) {
  "use strict";

  var JR = root.JR = root.JR || {};

  JR.APP = {
    name: "KeKe Run",
    tagline: "Kebutuhan & Keinginan",
    version: "3.0.0",
    mapel: "IPAS",
    kelas: "Kelas 4 · Fase B",
    unit: "Kebutuhan, Keinginan, dan Uang",
    developer: "Pengembang Andika Faris",
    goal: "Kamu diharapkan mampu memahami peran uang dalam kehidupan sehari-hari, membedakan dengan tepat dan tanggap antara kebutuhan dan keinginan, serta menerapkan skala prioritas dan kebiasaan menabung untuk masa depan.",
    storageKey: "keke-run.v3",
    legacyKey: "rupiah-rush.v2"
  };

  /* ---------------------------------------------------------------- MODE */
  JR.MODES = [
    { n: 1, id: "solo", name: "Solo", desc: "1 Murid", kb: "W A D" },
    { n: 2, id: "duel", name: "Duel", desc: "2 Murid", kb: "W A D  ·  I J L" },
    { n: 3, id: "trio", name: "Trio", desc: "3 Murid", kb: "W A D  ·  I J L  ·  Panah" },
    { n: 4, id: "kuartet", name: "Kuartet", desc: "4 Murid", kb: "W A D  ·  I J L  ·  Panah  ·  Numpad" }
  ];

  /* --------------------------------------------------------- KATEGORI */
  JR.CATS = [
    {
      id: "primer", label: "PRIMER", full: "KEBUTUHAN PRIMER",
      hint: "wajib untuk hidup", color: "#25C79A", num: 1,
      items: ["nasi", "air", "pakaian", "rumah", "kasur", "buku", "pensil", "seragam", "meja", "kursi"]
    },
    {
      id: "sekunder", label: "SEKUNDER", full: "KEBUTUHAN SEKUNDER",
      hint: "biar hidup nyaman", color: "#3E9BFF", num: 2,
      items: ["mainan", "tas", "sepatu", "eskrim", "sepeda", "televisi", "krayon", "kotakpensil", "mejabelajar"]
    },
    {
      id: "tersier", label: "TERSIER", full: "KEBUTUHAN TERSIER",
      hint: "mewah, bisa ditunda", color: "#B271FF", num: 3,
      items: ["hp", "tablet", "laptop", "kalungemas", "smartwatch", "piano", "robot", "boneka", "sepaturoda", "gelangemas", "cincinemas", "mobil", "liburan"]
    }
  ];

  /* ------------------------------------------------------------- BENDA */
  JR.ITEMS = {
    nasi:        { label: "Nasi",         cat: "primer",   icon: "assets/img/items/nasi.png",        color: "#F7EBD0" },
    air:         { label: "Air Minum",    cat: "primer",   icon: "assets/img/items/air.png",         color: "#8FE0FF" },
    pakaian:     { label: "Pakaian",      cat: "primer",   icon: "assets/img/items/pakaian.png",     color: "#2FB59A" },
    rumah:       { label: "Rumah",        cat: "primer",   icon: "assets/img/items/rumah.png",       color: "#F08A5D" },
    kasur:       { label: "Kasur",        cat: "primer",   icon: "assets/img/items/kasur.png",       color: "#7FC8F8" },
    buku:        { label: "Buku",         cat: "primer",   icon: "assets/img/items/buku.png",        color: "#5A6BF0" },
    pensil:      { label: "Pensil",       cat: "primer",   icon: "assets/img/items/pensil.png",      color: "#F7B731" },
    seragam:     { label: "Seragam",      cat: "primer",   icon: "assets/img/items/seragam.png",     color: "#E8EEF7" },
    meja:        { label: "Meja",         cat: "primer",   icon: "assets/img/items/meja.png",        color: "#C68A5C" },
    kursi:       { label: "Kursi",        cat: "primer",   icon: "assets/img/items/kursi.png",       color: "#B5773F" },

    mainan:      { label: "Mainan",       cat: "sekunder", icon: "assets/img/items/mainan.png",      color: "#FF6B8A" },
    tas:         { label: "Tas",          cat: "sekunder", icon: "assets/img/items/tas.png",         color: "#8A6BF0" },
    sepatu:      { label: "Sepatu",       cat: "sekunder", icon: "assets/img/items/sepatu.png",      color: "#EF4B5E" },
    eskrim:      { label: "Es Krim",      cat: "sekunder", icon: "assets/img/items/eskrim.png",      color: "#FFB6C8" },
    sepeda:      { label: "Sepeda",       cat: "sekunder", icon: "assets/img/items/sepeda.png",      color: "#F26419" },
    televisi:    { label: "Televisi",     cat: "sekunder", icon: "assets/img/items/televisi.png",    color: "#22304A" },
    krayon:      { label: "Krayon",       cat: "sekunder", icon: "assets/img/items/krayon.png",      color: "#43C6AC" },
    kotakpensil: { label: "Kotak Pensil", cat: "sekunder", icon: "assets/img/items/kotakpensil.png", color: "#F26D9C" },
    mejabelajar: { label: "Meja Belajar", cat: "sekunder", icon: "assets/img/items/mejabelajar.png", color: "#D9A46A" },

    hp:          { label: "HP",           cat: "tersier",  icon: "assets/img/items/hp.png",          color: "#2B3A55" },
    tablet:      { label: "Tablet",       cat: "tersier",  icon: "assets/img/items/tablet.png",      color: "#3E9BFF" },
    laptop:      { label: "Laptop",       cat: "tersier",  icon: "assets/img/items/laptop.png",      color: "#9AA6B8" },
    kalungemas:  { label: "Kalung Emas",  cat: "tersier",  icon: "assets/img/items/kalungemas.png",  color: "#F2C14E" },
    smartwatch:  { label: "Smartwatch",   cat: "tersier",  icon: "assets/img/items/smartwatch.png",  color: "#4A5568" },
    piano:       { label: "Piano",        cat: "tersier",  icon: "assets/img/items/piano.png",       color: "#22304A" },
    robot:       { label: "Robot",        cat: "tersier",  icon: "assets/img/items/robot.png",       color: "#8FA3C0" },
    boneka:      { label: "Boneka",       cat: "tersier",  icon: "assets/img/items/boneka.png",      color: "#C68A5C" },
    sepaturoda:  { label: "Sepatu Roda",  cat: "tersier",  icon: "assets/img/items/sepaturoda.png",  color: "#FF7A59" },
    gelangemas:  { label: "Gelang Emas",  cat: "tersier",  icon: "assets/img/items/gelangemas.png",  color: "#F2C14E" },
    cincinemas:  { label: "Cincin Emas",  cat: "tersier",  icon: "assets/img/items/cincinemas.png",  color: "#FFD67A" },
    mobil:       { label: "Mobil",        cat: "tersier",  icon: "assets/img/items/mobil.png",       color: "#EF4B5E" },
    liburan:     { label: "Liburan",      cat: "tersier",  icon: "assets/img/items/liburan.png",     color: "#43C6AC" }
  };

  JR.ALL_ITEMS = Object.keys(JR.ITEMS);

  /* ------------------------------------------------------------- LEVEL */
  /* Level = kecepatan lari. 1 lambat, 2 sedang, 3 cepat.
     `mix` = dari tingkat mana benda pengecoh diambil:
       "far"  → tingkat yang jauh berbeda (paling mudah dibedakan)
       "near" → tingkat tetangga (primer↔sekunder, sekunder↔tersier)
       "all"  → semua tingkat + lebih rapat (paling sulit)
     `detail` = tingkat ketajaman gambar benda (makin tinggi makin konkret). */
  JR.LEVELS = [
    {
      name: "Lambat", tag: "Pasar Pagi",
      dur: 62, speed: 8.4, speedEnd: 10.2, gap: 1.3, gapEnd: 1.08, hazard: 0.16,
      mix: "far", detail: 1,
      sky: ["#8FD7FF", "#CDECFF", "#FFF1DA"], skyTop: "#5FBEF7",
      fog: "#DFF2FF", ground: "#9BE08A", ground2: "#7ED070", road: "#EFD6B0", roadEdge: "#EFB86B",
      sun: "#FFF4C2", hemi: "#DDF3FF", tile: "#EAD7B4"
    },
    {
      name: "Sedang", tag: "Kota Siang",
      dur: 56, speed: 12.0, speedEnd: 14.4, gap: 1.12, gapEnd: 0.95, hazard: 0.26,
      mix: "near", detail: 2,
      sky: ["#67C8FF", "#BFE8FF", "#E9F7FF"], skyTop: "#2FA5F0",
      fog: "#CFEBFF", ground: "#84D67E", ground2: "#6CC46B", road: "#EBD0A8", roadEdge: "#E8A961",
      sun: "#FFF6D0", hemi: "#D6EFFF", tile: "#E2CBA6"
    },
    {
      name: "Cepat", tag: "Pelabuhan Senja",
      dur: 50, speed: 15.6, speedEnd: 18.6, gap: 0.98, gapEnd: 0.84, hazard: 0.34,
      mix: "all", detail: 3,
      sky: ["#FFB36B", "#FFCB9A", "#FFE3C2"], skyTop: "#F2795A",
      fog: "#FFD9BC", ground: "#7ECB86", ground2: "#68B872", road: "#E6C79C", roadEdge: "#E59C5A",
      sun: "#FFE1A0", hemi: "#FFE2C6", tile: "#DCC09B"
    }
  ];

  /* ------------------------------------------------------ SOAL / MISI */
  /* Soal setiap Murid berganti mengikuti poin yang sudah dikumpulkan.
     Semua mulai dari PRIMER → SEKUNDER → TERSIER, lalu berulang. */
  JR.QUEST = {
    order: ["primer", "sekunder", "tersier"],
    step: 55,              // tiap 55 poin, soal naik satu tingkat
    labels: ["SOAL 1", "SOAL 2", "SOAL 3"]
  };
  JR.questAt = function (score) {
    var idx = Math.floor(Math.max(0, score) / JR.QUEST.step) % JR.QUEST.order.length;
    return JR.CATS.filter(function (c) { return c.id === JR.QUEST.order[idx]; })[0];
  };
  JR.questNo = function (score) {
    return Math.floor(Math.max(0, score) / JR.QUEST.step) + 1;
  };
  /* benda yang harus diambil untuk soal saat ini */
  JR.targetPool = function (catId, levelIdx) {
    var cat = JR.CATS.filter(function (c) { return c.id === catId; })[0] || JR.CATS[0];
    return cat.items;
  };

  /* ------------------------------------------------------------ SKOR */
  JR.SCORE = { perItem: 10, comboMax: 8, comboStep: 1, hop: 5, finish: 60, life: 25 };

  /* ---------------------------------------------------------- KARAKTER */
  /* 9 karakter: 6 lama + 3 Murid perempuan (2 berhijab, 1 tidak berhijab). */
  JR.AVATARS = [
    { id: "cap",     name: "Si Cepat",     skin: "#F3C79E", shirt: "#2FB59A", pants: "#2C3E66", shoe: "#FFFFFF", hat: "cap",     hatColor: "#1F8F79", hair: "#2B2118", pack: "#FF8A5B" },
    { id: "hijab",   name: "Si Ceria",     skin: "#E8B98C", shirt: "#F2648C", pants: "#3B4B7A", shoe: "#FFE29A", hat: "hijab",   hatColor: "#F2648C", hair: "#2B2118", pack: "#5AC8FA", skirt: true },
    { id: "beanie",  name: "Si Keren",     skin: "#C68A5C", shirt: "#F79A3E", pants: "#2C3E66", shoe: "#FFFFFF", hat: "beanie",  hatColor: "#5A6BF0", hair: "#1B1410", pack: "#2FB59A" },
    { id: "pony",    name: "Si Lincah",    skin: "#F3C79E", shirt: "#8A6BF0", pants: "#2F4A6B", shoe: "#FFD67A", hat: "pony",    hatColor: "#FF6FA5", hair: "#3A2418", pack: "#F2648C", skirt: true },
    { id: "helmet",  name: "Si Pemberani", skin: "#8D5A3B", shirt: "#3E9BFF", pants: "#24344F", shoe: "#FFFFFF", hat: "helmet",  hatColor: "#25C79A", hair: "#1B1410", pack: "#FFB03B" },
    { id: "band",    name: "Si Gesit",     skin: "#E8B98C", shirt: "#EF4B5E", pants: "#2C3E66", shoe: "#FFE29A", hat: "band",    hatColor: "#FFD67A", hair: "#241A12", pack: "#5AC8FA" },
    { id: "hijab2",  name: "Si Manis",     skin: "#F0C6A2", shirt: "#FF7AA8", pants: "#3B4B7A", shoe: "#FFE29A", hat: "hijab",   hatColor: "#FF6FA5", hair: "#241A12", pack: "#FFD67A", skirt: true, veil: "pink" },
    { id: "hijab3",  name: "Si Anggun",    skin: "#D8A276", shirt: "#3E9BFF", pants: "#2F4A6B", shoe: "#FFFFFF", hat: "hijab",   hatColor: "#2E6FE0", hair: "#1B1410", pack: "#FF8A5B", skirt: true, veil: "blue" },
    { id: "long",    name: "Si Riang",     skin: "#F3C79E", shirt: "#43C6AC", pants: "#2F4A6B", shoe: "#FFFFFF", hat: "long",    hatColor: "#7C4A2A", hair: "#7C4A2A", pack: "#FF6FA5", skirt: true }
  ];

  /* --------------------------------------------------------- MATERI (halaman depan) */
  JR.INTRO = [
    {
      kicker: "MATERI 1",
      title: "Mana kebutuhan, mana keinginan?",
      body: "Kebutuhan itu barang yang benar-benar kita perlukan. Keinginan itu barang yang membuat hidup enak, tetapi bisa ditunda. Karena uang terbatas, kebutuhan harus didahulukan.",
      chips: [["nasi", "Nasi"], ["eskrim", "Es Krim"]],
      note: "Butuh = harus ada. Ingin = enak kalau ada."
    },
    {
      kicker: "MATERI 2",
      title: "Kebutuhan punya tiga tingkat",
      tiers: [
        ["primer", "PRIMER", "Wajib. Tanpa ini hidup kita terganggu.", ["nasi", "air", "pakaian"]],
        ["sekunder", "SEKUNDER", "Bikin hidup nyaman dan makin mudah.", ["buku", "tas", "sepeda"]],
        ["tersier", "TERSIER", "Mewah. Boleh dibeli, tapi bisa ditunda.", ["mobil", "hp", "kalungemas"]]
      ],
      note: "Urutannya dari yang paling penting."
    },
    {
      kicker: "MATERI 3",
      title: "Contoh benda tiap tingkat",
      body: "Primer: nasi, air minum, pakaian, rumah, kasur, buku, pensil, seragam, meja, kursi. Sekunder: mainan, tas, sepatu, es krim, sepeda, televisi, krayon, kotak pensil, meja belajar. Tersier: HP, tablet, laptop, perhiasan emas, smartwatch, piano, robot, boneka, sepatu roda, mobil, liburan.",
      chips: [["pensil", "Pensil"], ["robot", "Robot"]],
      note: "Baca nama benda di atas gambarnya."
    },
    {
      kicker: "MATERI 4",
      title: "Uang itu apa?",
      body: "Uang adalah alat tukar (untuk membeli barang), alat simpan nilai (bisa ditabung), dan alat ukur harga (tahu mana murah, mana mahal). Karena uang terbatas, kita harus memilih.",
      chips: [["mobil", "Mahal"], ["air", "Murah"]],
      note: "Uang terbatas, jadi harus dipilih."
    },
    {
      kicker: "MATERI 5",
      title: "Contoh soal",
      body: "Kalau soalnya KEBUTUHAN PRIMER, ambil nasi, bukan mobil. Kalau soalnya TERSIER, ambil mobil, bukan nasi. Salah ambil = jatuh dan kehilangan satu nyawa.",
      chips: [["nasi", "Nasi (benar)"], ["mobil", "Mobil (salah)"]],
      note: "Soal ada di tengah layarmu dan berganti setiap poin bertambah."
    },
    {
      kicker: "MATERI 6",
      title: "Cara main",
      body: "Tiga nyawa per Murid. Lompati lubang, ambil benda yang sesuai soal, dan kumpulkan poin. Soal berganti dari primer, sekunder, ke tersier setiap 55 poin. Level 1 lambat, level 2 sedang, level 3 cepat.",
      chips: [["nasi", "+10 poin"], ["sepeda", "lompati lubang"]],
      note: "Tombol kiri, lompat, dan kanan ada di bawah kolommu."
    }
  ];

  /* -------------------------------------------------- KONTROL KEYBOARD */
  JR.KEYS = [
    { left: ["KeyA"], right: ["KeyD"], jump: ["KeyW"] },
    { left: ["KeyJ"], right: ["KeyL"], jump: ["KeyI"] },
    { left: ["ArrowLeft"], right: ["ArrowRight"], jump: ["ArrowUp"] },
    { left: ["Numpad4"], right: ["Numpad6"], jump: ["Numpad8"] }
  ];

  JR.fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
  JR.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  JR.lerp = function (a, b, t) { return a + (b - a) * t; };
  JR.rand = function (a, b) { return a + Math.random() * (b - a); };
  JR.pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };
  JR.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
})(typeof window !== "undefined" ? window : global);
