# 🛠 STORYBOARD & SPESIFIKASI TEKNIS — “KeKe Run” v3

Dokumen ini menjelaskan **bagaimana** game dibangun: alur layar, arsitektur berkas, matematika tata letak, mesin 3D, aturan permainan, pipeline aset, dan daftar periksa QA.

---

## 1. Ringkasan teknologi

| Aspek | Keputusan | Alasan |
|---|---|---|
| Render 3D | **Three.js r149 UMD** (`vendor/three.min.js`) | Bisa dimuat sebagai skrip klasik → berjalan dari `file://` |
| Jumlah renderer | **1** `WebGLRenderer` untuk seluruh layar | 4 kolom cukup satu konteks WebGL |
| Bagi layar | **Scissor + viewport** per kolom | HUD (DOM) dan 3D selalu sejajar |
| Ilustrasi benda | Digambar **prosedural di kanvas 2D** (`js/art.js`) | Tetap jalan di `file://` (tanpa gambar eksternal → kanvas tidak tercemar) |
| Benda di jalan | **Kartu 3D** (kotak tipis + gambar) yang selalu menghadap kamera, dengan papan nama `Sprite` | Gambar realistis tetap terbaca pada perspektif apa pun |
| Bayangan | Bulatan kontak, **tanpa** shadow map | 4 pemain tetap ringan |
| Properti jalan | `InstancedMesh` | Satu *draw call* per jenis properti |
| Tata letak | CSS Grid; viewport 3D diukur dari **elemen sel**, bukan kanvas | Satu sumber kebenaran ukuran |
| Ukuran huruf soal | `container-type: inline-size` + `cqw` | Soal tidak pernah pecah jadi dua baris di kolom sempit |
| Font | Fredoka & Nunito disematkan base64, didaftarkan `FontFace` | `@font-face` data URI gagal di `file://` Chromium |
| Offline | `sw.js` cache-first (69 berkas) saat di-hosting; `file://` jalan tanpa SW | Dua jalur pemakaian aman |

---

## 2. Peta berkas

```
index.html                 kerangka 9 layar
assets/css/app.css         sistem desain, logo 3D, HUD, responsif
assets/img/items/*.png     32 ilustrasi benda (hasil ekspor js/art.js)
assets/img/coin.png        koin Rp
assets/icons/*             5 ikon PWA
js/fonts.js                FontFace dari data URI
js/art.js                  32 ilustrasi + koin (kanvas 2D), tekstur 3D, ikon
js/data.js                 APP, MODES, CATS, ITEMS, LEVELS, QUEST, AVATARS, INTRO
js/audio.js                musik, efek, mute
js/models.js               avatar 3D, kartu benda, papan nama, prop, koin
js/runner.js               satu dunia per Murid (jalan, benda, lubang, kamera)
js/world.js                layoutGrid, World (scissor), Preview3D + thumbnail
js/ui.js                   HUD, layar, konfirmasi, papan skor, bantuan
js/game.js                 state machine, soal, skor, level
vendor/three.min.js        Three.js r149
sw.js / manifest.webmanifest
tools/export_items.cjs     32 PNG + coin.png + 5 ikon
tools/make_audio.py        14 WAV
tools/embed_fonts.py       js/fonts.js
tests/test-v3.cjs          uji otomatis
docs/                      GBIM, panduan guru, dokumen ini
```

Urutan muat skrip: `fonts → three → data → art → audio → models → runner → world → ui → game`.

---

## 3. Alur layar (state machine)

```
title ─┬─▶ goals (modal tujuan pembelajaran)
       ├─▶ materials (6 slide materi) ─▶ title
       ├─▶ board / help
       └─▶ setup ─▶ confirm ─▶ countdown ─▶ play ⇄ paused
                                              │
                                              ▼
                                           results ─▶ board
                                              └─▶ play (main lagi)
```

| Layar | Isi utama |
|---|---|
| **Judul** | Logo 3D “KeKe Run” (gradasi + ekstrusi + kilau bergerak), koin Rp berputar, tagline, tombol **IPAS · Kelas 4 · Fase B** (tujuan pembelajaran), **MULAI LARI**, **MATERI BELAJAR**, **PAPAN SKOR**, **CARA BERMAIN** |
| **Atur permainan** | Mode 1–4, nama Murid, 9 karakter dengan potret 3D, pratinjau karakter berputar |
| **Konfirmasi** | “N Murid Siap Berlari”, tiga kartu tingkat + contoh benda, daftar Murid, tombol Kembali / MULAI LARI |
| **Materi** | 6 slide: kebutuhan vs keinginan, tiga tingkat, daftar benda, uang, contoh soal, cara main |
| **Hitung mundur** | 3-2-1-GO besar dengan garis luar gelap |
| **Main** | HUD per kolom: nama, 3 hati, poin, **kartu soal di tengah** (label SOAL n, kategori, petunjuk, bilah kemajuan), tombol ◀ lompat ▶ |
| **Jeda** | Lanjut, Ulang, Keluar ke menu |
| **Hasil** | Peringkat, benar/salah, nyawa sisa, level tercapai, Main Lagi / Papan Skor / Menu |
| **Papan skor** | 10 skor terbaik (`localStorage keke-run.v3.scores`), reset 2 langkah |
| **Cara bermain** | 4 kartu ringkas + kredit “Pengembang Andika Faris” sejajar tombol MENGERTI |
| **Tujuan pembelajaran** | Teks capaian pembelajaran dari `JR.APP.goal` |

---

## 4. Tata letak 1–4 kolom

`JR.layoutGrid(n, w, h)` memilih grid dengan skor terbaik (sel kosong minimal, aspek 0,2–5,3):

| Pemain | Mendatar | Potret |
|---|---|---|
| 1 | 1 × 1 | 1 × 1 |
| 2 | 2 × 1 | 1 × 2 |
| 3 | 3 × 1 | 2 × 2 |
| 4 | 4 × 1 | 2 × 2 |

Setelah DOM ditata:
1. `World.measure()` membaca `getBoundingClientRect()` **setiap sel**.
2. `x = left − boardLeft`, `y = boardBottom − bottom` (koordinat GL dari bawah).
3. `renderer.setScissor(...)` + `setViewport(...)` + `camera.aspect = w/h`.

Ukuran kanvas selalu `100%` (tidak pernah ditulis dalam px) agar rotasi layar langsung diikuti.

---

## 5. Mesin satu Murid (`JR.Runner`)

**Dunia:** jalan 3 lajur (`LANE = 1.2`, `ROAD_W = 4.0`, `Z_FAR = −145`), rumput, awan, matahari dengan pendar radial (additive), properti instanced, lubang, dan kartu benda.

**Kamera:** `(0, dist × 0.52, dist)` menghadap `(0, 1.15, −9)`, FOV 56; `dist` menyesuaikan aspek agar lebar dunia 4,6 unit selalu tampak.

**Benda:** kartu `0.9 × 0.9` dengan bingkai emas, gambar di muka, dan `Sprite` papan nama 0,30 unit di atasnya.
- Kartu di-*billboard*: `rotation.y = atan2(cam.x − x, cam.z − z)` + goyangan halus.
- Papan nama memudar masuk saat benda mencapai `z ≈ −92`, sehingga benda jauh tidak memenuhi layar tetapi tetap terbaca sebelum tiba.
- Papan nama memakai `sizeAttenuation` (mengecil sesuai jarak) → perspektif nyata.

**Lubang:** cincin cokelat + bibir terang + pusat hampir hitam. Menabrak = −1 nyawa; melompat (`y > 0.45`) = +5.

**Jatuh & bangun:** `fall` (0,85 s, tubuh terbalik) → `getup` (0,45 s) → `run` + kebal 1,1 s.

**Level:** 1 Lambat (8,4→10,2), 2 Sedang (12→14,4), 3 Cepat (15,6→18,6); durasi 62/56/50 detik; palet langit/jalan berubah.

**Pengecoh per level** (`pickStock`): `far` (tingkat paling berbeda), `near` (tetangga), `all` (semua tingkat). Semakin tinggi level, semakin mirip pilihan sehingga Murid harus membaca nama benda.

---

## 6. Soal, poin, dan level

| Kejadian | Efek |
|---|---|
| Benda sesuai soal | +`10 × level` (+ kombo hingga +8) |
| Benda tidak sesuai | −1 nyawa, jatuh, kebal 1,1 s |
| Lubang ditabrak / dilompati | −1 nyawa / +5 |
| Finis | +60, +25 per nyawa sisa |
| Nyawa habis | `status = "out"`, skor tetap dihitung |

**Soal mengikuti poin**, bukan level:
```js
questAt(score) → CATS[floor(score / 55) % 3]
```
Semua mulai dari PRIMER; setiap 55 poin naik ke SEKUNDER lalu TERSIER lalu berulang. Saat soal berganti, `setMission()` mematikan benda aktif yang masih jauh (`z < −12`) agar Murid tidak dihukum karena soal berubah di tengah jalan.

---

## 7. Pipeline aset

| Aset | Sumber | Keluaran |
|---|---|---|
| 32 ilustrasi benda | `js/art.js` → `DRAW` | PNG 200 px di `assets/img/items/` |
| Koin Rp | `JR.Art.drawCoin` | `assets/img/coin.png` + tekstur 3D |
| Ikon PWA | `tools/export_items.cjs` (ubin gradien + koin) | 5 PNG di `assets/icons/` |
| Audio | `tools/make_audio.py` | 14 WAV 22.050 Hz mono |
| Font | `tools/embed_fonts.py` | `js/fonts.js` (base64) |
| Model 3D | `js/models.js` | Dibentuk saat runtime (tanpa `.glb`) |

**Tidak ada gambar eksternal yang dimuat ke WebGL.** Tekstur 3D selalu berasal dari kanvas yang digambar di halaman, sehingga aman dari larangan *tainted canvas* di `file://`. PNG di `assets/img/` dipakai oleh DOM (ikon, kartu konfirmasi, materi).

---

## 8. Offline & PWA

- **`file://`**: skrip klasik, tekstur kanvas, font data URI, audio lokal → seluruh game berjalan tanpa server. Service worker tidak didaftarkan.
- **Hosting**: `sw.js` (`VERSION = "keke-run-v3.0.0"`) menyimpan **69 entri** (HTML, CSS, 10 skrip, 32 PNG benda, coin, 5 ikon, 14 audio, 3 berkas font, manifes). Diuji: cache berisi 69 entri dan game tetap boot saat jaringan dimatikan.
- Setelah mengubah aset, tambahkan berkas baru ke `ASSETS` dan naikkan `VERSION`.

---

## 9. Daftar periksa QA

**Otomatis** (`node tests/test-v3.cjs`, 90+ pemeriksaan):
- [x] 32 benda, kategori 10/9/13, id sesuai naskah, PNG ada di disk
- [x] 9 karakter (3 hijab, 1 tanpa hijab), rig lengkap
- [x] `layoutGrid` valid untuk 10 ukuran × 4 mode
- [x] urutan soal berbasis poin, level makin cepat, `mix` berbeda
- [x] kartu benda punya gambar + label; koin 3D punya dua sisi
- [x] pengecoh level 1/2/3 sesuai aturan, ganti soal membersihkan benda jauh
- [x] lajur, lompat, jatuh–bangun, kebal, lubang, eliminasi
- [x] alur DOM penuh: judul → tujuan → materi → atur → konfirmasi → hitung mundur → main → jeda → hasil → papan skor
- [x] soal berganti di HUD setelah poin naik; skor tersimpan di kunci baru
- [x] teks yang diminta dihapus; “Pengembang Andika Faris” ada di bantuan

**Manual di Chromium (WebGL nyata):**
- [x] 1280×720 untuk 1, 3, dan 4 Murid
- [x] 780×1680 (ponsel potret 2 Murid), 390×844
- [x] `file://` dan `http://`: font, PNG, dan 3D tampil sama
- [x] offline setelah service worker aktif
- [x] tidak ada error konsol

---

## 10. Batasan yang diketahui

- Ponsel 390 px dengan **4 pemain** tetap bisa dimainkan, tetapi tiap kolom ±195 px — disarankan Solo/Duel.
- WebGL wajib aktif; tanpa akselerasi grafis, animasi berjalan lambat (waktu simulasi dibatasi 0,05 s per frame).
- Skor disimpan lokal di perangkat; menghapus data situs akan menghapus skor.
- Mode 4 pemain membutuhkan keyboard atau layar sentuh *multi-touch*.
