/* KeKe Run — mesin permainan (state, mode, soal, skor, level)
 */
(function (root) {
  "use strict";
  var JR = root.JR;

  var Game = {
    state: "title",
    mode: 3,
    players: [],
    focus: 0,
    levelIndex: 0,
    levelTime: 0,
    runTime: 0,
    cd: 0,
    cdShown: null,
    startedGo: false,
    lastTs: 0,
    active: [],
    introIndex: 0
  };

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function storeKey() { return JR.APP.storageKey + ".scores"; }
  function loadScores() {
    try {
      var raw = localStorage.getItem(storeKey());
      // pindahkan skor versi sebelumnya (kalau ada) sekali saja
      if (!raw && JR.APP.legacyKey) {
        var old = localStorage.getItem(JR.APP.legacyKey + ".scores");
        if (old) { localStorage.setItem(storeKey(), old); raw = old; }
      }
      return JSON.parse(raw || "[]") || [];
    } catch (e) { return []; }
  }
  function saveScores(list) {
    try { localStorage.setItem(storeKey(), JSON.stringify(list.slice(0, 20))); } catch (e) {}
  }

  /* --------------------------------------------------------------- INIT */
  Game.init = function () {
    if (this.world) return;
    for (var i = 0; i < 4; i++) this.players.push({ name: "", avatar: JR.AVATARS[i].id });
    JR.UI.init();
    this.world = new JR.World(document.getElementById("stage"), document.getElementById("board"));
    this.preview = new JR.Preview3D(document.getElementById("preview"));
    this.preview.setAvatar(JR.UI.avatarById(this.players[0].avatar));
    JR.UI.renderHelp();
    JR.UI.renderGoals();
    JR.UI.setMuted(JR.Audio.isMuted());
    JR.Audio.armUnlock();
    JR.Audio.playMusic("musicMain");

    var self = this;
    root.addEventListener("resize", function () { self.resize(); });
    root.addEventListener("orientationchange", function () { setTimeout(function () { self.resize(); }, 250); });

    this.toTitle();
    requestAnimationFrame(function (ts) { self.loop(ts); });
  };

  Game.resize = function () {
    if (!this.world) return;
    this.world.resize();
    if (this.preview) this.preview.resize();
  };

  /* ---------------------------------------------------------------- LOOP */
  Game.loop = function (ts) {
    var dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 0.016;
    this.lastTs = ts;
    this.update(dt);
    if (this.world) this.world.render();
    if (this.preview && this.state === "setup") this.preview.render(dt);
    var self = this;
    requestAnimationFrame(function (t) { self.loop(t); });
  };

  Game.setClean = function (clean) {
    if (this.world && this.world.board) this.world.board.classList.toggle("is-clean", clean);
  };

  Game.idleStates = { title: 1, setup: 1, confirm: 1, materials: 1, help: 1, board: 1, goals: 1 };

  Game.update = function (dt) {
    var i;
    if (this.idleStates[this.state]) {
      if (this.world) this.world.runners.forEach(function (r) { r.update(dt, 3.0, 0, JR.LEVELS[0].dur); });
      return;
    }
    if (this.state === "countdown") {
      if (this.world) this.world.runners.forEach(function (r) { r.update(dt, 2.4, this.levelIndex, JR.LEVELS[this.levelIndex].dur); }, this);
      this.tickCountdown(dt);
      return;
    }
    if (this.state !== "play") return;   // jeda / hasil: dunia dibekukan

    var lv = JR.LEVELS[this.levelIndex];
    this.levelTime += dt;
    this.runTime += dt;
    var prog = JR.clamp(this.levelTime / lv.dur, 0, 1);
    var speed = JR.lerp(lv.speed, lv.speedEnd, prog);
    var remaining = Math.max(0, lv.dur - this.levelTime);

    for (i = 0; i < this.world.runners.length; i++) {
      var r = this.world.runners[i];
      // soal mengikuti poin Murid: primer → sekunder → tersier → ulang
      var want = JR.questAt(r.score);
      if (r.mission !== want.id && r.status !== "out") {
        if (r.setMission(want.id) && r.status === "run") {
          JR.Audio.sfx("levelup", { volume: 0.35 });
          JR.UI.toast(this.active[i].name + " · soal " + want.full);
        }
      }
      r.update(dt, speed, this.levelIndex, remaining);
      this.syncHUD(i);
    }

    if (this.levelTime >= lv.dur) this.nextLevel();
    else if (this.everyoneDone()) this.endRun();
  };

  Game.syncHUD = function (i) {
    var r = this.world.runners[i];
    if (!r || !this.active[i]) return;
    var cat = JR.questAt(r.score);
    var pct = (r.score % JR.QUEST.step) / JR.QUEST.step * 100;
    JR.UI.updateHUD(i, {
      name: this.active[i].name,
      lives: r.lives,
      score: r.score,
      mission: cat.full,
      hint: "Ambil yang " + cat.hint,
      color: cat.color,
      qno: JR.questNo(r.score),
      pct: pct
    });
  };

  Game.everyoneDone = function () {
    return this.world.runners.every(function (r) { return r.status === "out" || r.status === "done"; });
  };

  /* -------------------------------------------------------------- LAYAR */
  Game.toTitle = function () {
    this.state = "title";
    JR.UI.hideScreens();
    JR.UI.show("title");
    JR.UI.topbar(false);
    this.setClean(true);
    var list = [{ name: "Murid 1", avatar: this.players[0].avatar },
                { name: "Murid 2", avatar: this.players[1].avatar },
                { name: "Murid 3", avatar: this.players[2].avatar }];
    JR.UI.buildBoard(3, list);
    this.world.setCount(3, list.map(function (p) { return JR.UI.avatarById(p.avatar); }));
    this.resize();
    JR.Audio.playMusic("musicMain");
  };

  Game.openSetup = function () {
    this.state = "setup";
    JR.UI.show("setup");
    JR.UI.buildSetup({ mode: this.mode, players: this.players, focus: this.focus });
    this.preview.setAvatar(JR.UI.avatarById(this.players[this.focus].avatar));
    var self = this;
    setTimeout(function () { self.preview.resize(); }, 60);
    this.setClean(true);
  };

  Game.openConfirm = function () {
    var n = this.mode, list = [], i;
    for (i = 0; i < n; i++) {
      var p = this.players[i];
      list.push({ name: (p.name || "").trim() || ("Murid " + (i + 1)), avatar: p.avatar });
    }
    this.active = list;
    this.state = "confirm";
    JR.UI.show("confirm");
    JR.UI.renderConfirm(list);
    JR.UI.buildBoard(n, list);
    this.world.setCount(n, list.map(function (q) { return JR.UI.avatarById(q.avatar); }));
    this.resize();
    this.setClean(true);
  };

  Game.openMaterials = function (from) {
    this.returnTo = from || "title";
    this.state = "materials";
    this.introIndex = 0;
    JR.UI.show("intro");
    JR.UI.renderIntro(0, JR.INTRO.length);
    this.setClean(true);
    JR.Audio.playMusic("musicTrailer");
  };

  Game.openBoard = function (from) {
    this.returnTo = from || (JR.UI.current === "results" ? "results" : "title");
    this.state = "board";
    JR.UI.show("board");
    JR.UI.renderBoard(loadScores().map(function (r) { return r; }));
    this.setClean(true);
  };

  Game.openHelp = function () {
    this.returnTo = JR.UI.current === "results" ? "results" : "title";
    this.state = "help";
    JR.UI.show("help");
    this.setClean(true);
  };

  Game.openGoals = function () {
    this.goalsFrom = JR.UI.current || "title";
    this.state = "goals";
    JR.UI.show("goals");
    this.setClean(true);
  };

  Game.closeGoals = function () {
    this.state = this.goalsFrom || "title";
    JR.UI.show(this.state);
    this.setClean(true);
  };

  /* ---------------------------------------------------------- PERSIAPAN */
  Game.setMode = function (n) {
    this.mode = JR.clamp(n, 1, 4);
    if (this.focus >= this.mode) this.focus = this.mode - 1;
    JR.UI.buildSetup({ mode: this.mode, players: this.players, focus: this.focus });
  };

  Game.focusPlayer = function (i) {
    if (i === this.focus) return;
    this.focus = i;
    JR.UI.setFocus({ mode: this.mode, players: this.players, focus: this.focus });
    JR.UI.updateAvatarChips({ players: this.players, focus: this.focus });
    this.preview.setAvatar(JR.UI.avatarById(this.players[i].avatar));
  };

  Game.setName = function (i, v) {
    if (this.players[i]) this.players[i].name = v;
  };

  Game.setAvatar = function (id) {
    var p = this.players[this.focus];
    if (!p) return;
    p.avatar = id;
    this.preview.setAvatar(JR.UI.avatarById(id));
    var sw = document.querySelector('.player-row[data-player="' + this.focus + '"] .player-swatch');
    if (sw) sw.style.background = JR.UI.avatarById(id).shirt;
    JR.UI.updateAvatarChips({ players: this.players, focus: this.focus });
    JR.UI.setFocus({ players: this.players, focus: this.focus });
  };

  /* Mulai lari: siapkan dunia, lalu hitung mundur (tanpa halaman materi). */
  Game.startRun = function () {
    var n = this.mode, list = [], i;
    for (i = 0; i < n; i++) {
      var p = this.players[i];
      list.push({ name: (p.name || "").trim() || ("Murid " + (i + 1)), avatar: p.avatar });
    }
    this.active = list;

    JR.UI.buildBoard(n, list);
    this.world.setCount(n, list.map(function (q) { return JR.UI.avatarById(q.avatar); }));
    this.resize();

    this.world.runners.forEach(function (r) {
      r.mission = "primer";
      r.reset();
      r.onCollect = function (ok) {
        JR.Audio.sfx(ok ? "correct" : "wrong");
        if (!ok) JR.Audio.sfx("fall");
      };
      r.onHop = function () { JR.Audio.sfx("coin"); };
      r.onLand = function () { JR.Audio.sfx("land"); };
    });

    this.levelIndex = 0;
    this.levelTime = 0;
    this.runTime = 0;
    this._saved = false;
    JR.UI.resetHUD();
    JR.UI.setLevel("LEVEL 1 · " + JR.LEVELS[0].name);
    for (i = 0; i < n; i++) this.syncHUD(i);

    this.beginCountdown();
  };

  /* Materi di halaman depan */
  Game.introNext = function () {
    if (this.introIndex >= JR.INTRO.length - 1) { this.introClose(); return; }
    this.introIndex++;
    JR.UI.renderIntro(this.introIndex, JR.INTRO.length);
  };

  Game.introPrev = function () {
    if (this.introIndex <= 0) return;
    this.introIndex--;
    JR.UI.renderIntro(this.introIndex, JR.INTRO.length);
  };

  Game.introClose = function () {
    this.state = this.returnTo === "setup" ? "setup" : "title";
    JR.UI.show(this.state);
    this.setClean(true);
    JR.Audio.playMusic("musicMain");
  };

  /* ------------------------------------------------------------ HITUNG */
  Game.beginCountdown = function () {
    JR.UI.hideScreens();
    JR.UI.topbar(true);
    this.setClean(false);
    this.state = "countdown";
    this.cd = 3.6;
    this.cdShown = null;
    this.startedGo = false;
    JR.UI.els.countdown.classList.remove("is-hidden");
    JR.UI.els.countdownNum.textContent = "3";
    JR.Audio.playMusic("musicMain");
    this.world.runners.forEach(function (r) {
      r.mission = "primer";
      r.reset();
    });
    this.world._dirty = true;
    this.world.runners.forEach(function (r, idx) { if (this.active[idx]) this.syncHUD(idx); }, this);
  };

  Game.tickCountdown = function (dt) {
    this.cd -= dt;
    var n = Math.ceil(this.cd - 0.6);
    if (this.cd > 0.6) {
      if (n !== this.cdShown) {
        this.cdShown = n;
        JR.UI.els.countdownNum.textContent = String(n);
        JR.UI.els.countdownNum.style.animation = "none";
        void JR.UI.els.countdownNum.offsetWidth;
        JR.UI.els.countdownNum.style.animation = "";
        JR.Audio.sfx("count");
      }
    } else if (!this.startedGo) {
      this.startedGo = true;
      JR.UI.els.countdownNum.textContent = "GO!";
      JR.Audio.sfx("go");
      this.world.runners.forEach(function (r) { if (r.lives > 0) r.start(); });
    }
    if (this.cd <= -0.4) {
      JR.UI.els.countdown.classList.add("is-hidden");
      this.state = "play";
      JR.UI.announce("Lari dimulai. Soal pertama: " + JR.questAt(0).full);
    }
  };

  Game.nextLevel = function () {
    this.levelIndex++;
    if (this.levelIndex >= JR.LEVELS.length) { this.finishAll(); return; }
    var lv = JR.LEVELS[this.levelIndex];
    this.levelTime = 0;
    this.world.runners.forEach(function (r) {
      r.build(this.levelIndex);
      if (r.status !== "out") r.invuln = 1.4;
    }, this);
    JR.UI.setLevel("LEVEL " + (this.levelIndex + 1) + " · " + lv.name);
    JR.UI.toast("LEVEL " + (this.levelIndex + 1) + " · " + lv.name);
    JR.Audio.sfx("levelup");
  };

  Game.finishAll = function () {
    this.world.runners.forEach(function (r) {
      if (r.status === "out") return;
      r.status = "done";
      r.score += JR.SCORE.finish + r.lives * JR.SCORE.life;
    });
    this.endRun(true);
  };

  Game.endRun = function (finished) {
    if (this.state === "results") return;
    this.state = "results";
    JR.UI.hideScreens();
    JR.UI.topbar(false);
    this.setClean(true);
    JR.UI.els.countdown.classList.add("is-hidden");

    var rows = [];
    var self = this;
    this.world.runners.forEach(function (r, i) {
      rows.push({
        name: self.active[i].name,
        score: r.score,
        lives: r.lives,
        collected: r.collected,
        wrong: r.wrong,
        level: self.levelIndex + 1,
        time: fmtTime(self.runTime)
      });
    });
    rows.sort(function (a, b) { return b.score - a.score || a.wrong - b.wrong; });
    this.lastResults = rows;

    if (!this._saved) {
      this._saved = true;
      var list = loadScores();
      var modeName = (JR.MODES.filter(function (m) { return m.n === self.mode; })[0] || {}).name || "Solo";
      rows.forEach(function (r) {
        if (r.score <= 0) return;
        list.push({ name: r.name, score: r.score, mode: modeName, time: r.time, level: r.level, at: Date.now() });
      });
      list.sort(function (a, b) { return b.score - a.score || a.at - b.at; });
      saveScores(list);
    }

    JR.UI.renderResults(rows, fmtTime(this.runTime), finished ? "Garis Finis!" : "Lari Selesai");
    JR.UI.show("results");
    JR.Audio.sfx(finished ? "levelup" : "lose");
    JR.UI.announce("Hasil: " + rows.map(function (r) { return r.name + " " + r.score + " poin"; }).join(", "));
  };

  /* ------------------------------------------------------------- KONTROL */
  Game.press = function (i, dir, isJump) {
    if (this.state !== "play") return;
    var r = this.world.runners[i];
    if (!r) return;
    if (isJump) {
      if (r.jump()) JR.Audio.sfx("jump", { volume: 0.45 });
    } else if (r.move(dir)) {
      JR.Audio.sfx("whoosh", { volume: 0.3 });
    }
  };

  Game.keyDown = function (ev) {
    var code = ev.code;
    if (this.state === "play") {
      for (var i = 0; i < this.world.runners.length; i++) {
        var k = JR.KEYS[i];
        if (!k) continue;
        if (k.left.indexOf(code) >= 0) { this.press(i, -1, false); ev.preventDefault(); }
        else if (k.right.indexOf(code) >= 0) { this.press(i, 1, false); ev.preventDefault(); }
        else if (k.jump.indexOf(code) >= 0) { this.press(i, 0, true); ev.preventDefault(); }
      }
      if (code === "Escape" || code === "KeyP") { this.pause(); ev.preventDefault(); }
      return;
    }
    if (this.state === "countdown") {
      if (code === "Escape") { this.quit(); ev.preventDefault(); }
      return;
    }
    if (this.state === "paused" && (code === "Escape" || code === "KeyP")) { this.resume(); ev.preventDefault(); return; }
    if (this.state === "materials" && (code === "Enter" || code === "Space")) { this.introNext(); ev.preventDefault(); return; }
    if (this.state === "goals" && (code === "Escape" || code === "Enter")) { this.closeGoals(); ev.preventDefault(); return; }
    if (this.state === "confirm" && code === "Enter") { this.startRun(); ev.preventDefault(); return; }
    if (this.state === "title" && code === "Enter") { this.openSetup(); ev.preventDefault(); }
  };

  Game.keyUp = function () {};

  Game.blur = function () { if (this.state === "play") this.pause(); };

  Game.pause = function () {
    if (this.state !== "play") return;
    this.state = "paused";
    JR.UI.show("pause");
    JR.UI.announce("Permainan dijeda.");
  };

  Game.resume = function () {
    if (this.state !== "paused") return;
    JR.UI.hideScreens();
    this.state = "play";
    this.lastTs = 0;
  };

  /* -------------------------------------------------------------- AKSI */
  Game.action = function (name) {
    switch (name) {
      case "open-setup": this.openSetup(); break;
      case "close-setup": this.toTitle(); break;
      case "to-confirm": this.openConfirm(); break;
      case "confirm-back": this.openSetup(); break;
      case "start": this.startRun(); break;
      case "open-materials": this.openMaterials("title"); break;
      case "intro-next": this.introNext(); break;
      case "intro-prev": this.introPrev(); break;
      case "intro-close": this.introClose(); break;
      case "open-goals": this.openGoals(); break;
      case "close-goals": this.closeGoals(); break;
      case "open-board": this.openBoard(); break;
      case "close-board": this.state = this.returnTo || "title"; JR.UI.show(this.returnTo || "title"); this.setClean(true); break;
      case "open-help": this.openHelp(); break;
      case "close-help": this.state = this.returnTo || "title"; JR.UI.show(this.returnTo || "title"); this.setClean(true); break;
      case "mute": JR.UI.setMuted(JR.Audio.setMuted(!JR.Audio.isMuted())); break;
      case "pause": this.pause(); break;
      case "resume": this.resume(); break;
      case "restart": this.startRun(); break;
      case "quit": this.toTitle(); break;
      case "reset-scores":
        var self = this;
        JR.UI.confirm("TEKAN LAGI UNTUK HAPUS", function () {
          saveScores([]);
          JR.UI.renderBoard([]);
          JR.UI.toast("Semua skor dihapus");
          self._saved = true;
        });
        break;
      default: break;
    }
  };

  JR.Game = Game;

  /* Service worker: game tetap jalan tanpa internet setelah kunjungan pertama.
     Hanya didaftarkan pada http(s); saat dibuka lewat file:// tidak diperlukan. */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline tetap jalan */ });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { Game.init(); });
  } else {
    Game.init();
  }
})(typeof window !== "undefined" ? window : global);
