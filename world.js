/* KeKe Run — renderer layar terbagi + pratinjau karakter
 * Satu WebGLRenderer menggambar beberapa scene lewat scissor viewport,
 * sehingga 4 Murid tetap ringan.
 */
(function (root) {
  "use strict";
  var JR = root.JR, T = root.THREE;

  /* ------------------------------------------------------- TATA LETAK */
  JR.layoutGrid = function (n, w, h) {
    if (n <= 1) return { cols: 1, rows: 1 };
    var best = null;
    for (var cols = 1; cols <= n; cols++) {
      var rows = Math.ceil(n / cols);
      if (cols * rows < n) continue;
      var empty = cols * rows - n;
      var aspect = (w / cols) / (h / rows);
      if (aspect < 0.3 || aspect > 4.4) continue;
      var score = empty * 1.1 + Math.max(0, Math.abs(Math.log(aspect / 0.75)) - 0.45) * 4.2;
      if (!best || score < best.score) best = { cols: cols, rows: rows, score: score };
    }
    return best ? { cols: best.cols, rows: best.rows } : { cols: n, rows: 1 };
  };

  /* ------------------------------------------------------------ WORLD */
  function World(canvas, boardEl) {
    this.canvas = canvas;
    this.board = boardEl;
    this.renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x0a1424, 1);
    this.runners = [];
    this.slots = [];
    this.cells = [];
    this._dirty = true;
  }

  World.prototype.setCount = function (n, avatars) {
    this.runners = [];
    for (var i = 0; i < n; i++) {
      var r = new JR.Runner({ index: i, avatar: avatars[i] });
      r.build(0);
      this.runners.push(r);
    }
    this.syncSlots();
  };

  World.prototype.syncSlots = function () {
    this.slots = Array.prototype.slice.call(this.board.children);
    this.applyGrid(this.slots.length || 1);
    this._dirty = true;
  };

  World.prototype.applyGrid = function (n) {
    var rect = this.board.getBoundingClientRect();
    var g = JR.layoutGrid(n, rect.width || 1200, rect.height || 700);
    this.grid = g;
    this.board.style.gridTemplateColumns = "repeat(" + g.cols + ", 1fr)";
    this.board.style.gridTemplateRows = "repeat(" + g.rows + ", 1fr)";
    this._dirty = true;
  };

  World.prototype.resize = function () {
    var host = this.canvas.parentElement || this.canvas;
    var rect = host.getBoundingClientRect();
    var w = Math.max(2, Math.round(rect.width)), h = Math.max(2, Math.round(rect.height));
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    if (this.grid) this.applyGrid(this.runners.length || 1);
    this._dirty = true;
  };

  World.prototype.measure = function () {
    var crect = this.canvas.getBoundingClientRect();
    var gap = 4;
    this.cells = this.slots.map(function (s) {
      var r = s.getBoundingClientRect();
      return {
        x: r.left - crect.left + gap,
        y: crect.bottom - r.bottom + gap,
        w: Math.max(8, r.width - gap * 2),
        h: Math.max(8, r.height - gap * 2)
      };
    });
    var self = this;
    this.cells.forEach(function (c, i) {
      if (self.runners[i]) self.runners[i].setCamera(c.w / c.h);
    });
    this._dirty = false;
  };

  World.prototype.render = function () {
    if (this._dirty) this.measure();
    var r = this.renderer;
    r.setScissorTest(false);
    r.clear(true, true, true);
    r.setScissorTest(true);
    for (var i = 0; i < this.runners.length; i++) {
      var c = this.cells[i];
      if (!c) continue;
      r.setViewport(c.x, c.y, c.w, c.h);
      r.setScissor(c.x, c.y, c.w, c.h);
      r.render(this.runners[i].scene, this.runners[i].camera);
    }
    r.setScissorTest(false);
  };

  World.prototype.dispose = function () {
    try { this.renderer.dispose(); } catch (e) {}
  };

  /* --------------------------------------------------- PRATINJAU KARAKTER */
  function Preview3D(canvasEl) {
    this.canvas = canvasEl;
    this.renderer = new T.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(34, 1, 0.1, 40);
    this.camera.position.set(0, 1.32, 5.0);
    this.camera.lookAt(0, 1.02, 0);
    var hemi = new T.HemisphereLight(0xe8f7ff, 0x8fd6a0, 0.72);
    this.scene.add(hemi);
    var dir = new T.DirectionalLight(0xffffff, 0.62);
    dir.position.set(3, 6, 4);
    this.scene.add(dir);
    // panggung
    var podium = new T.Mesh(new T.CylinderGeometry(0.92, 1.0, 0.2, 28), JR.Models.mat("#DFF7F1", { flat: false }));
    podium.position.y = -0.11;
    this.scene.add(podium);
    var ring = new T.Mesh(new T.TorusGeometry(1.0, 0.028, 8, 40), JR.Models.mat("#5BE0C0", { flat: false, emissive: "#1f7f6b" }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01;
    this.scene.add(ring);
    this.t = 0;
  }

  Preview3D.prototype.setAvatar = function (cfg) {
    if (this.hero) this.scene.remove(this.hero.root);
    this.hero = JR.Models.avatar(cfg);
    this.hero.root.position.set(0, 0, 0);
    this.hero.root.rotation.y = Math.PI + 0.35;
    this.scene.add(this.hero.root);
  };

  Preview3D.prototype.resize = function () {
    var r = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    var w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  Preview3D.prototype.render = function (dt) {
    if (!this.hero) return;
    this.t += dt;
    this.hero.root.rotation.y = Math.PI + 0.35 + Math.sin(this.t * 0.9) * 0.5;
    var ph = this.t * 5.2;
    this.hero.legL.rotation.x = Math.sin(ph) * 0.22;
    this.hero.legR.rotation.x = -Math.sin(ph) * 0.22;
    this.hero.armL.rotation.x = -Math.sin(ph) * 0.18;
    this.hero.armR.rotation.x = Math.sin(ph) * 0.18;
    this.hero.torso.position.y = this.hero.torsoBase + Math.abs(Math.cos(ph)) * 0.015;
    this.renderer.render(this.scene, this.camera);
  };

  /* Potret 3D kecil untuk pemilih karakter (dibuat sekali, lalu dipakai ulang) */
  var THUMBS = null;
  Preview3D.thumbs = function () {
    if (THUMBS) return THUMBS;
    var size = 176;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var r;
    try {
      r = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    } catch (e) { return (THUMBS = {}); }
    r.setPixelRatio(1);
    r.setSize(size, size, false);
    r.setClearColor(0x000000, 0);
    var scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xeaf6ff, 0x7fb27a, 0.9));
    var d = new T.DirectionalLight(0xffffff, 0.7);
    d.position.set(2.4, 5, 4);
    scene.add(d);
    var cam = new T.PerspectiveCamera(30, 1, 0.1, 20);
    cam.position.set(0, 1.42, 3.9);
    cam.lookAt(0, 1.02, 0);
    THUMBS = {};
    JR.AVATARS.forEach(function (a) {
      var hero = JR.Models.avatar(a);
      hero.root.rotation.y = Math.PI;
      if (hero.shadow) hero.shadow.visible = false;
      scene.add(hero.root);
      r.render(scene, cam);
      THUMBS[a.id] = c.toDataURL("image/png");
      scene.remove(hero.root);
    });
    try { r.dispose(); } catch (e) {}
    return THUMBS;
  };

  JR.World = World;
  JR.Preview3D = Preview3D;
})(typeof window !== "undefined" ? window : global);
