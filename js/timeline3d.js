/* About: the timeline as a camera flight back through time.
   Newest entry first. Scrolling through the pinned section moves the camera down a corridor:
   each entry is a card placed in depth, alternating left and right, and each new year is a huge
   pixel number you fly through. The camera dwells a moment at every entry so it can be read. */
(function () {
  if (document.documentElement.classList.contains("tl3d-off")) return; // reduced motion: classic list

  var D = window.PORTFOLIO, R = "";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var TABS = [
    { label: "All", cat: null }, { label: "Game Jam", cat: "GameJam" }, { label: "Personal", cat: "Personal" },
    { label: "Competition", cat: "Competition" }, { label: "Class", cat: "Class" }, { label: "Club", cat: "Club" },
    { label: "Communication", cat: "Communication" }
  ];

  var track = document.getElementById("tl3d"), stage = document.getElementById("tl3d-stage"), world = document.getElementById("tl3d-world");
  var header = document.querySelector(".site-header");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function cats(p) { return [].concat(p.category); }
  function url(u) { return !u ? null : /^https?:/.test(u) ? u : R + u; }
  function ym(iso) { var p = String(iso).split("-"); return +p[0] * 12 + (+p[1] - 1); }
  function fmt(iso, day) { var p = String(iso).split("-"); return MONTHS[+p[1] - 1] + (day && p[2] ? " " + (+p[2]) + "," : "") + " " + p[0]; }
  function pct(p) { return Math.round((p.completion == null ? 1 : p.completion) * 100); }
  function ytThumb(p) { var m = p.links && p.links.youtube && String(p.links.youtube).match(/(?:youtu\.be\/|v=)([\w-]{11})/); return m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : null; }

  /* ---------- objects ---------- */
  var OBJ = [], EV = [];

  function cardHTML(p) {
    var media = p.preview
      ? '<video muted loop playsinline preload="metadata" src="' + url(p.preview) + '#t=0.5"></video>'
      : (url(p.poster) || ytThumb(p)) ? '<img src="' + esc(url(p.poster) || ytThumb(p)) + '" alt="" loading="lazy">' : "";
    var blocks = "";
    for (var i = 0; i < 10; i++) blocks += i < Math.round(pct(p) / 10) ? '<b class="on"></b>' : "<b></b>";
    return '<div class="t-card-in"><div class="t-media">' + media +
      '<span class="t-date">' + fmt(p.date, true) + "</span>" +
      (p.ongoing ? '<span class="t-now">In progress ' + pct(p) + "% <i>" + blocks + "</i></span>" : "") +
      '</div><div class="t-body"><h3>' + esc(p.title) + '</h3><ul class="t-chips">' +
      cats(p).map(function (c) { return "<li>" + esc(c === "GameJam" ? "Game jam" : c) + "</li>"; }).join("") + "</ul>" +
      (p.outcome && p.outcome !== "TODO" ? "<p>" + esc(p.outcome) + "</p>" : "") +
      '<span class="t-go">Open case study &rarr;</span></div></div>';
  }
  function msHTML(m) {
    return '<div class="t-ms-in">' + (m.image ? '<img src="' + esc(url(m.image)) + '" alt="">' : "") +
      "<div><small>Life · " + fmt(m.date) + (m.end ? " - " + fmt(m.end) : "") + "</small><h3>" + esc(m.title) + "</h3></div></div>";
  }

  function build(cat) {
    world.innerHTML = ""; OBJ = []; EV = [];
    var events = D.projects.filter(function (p) { return !cat || cats(p).indexOf(cat) !== -1; })
      .map(function (p) { return { date: p.date, p: p }; })
      .concat(cat ? [] : (D.milestones || []).map(function (m) { return { date: m.date, m: m }; }))
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var games = events.filter(function (e) { return e.p; }).length;
    var now = D.projects.filter(function (p) { return p.ongoing && (!cat || cats(p).indexOf(cat) !== -1); });

    add({ k: "cap", stop: true, m: ym(new Date().toISOString().slice(0, 10)), html:
      '<p class="t-kicker">Timeline · ' + String(events[events.length - 1].date).slice(0, 4) + " - " + new Date().getFullYear() + " · " + events.length + " entries</p>" +
      "<h3><em>Now</em></h3>" +
      (now.length ? "<p>In progress: <b>" + now.map(function (p) { return esc(p.title); }).join("</b>, <b>") + "</b></p>" : "<p>Scroll to rewind.</p>") });

    var lastYear = null;
    events.forEach(function (e) {
      var y = String(e.date).slice(0, 4);
      // the first year keeps only its doorway: its number would sit right behind "Now"
      if (y !== lastYear) { add({ k: "gate", year: y, html: lastYear ? y : "" }); lastYear = y; }
      var o = add(e.p
        ? { k: "card", stop: true, year: y, m: ym(e.date), href: R + "project.html?id=" + encodeURIComponent(e.p.id), html: cardHTML(e.p) }
        : { k: "ms", stop: true, year: y, m: ym(e.date), html: msHTML(e.m) });
      EV.push(o);
    });

    add({ k: "cap", stop: true, end: true, m: ym(events[events.length - 1].date), html:
      '<p class="t-kicker">' + fmt(events[events.length - 1].date) + " · start of the run</p>" +
      "<h3>End of<br>the tape</h3>" +
      "<p><b>" + games + "</b> games and projects" + (cat ? "" : ", <b>" + (events.length - games) + "</b> life events") + ".</p>" +
      '<p class="actions"><button class="button button--primary" type="button" data-rewind>Back to now &uarr;</button>' +
      '<a class="button" href="' + R + 'resume.html" target="_blank" rel="noopener">View resume</a></p>' });

    var back = world.querySelector("[data-rewind]");
    if (back) back.addEventListener("click", rewind);
    years();
  }
  function add(o) {
    var el = document.createElement(o.href ? "a" : "div");
    el.className = "t-obj t-" + o.k;
    if (o.href) el.href = o.href;
    if (o.k === "gate") el.setAttribute("aria-hidden", "true");
    el.innerHTML = o.html;
    world.appendChild(el);
    o.el = el; o.video = el.querySelector("video");
    OBJ.push(o);
    return o;
  }

  /* ---------- HUD: filter tabs + year rail ---------- */
  var tabsEl = document.getElementById("tl3d-tabs");
  tabsEl.innerHTML = TABS.map(function (t, i) {
    var n = t.cat ? D.projects.filter(function (p) { return cats(p).indexOf(t.cat) !== -1; }).length : null;
    return '<button type="button" class="tl-tab" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' + t.label + (n != null ? " <span>" + n + "</span>" : "") + "</button>";
  }).join("");
  tabsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".tl-tab"); if (!b) return;
    tabsEl.querySelectorAll(".tl-tab").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    introDone = true; stopSweep(); build(TABS[+b.dataset.i].cat); layout(); size(); go(0, true);
  });

  var yearsOl = document.getElementById("tl3d-years"), yearBtns = [];
  function years() {
    var list = [];
    EV.forEach(function (o) { if (list.indexOf(o.year) === -1) list.push(o.year); });
    yearsOl.innerHTML = list.map(function (y) {
      var n = EV.filter(function (o) { return o.year === y; }).length;
      return '<li><button type="button" data-y="' + y + '">' + y + " <small>" + n + "</small></button></li>";
    }).join("");
    yearBtns = [].slice.call(yearsOl.querySelectorAll("button"));
    yearBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var first = EV.filter(function (o) { return o.year === b.dataset.y; })[0];
        go(KEYS.findIndex(function (k) { return k.o === first; }));
      });
    });
  }

  /* ---------- layout: place objects in depth, build the camera keyframes ---------- */
  var narrow, H, xs, KEYS = [], LEN = 0, END = 0;

  function layout() {
    narrow = innerWidth < 760;
    H = stage.clientHeight;
    xs = narrow ? 1 : Math.max(0.75, Math.min(1.15, innerWidth / 1440));
    var SP = narrow ? 1150 : 680, GATE = narrow ? 700 : 900, side = 1, z = -400;

    OBJ.forEach(function (o, i) {
      if (o.k === "cap") {
        if (o.end) z -= narrow ? 1300 : 1100;
        o.x = 0; o.y = narrow ? 0 : -10; o.z = z; o.ry = 0;
        o.f = { x: 0, y: 0, z: -z - (narrow ? 260 : 420) };
        if (!o.end) z -= narrow ? 700 : 950; // room so the first year number stays well behind "Now"
        return;
      }
      if (o.k === "gate") {
        // the year number stands in the corridor a little before that year's first entry
        z -= GATE * 0.5; o.x = 0; o.y = narrow ? -40 : -60; o.z = z; o.ry = 0; z -= GATE * 0.5;
        return;
      }
      z -= SP;
      o.side = side;
      if (narrow) { o.x = side * 24; o.y = 0; o.ry = -side * 6; o.f = { x: o.x, y: 0, z: -z - 210 }; }
      else {
        o.x = side * (o.k === "ms" ? 300 : 370) * xs; o.y = o.k === "ms" ? 40 : -10; o.ry = -side * 14;
        o.f = { x: side * 190 * xs, y: o.k === "ms" ? 20 : 0, z: -z - 350 };
      }
      o.z = z; side = -side;
    });
    END = z;
    OBJ.forEach(function (o) {
      o.el.style.transform = "translate3d(" + o.x + "px," + o.y + "px," + o.z + "px) rotateY(" + o.ry + "deg) translate(-50%,-50%)";
      o.h = o.el.offsetHeight; // for the floor connector
    });

    // scroll keyframes: dwell at each stop, then travel at a speed set by the distance
    var dwell = H * (narrow ? 0.16 : 0.12), perPx = H * (narrow ? 0.34 : 0.28) / 680, s = 0, prev = null;
    KEYS = [];
    OBJ.forEach(function (o) {
      if (!o.stop) return;
      if (prev) s += Math.abs(o.f.z - prev.f.z) * perPx;
      var d = o.k === "cap" ? H * 0.2 : dwell;
      KEYS.push({ a: s, b: s + d, f: o.f, o: o, m: o.m });
      s += d; prev = o;
    });
    LEN = s;
    track.style.height = (s + H) + "px";
    // a 1px marker at every entry: with CSS scroll snap on (About, mouse wheel), the page snaps to these
    track.querySelectorAll(".tl3d-stop").forEach(function (m) { m.remove(); });
    KEYS.forEach(function (k) {
      var m = document.createElement("span");
      m.className = "tl3d-stop"; m.setAttribute("aria-hidden", "true");
      m.style.top = ((k.a + k.b) / 2) + "px";
      track.appendChild(m);
    });
  }

  function smooth(t) { return t * t * (3 - 2 * t); }
  // camera target + the date shown on the clock, for a scroll offset inside the track
  function at(y) {
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (y <= k.b) {
        if (y >= k.a || i === 0) return { f: k.f, m: k.m, i: i };
        var p = KEYS[i - 1], t = smooth((y - p.b) / (k.a - p.b));
        return { f: { x: p.f.x + (k.f.x - p.f.x) * t, y: p.f.y + (k.f.y - p.f.y) * t, z: p.f.z + (k.f.z - p.f.z) * t }, m: p.m + (k.m - p.m) * t, i: t < 0.5 ? i - 1 : i };
      }
    }
    var last = KEYS[KEYS.length - 1];
    return { f: last.f, m: last.m, i: KEYS.length - 1 };
  }
  function trackTop() { return track.getBoundingClientRect().top + scrollY - hdr; }
  /* ---------- sweeps: the camera flies on its own while the page stays put ----------
     Back to now and the intro use the same sweep, so they move at the same speed. */
  var sweepY = null, sweepRaf = 0, sweepWait = 0, introDone = false, SWEEP_MS = 1800;
  function localNow() { return Math.max(0, hdr - track.getBoundingClientRect().top); }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function sweep(from, to, done) {
    cancelAnimationFrame(sweepRaf); clearTimeout(sweepWait);
    var dur = Math.max(500, SWEEP_MS * Math.abs(to - from) / Math.max(1, LEN)), t0 = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      sweepY = from + (to - from) * ease(p);
      if (p < 1) sweepRaf = requestAnimationFrame(tick);
      else if (done) done(); else sweepY = null;
    })(t0);
  }
  function stopSweep() { cancelAnimationFrame(sweepRaf); clearTimeout(sweepWait); sweepY = null; }
  // before the first visit the camera waits at the oldest entry (2022); when the stage pins it rewinds to Now once,
  // with the same sweep as Back to now
  function oldestY() { var k = KEYS[Math.max(0, KEYS.length - 2)]; return (k.a + k.b) / 2; }
  function park() {
    if (introDone) return;
    sweepY = oldestY();
    var f = at(sweepY).f; cam.x = f.x; cam.y = f.y; cam.z = f.z;
  }
  function intro() { sweep(sweepY != null ? sweepY : oldestY(), localNow()); }
  function rewind() {
    var from = localNow();
    go(0, true);
    sweep(from, (KEYS[0].a + KEYS[0].b) / 2);
  }

  /* ---------- snap: when the scroll settles, glide to the nearest entry (leaning the way you scrolled) ---------- */
  var snapT = 0, lastL = 0, dir = 1;
  addEventListener("scroll", function () {
    var l = hdr - track.getBoundingClientRect().top;
    if (l !== lastL) dir = l > lastL ? 1 : -1;
    lastL = l;
    clearTimeout(snapT); snapT = setTimeout(snap, 140);
  }, { passive: true });
  function snap() {
    if (sweepY != null || !KEYS.length) return;
    // CSS snap already handles it (mouse wheel); touchpads chose free scrolling, so leave them alone
    var root = document.documentElement;
    if (root.classList.contains("free-scroll") || getComputedStyle(root).scrollSnapType !== "none") return;
    var l = hdr - track.getBoundingClientRect().top;
    if (l <= 0 || l >= LEN) return;
    // one flick = one entry: once you have moved 40px off an entry, the next one in that direction wins
    var cs = KEYS.map(function (k) { return (k.a + k.b) / 2; }), i = 0;
    cs.forEach(function (c, j) { if (Math.abs(c - l) < Math.abs(cs[i] - l)) i = j; });
    if ((l - cs[i]) * dir > 40) i = Math.max(0, Math.min(cs.length - 1, i + dir));
    var best = cs[i];
    if (Math.abs(best - l) > 3) scrollTo({ top: scrollY + best - l, behavior: "smooth" });
  }

  function go(i, instant) {
    if (!instant) stopSweep();
    var k = KEYS[Math.max(0, i)];
    if (k) scrollTo({ top: trackTop() + (k.a + k.b) / 2, behavior: instant ? "instant" : "smooth" });
  }

  /* ---------- canvas: dust, floor grid, the time rail with a pin for every entry, a frame for every year ---------- */
  var cv = document.getElementById("tl3d-canvas"), cx = cv.getContext("2d"), W = 0, Hc = 0, PERSP = 1000;
  var DUST = [], C = {};
  function size() {
    var dpr = Math.min(2, devicePixelRatio || 1);
    W = stage.clientWidth; Hc = stage.clientHeight;
    cv.width = W * dpr; cv.height = Hc * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    PERSP = narrow ? 760 : 1000;
    DUST = [];
    var n = Math.min(900, Math.round(-END / 22));
    for (var i = 0; i < n; i++) DUST.push({ x: (Math.random() - 0.5) * 6000, y: (Math.random() - 0.5) * 3400, z: 600 - Math.random() * (-END + 3000), w: Math.random() });
  }
  // canvas colours follow the site tokens (and so the theme switch)
  function rgb(v) { v = v.trim(); if (v[0] === "#") { var n = parseInt(v.length === 4 ? v.replace(/(\w)/g, "$1$1").slice(1) : v.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255].join(","); } return "128,128,128"; }
  function tokens() { var s = getComputedStyle(stage); ["--text", "--muted", "--line", "--yellow-strong"].forEach(function (k) { C[k] = rgb(s.getPropertyValue(k)); }); }
  new MutationObserver(tokens).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function proj(x, y, z, cam, ry, rx) {
    var X = x - cam.x, Y = y - cam.y, Z = z + cam.z;
    var sy = Math.sin(ry), cy = Math.cos(ry), sx = Math.sin(rx), cxr = Math.cos(rx);
    var X2 = X * cy + Z * sy, Z2 = -X * sy + Z * cy;
    var Y2 = Y * cxr - Z2 * sx, Z3 = Y * sx + Z2 * cxr;
    if (Z3 > PERSP - 20) return null;
    var s = PERSP / (PERSP - Z3);
    return { x: W / 2 + X2 * s, y: Hc / 2 + Y2 * s, s: s };
  }
  function line(a, b, color, w) { if (!a || !b) return; cx.strokeStyle = color; cx.lineWidth = w || 1; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }

  /* ---------- frame loop ---------- */
  var cam = { x: 0, y: 0, z: 0 }, mx = 0, my = 0, tmx = 0, tmy = 0, hdr = 57, curYear = null;
  var clockY = document.getElementById("tl3d-year"), clockM = document.getElementById("tl3d-month"), bar = document.getElementById("tl3d-progress"), hint = document.getElementById("tl3d-hint");
  stage.addEventListener("pointermove", function (e) { if (e.pointerType !== "mouse") return; var r = stage.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - 0.5; tmy = (e.clientY - r.top) / r.height - 0.5; });
  stage.addEventListener("pointerleave", function () { tmx = tmy = 0; });

  function step() {
    var r = track.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return; // off screen: do nothing
    // the first time the stage pins, fly through the whole chronology once and come back
    if (!introDone && r.top <= hdr + 2 && r.bottom > innerHeight) { introDone = true; intro(); }
    var local = Math.max(0, hdr - r.top), camLocal = sweepY != null ? sweepY : local, t = at(camLocal), vz = t.f.z - cam.z;
    cam.x += (t.f.x - cam.x) * 0.1; cam.y += (t.f.y - cam.y) * 0.1; cam.z += vz * 0.1;
    mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
    var ryDeg = mx * 4, rxDeg = -my * 3;
    world.style.transform = "rotateX(" + rxDeg + "deg) rotateY(" + ryDeg + "deg) translate3d(" + (-cam.x) + "px," + (-cam.y) + "px," + cam.z + "px)";

    // fog: fade in from the dark far away, fade out just before passing the camera
    var n0 = narrow ? -20 : -40, n1 = narrow ? -110 : -230, f1 = narrow ? -900 : -1300, f0 = narrow ? -1500 : -2500;
    OBJ.forEach(function (o) {
      var rel = o.z + cam.z, op;
      if (rel > n0) op = 0; else if (rel > n1) op = (n0 - rel) / (n0 - n1);
      else if (rel < f0) op = 0; else if (rel < f1) op = (rel - f0) / (f1 - f0); else op = 1;
      o.op = op;
      o.el.style.opacity = op.toFixed(3);
      o.el.style.visibility = op < 0.02 ? "hidden" : "visible";
      if (o.video) {
        var on = op > 0.3 && rel > -1500;
        if (on && o.video.paused) o.video.play().catch(function () {});
        else if (!on && !o.video.paused) o.video.pause();
      }
    });

    var ry = ryDeg * Math.PI / 180, rx = rxDeg * Math.PI / 180, floorY = narrow ? 470 : 520, near = -cam.z - 60, far = -cam.z - 5200;
    cx.clearRect(0, 0, W, Hc);

    // floor grid
    var base = Math.round(cam.x / 300) * 300;
    for (var gx = -3000; gx <= 3000; gx += 300) {
      var a = proj(base + gx, floorY, near, cam, ry, rx), b = proj(base + gx, floorY, far, cam, ry, rx);
      if (!a || !b) continue;
      var g = cx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, "rgba(" + C["--line"] + ",0.7)"); g.addColorStop(1, "rgba(" + C["--line"] + ",0)");
      line(a, b, g);
    }
    for (var gz = Math.floor(near / 400) * 400; gz > far; gz -= 400) {
      var fz = Math.max(0, 1 - (-(gz + cam.z)) / 5200);
      line(proj(-3000 + cam.x, floorY, gz, cam, ry, rx), proj(3000 + cam.x, floorY, gz, cam, ry, rx), "rgba(" + C["--line"] + "," + (0.6 * fz).toFixed(3) + ")");
    }

    // year gates: a doorway frame on the floor, drawn at the pixel number's depth
    OBJ.forEach(function (o) {
      if (o.k !== "gate") return;
      var rel = o.z + cam.z; if (rel > -60 || rel < -5200) return;
      var al = (Math.min(1, (5200 + rel) / 2400) * Math.min(1, -rel / 400) * 0.55).toFixed(3), w = narrow ? 700 : 1300, top = narrow ? -620 : -720;
      var c = "rgba(" + C["--yellow-strong"] + "," + al + ")";
      var p1 = proj(-w, floorY, o.z, cam, ry, rx), p2 = proj(-w, top, o.z, cam, ry, rx), p3 = proj(w, top, o.z, cam, ry, rx), p4 = proj(w, floorY, o.z, cam, ry, rx);
      line(p1, p2, c, 2); line(p2, p3, c, 2); line(p3, p4, c, 2); line(p1, p4, c, 2);
    });

    // the time rail down the middle of the floor, and a pin from the rail up to each entry
    var cur = KEYS[t.i] && KEYS[t.i].o;
    var ra = proj(0, floorY, near, cam, ry, rx), rb = proj(0, floorY, Math.max(far, END), cam, ry, rx);
    if (ra && rb) {
      var rg = cx.createLinearGradient(ra.x, ra.y, rb.x, rb.y);
      rg.addColorStop(0, "rgba(" + C["--yellow-strong"] + ",0.9)"); rg.addColorStop(1, "rgba(" + C["--yellow-strong"] + ",0)");
      line(ra, rb, rg, narrow ? 2 : 3);
    }
    EV.forEach(function (o) {
      var rel = o.z + cam.z; if (rel > -60 || rel < -5200) return;
      var live = o === cur, al = Math.min(1, (5200 + rel) / 2600);
      var col = live ? "rgba(" + C["--yellow-strong"] + "," + al.toFixed(3) + ")" : "rgba(" + C["--muted"] + "," + (al * 0.55).toFixed(3) + ")";
      var foot = proj(o.x, floorY, o.z, cam, ry, rx), rail = proj(0, floorY, o.z, cam, ry, rx), under = proj(o.x, o.y + o.h / 2, o.z, cam, ry, rx);
      line(rail, foot, col, live ? 2 : 1);
      line(foot, under, col, live ? 2 : 1);
      if (rail) {
        var sz = Math.max(3, rail.s * (live ? 16 : 10));
        cx.fillStyle = col; cx.fillRect(rail.x - sz / 2, rail.y - sz / 2, sz, sz);
        if (live) { cx.strokeStyle = "rgba(" + C["--text"] + "," + al.toFixed(3) + ")"; cx.lineWidth = 1.5; cx.strokeRect(rail.x - sz / 2 - 3, rail.y - sz / 2 - 3, sz + 6, sz + 6); }
      }
    });

    // dust, streaking when the camera moves fast
    var streak = Math.min(50, Math.abs(vz) * 0.3);
    DUST.forEach(function (d) {
      var rel = d.z + cam.z; if (rel < -5200 || rel > 400) return;
      var p = proj(d.x, d.y, d.z, cam, ry, rx); if (!p) return;
      var al = Math.min(1, (5200 + rel) / 2600) * (0.25 + d.w * 0.45), sz = Math.max(0.8, p.s * (0.8 + d.w * 1.8));
      var col = d.w > 0.86 ? C["--yellow-strong"] : C["--muted"];
      if (streak > 2) line(proj(d.x, d.y, d.z - streak * Math.sign(vz), cam, ry, rx), p, "rgba(" + col + "," + (al * 0.8).toFixed(3) + ")", sz);
      else { cx.fillStyle = "rgba(" + col + "," + al.toFixed(3) + ")"; cx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz); }
    });

    // HUD: the clock rewinds through the months, the year rail follows
    var m = Math.round(t.m), yr = Math.floor(m / 12);
    clockY.textContent = yr; clockM.textContent = MONTHS[m % 12].toUpperCase();
    bar.style.width = (Math.min(1, camLocal / Math.max(1, LEN)) * 100).toFixed(1) + "%";
    if (String(yr) !== curYear) { curYear = String(yr); yearBtns.forEach(function (b) { b.setAttribute("aria-current", String(b.dataset.y === curYear)); }); }
    hint.classList.toggle("is-gone", local > 40);
  }
  function frame() { step(); requestAnimationFrame(frame); }

  function measure() { hdr = header ? header.offsetHeight : 0; track.style.setProperty("--hdr", hdr + "px"); }
  measure(); tokens(); build(null); layout(); size(); park();
  addEventListener("resize", function () { measure(); layout(); size(); park(); });
  addEventListener("load", function () { layout(); }); // fonts and logos change card heights
  requestAnimationFrame(frame);
})();
