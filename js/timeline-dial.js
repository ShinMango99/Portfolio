/* About: the timeline as a game disc in a console.
   Every entry is a track printed on one big disc: titles along rays, years on the outer ring. The disc sits in
   a console at the left edge with half of it out of the slot, and the cover of the current entry spins in the
   console's porthole. The section pins while you scroll through it and the scroll turns the disc; the track in
   the yellow reading window (3 o'clock) is the one on the card. The first time the stage pins, the disc runs
   once from 2022 to now. Click the card, a track, the cover or EJECT: the disc stops and slides out of the
   slot, then the case study loads. With reduced motion the classic list is shown instead (nothing is built). */
(function () {
  var html = document.documentElement;
  if (html.classList.contains("dial-off")) return;
  var D = window.PORTFOLIO;
  if (!D) return;

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var TABS = [
    { label: "All", cat: null }, { label: "Game Jam", cat: "GameJam" }, { label: "Personal", cat: "Personal" },
    { label: "Competition", cat: "Competition" }, { label: "Class", cat: "Class" }, { label: "Club", cat: "Club" },
    { label: "Communication", cat: "Communication" }
  ];
  var TH = 10;          // degrees between tracks on the disc
  var INTRO_MS = 1600;  // the first run from 2022 to now
  var EJECT_MS = 820;   // disc out of the slot, then the page changes

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function cats(p) { return [].concat(p.category); }
  function url(u) { return !u ? null : u; }
  function ytThumb(p) { var m = p.links && p.links.youtube && String(p.links.youtube).match(/(?:youtu\.be\/|v=)([\w-]{11})/); return m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : null; }
  function fmt(iso, day) { var p = String(iso).split("-"); return MONTHS[+p[1] - 1] + (day && p[2] ? " " + (+p[2]) + "," : "") + " " + p[0]; }
  function pct(p) { return Math.round((p.completion == null ? 1 : p.completion) * 100); }
  function catLabel(c) { return c === "GameJam" ? "Game jam" : c; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function team(t) { return t == null ? null : /^1\b/.test(t) ? "Solo" : t + " people"; }
  function short(t) { var s = String(t).split(/[:,]/)[0]; return s.length > 32 ? s.slice(0, 30) + "..." : s; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  /* ---------- entries: projects + life events, newest first ---------- */
  function entries(cat) {
    var list = D.projects.filter(function (p) { return !cat || cats(p).indexOf(cat) !== -1; }).map(function (p) {
      return { kind: "p", p: p, date: p.date, title: p.title, img: url(p.poster), thumb: ytThumb(p),
        video: url(p.preview), href: "project.html?id=" + encodeURIComponent(p.id), cats: cats(p) };
    }).concat((D.milestones || []).filter(function (m) { return !cat || m.category === cat; }).map(function (m) {
      return { kind: "m", m: m, date: m.date, title: m.title, img: url(m.image), cats: [m.category || "Life"] };
    })).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    list.forEach(function (e, i) {
      e.i = i; e.year = String(e.date).slice(0, 4);
      e.month = MONTHS[+String(e.date).split("-")[1] - 1];
      e.first = i === 0 || list[i - 1].year !== e.year;
    });
    return list;
  }

  /* ---------- the card: one fixed size for every entry, the thumbnail always whole (16:9, letterboxed) ---------- */
  // the card's button: games invite you to play; teaching work (Communication) is not a game
  function goLabel(it) { return it.cats.indexOf("Communication") !== -1 ? "View this project" : "Play this game"; }
  function mediaHTML(it) {
    var fg = it.video
      ? '<video class="tc-fg" muted loop playsinline autoplay preload="auto" src="' + esc(it.video) + '"' + (it.img ? ' poster="' + esc(it.img) + '"' : "") + "></video>"
      : it.img ? '<img class="tc-fg" src="' + esc(it.img) + '" alt="">'
      : it.thumb ? '<img class="tc-fg is-cover" src="' + esc(it.thumb) + '" alt="">' : ""; // YouTube thumbs carry their own black bars
    return (it.img ? '<img class="tc-bg" src="' + esc(it.img) + '" alt="" aria-hidden="true">' : "") + fg;
  }
  function cardHTML(it) {
    if (it.kind === "m") {
      var m = it.m, kind = m.category || "Life event";
      return '<div class="tc-media tc-media--life"><span class="tc-life">' + (it.img ? '<img src="' + esc(it.img) + '" alt="">' : "") +
        "<b>" + it.year + "</b><small>" + esc(kind) + "</small></span></div>" +
        '<div class="tc-body"><p class="tc-kicker">' + esc(kind) + " · " + fmt(m.date) + (m.end ? " - " + fmt(m.end) : "") + "</p>" +
        '<h3 class="tc-title tc-title--2">' + esc(m.title) + "</h3>" +
        '<p class="tc-plain">' + (m.category ? "A role in the club, not a project, so it has no case study of its own." : "A milestone on the way, not a project, so it has no case study.") + "</p>" +
        '<span class="tc-none">No case study</span></div>';
    }
    var p = it.p, blocks = "";
    for (var i = 0; i < 10; i++) blocks += i < Math.round(pct(p) / 10) ? '<b class="on"></b>' : "<b></b>";
    var facts = [["Role", p.role], ["Team", team(p.team)], ["Tools", p.tools]].filter(function (f) { return f[1] && f[1] !== "TODO"; });
    return '<div class="tc-media">' + mediaHTML(it) +
      (p.ongoing ? '<span class="tc-now">In progress ' + pct(p) + "% <i>" + blocks + "</i></span>" : "") +
      (p.award ? '<span class="tc-award">' + esc(p.award) + "</span>" : "") + "</div>" +
      '<div class="tc-body">' +
      '<p class="tc-kicker">' + fmt(p.date, true) + " · " + it.cats.map(catLabel).map(esc).join(" / ") + "</p>" +
      '<h3 class="tc-title">' + esc(p.title) + "</h3>" +
      '<p class="tc-plain">' + esc(p.plain || p.summary) + "</p>" +
      (facts.length ? '<dl class="tc-facts">' + facts.map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>" : "") +
      '<span class="tc-go"><span class="tc-go-label">' + goLabel(it) + '</span> <span aria-hidden="true">&rarr;</span></span>' +
      "</div>";
  }

  /* ---------- DOM ---------- */
  var track = $("dial"), stage = $("dial-stage"), box = $("dial-visual"), slot = $("dial-slot"), header = document.querySelector(".site-header");
  var elYear = $("dial-year"), elMonth = $("dial-month"), elNum = $("dial-num"), elHint = $("dial-hint");
  var ITEMS = [], cur = -1, f = 0, hdr = 57, STEP = 300, opening = false, cardEl = null;

  function readout(i) {
    var it = ITEMS[i]; if (!it) return;
    elYear.textContent = it.year; elMonth.textContent = it.month.toUpperCase();
    elNum.textContent = pad(i + 1) + " / " + pad(ITEMS.length);
  }
  function show(i, d) {
    var it = ITEMS[i]; if (!it) return;
    cur = i;
    var el = document.createElement(it.kind === "p" ? "a" : "div");
    el.className = "tc" + (it.kind === "m" ? " tc--life" : "");
    if (it.href) el.href = it.href;
    el.innerHTML = cardHTML(it);
    el.style.setProperty("--from", (d > 0 ? 1 : -1) * 14 + "px");
    slot.innerHTML = ""; slot.appendChild(el); cardEl = el;
    var v = el.querySelector("video"); if (v) v.play().catch(function () {});
    readout(i);
    select(i, false);
  }

  /* ================= the console and the disc ================= */
  var ICON_RESET = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 2h2v2h5v1h2v1h1v6h-1v1h-2v1H5v-1H3v-1h2v-1h5v-1h1V7h-1V6H5v2H3z"/></svg>';
  var ICON_EJECT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M7 2h2v1h1v1h1v1h1v1h1v1h1v2H2V7h1V6h1V5h1V4h1V3h1zM2 11h12v3H2z"/></svg>';
  var ICON_POWER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M7 1h2v7H7zM4 3h2v2H5v1H4v4h1v1h1v1h4v-1h1v-1h1V6h-1V5h-1V3h2v1h1v2h1v4h-1v2h-1v1h-2v1H6v-1H4v-1H3v-2H2V6h1V4h1z"/></svg>';
  var disc, face, win, svg, rot, lab, imgs, flip = 0, groups = [], shell, port, eject;
  var Dd = 1000, Rd = 500, cx = 0, cy = 0, act = 0, lightAct = -1, ej = -1, ejP = 0, labRot = 0, labV = 0;

  function buildVisual() {
    var first = ITEMS.length ? ITEMS[ITEMS.length - 1].year : "", last = ITEMS.length ? ITEMS[0].year : "";
    box.innerHTML =
      '<div class="disc">' +
        '<div class="disc-face" aria-hidden="true"></div>' +
        '<div class="disc-win" aria-hidden="true"></div>' +
        '<svg class="disc-rot"><g></g></svg>' +
        '<button type="button" class="disc-label" tabindex="-1" aria-hidden="true"><img alt=""><img alt=""><i></i></button>' +
      "</div>" +
      '<div class="cons" aria-hidden="true">' +
        '<div class="cons-shell"></div><span class="cons-shade"></span><span class="cons-slot"></span>' +
        '<span class="cons-port"></span>' +
        '<div class="cons-brand"><b>JC</b><span>Disc system<br>' + first + " - " + last + "</span></div>" +
      "</div>" +
      // the three keys: POWER turns the disc off (the plain list instead), RESET back to now, EJECT opens the case study
      '<div class="cons-ctrl">' +
        '<button type="button" class="cons-btn cons-power" aria-label="Power: turn the disc off and show the timeline as a list" title="Turn the disc off (list view)">' +
          '<span class="cons-key"><i class="cons-led"></i></span><span class="cons-lab">Power</span></button>' +
        '<button type="button" class="cons-btn cons-reset" aria-label="Reset: back to ' + last + '" title="Back to ' + last + '">' +
          '<span class="cons-key">' + ICON_RESET + '</span><span class="cons-lab">Reset</span></button>' +
        '<button type="button" class="cons-btn cons-eject" title="Open the case study">' +
          '<span class="cons-key">' + ICON_EJECT + '</span><span class="cons-lab">Eject</span></button>' +
      "</div>";
    disc = box.querySelector(".disc"); face = box.querySelector(".disc-face"); win = box.querySelector(".disc-win");
    svg = box.querySelector(".disc-rot"); rot = svg.querySelector("g"); lab = box.querySelector(".disc-label"); imgs = lab.querySelectorAll("img");
    shell = box.querySelector(".cons-shell"); port = box.querySelector(".cons-port"); eject = box.querySelector(".cons-eject");
    svg.addEventListener("click", function (e) {
      var g = e.target.closest("g[data-i]"); if (!g) return;
      var i = +g.dataset.i;
      if (i === act) open(i, e); else go(i);
    });
    win.addEventListener("click", function (e) { open(act, e); });
    lab.addEventListener("click", function (e) { open(act, e); });
    eject.addEventListener("click", function (e) { open(act, e); });
    box.querySelector(".cons-reset").addEventListener("click", function () { go(0); });
    box.querySelector(".cons-power").addEventListener("click", powerOff);
    ej = -1; ejP = 0; lightAct = -1;
  }

  function layoutVisual(w, h) {
    var band = w > h * 1.15; // phones: the visual is a short band above the card
    Dd = band ? Math.max(h * 2.2, 240) : Math.min(h * 1.3, w * 1.75);
    Rd = Dd / 2; cx = w - (band ? 16 : 24) - Rd; cy = h / 2;
    var slotX = cx + Rd * 0.33, pr = Rd * 0.27, r1 = Rd * 0.36, r2 = Rd * 0.875, wh = Math.max(26, Math.min(42, Rd * 0.075));
    box.classList.toggle("is-compact", band || slotX < 170 || h < 560);
    function place(el, x, y, s) { el.style.left = x + "px"; el.style.top = y + "px"; el.style.width = el.style.height = s + "px"; }
    place(face, cx - Rd, cy - Rd, Dd); place(svg, cx - Rd, cy - Rd, Dd);
    svg.setAttribute("viewBox", [-Rd, -Rd, Dd, Dd].join(" "));
    place(lab, cx - Rd * 0.3, cy - Rd * 0.3, Rd * 0.6);
    win.style.left = (cx + r1 - 14) + "px"; win.style.top = (cy - wh / 2) + "px"; win.style.width = (r2 - r1 + 14) + "px"; win.style.height = wh + "px";
    // the console shell reaches far to the left; the porthole is a hole in it over the disc's label
    var off = 2000;
    shell.style.left = -off + "px"; shell.style.width = (slotX + off) + "px";
    var hole = "radial-gradient(circle " + pr + "px at " + (cx + off) + "px " + (cy + 40) + "px, transparent " + (pr - 0.5) + "px, #000 " + (pr + 0.5) + "px)";
    shell.style.webkitMaskImage = hole; shell.style.maskImage = hole;
    place(port, cx - pr, cy - pr, pr * 2);
    box.style.setProperty("--slot", slotX + "px");
    box.style.setProperty("--cy", cy + "px");
    box.style.setProperty("--wh", wh + "px");
    drawTracks(r1, r2);
    lightAct = -1; // the tracks were redrawn: mark the one in the window again
    select(act, true);
  }

  function drawTracks(r1, r2) {
    var out = "", ts = Math.max(11, Rd * 0.029), ds = Math.max(8.5, Rd * 0.018), runs = [];
    // year ring: one band per year, alternating shades, the year printed along its middle ray
    ITEMS.forEach(function (it, i) { if (it.first) runs.push({ y: it.year, a: i }); runs[runs.length - 1].b = i; });
    runs.forEach(function (r, k) {
      var a0 = (r.a - 0.5) * TH, a1 = (r.b + 0.5) * TH, ri = Rd * 0.9, ro = Rd * 0.995;
      out += '<path class="disc-band' + (k % 2 ? " disc-band--alt" : "") + '" d="' + arc(ri, ro, a0, a1) + '"/>';
      out += '<g transform="rotate(' + ((a0 + a1) / 2) + ')"><text class="disc-yr" x="' + (Rd * 0.947) + '" y="0" style="font-size:' + (Rd * 0.05).toFixed(1) + 'px">' + r.y + "</text></g>";
      if (k > 0) out += '<g transform="rotate(' + a0 + ')"><line class="disc-sep" x1="' + (Rd * 0.34) + '" x2="' + ro + '"/></g>';
    });
    ITEMS.forEach(function (it, i) {
      var label = it.kind === "m" ? short(it.title) : it.title;
      var sub = it.month.toUpperCase() + " " + it.year + " · " + it.cats.map(catLabel).join(" / ").toUpperCase();
      out += '<g data-i="' + i + '" class="disc-trk' + (it.kind === "m" ? " is-life" : "") + '" transform="rotate(' + (i * TH) + ')">' +
        '<rect class="disc-hit" x="' + (r1 - 12) + '" y="' + (-ts * 1.1) + '" width="' + (r2 - r1 + 12) + '" height="' + (ts * 2.2) + '"/>' +
        '<circle class="disc-dot" cx="' + (r1 - 8) + '" cy="0" r="' + Math.max(2.5, Rd * 0.006).toFixed(1) + '"/>' +
        '<text class="disc-ti" x="' + r1 + '" y="-2" style="font-size:' + ts.toFixed(1) + 'px">' + esc(label) + "</text>" +
        '<text class="disc-dt" x="' + r1 + '" y="' + (ds + 3).toFixed(1) + '" style="font-size:' + ds.toFixed(1) + 'px">' + esc(sub) + "</text></g>";
    });
    rot.innerHTML = out;
    groups = [].slice.call(rot.querySelectorAll("g[data-i]"));
  }
  function arc(ri, ro, a0, a1) {
    function p(r, a) { a = a * Math.PI / 180; return (r * Math.cos(a)).toFixed(1) + " " + (r * Math.sin(a)).toFixed(1); }
    var big = a1 - a0 > 180 ? 1 : 0;
    return "M" + p(ro, a0) + " A" + ro + " " + ro + " 0 " + big + " 1 " + p(ro, a1) + " L" + p(ri, a1) + " A" + ri + " " + ri + " 0 " + big + " 0 " + p(ri, a0) + "Z";
  }

  function updateVisual(f, vel, dt) {
    svg.style.transform = "rotate(" + (-f * TH).toFixed(3) + "deg)";
    groups.forEach(function (g, i) { var a = Math.abs(i - f) * TH; g.style.opacity = a > 95 ? "0" : (1 - Math.max(0, (a - 60) / 35)).toFixed(3); });
    if (ej >= 0) {
      ejP = Math.min(1, ejP + dt / (EJECT_MS / 1000));
      disc.style.transform = "translateX(" + (easeOut(ejP) * Dd * 0.12).toFixed(1) + "px)";
    }
    // the cover in the porthole plays; a fast scroll (or the intro run) spins it up like a seek
    var want = ej >= 0 ? 0 : 160 + Math.min(900, Math.abs(vel) * 110);
    labV += (want - labV) * Math.min(1, dt * (ej >= 0 ? 7 : 3));
    labRot = (labRot + labV * dt) % 360;
    lab.style.transform = "rotate(" + labRot.toFixed(2) + "deg)";
  }

  // light: only the reading window and the display (used while the intro runs, so covers do not all load)
  function select(i, light) {
    var it = ITEMS[i]; if (!it) return;
    if (i !== lightAct) {
      lightAct = i;
      groups.forEach(function (g, j) { g.classList.toggle("is-on", j === i); });
      win.classList.toggle("is-life", it.kind === "m");
    }
    if (light) return;
    act = i;
    var src = it.img || it.thumb;
    flip = 1 - flip;
    var on = imgs[flip], off = imgs[1 - flip];
    if (src) on.src = src; else on.removeAttribute("src");
    on.classList.toggle("is-on", !!src); off.classList.remove("is-on");
    lab.classList.toggle("is-life", it.kind === "m");
    var can = it.kind === "p";
    lab.disabled = !can; eject.disabled = !can;
    eject.setAttribute("aria-label", can ? "Eject: " + goLabel(it).toLowerCase() + ", " + it.title : "Eject (nothing to open for a life event)");
  }

  /* ================= scroll, filters, keys ================= */
  function build(cat) {
    ITEMS = entries(cat);
    buildVisual();
    cur = -1;
    f = introDone ? 0 : ITEMS.length - 1; // before the first visit the disc waits at 2022
    layout();
    show(Math.round(f), 1);
  }

  var tabsEl = $("dial-tabs");
  tabsEl.innerHTML = TABS.map(function (t, i) {
    var n = t.cat ? D.projects.filter(function (p) { return cats(p).indexOf(t.cat) !== -1; }).length +
      (D.milestones || []).filter(function (m) { return m.category === t.cat; }).length : null;
    return '<button type="button" class="tl-tab" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' + t.label + (n != null ? " <span>" + n + "</span>" : "") + "</button>";
  }).join("");
  tabsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".tl-tab"); if (!b || opening) return;
    tabsEl.querySelectorAll(".tl-tab").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    introDone = true; endSweep();
    build(TABS[+b.dataset.i].cat);
    scrollTo({ top: trackTop(), behavior: "instant" });
  });
  $("dial-prev").addEventListener("click", function () { go(want() - 1); });
  $("dial-next").addEventListener("click", function () { go(want() + 1); });

  // POWER off: the disc is display:none, its boxes all read 0, so everything that measures it must stand down
  function shut() { return html.classList.contains("dial-shut"); }
  function layout() {
    if (shut()) return;
    hdr = header ? header.offsetHeight : 0;
    track.style.setProperty("--hdr", hdr + "px");
    var H = stage.clientHeight;
    STEP = Math.max(200, Math.round(H * 0.42));
    track.style.height = (STEP * Math.max(0, ITEMS.length - 1) + H) + "px";
    // a 1px marker at every entry: with CSS scroll snap on (About, mouse wheel) the page snaps to these
    track.querySelectorAll(".dial-stop").forEach(function (m) { m.remove(); });
    ITEMS.forEach(function (it, i) {
      var m = document.createElement("span");
      m.className = "dial-stop"; m.setAttribute("aria-hidden", "true"); m.style.top = (i * STEP) + "px";
      track.appendChild(m);
    });
    var b = box.getBoundingClientRect();
    layoutVisual(b.width, b.height);
  }
  function trackTop() { return track.getBoundingClientRect().top + scrollY - hdr; }
  function local() { return hdr - track.getBoundingClientRect().top; }
  function target() { return clamp(local() / STEP, 0, ITEMS.length - 1); }
  function want() { return Math.round(target()); }
  function go(i) {
    if (opening || shut()) return;
    endSweep();
    i = clamp(i, 0, ITEMS.length - 1);
    scrollTo({ top: trackTop() + i * STEP, behavior: "smooth" });
  }

  // snap for touch screens: CSS snap already handles the mouse wheel, and touchpads chose free scrolling
  var snapT = 0, lastL = 0, dir = 1;
  addEventListener("scroll", function () {
    if (shut()) return;
    var l = local();
    if (l !== lastL) dir = l > lastL ? 1 : -1;
    lastL = l;
    clearTimeout(snapT); snapT = setTimeout(snap, 170);
  }, { passive: true });
  function snap() {
    if (opening || sweep || shut()) return;
    if (html.classList.contains("free-scroll") || getComputedStyle(html).scrollSnapType !== "none") return;
    var l = local(); if (l <= 0 || l >= STEP * (ITEMS.length - 1)) return;
    var t = l / STEP, i = Math.round(t);
    if ((t - i) * dir > 0.12) i += dir; // one flick = one entry
    i = clamp(i, 0, ITEMS.length - 1);
    if (Math.abs(i * STEP - l) > 2) scrollTo({ top: scrollY + i * STEP - l, behavior: "smooth" });
  }
  function pinned() { if (shut()) return false; var r = track.getBoundingClientRect(); return r.top <= hdr + 2 && r.bottom >= innerHeight - 2; }
  addEventListener("keydown", function (e) {
    if (opening || e.altKey || e.ctrlKey || e.metaKey || !pinned()) return;
    var k = e.key, i = want();
    if ((k === "ArrowDown" || k === "ArrowRight") && i < ITEMS.length - 1) { e.preventDefault(); go(i + 1); }
    else if ((k === "ArrowUp" || k === "ArrowLeft") && i > 0) { e.preventDefault(); go(i - 1); }
  });

  /* ---------- intro: the first time the stage pins, run the disc from 2022 to now once ---------- */
  var introDone = false, sweep = null;
  function startIntro() {
    introDone = true;
    if (ITEMS.length < 2) return;
    sweep = { from: ITEMS.length - 1, to: target(), t0: performance.now() };
    stage.classList.add("is-sweeping");
  }
  function endSweep() {
    if (!sweep) return;
    sweep = null;
    stage.classList.remove("is-sweeping");
    cur = -1; // the frame loop puts the full card back
  }
  // any input of your own takes over (after a short grace, so the wheel notch that brought you here does not)
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (type) {
    addEventListener(type, function () { if (sweep && performance.now() - sweep.t0 > 450) endSweep(); }, { passive: true });
  });

  /* ---------- POWER: the disc goes off and the plain list (main.js) takes its place, with a switch back ---------- */
  var powerBar = null;
  function powerOff() {
    if (opening) return;
    endSweep();
    stage.classList.add("is-off"); // the light goes out first
    setTimeout(function () {
      stage.classList.remove("is-off");
      html.classList.add("dial-shut");
      if (!powerBar) {
        powerBar = document.createElement("p");
        powerBar.className = "tl-power";
        powerBar.innerHTML = '<button type="button" class="button button--sm">' + ICON_POWER + "Turn the disc back on</button>";
        powerBar.querySelector("button").addEventListener("click", powerOn);
        var classic = document.querySelector(".tl-classic"), lead = classic && classic.querySelector(".lead");
        if (lead) lead.after(powerBar); else if (classic) classic.prepend(powerBar);
      }
      var sec = $("timeline");
      scrollTo({ top: sec.getBoundingClientRect().top + scrollY - hdr, behavior: "instant" });
      dispatchEvent(new Event("resize")); // main.js measures the list's gauge
      powerBar.querySelector("button").focus({ preventScroll: true });
    }, 280);
  }
  function powerOn() {
    html.classList.remove("dial-shut");
    introDone = false; cur = -1;
    f = ITEMS.length - 1; // it boots at 2022 and runs to now again
    layout();
    scrollTo({ top: trackTop(), behavior: "instant" });
    var p = box.querySelector(".cons-power"); if (p) p.focus({ preventScroll: true });
  }

  /* ---------- open: eject the disc, then load the case study ---------- */
  function open(i, e) {
    var it = ITEMS[i]; if (!it) return;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return; // new tab: let the browser do it
    if (e) e.preventDefault();
    if (opening) return;
    if (i !== cur) { go(i); return; }
    if (it.kind !== "p") return;
    opening = true;
    stage.classList.add("is-opening");
    if (cardEl) {
      cardEl.classList.add("is-loading");
      var lb = cardEl.querySelector(".tc-go-label"); if (lb) lb.textContent = "Loading " + it.title;
    }
    ej = i; ejP = 0;
    setTimeout(function () { location.href = it.href; }, EJECT_MS);
  }
  slot.addEventListener("click", function (e) { if (e.target.closest("a.tc")) open(cur, e); });
  // back button (page restored from the cache): put the disc back in
  addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    opening = false; ej = -1; ejP = 0;
    stage.classList.remove("is-opening");
    disc.style.transform = "";
    if (cardEl) { cardEl.classList.remove("is-loading"); var lb = cardEl.querySelector(".tc-go-label"); if (lb && ITEMS[cur]) lb.textContent = goLabel(ITEMS[cur]); }
  });

  /* ---------- frame loop ---------- */
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000)); last = now;
    var r = track.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight && ITEMS.length) {
      if (!introDone && pinned()) startIntro();
      var pf = f, i;
      if (sweep) {
        var p = Math.min(1, (now - sweep.t0) / INTRO_MS);
        f = sweep.from + (sweep.to - sweep.from) * easeInOut(p);
        i = Math.round(f);
        readout(i); select(i, true);
        if (p >= 1) endSweep();
      } else {
        var t = introDone ? target() : ITEMS.length - 1;
        f += (t - f) * (1 - Math.pow(0.00008, dt));
        if (Math.abs(t - f) < 0.0005) f = t;
        i = Math.round(f);
        if (i !== cur) show(i, i > cur ? 1 : -1);
      }
      updateVisual(f, (f - pf) / dt, dt);
      if (elHint) elHint.classList.toggle("is-gone", local() > 30);
    }
    requestAnimationFrame(frame);
  }

  build(null);
  addEventListener("resize", layout);
  addEventListener("load", layout);
  requestAnimationFrame(frame);
})();
