/* KeKe Run — satu "dunia" untuk satu Murid
 * Berisi scene, kamera, lintasan, objek, lubang, dan karakter 3D.
 */
(function (root) {
  "use strict";
  var JR = root.JR, T = root.THREE;

  var LANE = 1.2;            // jarak antar lajur
  var ROAD_W = 4.0;
  var Z_FAR = -145;          // objek muncul di sini
  var Z_NEAR = 10;           // objek hilang di sini (belakang kamera)
  var GRAV = 20, JUMP_V = 6.6;
  var BASE_DIST = 7.4;

  function dummy() { return new T.Object3D(); }

  /* --------------------------------------------------------------- TEKSTUR JALAN */
  function roadTexture(pal) {
    var c = document.createElement("canvas");
    c.width = 128; c.height = 256;
    var x = c.getContext("2d");
    x.fillStyle = pal.road; x.fillRect(0, 0, 128, 256);
    // bintik pasir
    for (var i = 0; i < 380; i++) {
      x.fillStyle = i % 2 ? "rgba(90,60,20,.10)" : "rgba(255,255,255,.55)";
      x.fillRect(Math.random() * 128, Math.random() * 256, 2, 2);
    }
    // pembatas lajur (putus-putus)
    var dashes = [45, 83];
    x.strokeStyle = "rgba(255,255,255,.78)";
    x.lineWidth = 8; x.lineCap = "round";
    dashes.forEach(function (dx) {
      for (var y = 0; y < 256; y += 78) {
        x.beginPath(); x.moveTo(dx, y + 12); x.lineTo(dx, y + 46); x.stroke();
      }
    });
    // tepi jalan
    x.fillStyle = pal.roadEdge;
    x.fillRect(0, 0, 8, 256); x.fillRect(120, 0, 8, 256);
    var tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(1, 18);
    tex.anisotropy = 4;
    return tex;
  }

  var glowTex = null;
  function softGlow() {
    if (glowTex) return glowTex;
    var c = document.createElement("canvas");
    c.width = c.height = 128;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,.55)");
    g.addColorStop(0.6, "rgba(255,255,255,.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    glowTex = new T.CanvasTexture(c);
    return glowTex;
  }

  function skyTexture(pal) {
    var c = document.createElement("canvas");
    c.width = 8; c.height = 256;
    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, pal.skyTop);
    g.addColorStop(0.55, pal.sky[0]);
    g.addColorStop(0.82, pal.sky[1]);
    g.addColorStop(1, pal.sky[2]);
    x.fillStyle = g; x.fillRect(0, 0, 8, 256);
    var t = new T.CanvasTexture(c);
    t.magFilter = T.LinearFilter;
    return t;
  }

  /* ------------------------------------------------------------------ RUNNER */
  function Runner(opts) {
    this.index = opts.index;
    this.cfg = opts.avatar;
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(56, 1, 0.1, 340);
    this._geos = [];
    this._built = false;
    this.mission = "primer";
    this.reset();
  }

  Runner.prototype.track = function (g) { this._geos.push(g); return g; };

  Runner.prototype.reset = function () {
    this.score = 0; this.lives = 3; this.combo = 0;
    this.lane = 1; this.x = 0; this.y = 0; this.vy = 0;
    this.status = "idle"; this.timer = 0; this.invuln = 0;
    this.distance = 0; this.collected = 0; this.wrong = 0; this.hops = 0;
    this.elapsed = 0; this.shake = 0;
    this.spawnT = 0.9; this.hazardT = 2.4;
    if (this.items) this.items.forEach(function (it) { it.active = false; it.group.visible = false; });
    if (this.hazards) this.hazards.forEach(function (h) { h.active = false; h.mesh.visible = false; });
    if (this.hero) {
      this.hero.root.position.set(0, 0, 0);
      this.hero.root.rotation.set(0, 0, 0);
      this.hero.body.rotation.set(0, 0, 0);
      this.hero.body.position.y = 0;
    }
    this.setCamera(this.aspect || 1);
  };

  Runner.prototype.build = function (levelIdx) {
    var pal = JR.LEVELS[levelIdx];
    var self = this;
    this.level = levelIdx;

    // bersihkan scene lama
    if (this._built) {
      this._geos.forEach(function (g) { if (g && g.dispose) g.dispose(); });
      this._geos = [];
      while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    }
    this.scene.background = skyTexture(pal);
    this.scene.fog = new T.Fog(new T.Color(pal.fog), 55, 170);

    // cahaya
    var hemi = new T.HemisphereLight(new T.Color(pal.hemi), new T.Color(pal.ground2), 0.62);
    this.scene.add(hemi);
    var dir = new T.DirectionalLight(new T.Color(pal.sun), 0.5);
    dir.position.set(6, 14, 6);
    this.scene.add(dir);
    var amb = new T.AmbientLight(0xffffff, 0.1);
    this.scene.add(amb);

    // tanah
    var groundGeo = this.track(new T.PlaneGeometry(150, 340));
    var ground = new T.Mesh(groundGeo, JR.Models.mat(pal.ground));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.06, -120);
    this.scene.add(ground);

    // jalan
    this.roadTex = roadTexture(pal);
    this.roadTex.anisotropy = 16;
    var roadGeo = this.track(new T.PlaneGeometry(ROAD_W, 340));
    var road = new T.Mesh(roadGeo, new T.MeshLambertMaterial({ map: this.roadTex }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -120);
    this.scene.add(road);

    // trotoar
    [-1, 1].forEach(function (s) {
      var g = new T.BoxGeometry(0.3, 0.2, 340);
      self.track(g);
      var m = new T.Mesh(g, JR.Models.mat(pal.roadEdge, { flat: false }));
      m.position.set(s * (ROAD_W / 2 + 0.05), 0.08, -120);
      self.scene.add(m);
    });

    // matahari + pendar lembut (gradasi radial, bukan piringan datar)
    var halo = new T.Mesh(new T.PlaneGeometry(52, 52), new T.MeshBasicMaterial({
      map: softGlow(), color: new T.Color(pal.sun), transparent: true, opacity: 0.55,
      blending: T.AdditiveBlending, depthWrite: false, fog: false
    }));
    halo.position.set(-30, 30, -192);
    this.scene.add(halo);
    var sun = new T.Mesh(this.track(new T.CircleGeometry(6.5, 24)),
      new T.MeshBasicMaterial({ color: new T.Color(pal.sun), transparent: true, opacity: 0.9, fog: false }));
    sun.position.set(-30, 30, -190);
    this.scene.add(sun);

    this.buildProps(pal);
    this.buildItems();
    this.buildHazards();
    this.buildHero();

    this._built = true;
    this.setCamera(this.aspect || 1);
  };

  Runner.prototype.buildProps = function (pal) {
    var kit = JR.Models.propKit({
      leaf1: pal.ground2, leaf2: pal.ground, wall: "#FFF6E8", roof: "#FF8A6B",
      door: "#8A6240", lamp: "#FFE9A8", awning1: "#FF9F6B", awning2: "#FFF2DF"
    });
    var plan = [
      ["tree", 46, 3.4, 13], ["bush", 34, 2.5, 9], ["house", 18, 4.6, 15],
      ["lamp", 20, 2.4, 2.0], ["rock", 20, 2.6, 8], ["stall", 12, 4.0, 11]
    ];
    var self = this;
    var d = dummy();
    this.fields = plan.map(function (p) {
      var type = p[0], count = p[1], minX = p[2], spread = p[3];
      var parts = kit[type];
      var meshes = parts.map(function (part) {
        var geo = self.track(part.geo);
        var m = new T.InstancedMesh(geo, JR.Models.mat(part.color, { emissive: part.emissive }), count);
        m.instanceMatrix.setUsage(T.DynamicDrawUsage);
        m.frustumCulled = false;
        self.scene.add(m);
        return m;
      });
      var data = [];
      for (var i = 0; i < count; i++) {
        data.push({
          side: Math.random() < 0.5 ? -1 : 1,
          x: 0, z: Z_FAR + Math.random() * Math.abs(Z_FAR - Z_NEAR),
          s: 0.85 + Math.random() * 0.55, ry: Math.random() * 6.28
        });
      }
      data.forEach(function (it) {
        it.x = it.side * (minX + Math.random() * spread);
      });
      return { meshes: meshes, data: data, factor: 1 };
    });

    // awan (paralaks lambat)
    var cloudParts = kit.cloud;
    var cm = cloudParts.map(function (part) {
      var geo = self.track(part.geo);
      var m = new T.InstancedMesh(geo, new T.MeshBasicMaterial({
        color: new T.Color("#ffffff"), transparent: true, opacity: 0.92, fog: false, depthWrite: false
      }), 7);
      m.instanceMatrix.setUsage(T.DynamicDrawUsage);
      m.frustumCulled = false;
      self.scene.add(m);
      return m;
    });
    var cd = [];
    for (var c = 0; c < 7; c++) {
      cd.push({ x: (Math.random() - 0.5) * 120, y: 16 + Math.random() * 14, z: -60 - Math.random() * 90, s: 1.6 + Math.random() * 1.4, ry: 0 });
    }
    this.clouds = { meshes: cm, data: cd, factor: 0.12 };
  };

  Runner.prototype.buildItems = function () {
    this.items = [];
    for (var i = 0; i < 11; i++) {
      var group = new T.Group();
      var holder = new T.Group();
      group.add(holder);
      var glow = new T.Mesh(new T.TorusGeometry(0.62, 0.05, 6, 24), new T.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false
      }));
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.03;
      group.add(glow);
      group.visible = false;
      this.scene.add(group);
      this.items.push({ group: group, holder: holder, glow: glow, card: null, lab: null, active: false, z: 0, lane: 0, id: null, cat: null, spin: Math.random() * 6.28 });
    }
  };

  Runner.prototype.buildHazards = function () {
    this.hazards = [];
    for (var i = 0; i < 7; i++) {
      var g = new T.Group();
      var rim = new T.Mesh(new T.CircleGeometry(0.6, 22), new T.MeshBasicMaterial({ color: 0x8A6034, transparent: true, opacity: 0.95, depthWrite: false }));
      rim.rotation.x = -Math.PI / 2; rim.scale.set(1.05, 0.68, 1);
      var lip = new T.Mesh(new T.RingGeometry(0.52, 0.6, 22), new T.MeshBasicMaterial({ color: 0xE4C79A, transparent: true, opacity: 0.55, depthWrite: false }));
      lip.rotation.x = -Math.PI / 2; lip.scale.set(1.05, 0.68, 1); lip.position.y = 0.006;
      var inner = new T.Mesh(new T.CircleGeometry(0.5, 22), new T.MeshBasicMaterial({ color: 0x1A120C, depthWrite: false }));
      inner.rotation.x = -Math.PI / 2; inner.scale.set(1.05, 0.68, 1); inner.position.y = 0.008;
      g.add(rim); g.add(lip); g.add(inner);
      g.visible = false;
      g.position.y = 0.025;
      this.scene.add(g);
      this.hazards.push({ mesh: g, active: false, z: 0, lane: 0 });
    }
  };

  Runner.prototype.buildHero = function () {
    this.hero = JR.Models.avatar(this.cfg);
    this.hero.root.position.set(0, 0, 0);
    this.scene.add(this.hero.root);
  };

  /* ------------------------------------------------------------- KAMERA */
  Runner.prototype.setCamera = function (aspect) {
    this.aspect = aspect || 1;
    var cam = this.camera;
    var fov = 56 * Math.PI / 180;
    var need = 4.6;                               // lebar dunia yang harus tampak
    var dist = Math.max(BASE_DIST, need / (2 * Math.tan(fov / 2) * this.aspect));
    dist = Math.min(dist, 26);
    cam.fov = 56;
    cam.aspect = this.aspect;
    cam.position.set(0, dist * 0.52, dist);
    cam.lookAt(0, 1.15, -9);
    cam.updateProjectionMatrix();
    this.camBase = cam.position.clone();
  };

  /* -------------------------------------------------------- KONTROL */
  Runner.prototype.move = function (dir) {
    if (this.status !== "run") return false;
    var next = JR.clamp(this.lane + dir, 0, 2);
    if (next === this.lane) return false;
    this.lane = next;
    return true;
  };

  Runner.prototype.jump = function () {
    if (this.status !== "run" || this.y > 0.01) return false;
    this.vy = JUMP_V;
    return true;
  };

  Runner.prototype.setRun = function (on) {
    if (on && this.status === "idle") this.status = "run";
  };

  Runner.prototype.start = function () {
    this.status = "run"; this.timer = 0;
    var self = this;
    this.items.forEach(function (slot, i) {
      if (i > 6) return;
      var q = self.pickStock(Math.random() < 0.6);
      self.placeItem(slot, q.id, q.cat);
      slot.z = -18 - i * 16;
      slot.group.position.z = slot.z;
    });
    var hz = this.hazards[0];
    if (hz) {
      hz.active = true; hz.lane = (Math.random() * 3) | 0; hz.z = -34; hz.passed = false;
      hz.mesh.visible = true;
      hz.mesh.position.set((hz.lane - 1) * LANE, 0.025, hz.z);
    }
  };

  Runner.prototype.damage = function (reason) {
    if (this.status !== "run" || this.invuln > 0) return false;
    this.lives = Math.max(0, this.lives - 1);
    this.combo = 0;
    this.wrong++;
    this.status = this.lives > 0 ? "fall" : "out";
    this.timer = 0;
    this.shake = 1;
    this.lastReason = reason;
    if (this.lives === 0) { this.status = "out"; this.timer = 0; }
    return true;
  };

  Runner.prototype.finish = function () {
    if (this.status === "out") return;
    this.status = "done";
  };

  /* -------------------------------------------------------------- UPDATE */
  Runner.prototype.update = function (dt, speed, levelIdx, timeLeft) {
    var hero = this.hero;
    if (!hero) return;
    this.elapsed += dt;
    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.2);

    var running = this.status === "run" || this.status === "idle";

    // gerak dunia
    if (this.roadTex) this.roadTex.offset.y += speed * dt * 0.077;
    this.scrollField(this.fields, speed * dt);
    this.scrollClouds(dt, speed);

    // posisi lajur
    var targetX = (this.lane - 1) * LANE;
    this.x += (targetX - this.x) * Math.min(1, dt * 14);
    hero.root.position.x = this.x;

    // lompat
    if (this.y > 0 || this.vy !== 0) {
      this.vy -= GRAV * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0; this.vy = 0;
        if (this.onLand) this.onLand();
      }
    }
    hero.root.position.y = this.y;

    // status & animasi
    this.timer += dt;
    if (this.status === "fall") {
      var k = Math.min(1, this.timer / 0.42);
      var e = 1 - Math.pow(1 - k, 3);
      hero.body.rotation.x = e * -1.35;
      hero.body.position.y = -e * 0.34;
      hero.body.rotation.z = e * 0.25;
      if (this.timer > 0.85) { this.status = "getup"; this.timer = 0; }
    } else if (this.status === "getup") {
      var k2 = Math.min(1, this.timer / 0.45);
      var e2 = k2 * k2 * (3 - 2 * k2);
      hero.body.rotation.x = -1.35 * (1 - e2);
      hero.body.position.y = -0.34 * (1 - e2);
      hero.body.rotation.z = 0.25 * (1 - e2);
      if (k2 >= 1) { this.status = "run"; this.timer = 0; this.invuln = 1.1; }
    } else if (this.status === "out") {
      hero.body.rotation.x = JR.lerp(hero.body.rotation.x, -1.35, Math.min(1, dt * 8));
      hero.body.position.y = JR.lerp(hero.body.position.y, -0.34, Math.min(1, dt * 8));
    } else {
      hero.body.rotation.x = 0; hero.body.rotation.z = 0; hero.body.position.y = 0;
    }

    // animasi lari
    if (running || this.status === "done") {
      var sp = this.status === "idle" ? 2.2 : speed * 0.85;
      hero.phase += dt * sp;
      var ph = hero.phase;
      var sw = Math.sin(ph * 2.2);
      hero.legL.rotation.x = sw * 0.9;
      hero.legR.rotation.x = -sw * 0.9;
      hero.armL.rotation.x = -sw * 0.75;
      hero.armR.rotation.x = sw * 0.75;
      hero.torso.position.y = hero.torsoBase + Math.abs(Math.cos(ph * 2.2)) * 0.03;
      hero.head.rotation.z = sw * 0.05;
      hero.body.rotation.z = sw * 0.03;
    }
    // kilat saat tidak bisa diserang
    var blink = this.invuln > 0 && (Math.sin(this.elapsed * 30) > 0);
    hero.root.visible = !blink;

    // nyalakan objek & lubang
    this.spawn(speed, dt, levelIdx, timeLeft);
    this.stepItems(dt, speed);
    this.stepHazards(dt, speed);

    // kamera goyang
    if (this.shake > 0) {
      var s = this.shake * 0.16;
      this.camera.position.x = this.camBase.x + Math.sin(this.elapsed * 60) * s;
      this.camera.position.y = this.camBase.y + Math.cos(this.elapsed * 52) * s;
    } else if (this.camBase) {
      this.camera.position.x = this.camBase.x;
      this.camera.position.y = this.camBase.y;
    }
  };

  Runner.prototype.scrollField = function (fields, dz) {
    if (!fields) return;
    var d = dummy();
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      if (!field) continue;
      var arr = field.data;
      for (var i = 0; i < arr.length; i++) {
        var it = arr[i];
        it.z += dz;
        if (it.z > Z_NEAR + 6) {
          it.z = Z_FAR - Math.random() * 12;
          it.x = (it.side || (Math.random() < 0.5 ? -1 : 1)) * (3.2 + Math.random() * 26);
        }
      }
      var meshes = field.meshes;
      for (var m = 0; m < meshes.length; m++) {
        var mesh = meshes[m];
        for (var j = 0; j < arr.length; j++) {
          d.position.set(arr[j].x, arr[j].y || 0, arr[j].z);
          d.rotation.set(0, arr[j].ry || 0, 0);
          d.scale.setScalar(arr[j].s);
          d.updateMatrix();
          mesh.setMatrixAt(j, d.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  };

  Runner.prototype.spawn = function (speed, dt, levelIdx, timeLeft) {
    var level = JR.LEVELS[levelIdx];
    var prog = 1 - JR.clamp((timeLeft || level.dur) / level.dur, 0, 1);
    var gap = JR.lerp(level.gap, level.gapEnd, prog);
    if (this.status !== "run") return;

    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = gap * JR.rand(0.85, 1.2);
      var free = this.items.filter(function (i) { return !i.active; })[0];
      if (free) {
        var q = this.pickStock(Math.random() < 0.56);
        this.placeItem(free, q.id, q.cat);
      }
    }

    this.hazardT -= dt;
    if (this.hazardT <= 0) {
      this.hazardT = 2.2 + Math.random() * 2.6;
      if (Math.random() < level.hazard) {
        var hz = this.hazards.filter(function (h) { return !h.active; })[0];
        if (hz) {
          hz.active = true;
          hz.lane = (Math.random() * 3) | 0;
          hz.z = Z_FAR;
          hz.mesh.visible = true;
          hz.mesh.position.set((hz.lane - 1) * LANE, 0.025, hz.z);
        }
      }
    }
  };

  /* Pilih benda: target (sesuai soal) atau pengecoh.
     Level menentukan seberapa "dekat" pengecoh dengan soal:
       far  → tingkat yang paling berbeda (mudah)
       near → tingkat tetangga (sedang)
       all  → semua tingkat bercampur (sulit) */
  Runner.prototype.pickStock = function (wantTarget) {
    var missionId = this.mission;
    var level = JR.LEVELS[this.level] || JR.LEVELS[0];
    var order = JR.QUEST.order;
    var mi = order.indexOf(missionId);
    var catId = missionId;
    if (!wantTarget) {
      var others = JR.CATS.filter(function (c) { return c.id !== missionId; });
      if (level.mix === "far") {
        others.sort(function (a, b) {
          return Math.abs(order.indexOf(b.id) - mi) - Math.abs(order.indexOf(a.id) - mi);
        });
        catId = others[0].id;
      } else if (level.mix === "near") {
        var adj = others.filter(function (c) { return Math.abs(order.indexOf(c.id) - mi) === 1; });
        catId = (adj.length ? JR.pick(adj) : JR.pick(others)).id;
      } else {
        catId = JR.pick(others).id;
      }
    }
    var cat = JR.CATS.filter(function (c) { return c.id === catId; })[0] || JR.CATS[0];
    return { id: JR.pick(cat.items), cat: cat.id };
  };

  /* Soal berganti mengikuti poin: benda lama yang belum terbaca dibersihkan
     supaya Murid tidak dihukum karena soal berubah di tengah jalan. */
  Runner.prototype.setMission = function (catId) {
    if (catId === this.mission) return false;
    this.mission = catId;
    if (!this.items) return true;
    this.items.forEach(function (it) {
      if (it.active && it.z < -12) { it.active = false; it.group.visible = false; }
    });
    this.spawnT = Math.min(this.spawnT, 0.25);
    return true;
  };

  Runner.prototype.placeItem = function (slot, id, cat) {
    slot.active = true; slot.id = id; slot.cat = cat;
    slot.lane = (Math.random() * 3) | 0;
    slot.x = (slot.lane - 1) * LANE;
    slot.z = Z_FAR;
    slot.spin = Math.random() * 6.28;
    // ganti kartu di dalam holder
    while (slot.holder.children.length) slot.holder.remove(slot.holder.children[0]);
    var level = JR.LEVELS[this.level] || JR.LEVELS[0];
    var model = JR.Models.item(id, level.detail);
    slot.card = model;
    slot.lab = model.userData.label;
    slot.holder.add(model);
    slot.group.visible = true;
    slot.group.position.set(slot.x, 0, slot.z);
  };

  Runner.prototype.stepItems = function (dt, speed) {
    var self = this;
    var cam = this.camera.position;
    this.items.forEach(function (it) {
      if (!it.active) return;
      it.z += speed * dt;
      it.spin += dt * 1.6;
      it.group.position.z = it.z;
      // kartu selalu menghadap kamera (perspektif nyata), sedikit bergoyang
      it.holder.rotation.y = Math.atan2(cam.x - it.x, cam.z - it.z) + Math.sin(it.spin) * 0.18;
      it.holder.rotation.x = -0.10;
      it.holder.position.y = 0.66 + Math.sin(it.z * 0.45 + it.spin) * 0.05;
      // papan nama muncul saat benda mendekat
      if (it.lab) {
        var a = JR.clamp((it.z + 92) / 22, 0, 1);
        it.lab.material.opacity = a;
        it.lab.visible = a > 0.02;
      }
      it.glow.material.opacity = 0.35 + Math.sin(it.spin * 2) * 0.15;
      it.glow.scale.setScalar(1 + Math.sin(it.spin * 2) * 0.05);

      if (it.z > Z_NEAR) { it.active = false; it.group.visible = false; return; }

      if (self.status === "run" && Math.abs(it.z) < 1.0 && Math.abs(it.x - self.x) < 0.72) {
        it.active = false; it.group.visible = false;
        self.collected++;
        if (it.cat === self.mission) {
          self.combo = Math.min(JR.SCORE.comboMax, self.combo + 1);
          self.score += JR.SCORE.perItem + (self.combo - 1);
          if (self.onCollect) self.onCollect(true, it.id);
        } else {
          if (self.onCollect) self.onCollect(false, it.id);
          self.damage("wrong");
        }
      }
    });
  };

  Runner.prototype.stepHazards = function (dt, speed) {
    var self = this;
    this.hazards.forEach(function (h) {
      if (!h.active) return;
      h.z += speed * dt;
      h.mesh.position.z = h.z;
      if (h.z > Z_NEAR) { h.active = false; h.mesh.visible = false; h.passed = false; return; }
      if (self.status !== "run" || h.lane !== self.lane) return;
      if (Math.abs(h.z) < 0.9) {
        if (self.y > 0.45) {
          if (!h.passed) {
            h.passed = true;
            self.hops++;
            self.score += JR.SCORE.hop;
            if (self.onHop) self.onHop();
          }
        } else {
          h.active = false; h.mesh.visible = false; h.passed = false;
          self.damage("hole");
        }
      }
    });
  };

  Runner.prototype.scrollClouds = function (dt, speed) {
    if (!this.clouds) return;
    var arr = this.clouds.data, d = dummy();
    for (var i = 0; i < arr.length; i++) {
      arr[i].z += speed * dt * 0.12;
      if (arr[i].z > 30) {
        arr[i].z = -150 - Math.random() * 40;
        arr[i].x = (Math.random() - 0.5) * 130;
      }
    }
    var meshes = this.clouds.meshes;
    for (var m = 0; m < meshes.length; m++) {
      for (var j = 0; j < arr.length; j++) {
        d.position.set(arr[j].x, arr[j].y, arr[j].z);
        d.rotation.set(0, 0, 0);
        d.scale.setScalar(arr[j].s);
        d.updateMatrix();
        meshes[m].setMatrixAt(j, d.matrix);
      }
      meshes[m].instanceMatrix.needsUpdate = true;
    }
  };

  JR.Runner = Runner;
  JR.RUNNER_CONST = { LANE: LANE, ROAD_W: ROAD_W, Z_FAR: Z_FAR, Z_NEAR: Z_NEAR };
})(typeof window !== "undefined" ? window : global);
