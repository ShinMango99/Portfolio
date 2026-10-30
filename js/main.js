/* Renders every page from js/data.js. No content lives here. <body data-page> picks the renderer. */
(function () {
  "use strict";

  var D = window.PORTFOLIO;
  if (!D) return;

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var body = document.body;

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function isTodo(v) { return v == null || v === "" || /^\s*TODO\b/i.test(String(v)); }
  function val(v) { return isTodo(v) ? '<span class="todo">[TODO]</span>' : esc(v); }
  // "YYYY-MM-DD" or "YYYY-MM"
  function fmtDate(iso, withDay) {
    var p = String(iso).split("-");
    var s = MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    return withDay && p[2] ? MONTHS[parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10) + ", " + p[0] : s;
  }
  function ytId(url) {
    var m = url && String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function pct(p) { return Math.round((p.completion == null ? 1 : p.completion) * 100); }
  function statusText(p) { return p.ongoing || pct(p) < 100 ? "In progress " + pct(p) + "%" : "Completed"; }
  // null hides the row; "TODO" shows a [TODO] marker
  function row(label, v) { return v === null || v === undefined ? "" : "<dt>" + label + "</dt><dd>" + val(v) + "</dd>"; }
  function pressRow(p) {
    if (!p.press || !p.press.length) return "";
    return "<dt>Press</dt><dd>" + p.press.map(function (a) {
      return '<a href="' + esc(a.href) + '" target="_blank" rel="noopener">' + esc(a.label) + "</a>";
    }).join(" · ") + "</dd>";
  }
  function teamText(t) { return /^\d+$/.test(String(t)) ? t + (t === "1" ? " person" : " people") : t; }
  function bareUrl(u) { return String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); }

  var projects = D.projects.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  var byId = {};
  projects.forEach(function (p) { byId[p.id] = p; });

  // solo / team / teaching, from category and team size
  function groupOf(p) {
    if (p.category === "Teaching") return "teaching";
    return /^1\b/.test(String(p.team)) ? "solo" : "team";
  }
  var catById = {};
  D.categories.forEach(function (c) { catById[c.id] = c; });
  function inGroup(g) { return projects.filter(function (p) { return groupOf(p) === g; }); }

  function projUrl(p) { return "project.html?id=" + encodeURIComponent(p.id); }
  function thumbOf(p) {
    var yt = ytId(p.links && p.links.youtube);
    return p.poster || (yt ? "https://i.ytimg.com/vi/" + yt + "/hqdefault.jpg" : null);
  }

  /* ---------- media: thumbnail, click to play (mp4 -> YouTube -> empty box) ---------- */

  function mountMedia(box, p, label) {
    var yt = ytId(p.links && p.links.youtube);
    var poster = thumbOf(p);
    var playable = p.video || yt;
    label = label || "Play trailer";

    if (!poster && !playable) {
      box.innerHTML = '<span class="media-empty">no trailer yet</span>';
      return;
    }
    box.innerHTML =
      (poster ? '<img src="' + esc(poster) + '" alt="' + esc(p.title) + ' thumbnail">' : '<span class="media-empty"></span>') +
      (playable ? '<button type="button" class="media-play" aria-label="' + esc(label) + ": " + esc(p.title) + '"><span>&#9654; ' + esc(label) + "</span></button>" : "");

    var btn = box.querySelector(".media-play");
    if (btn) btn.addEventListener("click", function () { play(box, p); });
  }

  // swap the box for a playing player: mp4 at half volume, falling back to YouTube
  function play(box, p) {
    var yt = ytId(p.links && p.links.youtube);
    if (p.video) {
      var v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.volume = 0.5;
      var poster = thumbOf(p);
      if (poster) v.poster = poster;
      v.addEventListener("error", function () { yt ? youtube() : (box.innerHTML = '<span class="media-empty">no trailer yet</span>'); }, { once: true });
      v.src = p.video;
      box.replaceChildren(v);
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    } else if (yt) {
      youtube();
    }
    function youtube() {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + yt + "?autoplay=1&rel=0";
      f.title = p.title + " trailer";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      box.replaceChildren(f);
      f.focus();
    }
  }

  /* ---------- project thumbnail: the picture plays the trailer, the text below opens the page ---------- */

  function tile(p) {
    return '<li class="tile">' +
      '<div class="media tile-media" data-mount="' + esc(p.id) + '"></div>' +
      '<a class="tile-body" href="' + projUrl(p) + '">' +
      '<span class="tile-title">' + esc(p.title) + "</span>" +
      (p.award ? '<span class="badge">' + esc(p.award) + "</span>" : "") +
      '<span class="tile-meta">' + esc(p.category) + " · " + String(p.date).slice(0, 4) + " · " + statusText(p) + "</span>" +
      '<span class="tile-text">' + val(p.summary) + "</span>" +
      '<span class="tile-role"><b>My role:</b> ' + val(p.role) + "</span>" +
      '<span class="tile-go">View project &rarr;</span>' +
      "</a></li>";
  }

  // fill every [data-mount] box: a trailer player when there is one, otherwise a picture linking to the page
  function mountAll(root, label) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-mount]"), function (box) {
      var p = byId[box.dataset.mount];
      if (p.video || ytId(p.links && p.links.youtube)) { mountMedia(box, p, label); return; }
      var img = thumbOf(p);
      box.innerHTML = '<a class="media-link" href="' + projUrl(p) + '" tabindex="-1" aria-hidden="true">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '<span class="tile-placeholder">' + esc(p.role || p.title) + "</span>") + "</a>";
    });
  }

  /* ---------- contact block (every page) ---------- */

  function renderContact() {
    var c = D.profile.contact;
    var links = [
      ["itch.io", c.itch, "assets/img/logoItchio.png"],
      ["GitHub", c.github, "assets/img/logoGithub.png"],
      ["LinkedIn", c.linkedin, "assets/img/logoLinkin.png"],
      ["Instagram", c.instagram, "assets/img/logoInsta.png"]
    ].filter(function (l) { return !isTodo(l[1]); });

    // address is written out in full so it still works if a mail link does not
    var html =
      '<div class="contact-email">' +
      '<img class="contact-icon" src="assets/img/logoGmail.png" alt="" width="24" height="24">' +
      '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>" +
      '<button type="button" class="button button--sm" data-copy="' + esc(c.email) + '">Copy email</button>' +
      "</div>" +
      '<ul class="contact-list">' + links.map(function (l) {
        return '<li><img class="contact-icon" src="' + l[2] + '" alt="" width="20" height="20"><b>' + l[0] + ':</b> ' +
          '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(bareUrl(l[1])) + "</a></li>";
      }).join("") + "</ul>";

    $$("[data-contact]").forEach(function (el) { el.innerHTML = html; });
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var text = b.dataset.copy;
        var done = function () {
          b.textContent = "Copied!";
          setTimeout(function () { b.textContent = "Copy email"; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
        else window.prompt("Copy this email address:", text);
      });
    });
  }

  /* ================= Home: portal ================= */

  function renderHome() {
    var prof = D.profile;
    $("#hero-name").textContent = prof.name + " · " + prof.title;
    $("#hero-lead").textContent = prof.heroLead;
    $("#hero-tail").textContent = prof.heroTail || "";
    $("#hero-sr").textContent = prof.heroLead + " " + prof.typedPhrases.join(", ") + (prof.heroTail ? ", " + prof.heroTail : ".");
    typeHero(prof);

    // each claim links to the page that proves it
    $("#proof").innerHTML = (prof.proof || []).map(function (x) {
      return '<li><a class="proof-card" href="' + esc(x.href) + '"><b>' + esc(x.title) + "</b><span>" + esc(x.text) + "</span></a></li>";
    }).join("");

    var featured = (prof.featured || []).map(function (id) { return byId[id]; }).filter(Boolean);
    var feature = $("#hero-feature");
    if (prof.reel) {
      // master reel up top; the featured games sit in a row under it and play their trailer in the same player
      // (a game without a trailer links to its page instead)
      feature.innerHTML = '<div class="media media--reel"></div>' +
        '<ul class="hero-thumbs">' + featured.map(function (p) {
          var img = thumbOf(p);
          var pic = img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : "";
          var playable = p.video || ytId(p.links && p.links.youtube);
          return "<li>" + (playable
            ? '<button type="button" class="hero-thumb" data-id="' + esc(p.id) + '">' + pic + "<span>" + esc(p.title) + "</span></button>"
            : '<a class="hero-thumb" href="' + projUrl(p) + '">' + pic + "<span>" + esc(p.title) + " &rarr;</span></a>") + "</li>";
        }).join("") + "</ul>" +
        '<p class="hero-caption" hidden>Now playing: <b></b> <button type="button" class="button button--sm">Back to reel</button></p>';
      var reel = /\.(mp4|webm)$/i.test(prof.reel) ? { title: "Highlight reel", video: prof.reel, poster: prof.reelPoster, links: {} } : { title: "Highlight reel", links: { youtube: prof.reel } };
      var player = feature.querySelector(".media");
      var now = feature.querySelector(".hero-caption");
      var thumbs = feature.querySelectorAll("button.hero-thumb");
      function select(btn) {
        Array.prototype.forEach.call(thumbs, function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      }
      mountMedia(player, reel, "Play reel");
      Array.prototype.forEach.call(thumbs, function (b) {
        var p = byId[b.dataset.id];
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          select(b);
          now.querySelector("b").textContent = p.title;
          now.hidden = false;
          play(player, p);
        });
      });
      now.querySelector("button").addEventListener("click", function () {
        select(null);
        now.hidden = true;
        play(player, reel);
      });
      $("#featured-list").innerHTML = featured.map(tile).join("");
      mountAll($("#featured-list"));
      $("#featured-section").hidden = false;
    } else {
      // no reel yet: lead with the best games; the picture plays the trailer, the bar below opens the page
      feature.innerHTML = '<ul class="mosaic">' + featured.map(function (p) {
        return '<li class="mosaic-item"><div class="media" data-mount="' + esc(p.id) + '"></div>' +
          '<a class="mosaic-label" href="' + projUrl(p) + '"><b>' + esc(p.title) + "</b>" +
          "<small>" + esc(p.award || p.category) + "</small>" +
          '<span class="mosaic-go">Open &rarr;</span></a></li>';
      }).join("") + "</ul>";
      mountAll(feature, "Play");
    }

    $("#portal").innerHTML = D.categories.map(function (c) {
      var list = c.id === "about" ? null : inGroup(c.id);
      var cover = c.coverImage || (c.cover && byId[c.cover] ? thumbOf(byId[c.cover]) : null);
      return '<li><a class="portal-item" href="' + esc(c.page) + '">' +
        '<span class="portal-media">' +
        (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy">' : '<span class="tile-placeholder">Unity &amp; C#<br>taught to students</span>') +
        "</span>" +
        '<span class="portal-body"><span class="portal-title">' + esc(c.title) +
        (list ? ' <span class="portal-count">' + list.length + (list.length === 1 ? " project" : " projects") + "</span>" : "") + "</span>" +
        '<span class="portal-text">' + esc(c.blurb) + "</span>" +
        '<span class="portal-go">Open &rarr;</span></span></a></li>';
    }).join("");
  }

  function typeHero(prof) {
    var phrase = $("#phrase");
    var typedLine = $(".hero-line--typed");
    // Lock the typed line to its tallest phrase so the tail line and the page never shift.
    function lockHeroHeight() {
      var current = phrase.textContent;
      typedLine.style.minHeight = "";
      var max = 0;
      prof.typedPhrases.forEach(function (t) {
        phrase.textContent = t;
        max = Math.max(max, typedLine.getBoundingClientRect().height);
      });
      phrase.textContent = current;
      typedLine.style.minHeight = Math.ceil(max) + "px";
    }
    phrase.textContent = prof.typedPhrases[0];
    lockHeroHeight();
    window.addEventListener("resize", lockHeroHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockHeroHeight);
    // type a phrase, hold, erase it, move to the next (reduced motion: just swap)
    if (prof.typedPhrases.length < 2) return;
    var pi = 0;
    if (reduced) {
      setInterval(function () {
        pi = (pi + 1) % prof.typedPhrases.length;
        phrase.textContent = prof.typedPhrases[pi];
      }, 3000);
      return;
    }
    var n = phrase.textContent.length;
    var deleting = true;
    setTimeout(function tick() {
      var word = prof.typedPhrases[pi];
      n += deleting ? -1 : 1;
      phrase.textContent = word.slice(0, n);
      var delay = deleting ? 35 : 75;
      if (!deleting && n === word.length) { deleting = true; delay = 1800; }
      else if (deleting && n === 0) { deleting = false; pi = (pi + 1) % prof.typedPhrases.length; delay = 350; }
      setTimeout(tick, delay);
    }, 1800);
  }

  /* ================= Category page ================= */

  function renderCategory() {
    var c = catById[body.dataset.cat];
    if (!c) return;
    $("#cat-title").textContent = c.title;
    $("#cat-blurb").textContent = c.blurb;
    $("#cat-list").innerHTML = inGroup(c.id).map(tile).join("");
    mountAll($("#cat-list"));

    // banner to the sibling category (solo <-> team)
    var m = catById[c.more];
    if (!m) return;
    var cover = m.cover && byId[m.cover] ? thumbOf(byId[m.cover]) : null;
    $("#cat-list").insertAdjacentHTML("afterend",
      '<a class="more-link" href="' + esc(m.page) + '">' +
      (cover ? '<span class="more-media"><img src="' + esc(cover) + '" alt="" loading="lazy"></span>' : "") +
      '<span class="more-body"><span class="more-eyebrow">More projects</span>' +
      '<span class="more-title">' + esc(m.title) + ' <span class="portal-count">' + inGroup(m.id).length + " projects</span></span>" +
      '<span class="portal-text">' + esc(m.blurb) + "</span>" +
      '<span class="tile-go">See ' + esc(m.title) + " &rarr;</span></span></a>");
  }

  /* ================= Project page ================= */

  function renderProject() {
    var id = new URLSearchParams(location.search).get("id");
    var p = byId[id];
    var box = $("#project");
    if (!p) {
      box.innerHTML = '<h1 class="page-title">Project not found</h1><p class="lead">That project does not exist. <a href="index.html">Back to Home</a></p>';
      return;
    }
    document.title = p.title + " · Jaemin Cho";
    var g = groupOf(p);
    var c = catById[g];
    var siblings = inGroup(g);
    var i = siblings.indexOf(p);
    var prev = siblings[i - 1];
    var next = siblings[i + 1];
    var hasMedia = thumbOf(p) || p.video;
    var gallery = (p.gallery || []).filter(function (src) { return src !== p.poster; });
    var l = p.links || {};

    var linkHtml =
      (l.itch ? '<a class="button button--primary" href="' + esc(l.itch) + '" target="_blank" rel="noopener">Play on itch.io</a>' : "") +
      (l.youtube ? '<a class="button" href="' + esc(l.youtube) + '" target="_blank" rel="noopener">Watch on YouTube</a>' : "") +
      (l.instagram ? '<a class="button" href="' + esc(l.instagram) + '" target="_blank" rel="noopener">Instagram post</a>' : "");

    box.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="' + esc(c.page) + '">' + esc(c.title) + "</a> / <span>" + esc(p.title) + "</span></nav>" +
      '<header class="project-head"><h1 class="page-title">' + esc(p.title) + "</h1>" +
      (p.award ? '<p><span class="badge badge--lg">' + esc(p.award) + "</span></p>" : "") +
      '<p class="card-meta">' + esc(p.category) + " · " + (p.ongoing ? "Since " : "") + fmtDate(p.date, true) + " · " + statusText(p) + "</p></header>" +
      '<div class="project-grid' + (hasMedia ? "" : " project-grid--text") + '">' +
      (hasMedia ? '<div class="media media--lg"></div>' : "") +
      '<aside class="facts"><dl>' + row("My role", p.role) + row("Result", p.outcome) + row("Tools", p.tools) +
      row("Team", p.team == null ? null : teamText(p.team)) + pressRow(p) + "</dl>" +
      (linkHtml ? '<div class="actions">' + linkHtml + "</div>" : "") + "</aside>" +
      "</div>" +
      '<div class="project-text"><p>' + val(p.summary) + "</p>" + (p.description ? "<p>" + esc(p.description) + "</p>" : "") + "</div>" +
      (gallery.length ? '<ul class="gallery">' + gallery.map(function (src) {
        return '<li><img src="' + esc(src) + '" alt="' + esc(p.title) + ' photo" loading="lazy"></li>';
      }).join("") + "</ul>" : "") +
      '<nav class="pager" aria-label="More in ' + esc(c.title) + '">' +
      (prev ? '<a class="button" href="' + projUrl(prev) + '">&larr; ' + esc(prev.title) + "</a>" : "<span></span>") +
      '<a class="button" href="' + esc(c.page) + '">All ' + esc(c.title) + "</a>" +
      (next ? '<a class="button" href="' + projUrl(next) + '">' + esc(next.title) + " &rarr;</a>" : "<span></span>") +
      "</nav>";

    if (hasMedia) mountMedia(box.querySelector(".media"), p);

    // other highlights, so a visitor always has somewhere to go next
    var more = (D.profile.featured || []).map(function (fid) { return byId[fid]; })
      .filter(function (x) { return x && x !== p; }).slice(0, 3);
    if (more.length) {
      $("#more-list").innerHTML = more.map(tile).join("");
      mountAll($("#more-list"));
      $("#more-section").hidden = false;
    }
  }

  /* ================= About: abilities + timeline ================= */

  function renderAbout() {
    $("#skills").innerHTML = D.skills.map(function (g) {
      return '<article class="skill-group"><header><h3>' + esc(g.group) + "</h3></header>" +
        '<div class="skill-list">' + g.items.map(function (s, si) {
          return '<button type="button" class="skill" style="--i:' + si + '" aria-pressed="false" data-name="' + esc(s.name) + '" data-desc="' + esc(s.desc) + '">' +
            '<span class="skill-top"><b>' + esc(s.name) + "</b><span>" + s.level + " / 10</span></span>" +
            '<span class="bar" role="img" aria-label="' + esc(s.name) + " level " + s.level + ' of 10"><i style="width:' + s.level * 10 + '%"></i></span></button>';
        }).join("") + "</div>" +
        '<p class="skill-info" aria-live="polite"></p></article>';
    }).join("");

    // fill each card's bars once, the first time it scrolls into view
    if ("IntersectionObserver" in window) {
      document.documentElement.classList.add("js-anim");
      var barIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in-view"); barIO.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      $$(".skill-group").forEach(function (g) { barIO.observe(g); });
    }

    // description shows on hover / focus / click (click pins it)
    $$(".skill-group").forEach(function (group) {
      var info = group.querySelector(".skill-info");
      var btns = Array.prototype.slice.call(group.querySelectorAll(".skill"));
      function show(b) { info.innerHTML = "<b>" + esc(b.dataset.name) + ":</b> " + esc(b.dataset.desc); }
      function reset() {
        var pinned = group.querySelector('.skill[aria-pressed="true"]');
        if (pinned) show(pinned); else info.textContent = "";
      }
      btns.forEach(function (b) {
        b.addEventListener("mouseenter", function () { show(b); });
        b.addEventListener("focus", function () { show(b); });
        b.addEventListener("mouseleave", reset);
        b.addEventListener("blur", reset);
        b.addEventListener("click", function () {
          var on = b.getAttribute("aria-pressed") !== "true";
          btns.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", String(on));
          if (on) show(b); else reset();
        });
      });
    });

    renderTimeline();
  }

  /* ---------- timeline (newest first) ---------- */

  function renderTimeline() {
    var events = D.projects.map(function (p) {
      return { date: p.date, project: p };
    }).concat((D.milestones || []).map(function (m) {
      return { date: m.date, milestone: m };
    })).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });

    var years = [];
    var byYear = {};
    events.forEach(function (e) {
      var y = String(e.date).slice(0, 4);
      if (!byYear[y]) { byYear[y] = []; years.push(y); }
      byYear[y].push(e);
    });

    $("#timeline-list").innerHTML = years.map(function (y) {
      return '<h3 class="tl-year">' + y + '</h3><ol class="tl-list">' + byYear[y].map(function (e) {
        if (e.milestone) {
          var m = e.milestone;
          return '<li class="tl-item tl-item--milestone" tabindex="0" data-m="' + D.milestones.indexOf(m) + '"><span class="tl-date">' + fmtDate(m.date) +
            (m.end ? " - " + fmtDate(m.end) : "") + "</span> " +
            (m.image ? '<img class="tl-logo" src="' + esc(m.image) + '" alt="">' : "") +
            '<span class="tl-title">' + esc(m.title) + "</span>" +
            (m.note ? '<p class="tl-note">' + esc(m.note) + "</p>" : "") + "</li>";
        }
        var p = e.project;
        return '<li class="tl-item' + (p.ongoing ? " tl-item--now" : "") + '" data-id="' + esc(p.id) + '"><span class="tl-date">' + fmtDate(p.date) + "</span> " +
          '<span class="tl-title"><a href="' + projUrl(p) + '">' + esc(p.title) + "</a></span> " +
          '<span class="tl-kind">(' + esc(p.category) + (p.ongoing ? ", in progress " + pct(p) + "%" : "") + ")</span>" +
          '<p class="tl-note">' + val(p.outcome) + "</p></li>";
      }).join("") + "</ol>";
    }).join("");

    var preview = $("#tl-preview");
    function previewProject(p) {
      var poster = thumbOf(p);
      return (poster ? '<div class="media"><img src="' + esc(poster) + '" alt=""></div>' : "") +
        '<h3 class="tl-preview-title">' + esc(p.title) + "</h3>" +
        '<p class="card-meta">' + esc(p.category) + " · " + (p.ongoing ? "Since " : "") + fmtDate(p.date) + " · " + statusText(p) + "</p>" +
        "<p>" + val(p.summary) + "</p>" +
        "<dl>" + row("My role", p.role) + row("Result", p.outcome) + row("Tools", p.tools) + pressRow(p) + "</dl>" +
        '<p><a href="' + projUrl(p) + '">Full details</a></p>';
    }
    function previewMilestone(m) {
      return (m.image ? '<img class="tl-preview-logo" src="' + esc(m.image) + '" alt="">' : "") +
        '<h3 class="tl-preview-title">' + esc(m.title) + "</h3>" +
        '<p class="card-meta">' + fmtDate(m.date) + (m.end ? " - " + fmtDate(m.end) : "") + "</p>" +
        (m.note ? "<p>" + esc(m.note) + "</p>" : "");
    }
    var hideTimer = null;
    function showPreview(li) {
      clearTimeout(hideTimer);
      $$(".tl-item").forEach(function (o) { o.classList.remove("is-active"); });
      li.classList.add("is-active");
      // fresh wrapper each time so the swap animation replays
      preview.innerHTML = '<div class="tl-preview-inner">' +
        (li.dataset.id ? previewProject(byId[li.dataset.id]) : previewMilestone(D.milestones[li.dataset.m])) + "</div>";
      preview.classList.add("is-open");
    }
    // short delay so the pointer can travel from an entry to the panel (e.g. its link)
    function hidePreview() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        preview.classList.remove("is-open");
        $$(".tl-item").forEach(function (o) { o.classList.remove("is-active"); });
      }, 150);
    }
    $$(".tl-item").forEach(function (li) {
      li.addEventListener("mouseenter", function () { showPreview(li); });
      li.addEventListener("mouseleave", hidePreview);
      li.addEventListener("focusin", function () { showPreview(li); });
      li.addEventListener("focusout", hidePreview);
    });
    preview.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    preview.addEventListener("mouseleave", hidePreview);
    preview.addEventListener("focusin", function () { clearTimeout(hideTimer); });
    preview.addEventListener("focusout", hidePreview);
  }

  /* ---------- boot ---------- */

  var pages = { home: renderHome, category: renderCategory, project: renderProject, about: renderAbout };
  if (pages[body.dataset.page]) pages[body.dataset.page]();
  renderContact();
  $$(".year").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
