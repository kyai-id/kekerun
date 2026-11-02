# 📘 PANDUAN GURU — “KeKe Run”

Panduan singkat untuk guru yang **belum pernah** memakai game ini. Tidak perlu memasang aplikasi apa pun.

---

## 1. Apa game ini?

Game lari 3D untuk IPAS Kelas IV (Fase B), materi **kebutuhan dan keinginan** serta **uang**.
Setiap Murid berlari di kolomnya sendiri, membaca **soal di tengah layar** (primer / sekunder / tersier), lalu mengambil benda yang tepat sambil melompati lubang. Salah ambil = jatuh, nyawa berkurang satu.

- **Pemain:** 1–4 Murid pada satu perangkat.
- **Benda:** 32 gambar benda (10 primer, 9 sekunder, 13 tersier), masing-masing dengan papan nama.
- **Karakter:** 9 pilihan 3D (3 di antaranya perempuan, 2 berhijab).
- **Durasi:** 3 level, total ± 2 menit 48 detik (bisa dijeda).
- **Nyawa:** 3 per Murid.
- **Prasyarat:** bisa membaca sederhana.

---

## 2. Menjalankan game (pilih satu)

### A. Dari berkas ZIP — paling cepat, tanpa internet
1. Ekstrak `Rupiah-Rush-v2.zip` ke folder mana saja.
2. Klik dua kali **`index.html`**.
3. Game terbuka di browser (Chrome, Edge, atau Firefox). Selesai.

> Jangan memindahkan `index.html` keluar dari foldernya — game butuh folder `js/`, `vendor/`, dan `assets/` di sebelahnya.

### B. Server lokal (opsional, agar bisa “pasang aplikasi”)
```bash
cd Rupiah-Rush
python3 -m http.server 8080
```
Buka `http://localhost:8080` di browser.

### C. GitHub Pages — untuk dibagikan lewat tautan
1. Buat akun di [github.com](https://github.com) → **New repository** (nama bebas, misal `rupiah-rush`), pilih **Public**.
2. Klik **Add file → Upload files**, seret **seluruh isi folder** `Rupiah-Rush` (bukan folder luarnya), lalu **Commit changes**.
3. Buka **Settings → Pages** → pada *Branch* pilih `main` dan folder `/ (root)` → **Save**.
4. Tunggu ± 1 menit. Alamat game muncul: `https://NAMA-AKUN.github.io/rupiah-rush/`.
5. Bagikan tautan itu ke Murid (bisa dibuka di HP/tablet/laptop, tanpa memasang apa pun).

---

## 3. Alur satu sesi

1. **MATERI BELAJAR** (opsional, di halaman depan) — 6 slide berisi pengertian, tiga tingkat, contoh benda, fungsi uang, dan contoh soal. Bisa dibaca bersama sebelum bermain.
2. **MULAI LARI** → pilih mode **Solo / Duel / Trio / Kuartet**.
3. Tulis nama Murid → ketuk karakter untuk menggantinya (pratinjau 3D berputar).
4. **LANJUT** → halaman **konfirmasi** berisi pengingat primer–sekunder–tersier dan contoh bendanya. Tekan **MULAI LARI**.
5. Hitung mundur 3-2-1 → lari.
6. Setelah finis: **hasil** + **papan skor**. Tombol **MAIN LAGI** untuk mengulang, **PAPAN SKOR** untuk melihat peringkat, **RESET** (2 kali tekan) untuk mengosongkan.

### Kontrol

| Murid | Kiri | Kanan | Lompat |
|---|---|---|---|
| 1 | `A` | `D` | `W` |
| 2 | `J` | `L` | `I` |
| 3 | `←` | `→` | `↑` |
| 4 | Numpad `4` | Numpad `6` | Numpad `8` |

Di tablet/HP, setiap kolom punya tombol **◀ lompat ▶** sendiri — tidak perlu keyboard.
`P` / `Esc` = jeda. Ikon pengeras suara = musik dan efek suara.

---

## 4. Aturan poin (untuk menjelaskan ke Murid)

| Kejadian | Poin |
|---|---|
| Ambil benda sesuai soal | +10 (dikali level, ditambah bonus kombo) |
| Lompati lubang | +5 |
| Ambil benda salah | −1 nyawa (dan karakter jatuh) |
| Menabrak lubang | −1 nyawa |
| Sampai finis | +60, lalu +25 per nyawa sisa |
| Nyawa habis | lari Murid itu berhenti; skor tetap dihitung |

**Soal berganti mengikuti poin:** setiap 55 poin, soal Murid naik satu tingkat — PRIMER → SEKUNDER → TERSIER → kembali ke PRIMER. Jadi semua Murid mulai dari soal primer, lalu makin lama makin sulit. Benda yang belum terbaca otomatis dibersihkan saat soal berganti, sehingga Murid tidak dihukum.

Pemenang = poin terbanyak di papan skor, **bukan** yang paling cepat.

---

## 5. Tips kelas

- **Pembagian mode.** 4 Murid satu laptop = Kuartet. Tablet 10 inci nyaman untuk Duel. Ponsel sebaiknya Solo/Duel.
- **Sebelum bermain**, tanyakan: “Mana yang benar-benar *butuh*, mana yang *ingin*?” lalu cocokkan dengan soal yang mereka dapat.
- **Level = kecepatan.** Level 1 lambat, level 2 sedang, level 3 cepat. Di level 3 benda pengecoh diambil dari tingkat yang mirip, jadi Murid harus membaca nama benda — bukan sekadar menebak warna.
- **Saat bermain**, hentikan sebentar (tombol jeda) ketika ada Murid mengambil benda salah, dan tanyakan alasannya. Kesalahan adalah bahan diskusi terbaik.
- **Sesudah bermain**, minta tiap Murid menyebut satu benda tersier yang ia inginkan dan satu kebutuhan primer yang harus didahulukan.
- **Suara**: bila kelas ramai, matikan musik lewat ikon pengeras suara; efek suara tetap membantu umpan balik.
- **Skor**: tombol reset butuh dua kali tekan agar tidak terhapus tanpa sengaja. Skor tersimpan di browser perangkat itu.

---

## 6. Bila ada masalah

| Gejala | Penyebab & solusi |
|---|---|
| Halaman putih / game tidak muncul | `index.html` dipindah keluar folder. Kembalikan ke dalam folder bersama `js/` dan `assets/`. |
| Tampilan 3D hitam | Browser lama atau akselerasi grafis dimatikan. Perbarui Chrome/Edge, atau nyalakan *hardware acceleration* di pengaturan browser. |
| Suara tidak keluar | Klik di halaman sekali (aturan browser: audio baru boleh berbunyi setelah ada klik), lalu nyalakan ikon pengeras suara. |
| Soal terlalu sulit/cepat | Main mode Solo atau Duel; level 1 sudah lambat. Ulangi dengan mode yang sama agar terbiasa. |
| Karakter/objek tampak lambat | Perangkat tanpa akselerasi grafis akan berjalan lambat. Perbarui browser atau gunakan laptop. |
| Terasa lambat di perangkat lama | Turunkan jumlah pemain (Kuartet → Duel), tutup tab lain, atau gunakan laptop. |
| Skor lama masih muncul | Gunakan **RESET** di papan skor (tekan dua kali). |

---

## 7. Berkas yang boleh diubah guru

- **Gambar benda**: `js/art.js` (bagian `DRAW`). Setelah diubah, jalankan `node tools/export_items.cjs` untuk memperbarui PNG di `assets/img/items/`.
- **Suara**: `assets/audio/*.wav` (nama berkas tetap).
- **Teks materi belajar & pengingat konfirmasi**: `js/data.js` (`JR.INTRO`) dan `js/ui.js` (`renderConfirm`).
- **Nama & kategori benda**: `js/data.js`, bagian `JR.ITEMS` dan `JR.CATS`.
- **Gambar/font/audio**: lihat tabel di `README.md`.

Setelah mengubah aset, muat ulang halaman dengan `Ctrl+F5` (Windows) atau `Cmd+Shift+R` (Mac).

---

## 8. Rujukan

- Rancangan pembelajaran lengkap: [`GBIM_IPAS_Kelas4_Uang.md`](GBIM_IPAS_Kelas4_Uang.md)
- Rincian teknis & storyboard: [`STORYBOARD_TEKNIS.md`](STORYBOARD_TEKNIS.md)
- Panduan umum & lisensi: [`../README.md`](../README.md)
