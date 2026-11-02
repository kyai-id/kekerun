#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Menyematkan woff2 ke js/fonts.js sebagai data URI.

Alasan: font eksternal (url file) diblokir saat game dibuka lewat file://,
sehingga tipografi game bisa hilang bila pengguna hanya klik-dua-kali.
Data URI + FontFace API membuat tipografi identik di file:// maupun hosting.
"""
import base64, os, io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "assets", "fonts")
OUT = os.path.join(ROOT, "js", "fonts.js")

SPECS = [
    ("Fredoka", "fredoka.woff2", "300 700"),
    ("Nunito", "nunito.woff2", "200 900"),
]

entries = []
for family, fname, weight in SPECS:
    data = base64.b64encode(open(os.path.join(FONTS, fname), "rb").read()).decode("ascii")
    entries.append('    { family: "%s", weight: "%s", b64: "%s" }' % (family, weight, data))

js = """/* KeKe Run — font tersemat (base64). Dibuat oleh tools/embed_fonts.py
   Dimuat lewat FontFace API agar tetap tampil saat game dibuka lewat file://. */
(function () {
  var DATA = [
%s
  ];
  if (!window.FontFace || !document.fonts) return;
  DATA.forEach(function (item) {
    try {
      var face = new FontFace(item.family, 'url("data:font/woff2;base64,' + item.b64 + '") format("woff2")',
        { weight: item.weight, style: "normal", display: "swap" });
      document.fonts.add(face);
      face.load().catch(function () { /* pakai font cadangan */ });
    } catch (e) { /* pakai font cadangan */ }
  });
})();
""" % ",\n".join(entries)

io.open(OUT, "w", encoding="utf-8").write(js)
print("js/fonts.js ditulis: %d KB" % (os.path.getsize(OUT) // 1024))
