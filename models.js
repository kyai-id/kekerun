/* KeKe Run — model 3D prosedural (tanpa berkas model, tanpa tekstur eksternal)
 * Karakter dibuat dari primitif ber-shading halus + detail wajah,
 * benda tampil sebagai kartu 3D bergambar dengan papan nama di atasnya.
 */
(function (root) {
  "use strict";
  var JR = root.JR;
  var T = root.THREE;

  var matCache = {};
  function mat(hex, opts) {
    opts = opts || {};
    var key = hex + "|" + (opts.emissive || "") + (opts.transparent ? "t" : "") + (opts.opacity || "") + (opts.flat === false ? "s" : "f");
    if (matCache[key]) return matCache[key];
    var m = new T.MeshLambertMaterial({
      color: new T.Color(hex),
      flatShading: opts.flat !== false,
      transparent: !!opts.transparent,
      opacity: opts.opacity != null ? opts.opacity : 1,
      emissive: new T.Color(opts.emissive || "#000000"),
      side: opts.side || T.FrontSide
    });
    matCache[key] = m;
    return m;
  }

  function put(parent, geo, color, x, y, z, rot, opts) {
    var m = new T.Mesh(geo, mat(color, opts));
    m.position.set(x || 0, y || 0, z || 0);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    parent.add(m);
    return m;
  }
  function box(w, h, d) { return new T.BoxGeometry(w, h, d); }
  function cyl(rt, rb, h, seg) { return new T.CylinderGeometry(rt, rb, h, seg || 14); }
  function sph(r, seg) { return new T.SphereGeometry(r, seg || 18, Math.max(10, (seg || 18) - 4)); }
  function cone(r, h, seg) { return new T.ConeGeometry(r, h, seg || 12); }
  function torus(r, t, seg) { return new T.TorusGeometry(r, t, 8, seg || 20); }
  function scale(m, x, y, z) { m.scale.set(x, y == null ? x : y, z == null ? x : z); return m; }

  /* ------------------------------------------------------- KARTU BENDA */
  function labelSprite(text) {
    var tex = JR.Art.labelTexture(text);
    var sp = new T.Sprite(new T.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: true, toneMapped: false
    }));
    var img = tex.image;
    var hh = 0.30;
    sp.scale.set(hh * (img.width / img.height), hh, 1);
    sp.center.set(0.5, 0);
    return sp;
  }

  function itemCard(id, detail) {
    var def = JR.ITEMS[id] || { label: String(id) };
    var g = new T.Group();
    // bingkai (tepi emas) memberi ketebalan 3D
    var rim = new T.Mesh(box(0.9, 0.9, 0.10), mat("#E7B84E", { flat: false, emissive: "#6B4A08" }));
    g.add(rim);
    var side = new T.Mesh(box(0.94, 0.94, 0.055), mat("#FFF4D2", { flat: false, emissive: "#5C4A1E" }));
    side.position.z = -0.02;
    g.add(side);
    var face = new T.Mesh(new T.PlaneGeometry(0.84, 0.84), new T.MeshBasicMaterial({
      map: JR.Art.texture(id, detail || 1), toneMapped: false
    }));
    face.position.z = 0.053;
    g.add(face);
    var lab = labelSprite(def.label);
    lab.position.set(0, 0.50, 0.02);
    g.add(lab);
    g.userData.id = id;
    g.userData.label = lab;
    return g;
  }

  function item(id, detail) { return itemCard(id, detail); }

  /* ---------------------------------------------------------- KARAKTER */
  function avatar(cfg) {
    var root = new T.Group();
    var body = new T.Group();
    root.add(body);

    var SKIN = cfg.skin, PANTS = cfg.pants, SHIRT = cfg.shirt;
    var shape = { flat: false };

    /* ---- kaki (pivot di pinggul) ---- */
    var legL = new T.Group(), legR = new T.Group();
    legL.position.set(-0.115, 0.86, 0);
    legR.position.set(0.115, 0.86, 0);
    [legL, legR].forEach(function (leg, i) {
      var legColor = cfg.skirt ? SKIN : PANTS;
      // paha
      cy(leg, 0.088, 0.08, 0.4, legColor, 0, -0.2, 0);
      // lutut
      put(leg, sph(0.082, 12), legColor, 0, -0.4, 0, null, shape);
      // betis
      cy(leg, 0.08, 0.062, 0.36, legColor, 0, -0.58, 0);
      // kaus kaki
      if (cfg.skirt) cy(leg, 0.07, 0.066, 0.14, "#FFFFFF", 0, -0.72, 0);
      // sepatu
      var shoe = put(leg, box(0.14, 0.1, 0.26), cfg.shoe, 0, -0.83, -0.03, null, shape);
      put(leg, box(0.15, 0.035, 0.28), "#DCE6F2", 0, -0.885, -0.03, null, shape);
      if (i === 0) shoe.rotation.y = 0.02;
    });
    body.add(legL); body.add(legR);

    function cy(parent, rt, rb, h, color, x, y, z) {
      var m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, 16), mat(color, shape));
      m.position.set(x || 0, y || 0, z || 0);
      parent.add(m);
      return m;
    }

    /* ---- pinggul / rok ---- */
    if (cfg.skirt) {
      var skirt = new T.Mesh(new T.CylinderGeometry(0.19, 0.33, 0.3, 18), mat(PANTS, shape));
      skirt.position.y = 0.78;
      body.add(skirt);
      var waist = new T.Mesh(new T.CylinderGeometry(0.185, 0.185, 0.07, 18), mat(PANTS, shape));
      waist.position.y = 0.92;
      body.add(waist);
    } else {
      var hips = new T.Mesh(new T.CylinderGeometry(0.2, 0.19, 0.18, 16), mat(PANTS, shape));
      hips.position.y = 0.86;
      body.add(hips);
    }

    /* ---- badan ---- */
    var TORSO_Y = 1.16;
    var torso = new T.Group();
    torso.position.set(0, TORSO_Y, 0);
    var shirt = new T.Mesh(new T.CylinderGeometry(0.225, 0.19, 0.5, 18), mat(SHIRT, shape));
    shirt.scale.z = 0.72;
    torso.add(shirt);
    // bahu membulat
    put(torso, sph(0.11, 14), SHIRT, -0.19, 0.2, 0, null, shape);
    put(torso, sph(0.11, 14), SHIRT, 0.19, 0.2, 0, null, shape);
    // kerah
    put(torso, new T.TorusGeometry(0.1, 0.03, 8, 18), "#FFFFFF", 0, 0.24, 0, [Math.PI / 2, 0, 0], shape);
    body.add(torso);

    /* ---- tas punggung ---- */
    if (cfg.pack) {
      var pack = new T.Mesh(box(0.26, 0.3, 0.14), mat(cfg.pack, shape));
      pack.position.set(0, 1.16, 0.2);
      body.add(pack);
      put(body, box(0.05, 0.34, 0.05), cfg.pack, -0.11, 1.18, 0.06, null, shape);
      put(body, box(0.05, 0.34, 0.05), cfg.pack, 0.11, 1.18, 0.06, null, shape);
      put(body, box(0.16, 0.09, 0.03), "#FFFFFF", 0, 1.14, 0.275, null, { flat: false, transparent: true, opacity: 0.85 });
    }

    /* ---- tangan (pivot di bahu) ---- */
    var armL = new T.Group(), armR = new T.Group();
    armL.position.set(-0.235, 1.35, 0);
    armR.position.set(0.235, 1.35, 0);
    [armL, armR].forEach(function (arm) {
      cy(arm, 0.062, 0.055, 0.28, SHIRT, 0, -0.14, 0);
      put(arm, sph(0.058, 12), SHIRT, 0, -0.28, 0, null, shape);
      cy(arm, 0.052, 0.045, 0.24, cfg.skirt ? SKIN : SKIN, 0, -0.4, 0);
      put(arm, sph(0.058, 12), SKIN, 0, -0.53, 0, null, shape);
    });
    body.add(armL); body.add(armR);

    /* ---- leher & kepala ---- */
    cy(body, 0.062, 0.07, 0.1, SKIN, 0, 1.45, 0);
    var head = new T.Group();
    head.position.set(0, 1.62, 0);
    body.add(head);

    var skull = put(head, sph(0.16, 22), SKIN, 0, 0, 0, null, shape);
    skull.scale.set(1, 1.1, 1.02);
    // dagu
    put(head, sph(0.085, 14), SKIN, 0, -0.1, -0.03, null, shape);
    // telinga
    put(head, sph(0.045, 10), SKIN, -0.155, -0.01, 0.01, null, shape).scale.set(0.5, 0.9, 0.7);
    put(head, sph(0.045, 10), SKIN, 0.155, -0.01, 0.01, null, shape).scale.set(0.5, 0.9, 0.7);
    // mata
    [-1, 1].forEach(function (s) {
      put(head, sph(0.05, 12), "#FFFFFF", s * 0.062, 0.015, -0.132, null, shape).scale.set(1, 0.85, 0.55);
      put(head, sph(0.022, 10), "#3A2A22", s * 0.062, 0.015, -0.163, null, shape);
      put(head, sph(0.008, 8), "#FFFFFF", s * 0.055, 0.028, -0.176, null, shape);
      put(head, box(0.055, 0.012, 0.012), cfg.hair, s * 0.062, 0.075, -0.15, [0, 0, s * 0.12], shape);
    });
    // hidung & mulut
    put(head, sph(0.024, 10), SKIN, 0, -0.035, -0.16, null, shape);
    var mouth = put(head, box(0.06, 0.014, 0.012), "#B4443F", 0, -0.09, -0.152, null, shape);
    mouth.rotation.z = 0;
    // pipi
    put(head, sph(0.03, 8), "#F08E8E", -0.1, -0.055, -0.13, null, { flat: false, transparent: true, opacity: 0.35 });
    put(head, sph(0.03, 8), "#F08E8E", 0.1, -0.055, -0.13, null, { flat: false, transparent: true, opacity: 0.35 });

    /* ---- rambut / penutup kepala ---- */
    var hairCap = new T.Mesh(
      new T.SphereGeometry(0.166, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
      mat(cfg.hair, shape)
    );
    hairCap.position.y = 0.005;
    head.add(hairCap);

    var hat = new T.Group();
    head.add(hat);
    switch (cfg.hat) {
      case "cap":
        put(hat, sph(0.172, 18), cfg.hatColor, 0, 0.05, 0.01, null, shape).scale.set(1, 0.72, 1);
        put(hat, box(0.3, 0.028, 0.17), cfg.hatColor, 0, 0.085, -0.145, [0.06, 0, 0], shape);
        put(hat, sph(0.03, 8), "#FFFFFF", 0, 0.15, 0.0, null, shape);
        break;
      case "hijab":
        // penutup kepala + kerudung menutup leher & dada
        put(hat, sph(0.182, 20), cfg.hatColor, 0, 0.012, 0.012, null, shape).scale.set(1.03, 1.06, 1.06);
        var drape = new T.Mesh(new T.CylinderGeometry(0.15, 0.27, 0.42, 20, 1, true), mat(cfg.hatColor, shape));
        drape.position.set(0, -0.24, 0.02);
        drape.scale.z = 0.86;
        hat.add(drape);
        // bukaan wajah
        put(hat, sph(0.125, 18), SKIN, 0, -0.005, -0.09, null, shape).scale.set(0.95, 1.12, 0.75);
        // hiasan
        put(hat, torus(0.17, 0.012, 18), "#F7D46A", 0, 0.02, 0.075, [0.25, 0, 0], shape);
        break;
      case "beanie":
        put(hat, sph(0.175, 18), cfg.hatColor, 0, 0.045, 0, null, shape).scale.set(1, 0.85, 1);
        put(hat, new T.TorusGeometry(0.166, 0.032, 8, 20), "#FFFFFF", 0, 0.0, 0, [Math.PI / 2, 0, 0], shape);
        put(hat, sph(0.04, 10), "#FFFFFF", 0, 0.19, 0, null, shape);
        break;
      case "pony":
        put(hat, new T.TorusGeometry(0.152, 0.026, 8, 20), cfg.hatColor, 0, 0.07, -0.01, [0.35, 0, 0], shape);
        put(hat, sph(0.075, 14), cfg.hair, 0.09, 0.05, 0.14, null, shape);
        var tail = new T.Mesh(new T.CylinderGeometry(0.055, 0.02, 0.34, 10), mat(cfg.hair, shape));
        tail.position.set(0.1, -0.12, 0.2);
        tail.rotation.x = 0.35;
        hat.add(tail);
        break;
      case "helmet":
        put(hat, sph(0.185, 20), cfg.hatColor, 0, 0.03, 0, null, shape).scale.set(1, 0.9, 1.05);
        put(hat, box(0.3, 0.035, 0.14), "#2B3A55", 0, 0.02, -0.15, [0.15, 0, 0], shape);
        put(hat, box(0.22, 0.03, 0.03), "#FFFFFF", 0, 0.13, -0.03, null, shape);
        break;
      case "long":
        var long = new T.Mesh(new T.CylinderGeometry(0.16, 0.19, 0.34, 16), mat(cfg.hair, shape));
        long.position.set(0, -0.08, 0.12);
        long.scale.z = 0.6;
        hat.add(long);
        put(hat, sph(0.1, 12), cfg.hair, 0, -0.24, 0.15, null, shape).scale.set(1.2, 0.9, 0.7);
        put(hat, torus(0.15, 0.018, 16), cfg.hatColor, 0, 0.02, 0.03, [0.2, 0, 0], shape);
        break;
      default: // band
        put(hat, new T.TorusGeometry(0.158, 0.028, 8, 20), cfg.hatColor, 0, 0.06, 0.01, [0.2, 0, 0], shape);
        break;
    }

    // bayangan kontak
    var sh = new T.Mesh(new T.CircleGeometry(0.34, 20), new T.MeshBasicMaterial({
      color: 0x0b1b2b, transparent: true, opacity: 0.24, depthWrite: false
    }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.014;
    root.add(sh);

    return {
      root: root, body: body, head: head, torso: torso, torsoBase: TORSO_Y,
      legL: legL, legR: legR, armL: armL, armR: armR, shadow: sh,
      phase: Math.random() * 6.28
    };
  }

  /* ------------------------------------------------------- PROP LATAR */
  function geoAt(geo, x, y, z, rot) {
    if (rot) { geo.rotateX(rot[0] || 0); geo.rotateY(rot[1] || 0); geo.rotateZ(rot[2] || 0); }
    geo.translate(x || 0, y || 0, z || 0);
    return geo;
  }

  function propKit(pal) {
    return {
      tree: [
        { geo: geoAt(cyl(0.11, 0.16, 1.1, 6), 0, 0.55, 0), color: "#8A6240" },
        { geo: geoAt(cone(0.72, 1.5, 7), 0, 1.55, 0), color: pal.leaf1 },
        { geo: geoAt(cone(0.52, 1.1, 7), 0, 2.35, 0), color: pal.leaf2 }
      ],
      bush: [
        { geo: geoAt(sph(0.5, 8), 0, 0.36, 0), color: pal.leaf2 },
        { geo: geoAt(sph(0.32, 8), 0.34, 0.26, 0.05), color: pal.leaf1 }
      ],
      house: [
        { geo: geoAt(box(1.4, 1.05, 1.25), 0, 0.52, 0), color: pal.wall },
        { geo: geoAt(cone(1.2, 0.8, 4), 0, 1.42, 0, [0, Math.PI / 4, 0]), color: pal.roof },
        { geo: geoAt(box(0.32, 0.5, 0.06), 0, 0.33, -0.63), color: pal.door },
        { geo: geoAt(box(0.28, 0.28, 0.06), -0.42, 0.62, -0.63), color: "#BFE9FF" }
      ],
      lamp: [
        { geo: geoAt(cyl(0.07, 0.1, 2.3, 6), 0, 1.15, 0), color: "#4A5568" },
        { geo: geoAt(sph(0.22, 8), 0, 2.36, 0), color: pal.lamp, emissive: pal.lamp },
        { geo: geoAt(cone(0.28, 0.2, 8), 0, 2.56, 0), color: "#4A5568" }
      ],
      rock: [
        { geo: geoAt(new T.DodecahedronGeometry(0.24, 0), 0, 0.16, 0), color: "#B9C2CC" },
        { geo: geoAt(new T.DodecahedronGeometry(0.14, 0), 0.22, 0.1, 0.1), color: "#CBD4DD" }
      ],
      stall: [
        { geo: geoAt(box(1.5, 0.85, 0.9), 0, 0.44, 0), color: pal.wall },
        { geo: geoAt(box(1.7, 0.1, 1.1), 0, 0.95, 0), color: pal.awning1 },
        { geo: geoAt(box(1.7, 0.1, 0.45), 0, 0.95, -0.34), color: pal.awning2 },
        { geo: geoAt(box(0.1, 0.55, 0.1), -0.72, 1.2, -0.44), color: "#8A6240" },
        { geo: geoAt(box(0.1, 0.55, 0.1), 0.72, 1.2, -0.44), color: "#8A6240" }
      ],
      cloud: [
        { geo: geoAt(sph(0.9, 8), 0, 0, 0), color: "#FFFFFF", transparent: true, opacity: 0.95 },
        { geo: geoAt(sph(0.65, 8), 0.8, -0.12, 0.1), color: "#FFFFFF", transparent: true, opacity: 0.9 },
        { geo: geoAt(sph(0.5, 8), -0.75, -0.18, 0.05), color: "#FFFFFF", transparent: true, opacity: 0.9 }
      ]
    };
  }

  /* ------------------------------------------------------------- KOIN 3D */
  var coinTex = null;
  function coin(radius, thickness) {
    if (!coinTex) coinTex = new T.CanvasTexture(JR.Art.coinCanvas(256));
    var sideMat = new T.MeshLambertMaterial({ color: new T.Color("#E7B84E"), emissive: new T.Color("#8A6410"), flatShading: false, fog: false });
    var faceMat = new T.MeshBasicMaterial({ map: coinTex, toneMapped: false, fog: false });
    var geo = new T.CylinderGeometry(radius, radius, thickness, 32);
    var m = new T.Mesh(geo, [sideMat, faceMat, faceMat]);
    m.rotation.x = Math.PI / 2;
    var g = new T.Group();
    g.add(m);
    return g;
  }

  JR.Models = {
    item: item, itemCard: itemCard, avatar: avatar, coin: coin,
    labelSprite: labelSprite, propKit: propKit, mat: mat, put: put, matCache: matCache
  };
  JR.M = { box: box, cyl: cyl, sph: sph, cone: cone, torus: torus, geoAt: geoAt };
})(typeof window !== "undefined" ? window : global);
