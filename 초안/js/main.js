/*
 * Renders the portfolio from js/data.js and wires up all interactions.
 * No content lives here: edit js/data.js instead.
 */
(function () {
  "use strict";

  var D = window.PORTFOLIO;
  var S = window.Sprites;
  if (!D || !S) return;

  /* ---------- helpers ---------- */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var motionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return motionMQ.matches; };
  var coarseMQ = window.matchMedia("(hover: none), (pointer: coarse)");
  var SHOW_TODO = new URLSearchParams(location.search).has("todo");

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isTodo(v) {
    return v == null || v === "" || (typeof v === "string" && /^\s*TODO\b/i.test(v));
  }
  // Text value or a graceful placeholder (red "TODO" badge when ?todo is in the URL).
  function val(v, fallback) {
    if (!isTodo(v)) return esc(v);
    return SHOW_TODO ? '<span class="todo">TODO</span>' : '<span class="soon">' + esc(fallback || "Details coming soon") + "</span>";
  }
  function fmtDate(iso) {
    var p = String(iso).split("-");
    return MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function cat(p) { return D.categories[p.category] || { label: p.category, color: "paper", sprite: "personal" }; }
  function pct(p) { return Math.round((p.completion == null ? 1 : p.completion) * 100); }

  function ytId(url) {
    if (!url) return null;
    var m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  // Sprite or the PNG override from data.js
  function pixelIcon(sprite, override, label) {
    if (override) {
      return '<img class="px" src="' + esc(override) + '" alt="' + esc(label || "") + '" decoding="async">';
    }
    return S.svg(sprite, label);
  }
  function placeholder(p) {
    var c = cat(p);
    return '<div class="ph c-' + c.color + '">' + pixelIcon(c.sprite, p.pixel || c.pixel, "") + "</div>";
  }
  // Poster image if available, else pixel placeholder. Broken images fall back automatically.
  function thumb(p, src, eager) {
    src = src || p.poster;
    if (!src) return placeholder(p);
    return '<img src="' + esc(src) + '" alt="' + esc(p.title) + ' cover art"' + (eager ? "" : ' loading="lazy"') + ' decoding="async" data-fallback="' + esc(p.id) + '">';
  }

  function statusHTML(p) {
    if (p.ongoing || pct(p) < 100) {
      var label = (p.status && !/complete/i.test(p.status) ? p.status : "In progress") + " " + pct(p) + "%";
      return '<span class="status"><span class="status-bar" aria-hidden="true"><i style="width:' + pct(p) + '%"></i></span>' + esc(label) + "</span>";
    }
    return '<span class="status status--done">Completed</span>';
  }

  function linkButtons(p, opts) {
    opts = opts || {};
    var l = p.links || {};
    var out = [];
    if (l.itch) out.push('<a class="btn btn--sm" href="' + esc(l.itch) + '" target="_blank" rel="noopener">Play on itch.io</a>');
    if (l.youtube) out.push('<a class="btn btn--sm" href="' + esc(l.youtube) + '" target="_blank" rel="noopener">Trailer</a>');
    if (l.instagram) out.push('<a class="btn btn--sm" href="' + esc(l.instagram) + '" target="_blank" rel="noopener">Watch on Instagram</a>');
    if (opts.details) out.unshift('<a class="btn btn--sm btn--primary" href="#' + esc(p.id) + '">Details</a>');
    return out.join("");
  }

  /* ---------- data prep ---------- */

  var projects = D.projects.slice().sort(function (a, b) {
    return (b.ongoing === true) - (a.ongoing === true) || String(b.date).localeCompare(String(a.date));
  });
  var byId = {};
  projects.forEach(function (p) { byId[p.id] = p; });

  /* ---------- broken image fallback ---------- */

  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG") return;
    var id = img.getAttribute("data-fallback");
    if (id && byId[id]) {
      byId[id]._posterFailed = true;
      img.outerHTML = placeholder(byId[id]);
    } else if (img.classList.contains("px")) {
      img.style.visibility = "hidden";
    }
  }, true);

  /* ---------- trailer (mp4 -> YouTube -> placeholder) ---------- */

  function trailerPlaceholder(p) {
    var ig = p.links && p.links.instagram;
    var c = cat(p);
    var bg = p.poster && !p._posterFailed
      ? thumb(p, null, true)
      : '<div class="ph c-' + c.color + '"></div><span class="trailer-ph-icon">' + pixelIcon(c.sprite, p.pixel || c.pixel, "") + "</span>";
    return '<div class="trailer-ph">' + bg +
      '<span class="trailer-ph-label">Trailer coming soon</span>' +
      (ig ? '<a class="btn btn--sm" href="' + esc(ig) + '" target="_blank" rel="noopener">Watch on Instagram</a>' : "") +
      "</div>";
  }

  function mountTrailer(slot, p) {
    var yt = ytId(p.links && p.links.youtube);
    var poster = p.poster && !p._posterFailed ? p.poster : null;
    if (!poster && yt) poster = null; // keep it light: no third-party thumbnail until clicked
    if (!p.video && !yt) { slot.innerHTML = trailerPlaceholder(p); return; }

    slot.innerHTML =
      '<button class="trailer-poster" type="button" aria-label="Play trailer: ' + esc(p.title) + '">' +
      (poster ? '<img src="' + esc(poster) + '" alt="" decoding="async" data-fallback="' + esc(p.id) + '">' : placeholder(p)) +
      '<span class="play-btn" aria-hidden="true">&#9654;</span></button>';

    slot.querySelector(".trailer-poster").addEventListener("click", function () {
      if (p.video) playVideo(); else playYouTube();
    });

    function playVideo() {
      var v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.preload = "metadata";
      if (poster) v.poster = poster;
      v.addEventListener("error", function () {
        if (yt) playYouTube(); else slot.innerHTML = trailerPlaceholder(p);
      }, { once: true });
      v.src = p.video;
      slot.replaceChildren(v);
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
      v.focus();
    }
    function playYouTube() {
      if (!yt) { slot.innerHTML = trailerPlaceholder(p); return; }
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + yt + "?autoplay=1&rel=0";
      f.title = p.title + " trailer";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.referrerPolicy = "strict-origin-when-cross-origin";
      slot.replaceChildren(f);
      f.focus();
    }
  }

  /* ---------- 1. hero ---------- */

  function renderHero() {
    var prof = D.profile;
    $("#hero-name").textContent = prof.name + " · " + prof.title;
    $("#hero-intro").textContent = prof.intro;
    $("#hero-sr").textContent = "I'm confident in " + prof.typedPhrases.join(", ") + ".";

    var spriteBox = $("#hero-sprite");
    if (prof.pixel) {
      spriteBox.innerHTML = '<img class="px" src="' + esc(prof.pixel) + '" alt="Pixel art of ' + esc(prof.name) + '">';
    } else {
      spriteBox.innerHTML = S.svg("hero", "Pixel art character of " + prof.name, "frame-a") + S.svg("heroBlink", null, "frame-b");
    }
    $("#nav-logo-icon").innerHTML = prof.pixel ? '<img class="px" src="' + esc(prof.pixel) + '" alt="">' : S.svg("hero");

    var f = byId[prof.featured] || projects[0];
    var c = cat(f);
    mountTrailer($("#hero-trailer-slot"), f);
    $("#hero-trailer-cap").className = "hero-trailer-cap c-" + c.color;
    $("#hero-trailer-cap").innerHTML =
      "<div><p class=\"eyebrow\">" + (f.featured ? "Featured · " + (f.ongoing ? "In development" : "Project") : "Featured") + "</p>" +
      '<div class="meta"><strong>' + esc(f.title) + '</strong><span class="tag">' + esc(c.label) + "</span>" + statusHTML(f) + "</div></div>" +
      '<a class="btn btn--sm" href="#' + esc(f.id) + '">Details</a>';

    typeLoop(prof.typedPhrases);
  }

  var typeTimer = null;
  function typeLoop(phrases) {
    var el = $("#typed");
    clearTimeout(typeTimer);
    if (reduced()) { el.textContent = phrases[0]; return; }
    var i = 0, n = 0, deleting = false;
    (function tick() {
      var word = phrases[i];
      n += deleting ? -1 : 1;
      el.textContent = word.slice(0, n);
      var delay = deleting ? 35 : 70;
      if (!deleting && n === word.length) { deleting = true; delay = 1800; }
      else if (deleting && n === 0) { deleting = false; i = (i + 1) % phrases.length; delay = 300; }
      typeTimer = setTimeout(tick, delay);
    })();
  }

  /* ---------- 2. abilities ---------- */

  function renderSkills() {
    var grid = $("#skills-grid");
    grid.innerHTML = D.skills.map(function (g, gi) {
      var chips = g.items.map(function (s, si) {
        var id = "skill-" + gi + "-" + si;
        var segs = "";
        for (var k = 0; k < 10; k++) segs += '<i class="' + (k < s.level ? "on" : "") + '" style="--i:' + k + '"></i>';
        var low = s.level <= 5;
        return '<li><button type="button" class="chip' + (low ? " chip--low" : "") + '" aria-pressed="false" aria-describedby="' + id + '-d"' +
          ' data-name="' + esc(s.name) + '" data-level="' + s.level + '" data-desc="' + esc(s.desc) + '">' +
          '<span class="chip-name">' + esc(s.name) + "</span>" +
          '<span class="chip-lv" aria-hidden="true">LV ' + s.level + (low ? ' <span class="chip-grow" title="Leveling up">&#9650;</span>' : "") + "</span>" +
          '<span class="lvbar" aria-hidden="true">' + segs + "</span>" +
          "</button>" +
          '<span class="sr-only" id="' + id + '-d">Level ' + s.level + " of 10. " + esc(s.desc) + "</span></li>";
      }).join("");
      return '<article class="skill-card panel">' +
        '<header class="skill-head"><span class="skill-icon">' + pixelIcon(g.sprite, g.pixel, "") + "</span><h3>" + esc(g.group) + "</h3></header>" +
        '<ul class="chips">' + chips + "</ul>" +
        '<div class="skill-info idle" aria-hidden="true"><p class="skill-info-title">' + esc(g.group) + '</p><p class="skill-info-desc">Hover, focus or tap a skill.</p></div>' +
        "</article>";
    }).join("");

    function show(chip) {
      var card = chip.closest(".skill-card");
      var info = $(".skill-info", card);
      info.classList.remove("idle");
      $(".skill-info-title", info).innerHTML = esc(chip.dataset.name) + " <b>+" + esc(chip.dataset.level) + "</b>";
      $(".skill-info-desc", info).textContent = chip.dataset.desc;
    }
    function reset(card) {
      var pressed = $('.chip[aria-pressed="true"]', card);
      if (pressed) { show(pressed); return; }
      var info = $(".skill-info", card);
      var title = $("h3", card).textContent;
      info.classList.add("idle");
      $(".skill-info-title", info).textContent = title;
      $(".skill-info-desc", info).textContent = "Hover, focus or tap a skill.";
    }

    $$(".chip", grid).forEach(function (chip) {
      var card = chip.closest(".skill-card");
      chip.addEventListener("mouseenter", function () { show(chip); });
      chip.addEventListener("focus", function () { show(chip); });
      chip.addEventListener("mouseleave", function () { reset(card); });
      chip.addEventListener("blur", function () { reset(card); });
      chip.addEventListener("click", function () {
        var on = chip.getAttribute("aria-pressed") !== "true";
        $$(".chip", card).forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", String(on));
        if (on) show(chip); else reset(card);
      });
    });

    // fill each card's level bars once, on first view
    var cards = $$(".skill-card", grid);
    if (!("IntersectionObserver" in window)) { cards.forEach(function (c) { c.classList.add("in-view"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* ---------- 3. timeline ---------- */

  var activeFilter = "All";

  function renderFilters() {
    var counts = { All: projects.length };
    projects.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    var keys = ["All"].concat(Object.keys(D.categories));
    $("#filters").innerHTML = keys.map(function (k) {
      var c = D.categories[k];
      return '<button type="button" class="filter' + (c ? " c-" + c.color : "") + '" data-filter="' + esc(k) + '" aria-pressed="' + (k === "All") + '">' +
        esc(c ? c.label : "All") + '<span class="count">' + (counts[k] || 0) + "</span></button>";
    }).join("");
    $$(".filter").forEach(function (b) {
      b.addEventListener("click", function () { applyFilter(b.dataset.filter); });
    });
  }

  function applyFilter(key) {
    activeFilter = key;
    $$(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === key)); });
    var any = false;
    $$(".tl-group").forEach(function (g) {
      var visible = 0;
      $$(".tl-entry", g).forEach(function (e) {
        var show = key === "All" || e.dataset.category === key;
        e.hidden = !show;
        if (show) visible++;
      });
      g.hidden = visible === 0;
      if (visible) any = true;
    });
    $("#tl-empty").hidden = any;
    var first = $(".tl-entry:not([hidden])");
    if (first) setPreview(byId[first.dataset.id]);
    updateScrollFx();
  }

  function renderTimeline() {
    var groups = [];
    var map = {};
    projects.forEach(function (p) {
      var key = p.ongoing ? "NOW" : String(p.date).slice(0, 4);
      if (!map[key]) { map[key] = []; groups.push(key); }
      map[key].push(p);
    });

    $("#tl-groups").innerHTML = groups.map(function (key) {
      var items = map[key].map(function (p) {
        var c = cat(p);
        return '<li class="tl-entry c-' + c.color + '" id="tl-' + esc(p.id) + '" data-id="' + esc(p.id) + '" data-category="' + esc(p.category) + '">' +
          '<span class="tl-dot" aria-hidden="true"></span>' +
          '<article class="tl-card">' +
          '<div class="tl-thumb">' + thumb(p) + "</div>" +
          "<div>" +
          '<div class="tl-meta"><time class="tl-date" datetime="' + esc(p.date) + '">' + (p.ongoing ? "Since " : "") + fmtDate(p.date) + "</time>" +
          '<span class="tag">' + esc(c.label) + "</span>" + statusHTML(p) +
          (p.featured ? '<span class="tl-featured">FEATURED</span>' : "") + "</div>" +
          '<h4 class="tl-title"><a href="#' + esc(p.id) + '" class="tl-open">' + esc(p.title) + "</a></h4>" +
          '<p class="tl-summary">' + val(p.summary, "Description coming soon") + "</p>" +
          '<p class="tl-outcome"><b>RESULT</b>' + val(p.outcome, "Result details coming soon") + "</p>" +
          (linkButtons(p) ? '<div class="tl-links">' + linkButtons(p) + "</div>" : "") +
          "</div></article></li>";
      }).join("");
      var now = key === "NOW";
      return '<section class="tl-group" aria-label="' + (now ? "Now, in progress" : key) + '">' +
        '<h3 class="tl-year' + (now ? " tl-year--now" : "") + '">' + (now ? "NOW &middot; In progress" : key) + "</h3>" +
        '<ol class="tl-list">' + items + "</ol></section>";
    }).join("");

    // whole card is clickable; links inside keep their own behaviour
    $$(".tl-card").forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var a = $(".tl-open", card);
        if (a) a.click();
      });
    });

    // preview panel follows hover / keyboard focus
    $$(".tl-entry").forEach(function (li) {
      var show = function () { setPreview(byId[li.dataset.id]); };
      li.addEventListener("mouseenter", show);
      li.addEventListener("focusin", show);
    });
    var tlEl = $("#tl");
    tlEl.addEventListener("mouseenter", function () { tlHover = true; });
    tlEl.addEventListener("mouseleave", function () { tlHover = false; });
    setPreview(projects[0]);
  }
  var tlHover = false;

  var previewId = null;
  function setPreview(p) {
    if (!p || previewId === p.id) return;
    previewId = p.id;
    var c = cat(p);
    var src = p.preview || (p._posterFailed ? null : p.poster);
    $("#tl-preview").className = "tl-preview panel c-" + c.color;
    $("#tl-preview").innerHTML =
      '<p class="tl-preview-label">PREVIEW</p>' +
      '<div class="tl-preview-screen">' + thumb(p, src, true) + "</div>" +
      '<div class="tl-preview-body"><span class="tag">' + esc(c.label) + "</span>" +
      '<p class="tl-preview-title">' + esc(p.title) + "</p>" +
      '<p class="tl-preview-text">' + val(isTodo(p.role) ? p.summary : "Role: " + p.role, "Details coming soon") + "</p></div>";
  }

  /* ---------- 4. selected work ---------- */

  function renderWork() {
    var games = projects.filter(function (p) { return p.category !== "Teaching"; });
    games.sort(function (a, b) { return (b.featured === true) - (a.featured === true); }); // stable: keeps date order
    $("#work-grid").innerHTML = games.map(function (p) {
      var c = cat(p);
      var text = isTodo(p.summary) ? p.outcome : p.summary;
      return '<li><a class="work-card c-' + c.color + '" href="#' + esc(p.id) + '" data-id="' + esc(p.id) + '">' +
        '<div class="work-media">' + thumb(p) +
        (p.featured ? '<span class="work-ribbon">FEATURED' + (p.ongoing ? " · IN DEVELOPMENT" : "") + "</span>" : "") +
        (p.video ? '<span class="work-play" aria-hidden="true">&#9654; PREVIEW</span><span class="work-hint" aria-hidden="true">TAP AGAIN FOR DETAILS</span>' : "") +
        "</div>" +
        '<div class="work-body">' +
        '<div class="work-top"><h3 class="work-title">' + esc(p.title) + '</h3><span class="tag">' + esc(c.label) + "</span></div>" +
        '<p class="work-text">' + val(text, "Description coming soon") + "</p>" +
        (isTodo(p.role) ? "" : '<p class="work-role"><b>MY ROLE</b>' + esc(p.role) + "</p>") +
        '<div class="work-foot"><span>' + fmtDate(p.date) + (p.ongoing ? " · " + pct(p) + "%" : "") + '</span><span class="work-open" aria-hidden="true">DETAILS &#9656;</span></div>' +
        "</div></a></li>";
    }).join("");

    $$(".work-card").forEach(function (card) {
      var p = byId[card.dataset.id];
      if (!p.video) return;
      var media = $(".work-media", card);
      var vid = null;
      function start() {
        if (vid || reduced()) return;
        vid = document.createElement("video");
        vid.muted = true; vid.loop = true; vid.playsInline = true;
        vid.setAttribute("playsinline", ""); vid.setAttribute("aria-hidden", "true");
        vid.preload = "auto";
        vid.addEventListener("error", stop, { once: true });
        vid.src = p.video;
        media.appendChild(vid);
        var pr = vid.play();
        if (pr && pr.catch) pr.catch(function () {});
        card.classList.add("previewing");
      }
      function stop() {
        if (vid) { vid.pause(); vid.removeAttribute("src"); vid.load(); vid.remove(); vid = null; }
        card.classList.remove("previewing");
      }
      card.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") start(); });
      card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") stop(); });
      card.addEventListener("focus", start);
      card.addEventListener("blur", stop);
      // touch: first tap previews, second tap opens details
      card.addEventListener("click", function (e) {
        if (coarseMQ.matches && !reduced() && !card.classList.contains("previewing")) {
          e.preventDefault();
          $$(".work-card.previewing").forEach(function (o) { if (o !== card) o.dispatchEvent(new Event("blur")); });
          start();
        }
      });
    });
  }

  /* ---------- 5. teaching ---------- */

  function renderTeaching() {
    var items = projects.filter(function (p) { return p.category === "Teaching"; });
    $("#teach-grid").innerHTML = items.map(function (p) {
      var c = cat(p);
      return '<article class="teach-card panel c-' + c.color + '">' +
        '<span class="teach-icon">' + pixelIcon(c.sprite, p.pixel || c.pixel, "") + "</span>" +
        "<div>" +
        '<div class="tl-meta"><time class="tl-date" datetime="' + esc(p.date) + '">' + fmtDate(p.date) + "</time>" + statusHTML(p) + "</div>" +
        '<h3><a href="#' + esc(p.id) + '">' + esc(p.title) + "</a></h3>" +
        '<p class="teach-role">' + val(p.role, "Role coming soon") + "</p>" +
        '<p class="teach-desc">' + val(p.description || p.summary) + "</p>" +
        "</div></article>";
    }).join("");
  }

  /* ---------- 6. contact ---------- */

  function renderContact() {
    var c = D.profile.contact;
    var links = [
      { label: "itch.io", href: c.itch, primary: true },
      { label: "GitHub", href: c.github },
      { label: "Email", href: isTodo(c.email) ? c.email : "mailto:" + c.email },
      { label: "LinkedIn", href: c.linkedin }
    ];
    $("#contact-links").innerHTML = links.map(function (l) {
      if (isTodo(l.href)) {
        return SHOW_TODO ? '<li><span class="btn" aria-disabled="true">' + esc(l.label) + ' <span class="todo">TODO</span></span></li>' : "";
      }
      var ext = /^https?:/.test(l.href);
      return '<li><a class="btn' + (l.primary ? " btn--primary" : "") + '" href="' + esc(l.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l.label) + "</a></li>";
    }).join("");
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- modal + deep links (#project-id) ---------- */

  var modal = $("#modal");
  var lastFocus = null;

  function fact(label, html, wide) {
    return '<div' + (wide ? ' class="wide"' : "") + "><dt>" + label + "</dt><dd>" + html + "</dd></div>";
  }

  function openProject(p) {
    var c = cat(p);
    modal.className = "modal panel c-" + c.color;
    var desc = p.description || p.summary;
    var team = isTodo(p.team) ? val(p.team) : esc(p.team) + (/^\d+$/.test(String(p.team)) ? (p.team === "1" ? " person" : " people") : "");
    $("#modal-body").innerHTML =
      '<header class="modal-head">' +
      '<div class="tl-meta"><span class="tag">' + esc(c.label) + '</span><time class="tl-date" datetime="' + esc(p.date) + '">' + (p.ongoing ? "Since " : "") + fmtDate(p.date) + "</time>" + statusHTML(p) + "</div>" +
      '<h2 class="modal-title" id="modal-title">' + esc(p.title) + "</h2></header>" +
      (p.category === "Teaching" ? "" : '<div class="trailer" id="modal-trailer"></div>') +
      '<div class="modal-desc"><p>' + val(desc, "Description coming soon") + "</p></div>" +
      '<dl class="modal-facts">' +
      fact("MY ROLE", val(p.role, "Role coming soon"), true) +
      fact("RESULT", val(p.outcome, "Result coming soon"), true) +
      fact("TOOLS", val(p.tools)) +
      fact("TEAM SIZE", team) +
      fact("DATE", (p.ongoing ? "Started " : "") + fmtDate(p.date)) +
      fact("STATUS", statusHTML(p)) +
      "</dl>" +
      (linkButtons(p) ? '<div class="btn-row">' + linkButtons(p) + "</div>" : "");

    var slot = $("#modal-trailer");
    if (slot) mountTrailer(slot, p);

    if (!modal.open) {
      lastFocus = document.activeElement;
      modal.showModal();
    }
    modal.dataset.active = "1";
    $("#modal-close").focus({ preventScroll: true });
    modal.scrollTop = 0;
  }

  function clearHash() {
    if (byId[decodeURIComponent(location.hash.slice(1))]) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  // Cleanup runs from our own close path; the native "close" event is only a backup
  // (some embedded browsers never dispatch it).
  function onClosed() {
    if (!modal.dataset.active) return;
    delete modal.dataset.active;
    $("#modal-body").innerHTML = ""; // stops any playing video / iframe
    clearHash();
    var back = lastFocus;
    if (!back || !document.contains(back) || back === document.body) {
      var id = modal.dataset.lastId;
      back = id ? ($("#tl-" + id + " .tl-open") || null) : null;
    }
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  function closeModal() {
    if (modal.open) modal.close();
    onClosed();
  }
  modal.addEventListener("close", onClosed);
  modal.addEventListener("cancel", function (e) { e.preventDefault(); closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.dataset.active) closeModal();
  });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  $("#modal-close").addEventListener("click", closeModal);

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    var p = byId[id];
    if (p) { modal.dataset.lastId = id; openProject(p); }
    else if (modal.dataset.active) closeModal();
  }
  window.addEventListener("hashchange", route);

  /* ---------- scroll effects: XP bar, levels, spine, checkpoints ---------- */

  var sections = $$("main > .section");
  var navLinks = $$(".nav-links a");
  var maxLevel = 1;
  var supportsSDA = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
  var ticking = false;

  function updateScrollFx() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - innerHeight;
    var prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    $("#xp-fill").style.transform = "scaleX(" + prog.toFixed(4) + ")";

    // current section + level
    var line = innerHeight * 0.4;
    var current = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < line) current = s; });
    if (prog > 0.995) current = sections[sections.length - 1];
    var lv = parseInt(current.dataset.level, 10) || 1;
    if (lv > maxLevel) {
      maxLevel = lv;
      $("#xp-level").textContent = "LV " + maxLevel;
      if (!reduced()) {
        var pop = $("#xp-pop");
        pop.classList.remove("show");
        void pop.offsetWidth;
        pop.classList.add("show");
      }
    }
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + current.id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });

    // preview panel follows the entry at the reading line while scrolling (unless pointer/focus is on one)
    if (!tlHover && !document.activeElement.closest(".tl-entry")) {
      var entries = $$(".tl-entry:not([hidden])");
      var pick = null;
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].offsetParent === null) continue;
        if (entries[i].getBoundingClientRect().top < line) pick = entries[i]; else break;
      }
      if (pick) setPreview(byId[pick.dataset.id]);
    }

    // timeline spine + checkpoints (fallback when scroll-driven animations are unavailable or motion is reduced)
    if (!supportsSDA || reduced()) {
      var tl = $("#tl");
      var fill = $("#tl-spine-fill");
      if (reduced()) {
        fill.style.setProperty("--fill", 1);
      } else {
        var r = tl.getBoundingClientRect();
        var f = r.height > 0 ? (innerHeight / 2 - r.top) / r.height : 0;
        fill.style.setProperty("--fill", Math.min(1, Math.max(0, f)).toFixed(4));
      }
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollFx); }
  }

  function setupCheckpoints() {
    var dots = $$(".tl-dot");
    if (reduced()) { dots.forEach(function (d) { d.classList.add("reached"); }); return; }
    if (supportsSDA) return; // pure CSS handles it
    if (!("IntersectionObserver" in window)) { dots.forEach(function (d) { d.classList.add("reached"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // reached once the dot is in, or above, the top half of the viewport
        var reached = e.isIntersecting || e.boundingClientRect.top < 0;
        e.target.classList.toggle("reached", reached);
      });
    }, { rootMargin: "0px 0px -50% 0px" });
    dots.forEach(function (d) { io.observe(d); });
  }

  /* ---------- init ---------- */

  renderHero();
  renderSkills();
  renderFilters();
  renderTimeline();
  renderWork();
  renderTeaching();
  renderContact();
  setupCheckpoints();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrollFx();

  var onMotionChange = function () {
    typeLoop(D.profile.typedPhrases);
    $$(".tl-dot").forEach(function (d) { d.classList.remove("reached"); });
    setupCheckpoints();
    updateScrollFx();
  };
  if (motionMQ.addEventListener) motionMQ.addEventListener("change", onMotionChange);

  route();
})();
