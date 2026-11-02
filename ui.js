/* KeKe Run — lapisan UI (DOM)
 * Membangun layar, HUD per Murid, papan skor, dan meneruskan aksi ke Game.
 */
(function (root) {
  "use strict";
  var JR = root.JR;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };

  var ui = {
    hud: [],
    screens: {},
    current: null,
    els: {}
  };

  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:60%;height:60%"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z" fill="currentColor"/></svg>';
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8.4-5.3-10.7-9.6C-1 7.7 1.4 4 5.2 4c2.3 0 4.1 1.3 5.1 2.8L12 8.9l1.7-2.1C14.7 5.3 16.5 4 18.8 4 22.6 4 25 7.7 22.7 11.4 20.4 15.7 12 21 12 21z" fill="currentColor"/></svg>';

  var ICON = {
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    jump: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* --------------------------------------------------------------- SCREEN */
  ui.init = function () {
    ui.els.stage = $("#stage");
    ui.els.board = $("#board");
    ui.els.topbar = $("#topbar");
    ui.els.levelName = $("#level-name");
    ui.els.countdown = $("#countdown");
    ui.els.countdownNum = $("#countdown-num");
    ui.els.toast = $("#toast");
    ui.els.sr = $("#sr");
    ["title", "setup", "confirm", "intro", "pause", "results", "board", "help", "goals"].forEach(function (k) {
      ui.screens[k] = $("#screen-" + k);
    });

    // aksi global
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-action]");
      if (!btn) return;
      ev.preventDefault();
      JR.Audio.sfx("click");
      if (root.JR.Game && JR.Game.action) JR.Game.action(btn.dataset.action, btn, ev);
    });

    // tombol arah per kolom
    ui.els.board.addEventListener("pointerdown", function (ev) {
      var btn = ev.target.closest("[data-move],[data-jump]");
      if (!btn) return;
      ev.preventDefault();
      var slot = btn.closest(".slot");
      if (!slot) return;
      var i = parseInt(slot.dataset.slot, 10);
      btn.classList.add("is-press");
      if (btn.dataset.jump) JR.Game.press(i, 0, true);
      else JR.Game.press(i, parseInt(btn.dataset.move, 10), false);
      setTimeout(function () { btn.classList.remove("is-press"); }, 110);
    }, { passive: false });

    // keyboard
    root.addEventListener("keydown", function (ev) {
      if (ev.repeat) return;
      JR.Game.keyDown(ev);
    });
    root.addEventListener("keyup", function (ev) { JR.Game.keyUp(ev); });
    root.addEventListener("blur", function () { JR.Game.blur(); });
  };

  ui.show = function (name) {
    Object.keys(ui.screens).forEach(function (k) {
      var on = k === name;
      var el = ui.screens[k];
      if (!el) return;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
    });
    ui.current = name;
  };

  ui.hideScreens = function () {
    Object.keys(ui.screens).forEach(function (k) {
      ui.screens[k].classList.remove("is-on");
      ui.screens[k].setAttribute("aria-hidden", "true");
    });
    ui.current = null;
  };

  ui.toast = function (text, ms) {
    var t = ui.els.toast;
    t.textContent = text;
    t.classList.add("is-on");
    clearTimeout(ui._toastT);
    ui._toastT = setTimeout(function () { t.classList.remove("is-on"); }, ms || 1700);
  };

  ui.announce = function (text) { if (ui.els.sr) ui.els.sr.textContent = text; };

  ui.topbar = function (on) { ui.els.topbar.classList.toggle("is-hidden", !on); };

  ui.setLevel = function (text) { ui.els.levelName.textContent = text; };

  ui.setMuted = function (muted) {
    var b = document.querySelector('[data-action="mute"]');
    if (b) { b.classList.toggle("is-off", muted); b.setAttribute("aria-pressed", muted ? "true" : "false"); }
  };

  /* ------------------------------------------------------------------ HUD */
  ui.buildBoard = function (n, players) {
    ui.els.board.innerHTML = "";
    ui.hud = [];
    for (var i = 0; i < n; i++) {
      var slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.slot = String(i);
      slot.innerHTML =
        '<div class="slot-hud">' +
          '<div class="pname"></div>' +
          '<div class="hud-right"><div class="hearts"></div><div class="score">0</div></div>' +
        '</div>' +
        '<div class="quest"><span class="qlabel">SOAL 1</span><span class="qtext"></span>' +
          '<span class="qhint"></span><div class="qbar"><span></span></div></div>' +
        '<div class="pad">' +
          '<button data-move="-1" aria-label="Geser ke kiri">' + ICON.left + '</button>' +
          '<button class="jump" data-jump="1" aria-label="Lompat">' + ICON.jump + '</button>' +
          '<button data-move="1" aria-label="Geser ke kanan">' + ICON.right + '</button>' +
        '</div>';
      ui.els.board.appendChild(slot);
      ui.hud.push({
        slot: slot,
        name: $(".pname", slot),
        hearts: $(".hearts", slot),
        score: $(".score", slot),
        quest: $(".quest", slot),
        qtext: $(".qtext", slot),
        qlabel: $(".qlabel", slot),
        qhint: $(".qhint", slot),
        qbar: $(".qbar span", slot),
        pad: $(".pad", slot),
        last: { score: -1, lives: -1, mission: "", pct: -1, name: "", qno: "" }
      });
      if (players && players[i]) ui.hud[i].name.textContent = players[i].name;
    }
    return ui.hud;
  };

  ui.updateHUD = function (i, d) {
    var h = ui.hud[i];
    if (!h) return;
    if (d.name !== h.last.name) { h.name.textContent = d.name; h.last.name = d.name; }
    if (d.lives !== h.last.lives) {
      var html = "";
      for (var k = 0; k < 3; k++) html += '<span class="heart' + (k < d.lives ? "" : " is-off") + '">' + HEART + '</span>';
      h.hearts.innerHTML = html;
      h.last.lives = d.lives;
    }
    if (d.score !== h.last.score) {
      h.score.textContent = JR.fmt(d.score);
      if (d.score > h.last.score && h.last.score >= 0) {
        h.score.classList.remove("bump");
        void h.score.offsetWidth;
        h.score.classList.add("bump");
      }
      h.last.score = d.score;
    }
    var qno = d.qno ? String(d.qno) : "1";
    if (qno !== h.last.qno) {
      h.qlabel.textContent = "SOAL " + qno;
      h.last.qno = qno;
    }
    if (d.mission !== h.last.mission) {
      h.qtext.textContent = d.mission;
      h.last.mission = d.mission;
      h.quest.classList.remove("is-change");
      void h.quest.offsetWidth;
      h.quest.classList.add("is-change");
    }
    if (d.hint !== h.last.hint) { h.qhint.textContent = d.hint || ""; h.last.hint = d.hint; }
    if (d.color && h.quest.style.getPropertyValue("--mission") !== d.color) h.quest.style.setProperty("--mission", d.color);
    var pct = Math.round(d.pct || 0);
    if (pct !== h.last.pct) { h.qbar.style.width = pct + "%"; h.last.pct = pct; }
  };

  ui.resetHUD = function () {
    ui.hud.forEach(function (h) { h.last = { score: -1, lives: -1, mission: "", pct: -1, name: "", qno: "" }; });
  };

  /* -------------------------------------------------------------- SETUP */
  ui.buildSetup = function (state) {
    var modeWrap = $("#mode-list");
    modeWrap.innerHTML = JR.MODES.map(function (m) {
      return '<button class="mode-card' + (m.n === state.mode ? " is-on" : "") + '" data-mode="' + m.n + '">' +
        '<span class="mode-n">' + m.n + '</span>' +
        '<span class="mode-name">' + m.name.toUpperCase() + '</span>' +
        '<span class="mode-desc">' + m.desc + '</span></button>';
    }).join("");

    var list = $("#player-list");
    list.innerHTML = "";
    state.players.slice(0, state.mode || state.players.length).forEach(function (p, i) {
      var av = avatarById(p.avatar);
      var row = document.createElement("div");
      row.className = "player-row" + (i === state.focus ? " is-on" : "");
      row.dataset.player = String(i);
      row.innerHTML =
        '<span class="player-swatch" style="background:' + av.shirt + '">' + (i + 1) + '</span>' +
        '<input class="player-input" maxlength="12" value="' + escapeAttr(p.name) + '" placeholder="Murid ' + (i + 1) + '" aria-label="Nama Murid ' + (i + 1) + '">' +
        '<span class="kbd">' + keyboardHint(i) + '</span>';
      list.appendChild(row);
    });

    var avs = $("#avatar-list");
    var thumbs = {};
    try { thumbs = JR.Preview3D.thumbs(); } catch (e) { thumbs = {}; }
    avs.innerHTML = JR.AVATARS.map(function (a) {
      var cur = state.players[state.focus];
      var img = thumbs[a.id]
        ? '<span class="avatar-thumb"><img src="' + thumbs[a.id] + '" alt=""></span>'
        : '<span class="avatar-swatch" style="background:linear-gradient(180deg,' + a.shirt + ' 0 55%,' + a.hatColor + ' 55% 100%);"></span>';
      return '<button class="avatar-chip' + (cur && cur.avatar === a.id ? " is-on" : "") + '" data-avatar="' + a.id + '">' +
        img + '<span>' + a.name + '</span></button>';
    }).join("");

    var cur = state.players[state.focus] || state.players[0];
    var cav = avatarById(cur.avatar);
    $("#preview-slot").textContent = "MURID " + (state.focus + 1);
    $("#preview-avatar").textContent = cav.name;

    // input nama
    Array.prototype.forEach.call(list.querySelectorAll(".player-input"), function (inp, i) {
      inp.addEventListener("input", function () { JR.Game.setName(i, inp.value); });
      inp.addEventListener("focus", function () { JR.Game.focusPlayer(i); });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") inp.blur(); });
    });
    list.addEventListener("click", function (ev) {
      var row = ev.target.closest(".player-row");
      if (row && !ev.target.classList.contains("player-input")) JR.Game.focusPlayer(parseInt(row.dataset.player, 10));
    });
    modeWrap.onclick = function (ev) {
      var b = ev.target.closest("[data-mode]");
      if (b) JR.Game.setMode(parseInt(b.dataset.mode, 10));
    };
    avs.onclick = function (ev) {
      var b = ev.target.closest("[data-avatar]");
      if (b) JR.Game.setAvatar(b.dataset.avatar);
    };
  };

  ui.setFocus = function (state) {
    Array.prototype.forEach.call(document.querySelectorAll(".player-row"), function (row, i) {
      row.classList.toggle("is-on", i === state.focus);
    });
    var cur = state.players[state.focus];
    if (!cur) return;
    var cav = avatarById(cur.avatar);
    var slot = $("#preview-slot"), name = $("#preview-avatar");
    if (slot) slot.textContent = "MURID " + (state.focus + 1);
    if (name) name.textContent = cav.name;
  };

  ui.updateAvatarChips = function (state) {
    var cur = state.players[state.focus];
    Array.prototype.forEach.call(document.querySelectorAll(".avatar-chip"), function (b) {
      b.classList.toggle("is-on", !!cur && b.dataset.avatar === cur.avatar);
    });
  };

  function avatarById(id) {
    return JR.AVATARS.filter(function (a) { return a.id === id; })[0] || JR.AVATARS[0];
  }
  function escapeAttr(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function keyboardHint(i) {
    var map = ["W A D", "I J L", "PANAH", "NUMPAD"];
    return map[i] || "";
  }

  /* -------------------------------------------------------------- INTRO */
  ui.renderIntro = function (i, total) {
    var s = JR.INTRO[i];
    $("#intro-kicker").textContent = s.kicker;
    $("#intro-title").textContent = s.title;
    $("#intro-body").textContent = s.body || "";
    $("#intro-body").style.display = s.body ? "" : "none";
    $("#intro-note").textContent = s.note || "";
    $("#intro-note").style.display = s.note ? "" : "none";

    var chips = $("#intro-chips");
    chips.innerHTML = (s.chips || []).map(function (c) {
      var item = JR.ITEMS[c[0]];
      return '<span class="chip"><img src="' + item.icon + '" alt="" width="30" height="30">' + c[1] + '</span>';
    }).join("");

    var art = $("#intro-art");
    if (s.tiers) {
      art.innerHTML = s.tiers.map(function (t) {
        var cat = JR.CATS.filter(function (c) { return c.id === t[0]; })[0];
        return '<div class="tier" style="--c:' + cat.color + '">' +
          '<div><div class="tier-name" style="color:' + cat.color + '">' + t[1] + '</div>' +
          '<div class="tier-desc">' + t[2] + '</div></div>' +
          '<div class="tier-icons">' + t[3].map(function (id) {
            return '<img src="' + JR.ITEMS[id].icon + '" alt="' + JR.ITEMS[id].label + '" width="26" height="26">';
          }).join("") + '</div></div>';
      }).join("");
    } else if ((s.chips || []).length) {
      art.innerHTML = s.chips.map(function (c) {
        return '<img src="' + JR.ITEMS[c[0]].icon + '" alt="' + JR.ITEMS[c[0]].label + '" style="width:clamp(64px,8vw,104px);height:auto;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45))">';
      }).join("");
    } else {
      art.innerHTML = '<img class="big-coin" src="assets/img/coin.png" alt="">';
    }

    var dots = $("#intro-dots");
    dots.innerHTML = "";
    for (var d = 0; d < total; d++) {
      var el = document.createElement("span");
      el.className = "dot" + (d === i ? " is-on" : "");
      dots.appendChild(el);
    }
    var next = document.querySelector('[data-action="intro-next"]');
    next.textContent = i === total - 1 ? "SELESAI" : "LANJUT";
    var prev = document.querySelector('[data-action="intro-prev"]');
    prev.disabled = i === 0;
    prev.style.opacity = i === 0 ? "0.35" : "1";
  };

  /* ------------------------------------------------------------- HASIL */
  ui.renderResults = function (rows, totalTime, title) {
    $("#results-title").textContent = title || "Hasil Lari";
    $("#results-time").textContent = totalTime;
    var wrap = $("#results-list");
    wrap.innerHTML = rows.map(function (r, i) {
      var win = i === 0 && r.score > 0;
      return '<div class="result-row' + (win ? " is-win" : "") + '">' +
        '<span class="medal">' + (win ? STAR : (i + 1)) + '</span>' +
        '<div><div class="result-name">' + escapeAttr(r.name) + '</div>' +
        '<div class="result-sub">' + r.lives + ' nyawa sisa · ' + r.collected + ' benda benar · ' + r.wrong + ' salah · level ' + r.level + '</div></div>' +
        '<span class="result-time result-sub">' + r.time + '</span>' +
        '<span class="result-score">' + JR.fmt(r.score) + '</span></div>';
    }).join("");
  };

  /* --------------------------------------------------------- PAPAN SKOR */
  ui.renderBoard = function (rows) {
    var body = $("#board-body");
    body.innerHTML = rows.map(function (r, i) {
      return '<tr' + (r.isNew ? ' class="is-new"' : "") + '>' +
        '<td class="' + (i === 0 ? "rank-1" : "") + '">' + (i + 1) + '</td>' +
        '<td>' + escapeAttr(r.name) + '</td>' +
        '<td>' + r.mode + '</td>' +
        '<td><strong>' + JR.fmt(r.score) + '</strong></td>' +
        '<td>' + r.time + '</td>' +
        '<td>' + r.level + '</td></tr>';
    }).join("");
    $("#board-empty").style.display = rows.length ? "none" : "";
  };

  /* -------------------------------------------------------------- BANTU */
  ui.renderHelp = function () {
    var grid = $("#help-grid");
    var cards = [
      ["Tujuan", "<p>Ambil benda yang sesuai <strong>soal di tengah layarmu</strong>. Salah ambil atau kena lubang = nyawa berkurang 1. Nyawa ada 3.</p>"],
      ["Tiga tingkat", "<ul><li><strong>Primer</strong> — nasi, air minum, pakaian, rumah, buku, seragam.</li><li><strong>Sekunder</strong> — tas, sepatu, sepeda, televisi, krayon.</li><li><strong>Tersier</strong> — HP, laptop, mobil, perhiasan emas, liburan.</li></ul>"],
      ["Poin", "<ul><li>Benda benar: +10 (dikali level, ada bonus kombo).</li><li>Lompati lubang: +5. Finis: +60 dan +25 per nyawa sisa.</li><li>Soal berganti setiap 55 poin: primer → sekunder → tersier.</li></ul>"],
      ["Kontrol", "<ul><li>Murid 1: <kbd>A</kbd> <kbd>D</kbd> geser, <kbd>W</kbd> lompat.</li><li>Murid 2: <kbd>J</kbd> <kbd>L</kbd>, <kbd>I</kbd> lompat.</li><li>Murid 3: <kbd>←</kbd> <kbd>→</kbd>, <kbd>↑</kbd> lompat.</li><li>Murid 4: numpad <kbd>4</kbd> <kbd>6</kbd>, <kbd>8</kbd> lompat.</li><li>Sentuh: tombol kiri, lompat, kanan di bawah kolom.</li></ul>"]
    ];
    grid.innerHTML = cards.map(function (c) {
      return '<div class="help-card"><h3>' + c[0] + '</h3>' + c[1] + '</div>';
    }).join("");
  };

  /* -------------------------------------------------------- KONFIRMASI */
  ui.renderConfirm = function (players) {
    var samples = {
      primer: ["nasi", "air", "pakaian", "buku"],
      sekunder: ["tas", "sepatu", "sepeda", "eskrim"],
      tersier: ["hp", "laptop", "mobil", "kalungemas"]
    };
    $("#confirm-tiers").innerHTML = JR.CATS.map(function (cat) {
      return '<div class="tier-card" style="--c:' + cat.color + '">' +
        '<span class="tier-num">' + cat.num + '</span>' +
        '<h3>' + cat.full + '</h3>' +
        '<p>' + cat.hint + '</p>' +
        '<div class="tier-items">' + samples[cat.id].map(function (id) {
          return '<img src="' + JR.ITEMS[id].icon + '" alt="' + JR.ITEMS[id].label + '" title="' + JR.ITEMS[id].label + '">';
        }).join("") + '</div></div>';
    }).join("");

    $("#confirm-players").innerHTML = players.map(function (p, i) {
      var av = avatarById(p.avatar);
      return '<span class="confirm-player"><span class="cp-dot" style="background:' + av.shirt + '">' + (i + 1) + '</span>' +
        escapeAttr(p.name || ("Murid " + (i + 1))) + '</span>';
    }).join("");
    $("#confirm-title").textContent = players.length + " Murid Siap Berlari";
  };

  ui.renderGoals = function () {
    var el = $("#goals-text");
    if (el) el.textContent = JR.APP.goal;
  };

  /* ---------------------------------------------------------- CONFIRM */
  ui.confirm = function (text, onYes) {
    var b = document.querySelector('[data-action="reset-scores"]');
    if (b && !b.dataset.armed) {
      b.dataset.armed = "1";
      b.textContent = text;
      setTimeout(function () {
        if (!b.dataset.armed) return;
        delete b.dataset.armed;
        b.textContent = "HAPUS SEMUA SKOR";
      }, 4000);
      return;
    }
    if (b) { delete b.dataset.armed; b.textContent = "HAPUS SEMUA SKOR"; }
    onYes();
  };

  ui.avatarById = avatarById;
  JR.UI = ui;
})(typeof window !== "undefined" ? window : global);
