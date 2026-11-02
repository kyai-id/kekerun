# 🏃 KeKe Run — Kebutuhan & Keinginan

Game lari **3D** untuk **IPAS Kelas IV (Fase B)**. Murid berlari di kolomnya sendiri, membaca **soal di tengah layar**, lalu mengambil benda yang tepat: **kebutuhan primer, sekunder, atau tersier**. Salah ambil atau kena lubang = nyawa berkurang.

- **1–4 Murid** dalam satu layar (Solo · Duel · Trio · Kuartet)
- **3 level** makin cepat, **3 nyawa**, jatuh lalu bangun kembali
- **32 benda** bergambar dengan papan nama 3D di atasnya
- **9 karakter** 3D (3 di antaranya perempuan, 2 berhijab)
- Bisa dimainkan **tanpa internet** (buka `index.html`) atau di-hosting

---

## Cara memainkan

1. **MULAI LARI** → pilih mode (1–4 Murid) → tulis nama → pilih karakter.
2. **LANJUT** → halaman konfirmasi berisi pengingat tiga tingkat kebutuhan → **MULAI LARI**.
3. Hitung mundur, lalu ambil benda sesuai soal. Soal berganti setiap **55 poin**.

Materi belajar ada di **halaman depan** (tombol *MATERI BELAJAR*), bukan di tengah alur permainan.

### Kontrol

| Murid | Kiri | Kanan | Lompat |
|---|---|---|---|
| 1 | `A` | `D` | `W` |
| 2 | `J` | `L` | `I` |
| 3 | `←` | `→` | `↑` |
| 4 | Numpad `4` | Numpad `6` | Numpad `8` |

Di tablet/HP setiap kolom punya tombol **◀ · lompat · ▶** sendiri. `P` / `Esc` = jeda.

### Aturan & poin

| Kejadian | Efek |
|---|---|
| Benda sesuai soal | +10 × level (+ bonus kombo) |
| Lompati lubang | +5 |
| Benda salah / kena lubang | −1 nyawa, karakter jatuh lalu bangun (kebal 1,1 detik) |
| Sampai finis | +60, lalu +25 per nyawa sisa |
| Nyawa habis | lari Murid itu berhenti, poin tetap dihitung |

**Soal berganti mengikuti poin:** PRIMER → SEKUNDER → TERSIER → PRIMER, berulang. Semua Murid mulai dari soal primer.

**Level = kecepatan:** level 1 lambat, level 2 sedang, level 3 cepat. Makin tinggi level, makin “konkret” pula pilihan bendanya: pengecoh diambil dari tingkat yang mirip (level 3 mencampur semua tingkat) sehingga Murid harus benar-benar membaca nama bendanya.

---

## 32 benda

| Tingkat | Benda |
|---|---|
| **Primer** (10) | Nasi, Air Minum, Pakaian, Rumah, Kasur, Buku, Pensil, Seragam, Meja, Kursi |
| **Sekunder** (9) | Mainan, Tas, Sepatu, Es Krim, Sepeda, Televisi, Krayon, Kotak Pensil, Meja Belajar |
| **Tersier** (13) | HP, Tablet, Laptop, Kalung Emas, Smartwatch, Piano, Robot, Boneka, Sepatu Roda, Gelang Emas, Cincin Emas, Mobil, Liburan |

Semua gambar dibuat dari kode di `js/art.js` (gradien, bayangan, kilau), lalu **diekspor menjadi PNG** di `assets/img/items/` agar bisa dipakai ulang untuk bahan ajar/cetak.

## 9 karakter

Si Cepat (topi) · Si Ceria (hijab) · Si Keren (beanie) · Si Lincah (poni) · Si Pemberani (helm) · Si Gesit (bandana) · **Si Manis (hijab)** · **Si Anggun (hijab)** · **Si Riang (rambut panjang)**

Setiap karakter punya rig 3D sendiri: kepala, mata, alis, hidung, mulut, telinga, leher, tangan, kaki, sepatu, dan pakaian (kemeja/rok). Potret kecil di pemilih karakter dirender langsung dari model 3D-nya.

---

## Menjalankan

### 1. Tanpa server (paling cepat)
Ekstrak ZIP, klik dua kali **`index.html`**. Semua berjalan dari `file://`: font disematkan, gambar digambar di kanvas, audio dari berkas lokal.

### 2. Server lokal
```bash
python3 -m http.server 8080
# buka http://localhost:8080
```

### 3. GitHub Pages
Unggah **isi folder** (bukan folder luarnya) ke repositori publik → **Settings → Pages → Branch: main / (root)** → **Save**. Tautan muncul setelah ± 1 menit.

Saat di-hosting, `sw.js` menyimpan 69 berkas inti sehingga game tetap bisa dibuka **offline** setelah kunjungan pertama.

---

## Struktur berkas

```
index.html                 kerangka 9 layar
assets/css/app.css         sistem desain, logo 3D, HUD, responsif
assets/img/items/*.png     32 ilustrasi benda
assets/img/coin.png        koin Rp (juga dipakai sebagai lambang)
assets/icons/*             5 ikon PWA (192, 512, maskable, apple, favicon)
assets/audio/*.wav         14 berkas audio (2 musik + 12 efek)
assets/fonts/*             Fredoka & Nunito (WOFF2) + lisensi OFL
js/fonts.js                pendaftaran font via FontFace (base64)
js/art.js                  ilustrasi benda + koin (kanvas 2D)
js/data.js                 benda, kategori, level, soal, karakter, materi
js/audio.js                musik & efek suara
js/models.js               model 3D karakter & kartu benda
js/runner.js               satu dunia 3D per Murid (jalan, benda, lubang)
js/world.js                renderer + scissor viewport + pratinjau 3D
js/ui.js                   HUD, layar, papan skor, konfirmasi
js/game.js                 mesin permainan & alur layar
vendor/three.min.js        Three.js r149
sw.js                      service worker offline-first
manifest.webmanifest       metadata PWA
tools/                     pembuat/pembaru aset
tests/test-v3.cjs          uji otomatis (logika 3D + alur DOM)
docs/                      GBIM, panduan guru, storyboard teknis
```

---

## Mengubah isi

| Ingin mengubah | Berkas |
|---|---|
| Nama/tagline/versi aplikasi | `js/data.js` → `JR.APP` |
| Daftar benda & kategori | `js/data.js` → `JR.CATS`, `JR.ITEMS` |
| Gambar benda | `js/art.js` → `DRAW` lalu jalankan `node tools/export_items.cjs` |
| Soal/materi belajar | `js/data.js` → `JR.QUEST`, `JR.INTRO` |
| Kecepatan & durasi level | `js/data.js` → `JR.LEVELS` |
| Karakter (warna, hijab, rok) | `js/data.js` → `JR.AVATARS` |
| Teks & tata letak layar | `index.html`, `js/ui.js`, `assets/css/app.css` |
| Audio | ganti berkas di `assets/audio/` (nama berkas tetap) |

Setelah mengubah aset, naikkan `VERSION` di `sw.js` agar cache lama dibuang, lalu muat ulang dengan `Ctrl+F5`.

### Membuat ulang aset

```bash
# butuh Playwright + Chromium (lihat catatan di bawah)
node tools/export_items.cjs     # 32 PNG benda + coin.png + 5 ikon
python3 tools/make_audio.py     # 14 WAV
python3 tools/embed_fonts.py    # js/fonts.js dari WOFF2
```

---

## Uji

```bash
npm install jsdom              # sekali saja (dev)
node tests/test-v3.cjs         # 90+ pemeriksaan logika 3D + alur DOM
node --check js/*.js           # sintaks
```

Uji tidak membutuhkan browser; `jsdom` dipakai untuk bagian DOM. Pemeriksaan di dalamnya: 32 benda & kategorinya, ketersediaan PNG, 9 karakter (3 hijab), tata letak 10 ukuran × 4 mode, urutan soal berbasis poin, level makin cepat, kartu benda + label, pengecoh per level, fisika lompat/jatuh/bangun, lubang, hingga alur layar penuh (judul → materi → atur → konfirmasi → hitung mundur → main → jeda → hasil → papan skor) dan penyimpanan skor.

Uji visual di Chromium: 1280×720 (1–4 pemain), 900×1280 potret, 390×844 ponsel, `file://` dan `http://`, serta mode offline setelah service worker aktif.

---

## Catatan teknis

- **Satu `WebGLRenderer`** untuk semua kolom; tiap kolom digambar dengan `scissor` + `viewport` sendiri.
- **Kartu benda selalu menghadap kamera** (billboard) sehingga gambar tetap terbaca; papan nama memakai `Sprite` yang ikut mengecil sesuai jarak (perspektif nyata).
- **Tekstur dibuat di kanvas** (bukan memuat gambar) agar tidak terkena larangan “tainted canvas” saat dibuka dari `file://`. PNG di `assets/img/` dipakai untuk DOM dan bahan cetak.
- **Tanpa shadow map**; karakter memakai bulatan bayangan. Properti jalan memakai `InstancedMesh`.
- **Font disematkan** dan didaftarkan lewat `FontFace` karena `@font-face` data-URI diblokir di `file://` pada Chromium.
- Waktu simulasi dibatasi `dt ≤ 0,05` s agar lompatan waktu tidak membuat karakter menembus benda saat perangkat lambat.

---

## Lisensi & kredit

- Kode: **MIT** (lihat `LICENSE`).
- Dokumen kurikulum di `docs/`: **CC BY-SA 4.0**.
- Font: **SIL Open Font License 1.1** — Fredoka, Nunito (`assets/fonts/OFL.txt`).
- Three.js r149: MIT.
- **Pengembang: Andika Faris.**
