/* KeKe Run — audio (musik latar + efek suara)
 * Memakai elemen <audio> agar tetap berbunyi saat game dibuka lewat file://.
 */
(function (root) {
  "use strict";
  var JR = root.JR;
  var DIR = "assets/audio/";
  var FILES = {
    musicMain: "music-main.wav",
    musicTrailer: "music-trailer.wav",
    click: "sfx-click.wav",
    correct: "sfx-correct.wav",
    wrong: "sfx-wrong.wav",
    jump: "sfx-jump.wav",
    land: "sfx-land.wav",
    coin: "sfx-coin.wav",
    levelup: "sfx-levelup.wav",
    lose: "sfx-lose.wav",
    count: "sfx-count.wav",
    go: "sfx-go.wav",
    whoosh: "sfx-whoosh.wav",
    fall: "sfx-fall.wav"
  };

  var musicEl = null, currentTrack = null, wantTrack = null;
  var muted = false, unlocked = false, active = 0;
  var vol = { music: 0.38, sfx: 0.62 };
  var pool = {};

  try { muted = localStorage.getItem(JR.APP.storageKey + ".muted") === "1"; } catch (e) {}

  function make(name) {
    var a = new Audio();
    a.src = DIR + FILES[name];
    a.preload = name.indexOf("music") === 0 ? "auto" : "auto";
    return a;
  }

  function ensureMusic() {
    if (!musicEl) { musicEl = make("musicMain"); musicEl.loop = true; }
    return musicEl;
  }

  function playMusic(name) {
    if (!FILES[name]) return;
    if (wantTrack === name && musicEl && !musicEl.paused) return;
    wantTrack = name;
    if (!unlocked || muted) return;
    if (!musicEl) {
      musicEl = make(name);
      musicEl.loop = true;
      musicEl.volume = 0;
      currentTrack = name;
      tryPlay(musicEl);
      fadeTo(vol.music, 900);
      return;
    }
    if (currentTrack === name) { tryPlay(musicEl); fadeTo(vol.music, 500); return; }
    fadeTo(0, 350, function () {
      musicEl.pause();
      musicEl.src = DIR + FILES[name];
      currentTrack = name;
      musicEl.volume = 0;
      tryPlay(musicEl);
      fadeTo(vol.music, 700);
    });
  }

  function stopMusic(fadeMs) {
    wantTrack = null;
    if (!musicEl) return;
    fadeTo(0, fadeMs || 400, function () { if (musicEl) musicEl.pause(); });
  }

  var fadeTimer = null;
  function fadeTo(target, ms, done) {
    if (!musicEl) return;
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    var from = musicEl.volume, steps = Math.max(1, Math.round((ms || 300) / 40)), i = 0;
    fadeTimer = setInterval(function () {
      i++;
      if (!musicEl) { clearInterval(fadeTimer); fadeTimer = null; return; }
      musicEl.volume = JR.clamp(from + (target - from) * (i / steps), 0, 1);
      if (i >= steps) {
        clearInterval(fadeTimer); fadeTimer = null;
        if (done) done();
      }
    }, 40);
  }

  function tryPlay(el) {
    var p = el.play();
    if (p && p.catch) p.catch(function () { /* menunggu gestur pengguna */ });
  }

  function sfx(name, opts) {
    if (muted || !FILES[name]) return;
    var limit = name === "click" ? 2 : 5;
    if (active >= limit) return;
    var el = pool[name];
    var node;
    try {
      node = el ? el.cloneNode(true) : make(name);
    } catch (e) { return; }
    node.volume = JR.clamp((opts && opts.volume) || vol.sfx, 0, 1);
    active++;
    var done = function () { active = Math.max(0, active - 1); node.onended = null; };
    node.onended = done;
    node.onerror = done;
    tryPlay(node);
    setTimeout(done, 4000);
  }

  function unlock() {
    unlocked = true;
    if (wantTrack && !muted) playMusic(wantTrack);
  }

  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem(JR.APP.storageKey + ".muted", muted ? "1" : "0"); } catch (e) {}
    if (muted) {
      if (musicEl) { musicEl.pause(); }
    } else if (wantTrack) {
      if (!musicEl) playMusic(wantTrack);
      else { tryPlay(musicEl); fadeTo(vol.music, 400); }
    }
    return muted;
  }

  function isMuted() { return muted; }

  /* Panggil sekali setelah interaksi pertama (kebijakan autoplay browser). */
  function armUnlock() {
    var once = function () {
      unlock();
      root.removeEventListener("pointerdown", once, true);
      root.removeEventListener("keydown", once, true);
    };
    root.addEventListener("pointerdown", once, true);
    root.addEventListener("keydown", once, true);
  }

  JR.Audio = {
    playMusic: playMusic, stopMusic: stopMusic, sfx: sfx,
    unlock: unlock, setMuted: setMuted, isMuted: isMuted, armUnlock: armUnlock,
    preloadMusic: function () { ensureMusic(); }
  };
})(typeof window !== "undefined" ? window : global);
