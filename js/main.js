/* Renders the draft portfolio from js/data.js. No content lives here. */
(function () {
  "use strict";

  var D = window.PORTFOLIO;
  if (!D) return;

  var $ = function (sel) { return document.querySelector(sel); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  var projects = D.projects.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  var byId = {};
  projects.forEach(function (p) { byId[p.id] = p; });

  /* ---------- media: thumbnail, click to play (mp4 -> YouTube -> empty box) ---------- */

  function mountMedia(box, p) {
    var yt = ytId(p.links && p.links.youtube);
    var poster = p.poster || (yt ? "https://i.ytimg.com/vi/" + yt + "/hqdefault.jpg" : null);
    var playable = p.video || yt;

    if (!poster && !playable) {
      box.innerHTML = '<span class="media-empty">no trailer yet</span>';
      return;
    }
    box.innerHTML =
      (poster ? '<img src="' + esc(poster) + '" alt="' + esc(p.title) + ' thumbnail" loading="lazy">' : '<span class="media-empty"></span>') +
      (playable ? '<button type="button" class="media-play" aria-label="Play trailer: ' + esc(p.title) + '"><span>&#9654; Play trailer</span></button>' : "");

    var btn = box.querySelector(".media-play");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (p.video) {
        var v = document.createElement("video");
        v.controls = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        if (poster) v.poster = poster;
        v.addEventListener("error", function () { yt ? youtube() : (box.innerHTML = '<span class="media-empty">no trailer yet</span>'); }, { once: true });
        v.src = p.video;
        box.replaceChildren(v);
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else {
        youtube();
      }
    });
    function youtube() {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + yt + "?autoplay=1&rel=0";
      f.title = p.title + " trailer";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      box.replaceChildren(f);
      f.focus();
    }
  }

  function linkButtons(p) {
    var l = p.links || {};
    var out = "";
    if (l.itch) out += '<a class="button button--sm" href="' + esc(l.itch) + '" target="_blank" rel="noopener">itch.io</a>';
    if (l.youtube) out += '<a class="button button--sm" href="' + esc(l.youtube) + '" target="_blank" rel="noopener">YouTube</a>';
    if (l.instagram) out += '<a class="button button--sm" href="' + esc(l.instagram) + '" target="_blank" rel="noopener">Instagram</a>';
    return out;
  }

  /* ---------- hero ---------- */

  var prof = D.profile;
  $("#hero-name").textContent = prof.name + " · " + prof.title;
  $("#hero-intro").textContent = prof.intro;
  if (prof.photo) $("#profile-photo").src = prof.photo;
  else $("#profile-photo").remove();
  $("#hero-lead").textContent = prof.heroLead;
  $("#hero-tail").textContent = prof.heroTail || "";
  $("#hero-sr").textContent = prof.heroLead + " " + prof.typedPhrases.join(", ") + (prof.heroTail ? ", " + prof.heroTail : ".");
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
  if (prof.typedPhrases.length > 1) {
    var pi = 0;
    if (reduced) {
      setInterval(function () {
        pi = (pi + 1) % prof.typedPhrases.length;
        phrase.textContent = prof.typedPhrases[pi];
      }, 3000);
    } else {
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
  }

  var featured = byId[prof.featured] || projects[0];
  mountMedia($("#hero-media"), featured);
  $("#hero-caption").innerHTML =
    "Trailer: <a href=\"#" + esc(featured.id) + "\">" + esc(featured.title) + "</a> · " + statusText(featured);

  /* ---------- abilities ---------- */

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
    Array.prototype.forEach.call(document.querySelectorAll(".skill-group"), function (g) { barIO.observe(g); });
  }

  // description shows on hover / focus / click (click pins it)
  Array.prototype.forEach.call(document.querySelectorAll(".skill-group"), function (group) {
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

  /* ---------- timeline (oldest first, no filters) ---------- */

  var events = D.projects.map(function (p) {
    return { date: p.date, project: p };
  }).concat((D.milestones || []).map(function (m) {
    return { date: m.date, milestone: m };
  })).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });

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
        '<span class="tl-title"><a href="#' + esc(p.id) + '">' + esc(p.title) + "</a></span> " +
        '<span class="tl-kind">(' + esc(p.category) + (p.ongoing ? ", in progress " + pct(p) + "%" : "") + ")</span>" +
        '<p class="tl-note">' + val(p.outcome) + "</p></li>";
    }).join("") + "</ol>";
  }).join("");

  /* ---------- timeline preview panel (hover / focus an entry) ---------- */

  var preview = $("#tl-preview");

  function previewProject(p) {
    var yt = ytId(p.links && p.links.youtube);
    var poster = p.poster || (yt ? "https://i.ytimg.com/vi/" + yt + "/hqdefault.jpg" : null);
    return (poster ? '<div class="media"><img src="' + esc(poster) + '" alt=""></div>' : "") +
      '<h3 class="tl-preview-title">' + esc(p.title) + "</h3>" +
      '<p class="card-meta">' + esc(p.category) + " · " + (p.ongoing ? "Since " : "") + fmtDate(p.date) + " · " + statusText(p) + "</p>" +
      "<p>" + val(p.summary) + "</p>" +
      "<dl>" + row("My role", p.role) + row("Result", p.outcome) + row("Tools", p.tools) + "</dl>" +
      '<p><a href="#' + esc(p.id) + '">Full details</a></p>';
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
    $$tl().forEach(function (o) { o.classList.remove("is-active"); });
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
      $$tl().forEach(function (o) { o.classList.remove("is-active"); });
    }, 150);
  }
  function $$tl() { return Array.prototype.slice.call(document.querySelectorAll(".tl-item")); }

  $$tl().forEach(function (li) {
    li.addEventListener("mouseenter", function () { showPreview(li); });
    li.addEventListener("mouseleave", hidePreview);
    li.addEventListener("focusin", function () { showPreview(li); });
    li.addEventListener("focusout", hidePreview);
  });
  preview.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  preview.addEventListener("mouseleave", hidePreview);
  preview.addEventListener("focusin", function () { clearTimeout(hideTimer); });
  preview.addEventListener("focusout", hidePreview);

  /* ---------- project cards ---------- */

  // null hides the row; "TODO" shows a [TODO] marker
  function row(label, v) { return v === null ? "" : "<dt>" + label + "</dt><dd>" + val(v) + "</dd>"; }

  function card(p) {
    return '<li><article class="card" id="' + esc(p.id) + '">' +
      '<div class="media"></div>' +
      '<div class="card-body">' +
      "<div><h3>" + esc(p.title) +
      (p.featured ? '<span class="badge">Featured</span>' : "") + "</h3>" +
      '<p class="card-meta">' + esc(p.category) + " · " + (p.ongoing ? "Since " : "") + fmtDate(p.date) + " · " + statusText(p) + "</p></div>" +
      "<p>" + val(p.summary) + "</p>" +
      (p.description ? "<p>" + esc(p.description) + "</p>" : "") +
      "<dl>" + row("My role", p.role) + row("Result", p.outcome) + row("Tools", p.tools) +
      row("Team", /^\d+$/.test(String(p.team)) ? p.team + (p.team === "1" ? " person" : " people") : p.team) + "</dl>" +
      (linkButtons(p) ? '<div class="links">' + linkButtons(p) + "</div>" : "") +
      "</div></article></li>";
  }

  var games = projects.filter(function (p) { return p.category !== "Teaching"; });
  var teaching = projects.filter(function (p) { return p.category === "Teaching"; });
  $("#work-list").innerHTML = games.map(card).join("");
  $("#teaching-list").innerHTML = teaching.map(card).join("");
  projects.forEach(function (p) {
    var box = document.querySelector("#" + CSS.escape(p.id) + " .media");
    if (!box) return;
    if (p.category === "Teaching") box.remove();
    else mountMedia(box, p);
  });

  /* ---------- contact ---------- */

  var c = prof.contact;
  // [label, link, icon file]
  $("#contact-list").innerHTML = [
    ["itch.io", c.itch, "assets/img/logoItchio.png"],
    ["GitHub", c.github, "assets/img/logoGithub.png"],
    ["Email", isTodo(c.email) ? c.email : "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(c.email), "assets/img/logoGmail.png"],
    ["LinkedIn", c.linkedin, "assets/img/logoLinkin.png"],
    ["Instagram", c.instagram, "assets/img/logoInsta.png"]
  ].filter(function (l) { return l[1] !== undefined && l[1] !== null; }).map(function (l) {
    var icon = '<img class="contact-icon" src="' + l[2] + '" alt="" width="20" height="20">';
    if (isTodo(l[1])) return '<li><span class="button" aria-disabled="true">' + icon + l[0] + ' <span class="todo">[TODO]</span></span></li>';
    var ext = /^https?:/.test(l[1]);
    return '<li><a class="button" href="' + esc(l[1]) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + icon + l[0] + "</a></li>";
  }).join("");
  $("#year").textContent = new Date().getFullYear();
})();
