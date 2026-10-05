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
  $("#hero-sr").textContent = "I'm confident in " + prof.typedPhrases.join(", ") + ".";
  var phrase = $("#phrase");
  phrase.textContent = prof.typedPhrases[0];
  if (!reduced && prof.typedPhrases.length > 1) {
    var pi = 0;
    setInterval(function () {
      pi = (pi + 1) % prof.typedPhrases.length;
      phrase.textContent = prof.typedPhrases[pi];
    }, 2500);
  }

  var featured = byId[prof.featured] || projects[0];
  mountMedia($("#hero-media"), featured);
  $("#hero-caption").innerHTML =
    "Trailer: <a href=\"#" + esc(featured.id) + "\">" + esc(featured.title) + "</a> · " + statusText(featured);

  /* ---------- abilities ---------- */

  $("#skills").innerHTML = D.skills.map(function (g) {
    return '<article class="skill-group"><header><h3>' + esc(g.group) + "</h3></header>" +
      g.items.map(function (s) {
        return '<div class="skill"><div class="skill-top"><b>' + esc(s.name) + "</b><span>" + s.level + " / 10</span></div>" +
          '<div class="bar" role="img" aria-label="' + esc(s.name) + " level " + s.level + ' of 10"><i style="width:' + s.level * 10 + '%"></i></div>' +
          "<p>" + esc(s.desc) + "</p></div>";
      }).join("") + "</article>";
  }).join("");

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
        return '<li class="tl-item tl-item--milestone"><span class="tl-date">' + fmtDate(m.date) +
          (m.end ? " – " + fmtDate(m.end) : "") + "</span> " +
          (m.image ? '<img class="tl-logo" src="' + esc(m.image) + '" alt="">' : "") +
          '<span class="tl-title">' + esc(m.title) + "</span>" +
          (m.note ? '<p class="tl-note">' + esc(m.note) + "</p>" : "") + "</li>";
      }
      var p = e.project;
      return '<li class="tl-item' + (p.ongoing ? " tl-item--now" : "") + '"><span class="tl-date">' + fmtDate(p.date) + "</span> " +
        '<span class="tl-title"><a href="#' + esc(p.id) + '">' + esc(p.title) + "</a></span> " +
        '<span class="tl-kind">(' + esc(p.category) + (p.ongoing ? ", in progress " + pct(p) + "%" : "") + ")</span>" +
        '<p class="tl-note">' + val(p.outcome) + "</p></li>";
    }).join("") + "</ol>";
  }).join("");

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
  $("#contact-list").innerHTML = [
      ["itch.io", c.itch, "assets/img/logoItchio.png"],
      ["GitHub", c.github, "assets/img/logoGithub.png"],
      ["Email", isTodo(c.email) ? c.email : "mailto:" + c.email, "assets/img/logoGmail.png"],
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
