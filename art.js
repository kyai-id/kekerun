/* KeKe Run — ilustrasi benda (kanvas 2D) + koin Rp
 * Digambar dengan kode, tanpa memuat berkas gambar, sehingga tetap aman
 * saat game dibuka dari file:// (kanvas tidak pernah "tercemar").
 * Satu sumber seni: dipakai untuk tekstur 3D, ikon DOM, dan ekspor PNG.
 */
(function (root) {
  "use strict";
  var JR = root.JR;
  var T = root.THREE;
  var S = 256;                                  // ruang gambar logis
  var icons = {}, textures = {}, labels = {}, gcache = {};

  /* ---------------------------------------------------------- BANTUAN */
  function cv(size) {
    var c = document.createElement("canvas");
    c.width = c.height = size || S;
    return c;
  }
  function L(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }
  function R(c, cx, cy, r0, r1, stops) {
    var g = c.createRadialGradient(cx, cy, r0, cx, cy, r1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
    return c;
  }
  function el(c, cx, cy, rx, ry, rot) {
    c.beginPath();
    c.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2);
    return c;
  }
  function poly(c, pts) {
    c.beginPath();
    for (var i = 0; i < pts.length; i += 2) {
      if (i === 0) c.moveTo(pts[0], pts[1]); else c.lineTo(pts[i], pts[i + 1]);
    }
    c.closePath();
    return c;
  }
  function line(c, x0, y0, x1, y1, w, col) {
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1);
    c.lineWidth = w; c.strokeStyle = col; c.lineCap = "round"; c.stroke();
  }
  function shadow(c, cx, cy, rx, ry, a) {
    c.save();
    el(c, cx, cy, rx, ry);
    c.fillStyle = R(c, cx, cy, 0, Math.max(rx, ry), [[0, "rgba(20,30,50," + (a || 0.22) + ")"], [1, "rgba(20,30,50,0)"]]);
    c.fill();
    c.restore();
  }
  function gold(c, x0, y0, x1, y1) {
    return L(c, x0, y0, x1, y1, [[0, "#FFF6CC"], [0.32, "#F7D46A"], [0.62, "#E0A92C"], [1, "#B0781A"]]);
  }
  function shine(c, x, y, w, h, a) {
    c.save();
    rr(c, x, y, w, h, w / 2);
    c.fillStyle = L(c, x, y, x + w, y + h, [[0, "rgba(255,255,255," + (a || 0.5) + ")"], [1, "rgba(255,255,255,0)"]]);
    c.fill();
    c.restore();
  }

  /* ------------------------------------------------------------- GAMBAR */
  var DRAW = {};

  DRAW.nasi = function (c) {
    shadow(c, 128, 220, 86, 15, 0.24);
    // piring
    el(c, 128, 198, 94, 28); c.fillStyle = L(c, 40, 176, 216, 226, [[0, "#FFFFFF"], [1, "#C2D2E4"]]); c.fill();
    el(c, 128, 194, 78, 22); c.fillStyle = "#F4F9FF"; c.fill();
    el(c, 128, 194, 64, 17); c.fillStyle = "#DCE7F4"; c.fill();
    // nasi
    el(c, 122, 160, 58, 42); c.fillStyle = R(c, 104, 136, 4, 74, [[0, "#FFFFFF"], [0.5, "#FBF8EE"], [1, "#CDC2A8"]]); c.fill();
    c.save(); el(c, 122, 160, 56, 40); c.clip();
    for (var i = 0; i < 30; i++) {
      var a = i * 1.9, rr2 = 8 + (i % 6) * 9;
      el(c, 122 + Math.cos(a) * rr2, 156 + Math.sin(a) * rr2 * 0.62, 7, 3, a);
      c.fillStyle = i % 4 ? "rgba(255,255,255,.95)" : "rgba(186,172,142,.60)"; c.fill();
    }
    c.restore();
    // telur mata sapi
    el(c, 152, 136, 34, 24, -0.12); c.fillStyle = "#FFFFFF"; c.fill();
    el(c, 150, 134, 26, 18, -0.12); c.fillStyle = "#FFF9F2"; c.fill();
    el(c, 152, 133, 13, 12); c.fillStyle = R(c, 148, 129, 2, 15, [[0, "#FFD65A"], [1, "#F08A1E"]]); c.fill();
    // daun pandan
    el(c, 172, 172, 24, 9, -0.55); c.fillStyle = "#3E9B52"; c.fill();
    el(c, 172, 172, 15, 5, -0.55); c.fillStyle = "#63C877"; c.fill();
    // sambal
    el(c, 78, 186, 19, 12); c.fillStyle = "#D63A2C"; c.fill();
    el(c, 78, 183, 12, 6); c.fillStyle = "#FF7A59"; c.fill();
    c.save(); c.globalAlpha = 0.45;
    el(c, 104, 138, 20, 9, -0.5); c.fillStyle = "#FFFFFF"; c.fill();
    c.restore();
  };

  DRAW.air = function (c) {
    shadow(c, 128, 220, 56, 13, 0.22);
    c.save();
    rr(c, 86, 54, 84, 156, 22);
    c.fillStyle = L(c, 86, 54, 170, 210, [[0, "rgba(228,248,255,.96)"], [0.5, "rgba(186,230,248,.96)"], [1, "rgba(214,244,255,.98)"]]);
    c.fill();
    c.save(); c.clip();
    c.fillStyle = L(c, 88, 104, 168, 210, [[0, "#6FD3F7"], [1, "#1E93D4"]]);
    c.fillRect(86, 112, 84, 100);
    el(c, 128, 112, 42, 9); c.fillStyle = "#A6E6FC"; c.fill();
    for (var i = 0; i < 5; i++) {
      el(c, 104 + (i * 13) % 46, 196 - i * 14, 4 + (i % 2) * 2, 4 + (i % 2) * 2);
      c.fillStyle = "rgba(255,255,255,.55)"; c.fill();
    }
    c.restore();
    rr(c, 86, 132, 84, 34, 4); c.fillStyle = "#FFFFFF"; c.fill();
    c.beginPath(); c.moveTo(86, 158); c.quadraticCurveTo(128, 146, 170, 158);
    c.lineTo(170, 166); c.lineTo(86, 166); c.closePath(); c.fillStyle = "#2FA9E4"; c.fill();
    c.fillStyle = "#1F80B8"; c.font = "bold 15px system-ui, sans-serif"; c.textAlign = "center";
    c.fillText("AIR", 128, 152);
    c.restore();
    rr(c, 108, 34, 40, 24, 7); c.fillStyle = L(c, 108, 34, 148, 58, [[0, "#57B9EC"], [1, "#166E9F"]]); c.fill();
    rr(c, 114, 30, 28, 9, 4); c.fillStyle = "#2C93C9"; c.fill();
    shine(c, 96, 62, 12, 132, 0.6);
    shine(c, 150, 74, 7, 90, 0.35);
  };

  DRAW.pakaian = function (c) {
    shadow(c, 128, 218, 74, 14, 0.22);
    poly(c, [96, 74, 66, 96, 58, 128, 84, 138, 92, 120, 92, 202, 164, 202, 164, 120, 172, 138, 198, 128, 190, 96, 160, 74]);
    c.fillStyle = L(c, 60, 74, 196, 200, [[0, "#4FD3B4"], [0.55, "#2FB59A"], [1, "#1B8A74"]]); c.fill();
    el(c, 128, 78, 22, 10); c.fillStyle = "#1B8A74"; c.fill();
    el(c, 128, 74, 22, 10); c.fillStyle = "#2FB59A"; c.fill();
    rr(c, 122, 84, 12, 112, 4); c.fillStyle = "rgba(0,0,0,.10)"; c.fill();
    for (var i = 0; i < 4; i++) { el(c, 128, 100 + i * 26, 4, 4); c.fillStyle = "#EAF7F3"; c.fill(); }
    c.save(); c.globalAlpha = 0.25;
    line(c, 104, 136, 108, 196, 5, "#0F6E5C");
    line(c, 150, 128, 154, 190, 5, "#0F6E5C");
    c.restore();
    shine(c, 100, 96, 14, 84, 0.4);
  };

  DRAW.rumah = function (c) {
    shadow(c, 128, 212, 88, 16, 0.24);
    rr(c, 62, 112, 132, 90, 4); c.fillStyle = L(c, 62, 112, 194, 202, [[0, "#FFF8EC"], [1, "#E7D6BC"]]); c.fill();
    poly(c, [44, 118, 128, 48, 212, 118]); c.fillStyle = L(c, 44, 48, 212, 118, [[0, "#FF8A6B"], [1, "#C0452F"]]); c.fill();
    poly(c, [56, 112, 128, 54, 200, 112]); c.fillStyle = "#E2644C"; c.fill();
    rr(c, 166, 58, 16, 34, 2); c.fillStyle = "#B5503C"; c.fill();
    rr(c, 112, 156, 32, 46, 3); c.fillStyle = L(c, 112, 156, 144, 202, [[0, "#9C6A44"], [1, "#6E4526"]]); c.fill();
    el(c, 138, 180, 3, 3); c.fillStyle = "#F7D46A"; c.fill();
    rr(c, 74, 128, 36, 32, 3); c.fillStyle = "#A7DDF6"; c.fill();
    rr(c, 158, 128, 36, 32, 3); c.fillStyle = "#A7DDF6"; c.fill();
    c.strokeStyle = "#FFFFFF"; c.lineWidth = 3;
    [74, 158].forEach(function (x) {
      c.strokeRect(x, 128, 36, 32);
      line(c, x + 18, 128, x + 18, 160, 3, "#FFFFFF");
      line(c, x, 144, x + 36, 144, 3, "#FFFFFF");
    });
    el(c, 60, 202, 22, 9); c.fillStyle = "#5FBE6A"; c.fill();
    el(c, 196, 204, 26, 10); c.fillStyle = "#4FAE5C"; c.fill();
  };

  DRAW.kasur = function (c) {
    shadow(c, 128, 218, 88, 14, 0.22);
    // kepala kasur (lebar, di belakang bantal)
    rr(c, 46, 96, 52, 74, 10); c.fillStyle = L(c, 46, 96, 98, 170, [[0, "#D9A46A"], [1, "#8A5C2E"]]); c.fill();
    rr(c, 54, 104, 36, 58, 8); c.fillStyle = "rgba(255,255,255,.18)"; c.fill();
    // kasur
    rr(c, 56, 126, 152, 44, 10); c.fillStyle = L(c, 56, 126, 208, 170, [[0, "#FFFFFF"], [1, "#C9D9EC"]]); c.fill();
    rr(c, 56, 126, 152, 13, 8); c.fillStyle = "#F6FAFF"; c.fill();
    // selimut
    rr(c, 114, 128, 94, 42, 10); c.fillStyle = L(c, 114, 128, 208, 170, [[0, "#5FD6C0"], [1, "#22997F"]]); c.fill();
    rr(c, 114, 128, 94, 13, 8); c.fillStyle = "#7FE4D0"; c.fill();
    line(c, 114, 148, 208, 148, 2, "rgba(0,0,0,.10)");
    // bantal
    rr(c, 66, 108, 64, 30, 14); c.fillStyle = "#FFFFFF"; c.fill();
    rr(c, 66, 108, 64, 30, 14); c.strokeStyle = "rgba(0,0,0,.08)"; c.lineWidth = 2; c.stroke();
    // rangka & kaki
    rr(c, 52, 168, 158, 18, 6); c.fillStyle = "#8A6240"; c.fill();
    rr(c, 62, 184, 10, 22, 3); c.fillStyle = "#6E4A2F"; c.fill();
    rr(c, 190, 184, 10, 22, 3); c.fillStyle = "#6E4A2F"; c.fill();
    c.save(); c.globalAlpha = 0.28;
    line(c, 128, 152, 142, 166, 3, "#0F6E5C");
    line(c, 164, 152, 178, 166, 3, "#0F6E5C");
    c.restore();
  };

  DRAW.buku = function (c) {
    shadow(c, 128, 216, 78, 14, 0.22);
    // buku bawah (biru)
    rr(c, 44, 170, 168, 36, 5); c.fillStyle = L(c, 44, 170, 212, 206, [[0, "#6C7BFF"], [1, "#2E3BB8"]]); c.fill();
    rr(c, 158, 174, 48, 28, 3); c.fillStyle = "#FFF8EA"; c.fill();
    for (var i = 0; i < 3; i++) line(c, 162, 179 + i * 8, 202, 179 + i * 8, 1.5, "#CBD5E4");
    rr(c, 44, 170, 20, 36, 5); c.fillStyle = "#4C59D6"; c.fill();
    // buku tengah (hijau)
    rr(c, 52, 142, 156, 30, 5); c.fillStyle = L(c, 52, 142, 208, 172, [[0, "#5FE0C8"], [1, "#1E9E86"]]); c.fill();
    rr(c, 160, 146, 44, 22, 3); c.fillStyle = "#FFF8EA"; c.fill();
    for (var j = 0; j < 3; j++) line(c, 164, 150 + j * 7, 200, 150 + j * 7, 1.5, "#CBD5E4");
    rr(c, 52, 142, 18, 30, 5); c.fillStyle = "#2CB39B"; c.fill();
    // buku atas (oranye) sedikit miring, duduk di atas tumpukan
    c.save(); c.translate(130, 128); c.rotate(-0.05);
    rr(c, -70, -15, 140, 30, 5); c.fillStyle = L(c, -70, -15, 70, 15, [[0, "#FFB25C"], [1, "#E07C1E"]]); c.fill();
    rr(c, 30, -12, 36, 24, 3); c.fillStyle = "#FFF8EA"; c.fill();
    rr(c, -70, -15, 16, 30, 5); c.fillStyle = "#F2913A"; c.fill();
    poly(c, [-20, -15, -10, -42, -2, -40, -8, -15]); c.fillStyle = "#EF4B5E"; c.fill();
    c.restore();
    shine(c, 56, 148, 7, 18, 0.35);
  };

  DRAW.pensil = function (c) {
    shadow(c, 128, 214, 70, 12, 0.18);
    c.save(); c.translate(126, 128); c.rotate(-0.68);
    rr(c, -78, -20, 128, 40, 4); c.fillStyle = L(c, 0, -20, 0, 20, [[0, "#FFE27A"], [0.45, "#F7B731"], [1, "#D18F12"]]); c.fill();
    c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(-78, 2, 128, 6);
    c.fillStyle = "rgba(255,255,255,.45)"; c.fillRect(-78, -16, 128, 5);
    poly(c, [50, -20, 88, 0, 50, 20]); c.fillStyle = L(c, 50, -20, 88, 20, [[0, "#F2D8B4"], [1, "#CB9E6C"]]); c.fill();
    poly(c, [72, -9, 88, 0, 72, 9]); c.fillStyle = "#3B3B3B"; c.fill();
    rr(c, -96, -21, 20, 42, 3); c.fillStyle = L(c, 0, -21, 0, 21, [[0, "#E2E9F2"], [1, "#9AA6B8"]]); c.fill();
    c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(-90, -21, 4, 42);
    rr(c, -118, -21, 24, 42, 7); c.fillStyle = L(c, 0, -21, 0, 21, [[0, "#FF9FB2"], [1, "#E05C78"]]); c.fill();
    c.restore();
  };

  DRAW.seragam = function (c) {
    shadow(c, 128, 218, 72, 14, 0.2);
    poly(c, [86, 146, 170, 146, 186, 208, 70, 208]); c.fillStyle = L(c, 86, 146, 170, 208, [[0, "#3E5AA8"], [1, "#22376B"]]); c.fill();
    for (var i = 0; i < 4; i++) line(c, 92 + i * 24, 152, 88 + i * 26, 204, 2, "rgba(0,0,0,.18)");
    poly(c, [96, 74, 66, 92, 60, 148, 86, 152, 96, 118, 96, 146, 160, 146, 160, 118, 170, 152, 196, 148, 190, 92, 160, 74]);
    c.fillStyle = L(c, 60, 74, 196, 148, [[0, "#FFFFFF"], [1, "#DCE6F3"]]); c.fill();
    poly(c, [112, 74, 128, 92, 144, 74, 138, 70, 128, 80, 118, 70]); c.fillStyle = "#C9D6E8"; c.fill();
    poly(c, [128, 92, 140, 106, 128, 140, 116, 106]); c.fillStyle = "#EF4B5E"; c.fill();
    poly(c, [122, 92, 134, 92, 128, 100]); c.fillStyle = "#C53346"; c.fill();
    rr(c, 146, 108, 22, 16, 2); c.strokeStyle = "#C9D6E8"; c.lineWidth = 2; c.stroke();
    for (var b = 0; b < 3; b++) { el(c, 128, 100 + b * 15, 3, 3); c.fillStyle = "#B9C8DC"; c.fill(); }
    shine(c, 104, 82, 12, 56, 0.55);
  };

  DRAW.meja = function (c) {
    shadow(c, 128, 214, 84, 15, 0.22);
    poly(c, [34, 112, 196, 98, 224, 124, 58, 140]); c.fillStyle = L(c, 34, 98, 224, 140, [[0, "#EFC089"], [1, "#B98249"]]); c.fill();
    poly(c, [34, 112, 58, 140, 58, 152, 34, 124]); c.fillStyle = "#A56F3C"; c.fill();
    poly(c, [58, 140, 224, 124, 224, 136, 58, 152]); c.fillStyle = "#C48F52"; c.fill();
    c.save(); c.globalAlpha = 0.25;
    for (var i = 0; i < 4; i++) line(c, 60 + i * 10, 122 + i * 2, 200 - i * 8, 112 + i * 2, 2, "#7A4E24");
    c.restore();
    line(c, 66, 150, 58, 206, 9, "#8A5C2E");
    line(c, 200, 138, 210, 200, 9, "#8A5C2E");
    line(c, 176, 140, 182, 200, 7, "#7A4E24");
  };

  DRAW.kursi = function (c) {
    shadow(c, 128, 216, 68, 13, 0.2);
    rr(c, 72, 62, 106, 14, 6); c.fillStyle = "#A56F3C"; c.fill();
    line(c, 82, 70, 84, 154, 8, "#8A5C2E");
    line(c, 166, 70, 164, 150, 8, "#8A5C2E");
    rr(c, 96, 82, 8, 64, 3); c.fillStyle = "#B57C43"; c.fill();
    rr(c, 126, 82, 8, 64, 3); c.fillStyle = "#B57C43"; c.fill();
    poly(c, [62, 150, 192, 138, 208, 156, 78, 170]); c.fillStyle = L(c, 62, 138, 208, 170, [[0, "#E7B57C"], [1, "#B57C43"]]); c.fill();
    poly(c, [62, 150, 78, 170, 78, 182, 62, 162]); c.fillStyle = "#96653A"; c.fill();
    line(c, 76, 172, 72, 208, 8, "#8A5C2E");
    line(c, 194, 158, 200, 204, 8, "#8A5C2E");
  };

  DRAW.mainan = function (c) {
    shadow(c, 128, 216, 76, 14, 0.22);
    function blok(x, y, s, col) {
      var d = s * 0.34;
      poly(c, [x, y, x + d, y - d * 0.7, x + s + d, y - d * 0.7, x + s, y]);
      c.fillStyle = col[1]; c.fill();
      poly(c, [x + s, y, x + s + d, y - d * 0.7, x + s + d, y + s - d * 0.7, x + s, y + s]);
      c.fillStyle = col[2]; c.fill();
      c.fillStyle = col[0]; c.fillRect(x, y, s, s);
    }
    blok(58, 168, 46, ["#FF6B8A", "#E04F6D", "#C13B58"]);
    blok(108, 168, 46, ["#5AA9FF", "#3F86DE", "#2E68B4"]);
    blok(84, 122, 46, ["#FFD65A", "#E0B134", "#B88A1E"]);
    c.font = "bold 26px system-ui, sans-serif"; c.textAlign = "center"; c.fillStyle = "rgba(255,255,255,.9)";
    c.fillText("A", 81, 200); c.fillText("B", 131, 200); c.fillText("C", 107, 154);
    el(c, 186, 176, 30, 30); c.fillStyle = R(c, 176, 166, 4, 34, [[0, "#FFFFFF"], [1, "#FF7A59"]]); c.fill();
    c.save(); c.beginPath(); c.arc(186, 176, 30, 0, Math.PI * 2); c.clip();
    c.fillStyle = "#5AA9FF"; c.fillRect(156, 158, 60, 12);
    c.fillStyle = "#FFD65A"; c.fillRect(156, 190, 60, 12);
    c.restore();
  };

  DRAW.tas = function (c) {
    shadow(c, 128, 218, 64, 13, 0.22);
    c.strokeStyle = "#6E52D8"; c.lineWidth = 9; c.lineCap = "round";
    c.beginPath(); c.arc(128, 92, 26, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    rr(c, 68, 88, 120, 122, 28); c.fillStyle = L(c, 68, 88, 188, 210, [[0, "#A98CFF"], [0.55, "#8465F0"], [1, "#5B3FD0"]]); c.fill();
    rr(c, 86, 146, 84, 52, 16); c.fillStyle = "#9678F7"; c.fill();
    rr(c, 86, 146, 84, 52, 16); c.strokeStyle = "rgba(0,0,0,.12)"; c.lineWidth = 2; c.stroke();
    line(c, 92, 158, 164, 158, 4, "#4E33B8");
    for (var i = 0; i < 8; i++) { c.fillStyle = "#E4DBFF"; c.fillRect(96 + i * 9, 155, 4, 6); }
    c.font = "bold 15px system-ui, sans-serif"; c.textAlign = "center"; c.fillStyle = "#F7E6A8";
    c.fillText("KELAS 4", 128, 186);
    c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 6;
    c.beginPath(); c.moveTo(92, 100); c.quadraticCurveTo(78, 150, 96, 196); c.stroke();
  };

  DRAW.sepatu = function (c) {
    shadow(c, 128, 208, 90, 13, 0.22);
    // sol
    rr(c, 32, 166, 198, 32, 16); c.fillStyle = "#FFFFFF"; c.fill();
    rr(c, 32, 184, 198, 14, 7); c.fillStyle = "#CFDCEA"; c.fill();
    line(c, 38, 198, 224, 198, 2, "rgba(0,0,0,.08)");
    // badan sepatu
    poly(c, [40, 170, 46, 142, 68, 128, 90, 122, 112, 106, 148, 100, 172, 112, 190, 134, 202, 152, 206, 170]);
    c.fillStyle = L(c, 40, 100, 206, 170, [[0, "#FF8A98"], [0.42, "#EF4B5E"], [1, "#A82336"]]); c.fill();
    // ujung putih
    poly(c, [40, 170, 46, 142, 70, 130, 84, 144, 88, 170]); c.fillStyle = "#FBFDFF"; c.fill();
    // panel tali
    poly(c, [90, 124, 122, 106, 138, 118, 104, 140]); c.fillStyle = "#FFF1F3"; c.fill();
    c.strokeStyle = "#FFFFFF"; c.lineWidth = 4; c.lineCap = "round";
    for (var i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(98 + i * 12, 124 + i * 6); c.lineTo(120 + i * 12, 112 + i * 6); c.stroke();
      c.beginPath(); c.moveTo(114 + i * 12, 132 + i * 6); c.lineTo(126 + i * 12, 114 + i * 6); c.stroke();
    }
    // tumit kuning
    rr(c, 184, 130, 24, 42, 10); c.fillStyle = "#FFD65A"; c.fill();
    // garis samping
    c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 6;
    c.beginPath(); c.moveTo(96, 164); c.quadraticCurveTo(146, 142, 190, 156); c.stroke();
    // tali lidah
    rr(c, 146, 100, 30, 12, 6); c.fillStyle = "#FFE29A"; c.fill();
  };

  DRAW.eskrim = function (c) {
    shadow(c, 128, 216, 50, 11, 0.2);
    poly(c, [104, 138, 152, 138, 128, 212]); c.fillStyle = L(c, 104, 138, 152, 212, [[0, "#E9B872"], [1, "#B97A34"]]); c.fill();
    c.save(); poly(c, [104, 138, 152, 138, 128, 212]); c.clip();
    c.strokeStyle = "rgba(120,70,20,.5)"; c.lineWidth = 2;
    for (var i = 0; i < 7; i++) { line(c, 100 + i * 10, 140, 128 + i * 6, 214, 2, "rgba(120,70,20,.45)"); line(c, 100 + i * 10, 214, 128 + i * 6, 140, 2, "rgba(120,70,20,.35)"); }
    c.restore();
    el(c, 128, 122, 40, 34); c.fillStyle = R(c, 116, 108, 4, 46, [[0, "#FFF3F6"], [0.5, "#FFC3D4"], [1, "#F58DA9"]]); c.fill();
    el(c, 118, 86, 30, 26); c.fillStyle = R(c, 110, 76, 3, 34, [[0, "#FFFDF3"], [1, "#F3DFAE"]]); c.fill();
    c.save(); c.globalAlpha = 0.85;
    c.strokeStyle = "#7A4B22"; c.lineWidth = 5; c.lineCap = "round";
    c.beginPath(); c.moveTo(100, 84); c.quadraticCurveTo(120, 96, 138, 86); c.stroke();
    c.beginPath(); c.moveTo(104, 108); c.quadraticCurveTo(126, 120, 148, 106); c.stroke();
    c.restore();
    el(c, 146, 62, 9, 9); c.fillStyle = R(c, 143, 59, 1, 10, [[0, "#FF8BA0"], [1, "#C81E3C"]]); c.fill();
    line(c, 146, 62, 150, 44, 3, "#4B7A2E");
  };

  DRAW.sepeda = function (c) {
    shadow(c, 128, 210, 86, 13, 0.2);
    function wheel(x) {
      el(c, x, 162, 42, 42); c.strokeStyle = "#2B3A55"; c.lineWidth = 11; c.stroke();
      el(c, x, 162, 34, 34); c.strokeStyle = "#C9D6E8"; c.lineWidth = 3; c.stroke();
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        line(c, x, 162, x + Math.cos(a) * 32, 162 + Math.sin(a) * 32, 2, "#DCE6F3");
      }
      el(c, x, 162, 6, 6); c.fillStyle = "#8FA3C0"; c.fill();
    }
    wheel(74); wheel(184);
    c.strokeStyle = "#F26419"; c.lineWidth = 9; c.lineCap = "round";
    c.beginPath(); c.moveTo(74, 162); c.lineTo(118, 118); c.lineTo(156, 118); c.lineTo(184, 162); c.stroke();
    c.beginPath(); c.moveTo(118, 118); c.lineTo(128, 162); c.lineTo(184, 162); c.stroke();
    line(c, 128, 162, 118, 96, 7, "#F26419");
    line(c, 108, 94, 132, 94, 7, "#2B3A55");
    line(c, 156, 118, 158, 96, 6, "#F26419");
    line(c, 146, 94, 170, 94, 6, "#2B3A55");
    el(c, 128, 162, 12, 12); c.fillStyle = "#D7DEE8"; c.fill();
    c.beginPath(); c.arc(128, 162, 12, 0, Math.PI * 2); c.strokeStyle = "#9AA6B8"; c.lineWidth = 3; c.stroke();
  };

  DRAW.televisi = function (c) {
    shadow(c, 128, 210, 82, 14, 0.24);
    rr(c, 44, 62, 168, 118, 10); c.fillStyle = L(c, 44, 62, 212, 180, [[0, "#33445F"], [1, "#151F33"]]); c.fill();
    rr(c, 54, 72, 148, 96, 5); c.fillStyle = L(c, 54, 72, 202, 168, [[0, "#7FD8FF"], [0.55, "#5AB6F0"], [1, "#2C7FBF"]]); c.fill();
    c.save(); rr(c, 54, 72, 148, 96, 5); c.clip();
    el(c, 176, 92, 18, 18); c.fillStyle = "#FFE27A"; c.fill();
    poly(c, [54, 168, 98, 118, 132, 156, 158, 128, 202, 168]); c.fillStyle = "#3E8E5A"; c.fill();
    poly(c, [54, 168, 98, 132, 124, 168]); c.fillStyle = "#2F6E46"; c.fill();
    c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(54, 72, 148, 12);
    c.restore();
    rr(c, 112, 180, 32, 12, 3); c.fillStyle = "#22304A"; c.fill();
    rr(c, 92, 190, 72, 10, 5); c.fillStyle = "#2B3A55"; c.fill();
    shine(c, 60, 78, 22, 84, 0.3);
  };

  DRAW.krayon = function (c) {
    shadow(c, 128, 214, 76, 13, 0.2);
    rr(c, 48, 100, 160, 104, 8); c.fillStyle = L(c, 48, 100, 208, 204, [[0, "#43C6AC"], [1, "#1E9E86"]]); c.fill();
    rr(c, 48, 100, 160, 30, 8); c.fillStyle = "#5AD6BC"; c.fill();
    rr(c, 58, 112, 140, 22, 5); c.fillStyle = "rgba(255,255,255,.85)"; c.fill();
    c.font = "bold 15px system-ui, sans-serif"; c.textAlign = "center"; c.fillStyle = "#1E7D68";
    c.fillText("KRAYON", 128, 129);
    var cols = [["#EF4B5E", "#B32739"], ["#FFC93C", "#D19A10"], ["#5A6BF0", "#3644C9"], ["#43C6AC", "#1E9E86"]];
    for (var i = 0; i < 4; i++) {
      var x = 66 + i * 34;
      rr(c, x, 62, 22, 96, 4); c.fillStyle = L(c, x, 62, x + 22, 158, [[0, cols[i][0]], [1, cols[i][1]]]); c.fill();
      poly(c, [x, 62, x + 11, 38, x + 22, 62]); c.fillStyle = cols[i][1]; c.fill();
      c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(x + 4, 70, 4, 76);
      rr(c, x - 2, 150, 26, 12, 3); c.fillStyle = i % 2 ? "#F4F7FB" : "#E2E9F2"; c.fill();
    }
  };

  DRAW.kotakpensil = function (c) {
    shadow(c, 128, 214, 72, 13, 0.2);
    rr(c, 46, 118, 164, 84, 16); c.fillStyle = L(c, 46, 118, 210, 202, [[0, "#FF9AB8"], [1, "#E0607F"]]); c.fill();
    rr(c, 46, 118, 164, 28, 16); c.fillStyle = "#FFB3C8"; c.fill();
    line(c, 54, 150, 202, 150, 5, "#B44A63");
    for (var i = 0; i < 11; i++) { c.fillStyle = "#FFE3EC"; c.fillRect(58 + i * 13, 146, 6, 9); }
    el(c, 200, 150, 9, 9); c.fillStyle = "#F7D46A"; c.fill();
    // pensil keluar
    c.save(); c.translate(88, 108); c.rotate(-0.3);
    rr(c, -10, -58, 20, 66, 3); c.fillStyle = "#F7B731"; c.fill();
    poly(c, [-10, -58, 0, -78, 10, -58]); c.fillStyle = "#E7C39A"; c.fill();
    poly(c, [-4, -70, 0, -78, 4, -70]); c.fillStyle = "#3B3B3B"; c.fill();
    c.restore();
    c.save(); c.translate(150, 104); c.rotate(0.24);
    rr(c, -10, -54, 20, 62, 3); c.fillStyle = "#5A6BF0"; c.fill();
    rr(c, -10, -60, 20, 12, 3); c.fillStyle = "#3644C9"; c.fill();
    c.restore();
    c.font = "bold 14px system-ui, sans-serif"; c.textAlign = "center"; c.fillStyle = "#FFF3F7";
    c.fillText("PENSIL", 128, 188);
  };

  DRAW.mejabelajar = function (c) {
    shadow(c, 128, 212, 86, 14, 0.22);
    rr(c, 40, 132, 176, 14, 5); c.fillStyle = "#B57C43"; c.fill();
    rr(c, 40, 126, 176, 10, 4); c.fillStyle = "#D9A96A"; c.fill();
    rr(c, 56, 144, 12, 62, 3); c.fillStyle = "#96653A"; c.fill();
    rr(c, 188, 144, 12, 62, 3); c.fillStyle = "#96653A"; c.fill();
    // lampu
    c.strokeStyle = "#4A5568"; c.lineWidth = 7; c.lineCap = "round";
    c.beginPath(); c.moveTo(176, 124); c.lineTo(176, 84); c.quadraticCurveTo(176, 62, 150, 62); c.stroke();
    poly(c, [126, 62, 152, 44, 164, 68, 138, 80]); c.fillStyle = L(c, 126, 44, 164, 80, [[0, "#5AA9FF"], [1, "#2C6FC4"]]); c.fill();
    el(c, 148, 78, 10, 5); c.fillStyle = "#FFF1B8"; c.fill();
    el(c, 176, 128, 14, 5); c.fillStyle = "#4A5568"; c.fill();
    // buku terbuka
    poly(c, [64, 122, 106, 114, 106, 128, 64, 136]); c.fillStyle = "#FFFFFF"; c.fill();
    poly(c, [106, 114, 146, 122, 146, 136, 106, 128]); c.fillStyle = "#F2F6FF"; c.fill();
    line(c, 106, 114, 106, 128, 2, "#C9D6E8");
    c.save(); c.globalAlpha = 0.5;
    for (var i = 0; i < 3; i++) { line(c, 72, 124 + i * 4, 100, 119 + i * 4, 1.5, "#9AA6B8"); line(c, 112, 119 + i * 4, 140, 124 + i * 4, 1.5, "#9AA6B8"); }
    c.restore();
  };

  DRAW.hp = function (c) {
    shadow(c, 128, 216, 52, 12, 0.24);
    rr(c, 82, 34, 92, 176, 18); c.fillStyle = L(c, 82, 34, 174, 210, [[0, "#3D4E6B"], [1, "#1A2337"]]); c.fill();
    rr(c, 90, 42, 76, 160, 12); c.fillStyle = L(c, 90, 42, 166, 202, [[0, "#7FD8FF"], [0.5, "#3E9BFF"], [1, "#1E5FB8"]]); c.fill();
    rr(c, 118, 36, 20, 6, 3); c.fillStyle = "#0E1626"; c.fill();
    c.save(); rr(c, 90, 42, 76, 160, 12); c.clip();
    el(c, 150, 70, 26, 26); c.fillStyle = "rgba(255,255,255,.28)"; c.fill();
    for (var r0 = 0; r0 < 4; r0++) {
      for (var c0 = 0; c0 < 3; c0++) {
        rr(c, 100 + c0 * 18, 92 + r0 * 18, 13, 13, 4);
        c.fillStyle = ["#FFFFFF", "#FFE27A", "#FF9AB8", "#8EF0D8"][(r0 + c0) % 4];
        c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1;
      }
    }
    rr(c, 100, 172, 56, 12, 6); c.fillStyle = "rgba(255,255,255,.75)"; c.fill();
    c.restore();
    shine(c, 94, 50, 10, 130, 0.45);
  };

  DRAW.tablet = function (c) {
    shadow(c, 128, 212, 74, 13, 0.24);
    rr(c, 34, 74, 188, 130, 14); c.fillStyle = L(c, 34, 74, 222, 204, [[0, "#4A5A78"], [1, "#1B2436"]]); c.fill();
    rr(c, 44, 84, 168, 110, 8); c.fillStyle = L(c, 44, 84, 212, 194, [[0, "#A6E6FC"], [0.55, "#5AA9FF"], [1, "#2C6FC4"]]); c.fill();
    c.save(); rr(c, 44, 84, 168, 110, 8); c.clip();
    for (var i = 0; i < 4; i++) {
      rr(c, 58 + i * 38, 100, 28, 28, 7);
      c.fillStyle = ["#FFFFFF", "#FFE27A", "#FF9AB8", "#8EF0D8"][i]; c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
    }
    rr(c, 58, 140, 140, 10, 5); c.fillStyle = "rgba(255,255,255,.7)"; c.fill();
    rr(c, 58, 158, 100, 10, 5); c.fillStyle = "rgba(255,255,255,.45)"; c.fill();
    c.restore();
    rr(c, 120, 196, 16, 8, 4); c.fillStyle = "#0E1626"; c.fill();
  };

  DRAW.laptop = function (c) {
    shadow(c, 128, 208, 88, 14, 0.24);
    rr(c, 52, 62, 152, 104, 8); c.fillStyle = L(c, 52, 62, 204, 166, [[0, "#E4EBF5"], [1, "#B9C6D8"]]); c.fill();
    rr(c, 60, 70, 136, 88, 4); c.fillStyle = L(c, 60, 70, 196, 158, [[0, "#2B3A55"], [1, "#16203A"]]); c.fill();
    c.save(); rr(c, 60, 70, 136, 88, 4); c.clip();
    rr(c, 74, 84, 74, 8, 4); c.fillStyle = "#5FD6C0"; c.fill();
    rr(c, 74, 100, 100, 6, 3); c.fillStyle = "#7FA8FF"; c.fill();
    rr(c, 74, 112, 84, 6, 3); c.fillStyle = "#FFC93C"; c.fill();
    rr(c, 74, 124, 108, 6, 3); c.fillStyle = "#FF9AB8"; c.fill();
    rr(c, 74, 136, 60, 6, 3); c.fillStyle = "#8EF0D8"; c.fill();
    c.restore();
    poly(c, [30, 176, 226, 176, 244, 198, 12, 198]); c.fillStyle = L(c, 30, 176, 226, 198, [[0, "#DDE5F0"], [1, "#AEBCCC"]]); c.fill();
    poly(c, [30, 176, 226, 176, 226, 182, 30, 182]); c.fillStyle = "#F6F9FD"; c.fill();
    rr(c, 100, 184, 56, 8, 4); c.fillStyle = "#B9C6D8"; c.fill();
    shine(c, 62, 72, 12, 70, 0.18);
  };

  DRAW.kalungemas = function (c) {
    shadow(c, 128, 214, 52, 12, 0.2);
    c.strokeStyle = gold(c, 60, 60, 200, 170); c.lineWidth = 7; c.lineCap = "round";
    c.beginPath(); c.arc(128, 96, 62, Math.PI * 0.12, Math.PI * 0.88); c.stroke();
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (0.16 + i * 0.085);
      el(c, 128 - Math.cos(a) * 62, 96 + Math.sin(a) * 62, 5, 5);
      c.fillStyle = "#FFF0B8"; c.fill();
    }
    el(c, 128, 96, 8, 8); c.fillStyle = "#C79A2E"; c.fill();
    poly(c, [128, 100, 156, 132, 128, 172, 100, 132]); c.fillStyle = L(c, 100, 100, 156, 172, [[0, "#B8F0FF"], [0.5, "#5FD6F0"], [1, "#2A8FB8"]]); c.fill();
    poly(c, [128, 100, 142, 132, 128, 172]); c.fillStyle = "rgba(255,255,255,.45)"; c.fill();
    poly(c, [128, 100, 114, 132, 128, 172]); c.fillStyle = "rgba(0,40,60,.18)"; c.fill();
    el(c, 128, 100, 10, 6); c.fillStyle = "#F7D46A"; c.fill();
  };

  DRAW.smartwatch = function (c) {
    shadow(c, 128, 212, 46, 11, 0.2);
    rr(c, 104, 34, 48, 58, 12); c.fillStyle = "#4A5568"; c.fill();
    rr(c, 104, 160, 48, 56, 12); c.fillStyle = "#4A5568"; c.fill();
    for (var i = 0; i < 4; i++) { c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(108, 42 + i * 12, 40, 4); c.fillRect(108, 168 + i * 12, 40, 4); }
    rr(c, 86, 76, 84, 96, 20); c.fillStyle = L(c, 86, 76, 170, 172, [[0, "#5B6B85"], [1, "#232E42"]]); c.fill();
    rr(c, 94, 84, 68, 80, 14); c.fillStyle = L(c, 94, 84, 162, 164, [[0, "#7FFFE0"], [0.5, "#2FC8A8"], [1, "#128A72"]]); c.fill();
    c.fillStyle = "#08372D"; c.textAlign = "center"; c.font = "bold 32px system-ui, sans-serif";
    c.fillText("10", 128, 124);
    c.font = "bold 14px system-ui, sans-serif"; c.fillText(":30", 128, 146);
    rr(c, 170, 108, 8, 20, 4); c.fillStyle = "#8FA3C0"; c.fill();
    shine(c, 100, 90, 10, 62, 0.35);
  };

  DRAW.piano = function (c) {
    shadow(c, 128, 208, 84, 13, 0.22);
    rr(c, 34, 118, 188, 74, 8); c.fillStyle = L(c, 34, 118, 222, 192, [[0, "#3B2B2B"], [1, "#1A1111"]]); c.fill();
    rr(c, 34, 118, 188, 16, 8); c.fillStyle = "#5A3A3A"; c.fill();
    for (var i = 0; i < 12; i++) {
      rr(c, 42 + i * 14.4, 134, 12, 50, 2); c.fillStyle = L(c, 42, 134, 54, 184, [[0, "#FFFFFF"], [1, "#E4E9F0"]]); c.fill();
      c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 1; c.stroke();
    }
    for (var k = 0; k < 7; k++) {
      var x = 49 + k * 28.8;
      if (k === 2 || k === 6) continue;
      rr(c, x, 134, 8, 30, 2); c.fillStyle = L(c, x, 134, x + 8, 164, [[0, "#3A3A3A"], [1, "#0E0E0E"]]); c.fill();
    }
    rr(c, 40, 192, 176, 10, 5); c.fillStyle = "#2A1C1C"; c.fill();
    line(c, 60, 202, 52, 214, 8, "#241717"); line(c, 196, 202, 204, 214, 8, "#241717");
    c.fillStyle = "#F7D46A"; c.font = "bold 11px system-ui, sans-serif"; c.textAlign = "center";
    c.fillText("PIANO", 128, 130);
  };

  DRAW.robot = function (c) {
    shadow(c, 128, 212, 56, 12, 0.22);
    line(c, 128, 62, 128, 40, 5, "#8FA3C0");
    el(c, 128, 34, 9, 9); c.fillStyle = "#FF6B8A"; c.fill();
    rr(c, 92, 58, 72, 56, 16); c.fillStyle = L(c, 92, 58, 164, 114, [[0, "#DDE6F2"], [1, "#9AAEC8"]]); c.fill();
    rr(c, 100, 68, 56, 34, 10); c.fillStyle = "#12233D"; c.fill();
    el(c, 116, 84, 8, 8); c.fillStyle = "#7FFFE0"; c.fill();
    el(c, 140, 84, 8, 8); c.fillStyle = "#7FFFE0"; c.fill();
    rr(c, 96, 118, 64, 62, 12); c.fillStyle = L(c, 96, 118, 160, 180, [[0, "#C3D2E4"], [1, "#7E93AE"]]); c.fill();
    rr(c, 108, 130, 40, 26, 6); c.fillStyle = "#1B2B45"; c.fill();
    for (var i = 0; i < 3; i++) { rr(c, 114 + i * 12, 136, 8, 8, 2); c.fillStyle = ["#FFC93C", "#FF6B8A", "#5FD6C0"][i]; c.fill(); }
    line(c, 92, 128, 70, 156, 10, "#9AAEC8"); line(c, 164, 128, 186, 156, 10, "#9AAEC8");
    el(c, 68, 160, 10, 10); c.fillStyle = "#7E93AE"; c.fill();
    el(c, 188, 160, 10, 10); c.fillStyle = "#7E93AE"; c.fill();
    rr(c, 110, 180, 14, 24, 5); c.fillStyle = "#7E93AE"; c.fill();
    rr(c, 132, 180, 14, 24, 5); c.fillStyle = "#7E93AE"; c.fill();
  };

  DRAW.boneka = function (c) {
    shadow(c, 128, 214, 56, 12, 0.22);
    el(c, 86, 78, 17, 17); c.fillStyle = "#B57A45"; c.fill();
    el(c, 170, 78, 17, 17); c.fillStyle = "#B57A45"; c.fill();
    el(c, 86, 78, 9, 9); c.fillStyle = "#E3B183"; c.fill();
    el(c, 170, 78, 9, 9); c.fillStyle = "#E3B183"; c.fill();
    el(c, 128, 120, 34, 32); c.fillStyle = R(c, 118, 108, 6, 44, [[0, "#D9A46A"], [1, "#A46A38"]]); c.fill();
    el(c, 128, 176, 44, 42); c.fillStyle = R(c, 116, 162, 8, 56, [[0, "#C9925B"], [1, "#96602F"]]); c.fill();
    el(c, 76, 172, 16, 20, -0.3); c.fillStyle = "#A96F3C"; c.fill();
    el(c, 180, 172, 16, 20, 0.3); c.fillStyle = "#A96F3C"; c.fill();
    el(c, 128, 92, 5, 4); c.fillStyle = "#2B2118"; c.fill();
    el(c, 116, 106, 5, 4); c.fillStyle = "#2B2118"; c.fill();
    el(c, 140, 106, 5, 4); c.fillStyle = "#2B2118"; c.fill();
    el(c, 128, 116, 12, 9); c.fillStyle = "#EBCBA6"; c.fill();
    el(c, 128, 112, 5, 4); c.fillStyle = "#3A2A22"; c.fill();
    c.strokeStyle = "#3A2A22"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(128, 116); c.lineTo(128, 121); c.moveTo(128, 121); c.quadraticCurveTo(123, 124, 121, 121);
    c.moveTo(128, 121); c.quadraticCurveTo(133, 124, 135, 121); c.stroke();
    el(c, 128, 160, 12, 10); c.fillStyle = "#F7D46A"; c.fill();
    el(c, 128, 160, 5, 5); c.fillStyle = "#E0A92C"; c.fill();
  };

  DRAW.sepaturoda = function (c) {
    shadow(c, 128, 214, 82, 13, 0.22);
    // roda
    for (var w = 0; w < 4; w++) {
      var wx = 64 + w * 36;
      el(c, wx, 192, 14, 14); c.fillStyle = "#1E2A3A"; c.fill();
      el(c, wx, 192, 7, 7); c.fillStyle = "#C3D2E4"; c.fill();
      el(c, wx, 192, 3, 3); c.fillStyle = "#8FA3C0"; c.fill();
    }
    // rangka
    rr(c, 50, 170, 142, 12, 6); c.fillStyle = "#9AAEC8"; c.fill();
    // boot
    poly(c, [56, 172, 58, 138, 70, 112, 98, 100, 128, 108, 140, 128, 154, 142, 186, 150, 190, 172]);
    c.fillStyle = L(c, 56, 100, 190, 172, [[0, "#FF9A7A"], [0.6, "#EF5A38"], [1, "#B83218"]]); c.fill();
    // kerah
    rr(c, 62, 104, 62, 22, 10); c.fillStyle = "#FFF3EE"; c.fill();
    rr(c, 70, 110, 44, 10, 5); c.fillStyle = "#FFC9B6"; c.fill();
    // ujung putih
    poly(c, [56, 172, 58, 146, 78, 136, 92, 150, 94, 172]); c.fillStyle = "#FBFDFF"; c.fill();
    // lidah + tali
    poly(c, [82, 126, 112, 116, 124, 132, 96, 148]); c.fillStyle = "#FFF6F0"; c.fill();
    c.strokeStyle = "#F26D4B"; c.lineWidth = 4; c.lineCap = "round";
    for (var i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(88 + i * 11, 130 + i * 6); c.lineTo(110 + i * 11, 122 + i * 6); c.stroke();
    }
    // pengunci
    rr(c, 120, 138, 26, 12, 5); c.fillStyle = "#E8EEF7"; c.fill();
    // rem tumit
    rr(c, 182, 158, 16, 14, 4); c.fillStyle = "#FFD65A"; c.fill();
    // kilau
    poly(c, [66, 146, 82, 118, 90, 120, 74, 148]); c.fillStyle = "rgba(255,255,255,.35)"; c.fill();
  };

  DRAW.gelangemas = function (c) {
    shadow(c, 128, 214, 54, 11, 0.18);
    c.save(); c.translate(128, 132); c.rotate(-0.28);
    el(c, 0, 0, 66, 44);
    c.strokeStyle = gold(c, -66, -44, 66, 44); c.lineWidth = 15; c.stroke();
    el(c, 0, 0, 66, 44); c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 4; c.stroke();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      el(c, Math.cos(a) * 66, Math.sin(a) * 44, 6, 6); c.fillStyle = "#FFF0B8"; c.fill();
    }
    el(c, 54, 30, 16, 16); c.fillStyle = gold(c, 38, 14, 70, 46); c.fill();
    el(c, 54, 30, 8, 8); c.fillStyle = "#C8102E"; c.fill();
    c.restore();
    el(c, 128, 196, 30, 7); c.fillStyle = "rgba(255,255,255,.25)"; c.fill();
  };

  DRAW.cincinemas = function (c) {
    shadow(c, 128, 212, 48, 11, 0.2);
    el(c, 128, 152, 50, 40); c.strokeStyle = gold(c, 78, 112, 178, 192); c.lineWidth = 17; c.stroke();
    el(c, 128, 142, 50, 34); c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 4; c.stroke();
    poly(c, [128, 56, 158, 92, 128, 138, 98, 92]); c.fillStyle = L(c, 98, 56, 158, 138, [[0, "#EAFBFF"], [0.55, "#8FE0FF"], [1, "#3E9BFF"]]); c.fill();
    poly(c, [128, 56, 128, 138, 98, 92]); c.fillStyle = "rgba(255,255,255,.45)"; c.fill();
    poly(c, [128, 56, 158, 92, 128, 138]); c.fillStyle = "rgba(0,40,80,.16)"; c.fill();
    line(c, 128, 56, 158, 92, 2, "rgba(255,255,255,.75)");
    line(c, 158, 92, 108, 92, 2, "rgba(255,255,255,.55)");
    el(c, 128, 128, 6, 6); c.fillStyle = gold(c, 120, 120, 136, 136); c.fill();
  };

  DRAW.mobil = function (c) {
    shadow(c, 128, 206, 92, 14, 0.24);
    poly(c, [30, 158, 26, 132, 62, 122, 84, 96, 148, 88, 182, 116, 220, 122, 230, 150, 226, 166, 34, 166]);
    c.fillStyle = L(c, 30, 88, 230, 166, [[0, "#FF7A8C"], [0.5, "#EF4B5E"], [1, "#B62539"]]); c.fill();
    poly(c, [88, 100, 142, 94, 172, 118, 82, 120]); c.fillStyle = L(c, 82, 94, 172, 120, [[0, "#D8F4FF"], [1, "#7FC8EC"]]); c.fill();
    poly(c, [150, 94, 168, 116, 178, 116, 160, 95]); c.fillStyle = "rgba(0,0,0,.12)"; c.fill();
    rr(c, 196, 126, 30, 12, 6); c.fillStyle = "#FFF1B8"; c.fill();
    rr(c, 34, 128, 20, 10, 5); c.fillStyle = "#FF6B6B"; c.fill();
    line(c, 34, 148, 226, 148, 3, "rgba(0,0,0,.14)");
    function wheel(x) {
      el(c, x, 166, 24, 24); c.fillStyle = "#1B2430"; c.fill();
      el(c, x, 166, 12, 12); c.fillStyle = "#C3D2E4"; c.fill();
      el(c, x, 166, 5, 5); c.fillStyle = "#8FA3C0"; c.fill();
    }
    wheel(80); wheel(180);
    poly(c, [58, 100, 84, 96, 80, 104, 54, 108]); c.fillStyle = "rgba(255,255,255,.35)"; c.fill();
  };

  DRAW.liburan = function (c) {
    shadow(c, 128, 212, 82, 14, 0.22);
    el(c, 196, 72, 26, 26); c.fillStyle = R(c, 196, 72, 2, 28, [[0, "#FFF3B0"], [1, "#FFC93C"]]); c.fill();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      line(c, 196 + Math.cos(a) * 30, 72 + Math.sin(a) * 30, 196 + Math.cos(a) * 38, 72 + Math.sin(a) * 38, 3, "#FFD65A");
    }
    rr(c, 56, 108, 132, 96, 12); c.fillStyle = L(c, 56, 108, 188, 204, [[0, "#5AD6BC"], [1, "#1E9E86"]]); c.fill();
    rr(c, 56, 108, 132, 26, 12); c.fillStyle = "#7FE4D0"; c.fill();
    line(c, 72, 130, 172, 130, 4, "#137A66");
    c.strokeStyle = "#B57A2F"; c.lineWidth = 7; c.lineCap = "round";
    c.beginPath(); c.moveTo(150, 112); c.lineTo(150, 96); c.quadraticCurveTo(150, 86, 162, 86); c.stroke();
    rr(c, 84, 142, 44, 32, 6); c.fillStyle = "rgba(255,255,255,.9)"; c.fill();
    rr(c, 92, 150, 28, 16, 3); c.fillStyle = "#3E9BFF"; c.fill();
    poly(c, [72, 108, 92, 78, 108, 108]); c.fillStyle = "#FFC93C"; c.fill();
    c.fillStyle = "#FFFFFF"; c.font = "bold 13px system-ui, sans-serif"; c.textAlign = "center";
    c.fillText("TRIP", 106, 196);
    c.save(); c.translate(168, 168); c.rotate(-0.3);
    poly(c, [-20, 0, 18, -10, 24, -4, -6, 8, -16, 14, -12, 2]);
    c.fillStyle = "#FFFFFF"; c.fill();
    c.restore();
  };

  /* -------------------------------------------------------------- KOIN Rp */
  function drawCoin(c) {
    c.clearRect(0, 0, S, S);
    var cx = 128, cy = 128, r = 96;
    c.save();
    c.translate(cx, cy);
    // ketebalan koin
    for (var d = 12; d >= 1; d--) {
      c.beginPath(); c.arc(0, d * 0.9, r, 0, Math.PI * 2);
      c.fillStyle = d > 6 ? "#A06C10" : "#B87C16"; c.fill();
    }
    // muka koin
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2);
    c.fillStyle = R(c, -r * 0.4, -r * 0.5, r * 0.1, r * 1.5, [[0, "#FFF7D0"], [0.35, "#F7D46A"], [0.72, "#DFA72A"], [1, "#A9761A"]]);
    c.fill();
    // cincin tepi
    c.beginPath(); c.arc(0, 0, r * 0.995, 0, Math.PI * 2);
    c.strokeStyle = "rgba(120,80,10,.55)"; c.lineWidth = 4; c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.86, 0, Math.PI * 2);
    c.strokeStyle = "rgba(255,244,190,.75)"; c.lineWidth = 3; c.stroke();
    // teks Rp emboss
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "bold 92px 'Fredoka', system-ui, sans-serif";
    c.fillStyle = "rgba(120,78,8,.55)";
    c.fillText("Rp", 3, 6);
    c.fillStyle = R(c, -22, -20, 4, 90, [[0, "#FFFDF0"], [0.6, "#FFE9A8"], [1, "#D9A32A"]]);
    c.fillText("Rp", 0, 0);
    c.lineWidth = 2; c.strokeStyle = "rgba(255,255,255,.55)";
    c.strokeText("Rp", 0, 0);
    // kilau
    c.save(); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
    c.fillStyle = "rgba(255,255,255,.35)";
    c.beginPath(); c.ellipse(-38, -52, 58, 26, -0.5, 0, Math.PI * 2); c.fill();
    c.restore();
    c.restore();
  }

  /* ------------------------------------------------------------ KOMPOSISI */
  function cardBg(c, detail) {
    c.clearRect(0, 0, S, S);
    // piringan putih (kartu) dengan tepi emas
    rr(c, 12, 12, 232, 232, 40);
    c.fillStyle = L(c, 12, 12, 244, 244, [[0, "#FFFFFF"], [0.55, "#F6FAFF"], [1, "#DDE9F7"]]); c.fill();
    rr(c, 12, 12, 232, 232, 40);
    c.strokeStyle = L(c, 12, 12, 244, 244, [[0, "#FFE9A8"], [1, "#D9A32A"]]);
    c.lineWidth = 7; c.stroke();
    // lingkar dalam
    rr(c, 26, 26, 204, 204, 30);
    c.strokeStyle = "rgba(90,140,200,.20)"; c.lineWidth = 2; c.stroke();
    if (detail >= 2) {
      c.save();
      rr(c, 12, 12, 232, 232, 40); c.clip();
      c.fillStyle = "rgba(255,255,255,.55)";
      c.beginPath(); c.moveTo(30, 12); c.lineTo(120, 12); c.lineTo(40, 244); c.lineTo(12, 244); c.closePath(); c.fill();
      c.restore();
    }
  }

  /* --------------------------------------------------------------- API */
  function itemCanvas(id, size, detail) {
    var c = cv(size || S);
    var x = c.getContext("2d");
    x.save(); x.scale(c.width / S, c.height / S);
    cardBg(x, detail || 1);
    x.save();
    rr(x, 26, 26, 204, 204, 30); x.clip();
    (DRAW[id] || DRAW.nasi)(x);
    x.restore();
    x.restore();
    return c;
  }

  function texture(id, detail) {
    if (!T) return null;
    var key = id + "|" + (detail || 1);
    if (textures[key]) return textures[key];
    var c = itemCanvas(id, 320, detail);
    var t = new T.CanvasTexture(c);
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = T.LinearMipmapLinearFilter;
    t.needsUpdate = true;
    textures[key] = t;
    return t;
  }

  function labelCanvas(text) {
    var font = "bold 64px 'Fredoka', 'Nunito', system-ui, sans-serif";
    var m = document.createElement("canvas").getContext("2d");
    m.font = font;
    var w = Math.ceil(m.measureText(text).width) + 64;
    var c = cv(1);
    c.width = Math.max(64, w);
    c.height = 96;
    var x = c.getContext("2d");
    rr(x, 2, 8, c.width - 4, 80, 40);
    x.fillStyle = "rgba(11,20,38,.92)";
    x.fill();
    rr(x, 2, 8, c.width - 4, 80, 40);
    x.strokeStyle = "rgba(255,255,255,.30)";
    x.lineWidth = 3;
    x.stroke();
    x.font = font;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "#FFFFFF";
    x.fillText(text, c.width / 2, 50);
    return c;
  }

  function labelTexture(text) {
    if (!T) return null;
    if (labels[text]) return labels[text];
    var c = labelCanvas(text);
    var t = new T.CanvasTexture(c);
    t.anisotropy = 8;
    t.minFilter = T.LinearFilter;
    t.needsUpdate = true;
    labels[text] = t;
    return t;
  }

  JR.Art = {
    DRAW: DRAW,
    drawCoin: drawCoin,
    itemCanvas: itemCanvas,
    texture: texture,
    labelTexture: labelTexture,
    labelCanvas: labelCanvas,
    coinCanvas: function (size) {
      var c = cv(size || 512);
      var x = c.getContext("2d");
      x.save(); x.scale(c.width / S, c.height / S);
      drawCoin(x);
      x.restore();
      return c;
    },
    icon: function (id) {
      if (icons[id]) return icons[id];
      var c = itemCanvas(id, 200, 1);
      icons[id] = c.toDataURL("image/png");
      return icons[id];
    },
    coinIcon: function () {
      if (icons.__coin) return icons.__coin;
      icons.__coin = JR.Art.coinCanvas(256).toDataURL("image/png");
      return icons.__coin;
    }
  };
})(typeof window !== "undefined" ? window : global);
