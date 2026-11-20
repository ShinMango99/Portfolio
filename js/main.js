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
  // engine label: p.engine if set, otherwise the first entry of tools ("Unreal Engine" -> "Unreal")
  function engineOf(p) {
    var e = p.engine || String(p.tools || "").split(",")[0].trim();
    return e.replace(/ Engine$/, "");
  }
  // "Solo" / "Team of 6"; teaching entries skip it (their number is students, not a dev team)
  function teamLabel(p) {
    if (p.team == null || hasCat(p, "Communication")) return "";
    var t = String(p.team);
    if (/^1\b/.test(t)) return "Solo";
    return /^\d+$/.test(t) ? "Team of " + t : t;
  }
  function tagsHtml(p) {
    var e = engineOf(p), t = teamLabel(p);
    if (!e && !t) return "";
    return '<span class="tile-tags">' + (e ? '<span class="tag tag--engine">' + esc(e) + "</span>" : "") +
      (t ? '<span class="tag">' + esc(t) + "</span>" : "") + "</span>";
  }
  // category is one name or a list of names (a club project that was also a competition entry)
  function catsOf(p) { return [].concat(p.category); }
  function hasCat(p, c) { return catsOf(p).indexOf(c) !== -1; }
  function catText(p) { return catsOf(p).join(" / "); }
  // run fn once the first-visit loading screen (boot.js, Home only) has uncovered the page; right away when there is none
  function afterBoot(fn) { if (window.BOOT) window.BOOT.after(fn); else fn(); }
  function bareUrl(u) { return String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); }

  var projects = D.projects.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  var byId = {};
  projects.forEach(function (p) { byId[p.id] = p; });

  // solo / team / teaching, from category and team size
  function groupOf(p) {
    if (hasCat(p, "Communication")) return "teaching";
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
    label = label || p.mediaLabel || "Play trailer";

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

  /* ---------- hover preview: like an itch.io cover GIF, a silent gameplay loop plays while the cursor is on it ---------- */

  var canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  // hoverEl: what the cursor enters; host: the positioned picture box the loop covers
  function hoverPreview(hoverEl, host, p) {
    if (!p || !p.preview || !canHover || reduced || !hoverEl || !host) return;
    var v = null;
    hoverEl.addEventListener("mouseenter", function () {
      // a trailer is already playing in this box: leave it alone
      if (host.querySelector("iframe, video:not(.hover-preview)")) return;
      if (!v) {
        v = document.createElement("video");
        v.className = "hover-preview";
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("aria-hidden", "true");
        v.preload = "auto";
        v.src = p.preview;
        host.insertBefore(v, host.querySelector(".media-play"));
      }
      host.classList.add("is-previewing");
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    });
    hoverEl.addEventListener("mouseleave", function () {
      host.classList.remove("is-previewing");
      if (v) { v.pause(); v.currentTime = 0; }
    });
  }

  /* ---------- project thumbnail: the picture plays the trailer, the text below opens the page ---------- */

  function tile(p) {
    return '<li class="tile">' +
      '<div class="media tile-media" data-mount="' + esc(p.id) + '"></div>' +
      '<a class="tile-body" href="' + projUrl(p) + '">' +
      '<span class="tile-title">' + esc(p.title) + "</span>" +
      tagsHtml(p) +
      (p.award ? '<span class="badge">' + esc(p.award) + "</span>" : "") +
      '<span class="tile-meta">' + esc(catText(p)) + " · " + String(p.date).slice(0, 4) + " · " + statusText(p) + "</span>" +
      '<span class="tile-text">' + val(p.summary) + "</span>" +
      '<span class="tile-role"><b>My role:</b> ' + val(p.role) + "</span>" +
      '<span class="tile-go">View project &rarr;</span>' +
      "</a></li>";
  }

  // fill every [data-mount] box: a trailer player when there is one, otherwise a picture linking to the page
  function mountAll(root, label) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-mount]"), function (box) {
      var p = byId[box.dataset.mount];
      hoverPreview(box.closest(".tile") || box, box, p);
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
    // plain headline lines, if the page has them (the code-card hero writes its own lines in index.html)
    if ($("#hero-lead")) $("#hero-lead").textContent = prof.heroLead;
    if ($("#hero-tail")) $("#hero-tail").textContent = prof.heroTail || "";
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
      // the reel plays on its own like a GIF: a silent loop (profile.reelLoop), with a chip to switch to
      // the full reel with sound. Reduced motion or data saver: poster + play button instead.
      var saveData = navigator.connection && navigator.connection.saveData;
      var canLoop = prof.reelLoop && !reduced && !saveData;
      function showReel() {
        if (!canLoop) { mountMedia(player, reel, "Play reel"); return; }
        player.innerHTML = '<video class="reel-loop" muted loop autoplay playsinline preload="auto" aria-hidden="true"' +
          (prof.reelPoster ? ' poster="' + esc(prof.reelPoster) + '"' : "") + "></video>" +
          '<button type="button" class="button button--sm reel-sound">&#9654; Watch with sound</button>';
        player.querySelector(".reel-sound").addEventListener("click", function () { play(player, reel); });
        var v = player.querySelector("video");
        // first visit: the loading screen (boot.js) is already playing this loop full size. Its video lands here
        // when the screen leaves, so the reel goes on from the same frame and the file loads only once.
        // Until then the box stays plain (no poster), since the landing reel covers it.
        if (window.BOOT && window.BOOT.land(v, function (bv) {
          if (bv.error || v.parentNode !== player) { startLoop(v); return; }
          bv.className = v.className;
          bv.setAttribute("aria-hidden", "true");
          player.replaceChild(bv, v);
          var pr = bv.play();
          if (pr && pr.catch) pr.catch(function () {});
        })) {
          v.removeAttribute("poster");
          return;
        }
        startLoop(v);
      }
      function startLoop(v) {
        v.muted = true; // the property, not just the attribute, is what lets autoplay start
        v.addEventListener("error", function () { mountMedia(player, reel, "Play reel"); }, { once: true });
        v.src = prof.reelLoop;
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () {});
      }
      // pause the loop while it is scrolled out of view
      if (canLoop && "IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          var v = player.querySelector("video.reel-loop");
          if (!v) return;
          if (entries[0].isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else v.pause();
        }).observe(player);
      }
      showReel();
      // every small game card under the reel previews its game on hover
      Array.prototype.forEach.call(feature.querySelectorAll(".hero-thumb"), function (t) {
        var id = t.dataset.id || (t.getAttribute("href") || "").split("id=")[1];
        hoverPreview(t, t, byId[decodeURIComponent(id || "")]);
      });
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
        showReel();
      });
    } else {
      // no reel yet: lead with the best games; the picture plays the trailer, the bar below opens the page
      feature.innerHTML = '<ul class="mosaic">' + featured.map(function (p) {
        return '<li class="mosaic-item"><div class="media" data-mount="' + esc(p.id) + '"></div>' +
          '<a class="mosaic-label" href="' + projUrl(p) + '"><b>' + esc(p.title) + "</b>" +
          "<small>" + esc(p.award || catText(p)) + "</small>" +
          '<span class="mosaic-go">Open &rarr;</span></a></li>';
      }).join("") + "</ul>";
      mountAll(feature, "Play");
    }

    // every game in a character-select row. It opens on the featured games: the first in the middle, the next
    // ones to its right, the last one to its left, and every other game in between, oldest first.
    var others = projects.filter(function (p) { return groupOf(p) !== "teaching" && featured.indexOf(p) === -1; }).reverse();
    var right = featured.slice(0, Math.ceil((featured.length + 1) / 2));
    var games = right.concat(others, featured.slice(right.length));
    $("#games-lead").textContent = "All " + games.length + " games I have worked on. The middle card plays; open it for the trailer, my role and a playable link.";
    gameSelect($("#game-select"), games);
    $("#featured-section").hidden = false;

    browseRow($("#portal"), D.categories, $("#bw-ctrl"));
  }

  /* ---------- Home: browse row ----------
     Every sub-page as one poster panel in a single row that runs from edge to edge of the window. One panel is
     open: wide, in full colour, playing its cover game's loop, with its name set big on the picture. The others
     are dim grey strips with a big outlined number and the name standing up. The open panel moves on by itself
     (the bar along its top edge is the timer) and holds while the cursor is on the row, while keyboard focus is
     inside, while the row is off screen, after Pause, and always with reduced motion. Passing over a strip only
     hints at it; resting on it for 0.75 s, a click or a tap opens it, and a click on the open panel follows its link. Keyboard focus opens
     what it lands on. Below 900px it is a plain sideways swipe of full posters (style.css). */
  function browseRow(root, cats, ctrl) {
    var n = cats.length;
    if (!root || !n) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    var wide = matchMedia("(min-width: 900px)");
    function pad(x) { return (x < 10 ? "0" : "") + x; }

    root.style.setProperty("--n", n);
    root.innerHTML = cats.map(function (c, i) {
      var list = c.id === "about" ? null : inGroup(c.id);
      var img = c.coverImage || (c.cover && byId[c.cover] ? thumbOf(byId[c.cover]) : null);
      var meta = pad(i + 1) + " · " + (list ? list.length + (list.length === 1 ? " project" : " projects") : "Profile");
      // YouTube thumbnails are 4:3 with black bars; .is-yt pushes the bars out of the frame.
      // Each text line sits in its own mask (.bw-line) and slides up out of it when the panel opens.
      return '<li class="bw-panel" style="--i:' + i + '">' +
        '<a class="bw-link" href="' + esc(c.page) + '" draggable="false">' +
        '<span class="bw-media">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" draggable="false"' +
          (/ytimg\.com/.test(img) ? ' class="is-yt"' : "") + ">" : "") + "</span>" +
        '<span class="bw-num" aria-hidden="true">' + pad(i + 1) + "</span>" +
        '<span class="bw-side" aria-hidden="true">' + esc(c.title) + "</span>" +
        '<span class="bw-body">' +
        '<span class="bw-line" style="--l:0"><span class="bw-meta">' + esc(meta) + "</span></span>" +
        '<span class="bw-line" style="--l:1"><span class="bw-title">' + esc(c.title) + "</span></span>" +
        '<span class="bw-line" style="--l:2"><span class="bw-text">' + esc(c.blurb) + "</span></span>" +
        '<span class="bw-line bw-line--go" style="--l:3"><span><span class="bw-go">Open <span aria-hidden="true">&rarr;</span></span></span></span>' +
        "</span>" +
        '<span class="bw-timer" aria-hidden="true"></span>' +
        "</a></li>";
    }).join("");
    if (ctrl) {
      ctrl.innerHTML = '<p class="bw-index" aria-hidden="true"><b></b><span> / ' + pad(n) + "</span></p>" +
        (reduced ? "" : '<button type="button" class="bw-pause"></button>');
    }

    var panels = root.querySelectorAll(".bw-panel");
    var index = ctrl && ctrl.querySelector(".bw-index b");
    var pauseBtn = ctrl && ctrl.querySelector(".bw-pause");
    var at = -1, playT = 0;
    var held = { user: false, hover: false, focus: false, away: true };
    function indexOf(panel) { return Array.prototype.indexOf.call(panels, panel); }

    function open(i) {
      i = (i % n + n) % n;
      if (i === at) return;
      at = i;
      Array.prototype.forEach.call(panels, function (p, k) {
        var on = k === at;
        p.classList.toggle("is-open", on);
        // a fresh <i> restarts the bar that times the next panel
        p.querySelector(".bw-timer").innerHTML = on ? "<i></i>" : "";
        if (!on) stopLoop(p);
      });
      if (index) {
        // a fresh <b> replays the number's flip
        var b = index.cloneNode(false);
        b.textContent = pad(at + 1);
        index.parentNode.replaceChild(b, index);
        index = b;
      }
      // the gameplay loop starts once the panel has opened up
      clearTimeout(playT);
      playT = setTimeout(startLoop, reduced ? 0 : 400);
    }

    // the open panel plays the silent loop of the game on its cover, if it has one
    function startLoop() {
      var panel = panels[at], c = cats[at];
      var p = c.cover && byId[c.cover];
      if (!p || !p.preview || saveData || reduced || !wide.matches || held.away) return;
      var box = panel.querySelector(".bw-media");
      var v = box.querySelector("video");
      if (!v) {
        v = document.createElement("video");
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("aria-hidden", "true");
        v.preload = "auto";
        v.addEventListener("playing", function () { if (panel.classList.contains("is-open")) panel.classList.add("is-playing"); });
        v.src = p.preview;
        box.appendChild(v);
      }
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    }
    function stopLoop(panel) {
      panel.classList.remove("is-playing");
      var v = panel.querySelector("video");
      if (v) v.pause();
    }

    function hold(key, on) {
      held[key] = on;
      root.classList.toggle("is-held", held.user || held.hover || held.focus || held.away);
    }
    // the full bar is the cue for the next panel
    root.addEventListener("animationend", function (e) {
      if (e.animationName === "bw-fill") open(at + 1);
    });

    function paintPause() {
      if (!pauseBtn) return;
      pauseBtn.innerHTML = held.user ? PIX.play : PIX.pause;
      pauseBtn.title = held.user ? "Play the slideshow" : "Pause the slideshow";
      pauseBtn.setAttribute("aria-label", pauseBtn.title);
    }
    if (pauseBtn) pauseBtn.addEventListener("click", function () { hold("user", !held.user); paintPause(); });
    paintPause();

    // the cursor on the row holds the timer. Resting on a closed strip for 0.75 s opens it; just passing over
    // it only hints (style.css), so the row never jumps because the cursor crossed it.
    var hoverT = 0;
    Array.prototype.forEach.call(panels, function (p, k) {
      p.addEventListener("pointerenter", function (e) {
        if (e.pointerType !== "mouse" || !wide.matches) return;
        clearTimeout(hoverT);
        hoverT = setTimeout(function () { open(k); }, 300);
      });
      p.addEventListener("pointerleave", function () { clearTimeout(hoverT); });
    });
    root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hold("hover", true); });
    root.addEventListener("pointerleave", function (e) {
      clearTimeout(hoverT);
      if (e.pointerType === "mouse") hold("hover", false);
    });
    // mouse, touch and pen alike: a click on a closed strip opens it, a click on the open panel follows its link
    root.addEventListener("click", function (e) {
      var panel = e.target.closest(".bw-panel");
      if (!panel || !wide.matches) return;
      var k = indexOf(panel);
      if (k !== at) { e.preventDefault(); open(k); }
    });

    // keyboard: focus opens the panel it lands on, the arrow keys walk the row. A mouse press also focuses the
    // link, but that one waits for the click.
    root.addEventListener("focusin", function (e) {
      if (!e.target.matches(":focus-visible")) return;
      var panel = e.target.closest(".bw-panel");
      if (panel && wide.matches) open(indexOf(panel));
      hold("focus", true);
    });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) hold("focus", false); });
    root.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var from = e.target.closest(".bw-panel");
      if (!from) return;
      e.preventDefault();
      var k = (indexOf(from) + (e.key === "ArrowLeft" ? -1 : 1) + n) % n;
      panels[k].querySelector(".bw-link").focus();
    });

    // the open picture drifts a little against the cursor
    if (canHover && !reduced) {
      var mx = 0, my = 0, ticking = false;
      root.addEventListener("pointermove", function (e) {
        var r = root.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width * 2 - 1;
        my = (e.clientY - r.top) / r.height * 2 - 1;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          root.style.setProperty("--mx", mx.toFixed(3));
          root.style.setProperty("--my", my.toFixed(3));
        });
      });
    }

    // the panels rise in one after another the first time the row comes into view; the loop pauses off screen
    if ("IntersectionObserver" in window) {
      if (!reduced) root.classList.add("bw-juicy");
      new IntersectionObserver(function (entries) {
        var seen = entries[0].isIntersecting;
        if (seen) root.classList.add("is-in");
        hold("away", !seen);
        if (seen) startLoop(); else stopLoop(panels[at]);
      }, { threshold: 0.4 }).observe(root);
    } else {
      hold("away", false);
    }
    // crossing 900px switches between the row and the swipe
    wide.addEventListener("change", function () { if (wide.matches) startLoop(); else stopLoop(panels[at]); });

    open(0);
  }

  /* ---------- Home: game select ----------
     Every game in one row that slides past like a character select screen: the middle card is full size,
     lifted and playing its gameplay loop; its neighbours shrink, fade and turn away; the rest wait off stage.
     The row moves on by itself: the lit block in the bar below fills up, and when it is full the next game
     slides in. It holds while the cursor is on the cards, while keyboard focus is inside, while the section
     is off screen, after Pause, and always with reduced motion. A side card, a block, an arrow, the arrow
     keys or a swipe bring a game to the middle; the middle card opens the project page. */
  var PIX = {
    arrow: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M5 2h2v2h2v2h2v4h-2v2h-2v2H5v-2h2v-2h2V6H7V4H5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
    play: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M5 2h2v2h2v2h2v4h-2v2h-2v2H5z"/></svg>'
  };
  function gameSelect(root, games) {
    var n = games.length;
    if (!root || !n) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    function pad(x) { return (x < 10 ? "0" : "") + x; }

    root.innerHTML =
      '<ul class="gs-track">' + games.map(function (p, i) {
        var img = thumbOf(p);
        var meta = [engineOf(p), teamLabel(p), String(p.date).slice(0, 4)].filter(Boolean).join(" · ");
        return '<li class="gs-card" data-pos="3" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + n + '">' +
          '<a class="gs-link" href="' + projUrl(p) + '" draggable="false">' +
          '<span class="gs-media">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" draggable="false">' : "") +
          (p.award ? '<span class="gs-award">' + esc(p.award) + "</span>" : "") + "</span>" +
          '<span class="gs-body"><span class="gs-title">' + esc(p.title) + "</span>" +
          '<span class="gs-meta">' + esc(meta) + "</span>" +
          '<span class="gs-go" aria-hidden="true"><span class="gs-go-text">View project </span>&rarr;</span></span>' +
          "</a></li>";
      }).join("") + "</ul>" +
      '<div class="container gs-foot">' +
      '<p class="gs-summary"></p>' +
      '<div class="gs-nav">' +
      '<button type="button" class="gs-arrow" data-step="-1" aria-label="Previous game" title="Previous game">' + PIX.arrow + "</button>" +
      '<ol class="gs-dots">' + games.map(function (p, i) {
        return '<li><button type="button" data-i="' + i + '" aria-label="' + esc(p.title) + '" title="' + esc(p.title) + '"></button></li>';
      }).join("") + "</ol>" +
      '<button type="button" class="gs-arrow" data-step="1" aria-label="Next game" title="Next game">' + PIX.arrow + "</button>" +
      '<span class="gs-count" aria-hidden="true"></span>' +
      (reduced ? "" : '<button type="button" class="gs-pause"></button>') +
      "</div></div>" +
      '<p class="sr-only" aria-live="polite"></p>';

    var track = root.querySelector(".gs-track");
    var cards = root.querySelectorAll(".gs-card");
    var dots = root.querySelectorAll(".gs-dots button");
    var summary = root.querySelector(".gs-summary");
    var count = root.querySelector(".gs-count");
    var live = root.querySelector("[aria-live]");
    var pauseBtn = root.querySelector(".gs-pause");
    var at = 0, playT = 0;
    var held = { user: false, hover: false, focus: false, away: true };

    function go(i, byUser) {
      at = (i % n + n) % n;
      Array.prototype.forEach.call(cards, function (c, k) {
        // shortest way round the ring: -n/2 .. n/2, and everything past 2 waits just off stage
        var d = ((k - at) % n + n) % n;
        if (d > n / 2) d -= n;
        var pos = Math.max(-3, Math.min(3, d));
        c.dataset.pos = pos;
        c.setAttribute("aria-hidden", String(Math.abs(pos) > 2));
        c.querySelector(".gs-link").tabIndex = Math.abs(pos) > 2 ? -1 : 0;
        if (k !== at) stopPreview(c);
      });
      var p = games[at];
      summary.textContent = isTodo(p.summary) ? "" : p.summary;
      count.textContent = pad(at + 1) + " / " + pad(n);
      Array.prototype.forEach.call(dots, function (b, k) {
        // a fresh <i> restarts the fill that times the next slide
        if (k === at) { b.setAttribute("aria-current", "true"); b.innerHTML = "<i></i>"; }
        else { b.removeAttribute("aria-current"); b.innerHTML = ""; }
      });
      if (byUser) live.textContent = p.title + ", " + (at + 1) + " of " + n;
      // the gameplay loop starts once the card has slid into the middle
      clearTimeout(playT);
      playT = setTimeout(function () { startPreview(cards[at], p); }, reduced ? 0 : 450);
    }

    function startPreview(card, p) {
      if (!p.preview || saveData) return;
      var box = card.querySelector(".gs-media");
      var v = box.querySelector("video");
      if (!v) {
        v = document.createElement("video");
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("aria-hidden", "true");
        v.preload = "auto";
        v.addEventListener("playing", function () { if (card.dataset.pos === "0") card.classList.add("is-playing"); });
        v.src = p.preview;
        box.insertBefore(v, box.querySelector(".gs-award"));
      }
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {});
    }
    function stopPreview(card) {
      card.classList.remove("is-playing");
      var v = card.querySelector("video");
      if (v) v.pause();
    }

    function hold(key, on) {
      held[key] = on;
      root.classList.toggle("is-held", held.user || held.hover || held.focus || held.away);
    }
    // the full block is the cue for the next slide
    root.addEventListener("animationend", function (e) {
      if (e.animationName === "gs-fill") go(at + 1);
    });

    function paintPause() {
      if (!pauseBtn) return;
      pauseBtn.innerHTML = held.user ? PIX.play : PIX.pause;
      pauseBtn.title = held.user ? "Play the slideshow" : "Pause the slideshow";
      pauseBtn.setAttribute("aria-label", pauseBtn.title);
    }
    if (pauseBtn) pauseBtn.addEventListener("click", function () { hold("user", !held.user); paintPause(); });
    paintPause();

    Array.prototype.forEach.call(root.querySelectorAll(".gs-arrow"), function (b) {
      b.addEventListener("click", function () { go(at + Number(b.dataset.step), true); });
    });
    Array.prototype.forEach.call(dots, function (b) {
      b.addEventListener("click", function () { go(Number(b.dataset.i), true); });
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        go(at + (e.key === "ArrowLeft" ? -1 : 1), true);
      }
    });

    // a side card slides to the middle instead of opening; a sideways drag or swipe moves one step
    var x0 = null, swiped = false;
    track.addEventListener("pointerdown", function (e) { x0 = e.clientX; swiped = false; });
    track.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) { swiped = true; go(at + (dx < 0 ? 1 : -1), true); }
    });
    track.addEventListener("click", function (e) {
      var card = e.target.closest(".gs-card");
      if (!card) return;
      if (swiped) { e.preventDefault(); swiped = false; return; }
      var k = Array.prototype.indexOf.call(cards, card);
      if (k !== at) { e.preventDefault(); go(k, true); }
    });

    track.addEventListener("mouseenter", function () { hold("hover", true); });
    track.addEventListener("mouseleave", function () { hold("hover", false); });
    // keyboard focus holds the row; a mouse click on an arrow does not
    root.addEventListener("focusin", function (e) { if (e.target.matches(":focus-visible")) hold("focus", true); });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) hold("focus", false); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { hold("away", !entries[0].isIntersecting); }, { threshold: 0.5 }).observe(track);
    } else {
      hold("away", false);
    }

    go(0);
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
    // the first-visit loading screen covers the hero for a few seconds, so start typing once it has gone
    afterBoot(function () {
      setTimeout(function tick() {
        var word = prof.typedPhrases[pi];
        n += deleting ? -1 : 1;
        phrase.textContent = word.slice(0, n);
        var delay = deleting ? 35 : 75;
        if (!deleting && n === word.length) { deleting = true; delay = 1800; }
        else if (deleting && n === 0) { deleting = false; pi = (pi + 1) % prof.typedPhrases.length; delay = 350; }
        setTimeout(tick, delay);
      }, 1800);
    });
  }

  /* ================= Category page ================= */

  function renderCategory() {
    var c = catById[body.dataset.cat];
    if (!c) return;
    $("#cat-title").textContent = c.title;
    $("#cat-blurb").textContent = c.blurb;
    $("#cat-list").innerHTML = inGroup(c.id).map(tile).join("");
    mountAll($("#cat-list"));
    juiceTiles($("#cat-list"));
    evenRows($("#cat-list"), ".tile-body");

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

  /* Snap mode gives every card one fixed height and the picture takes what the text leaves (style.css sets the
     text to flex: none there). Cards side by side must leave the same room, or their pictures end at different
     heights, so every text block in a row gets the height of the tallest one. Outside snap mode the text
     stretches on its own (flex-grow is not 0), so nothing is set. */
  function evenRows(list, bodySel) {
    if (!list) return;
    function run() {
      var rows = {};
      Array.prototype.forEach.call(list.children, function (c) {
        var b = c.querySelector(bodySel);
        if (!b) return;
        b.style.minHeight = "";
        if (getComputedStyle(b).flexGrow !== "0") return;
        (rows[c.offsetTop] = rows[c.offsetTop] || []).push(b);
      });
      Object.keys(rows).forEach(function (top) {
        var max = Math.max.apply(null, rows[top].map(function (b) { return b.offsetHeight; }));
        rows[top].forEach(function (b) { b.style.minHeight = max + "px"; });
      });
    }
    var t;
    function later() { clearTimeout(t); t = setTimeout(run, 120); }
    run();
    addEventListener("resize", later);
    addEventListener("load", run);
    if (document.fonts) document.fonts.ready.then(run);
    // the touchpad switch (.free-scroll on <html>) turns snap mode off
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  /* tiles pop in the first time they scroll into view */
  function juiceTiles(list) {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var tiles = $$(".tile", list);
    if (!tiles.length) return;
    list.classList.add("tiles-juicy");

    function cols() { return Math.max(1, getComputedStyle(list).gridTemplateColumns.split(" ").length); }
    var perRow = cols();
    tiles.forEach(function (t, i) { t.style.setProperty("--col", i % perRow); });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("tile-in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      tiles.forEach(function (t) { io.observe(t); });
    } else {
      tiles.forEach(function (t) { t.classList.add("tile-in"); });
    }

    window.addEventListener("resize", function () {
      perRow = cols();
      tiles.forEach(function (t, i) { t.style.setProperty("--col", i % perRow); });
    });
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
    // the big "Next project" banner never dead-ends: after the last one it moves on to the other category
    var upNext = next || (c.more && inGroup(c.more)[0]) || (siblings[0] !== p ? siblings[0] : null);
    var upCover = upNext ? thumbOf(upNext) : null;
    var hasMedia = thumbOf(p) || p.video;
    // gallery items are a path or { src, caption }
    var gallery = (p.gallery || []).map(function (g) { return typeof g === "string" ? { src: g } : g; })
      .filter(function (g) { return g.src !== p.poster; });
    var l = p.links || {};

    var linkHtml =
      (l.itch ? '<a class="button button--primary" href="' + esc(l.itch) + '" target="_blank" rel="noopener">Play on itch.io</a>' : "") +
      (l.youtube ? '<a class="button" href="' + esc(l.youtube) + '" target="_blank" rel="noopener">Watch on YouTube</a>' : "") +
      (l.instagram ? '<a class="button" href="' + esc(l.instagram) + '" target="_blank" rel="noopener">Instagram post</a>' : "");

    box.innerHTML =
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="' + esc(c.page) + '">' + esc(c.title) + "</a> / <span>" + esc(p.title) + "</span></nav>" +
      '<header class="project-head"><h1 class="page-title">' + esc(p.title) + "</h1>" +
      tagsHtml(p) +
      (p.award ? '<p><span class="badge badge--lg">' + esc(p.award) + "</span></p>" : "") +
      '<p class="card-meta">' + esc(catText(p)) + " · " + (p.ongoing ? "Since " : "") + fmtDate(p.date, true) + " · " + statusText(p) + "</p></header>" +
      // plain words first, for readers who don't make games (recruiters, HR)
      (p.plain ? '<div class="plain"><p class="plain-label">In plain words</p><p>' + esc(p.plain) + "</p></div>" : "") +
      '<div class="project-grid' + (hasMedia ? "" : " project-grid--text") + '">' +
      (hasMedia ? '<div class="media media--lg"></div>' : "") +
      '<aside class="facts"><dl>' + row("My role", p.role) + row("When", p.period) + row("Result", p.outcome) + row("Tools", p.tools) +
      row("Team", p.team == null ? null : teamText(p.team)) + pressRow(p) + "</dl>" +
      (linkHtml ? '<div class="actions">' + linkHtml + "</div>" : "") + "</aside>" +
      "</div>" +
      (p.stats && p.stats.length ? '<ul class="stats">' + p.stats.map(function (s) {
        return "<li><b>" + esc(s.value) + "</b><span>" + esc(s.label) + "</span></li>";
      }).join("") + "</ul>" : "") +
      '<div class="project-text"><p>' + val(p.summary) + "</p>" + (p.description ? "<p>" + esc(p.description) + "</p>" : "") + "</div>" +
      (p.sections || []).map(function (sec) {
        return '<section class="project-section"><h2>' + esc(sec.heading) + "</h2>" +
          (sec.text ? "<p>" + esc(sec.text) + "</p>" : "") +
          (sec.items ? "<ul>" + sec.items.map(function (it) { return "<li>" + esc(it) + "</li>"; }).join("") + "</ul>" : "") +
          "</section>";
      }).join("") +
      (p.quote ? '<figure class="project-quote"><blockquote>' + esc(p.quote) + "</blockquote>" +
        (p.quoteSource ? "<figcaption>" + esc(p.quoteSource) + "</figcaption>" : "") + "</figure>" : "") +
      (gallery.length ? '<ul class="gallery">' + gallery.map(function (g) {
        var alt = g.caption || p.title + " photo";
        return '<li><figure><img src="' + esc(g.src) + '" alt="' + esc(alt) + '" loading="lazy">' +
          (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure></li>";
      }).join("") + "</ul>" : "") +
      (upNext ? '<a class="more-link next-link" href="' + projUrl(upNext) + '">' +
        (upCover ? '<span class="more-media"><img src="' + esc(upCover) + '" alt="" loading="lazy"></span>' : "") +
        '<span class="more-body"><span class="more-eyebrow">' + (next ? "Next project" : "Next: " + esc(catById[groupOf(upNext)].title)) + "</span>" +
        '<span class="more-title">' + esc(upNext.title) + "</span>" +
        (upNext.summary ? '<span class="portal-text">' + esc(upNext.summary) + "</span>" : "") +
        '<span class="tile-go">Open project &rarr;</span></span></a>' : "") +
      '<nav class="pager" aria-label="More in ' + esc(c.title) + '">' +
      (prev ? '<a class="button" href="' + projUrl(prev) + '">&larr; ' + esc(prev.title) + "</a>" : "<span></span>") +
      '<a class="button" href="' + esc(c.page) + '">All ' + esc(c.title) + "</a>" +
      "</nav>";
    backToTop();

    if (hasMedia) {
      mountMedia(box.querySelector(".media"), p);
      hoverPreview(box.querySelector(".media"), box.querySelector(".media"), p);
    }

    // other highlights, so a visitor always has somewhere to go next
    var more = (D.profile.featured || []).map(function (fid) { return byId[fid]; })
      .filter(function (x) { return x && x !== p; }).slice(0, 3);
    if (more.length) {
      $("#more-list").innerHTML = more.map(tile).join("");
      mountAll($("#more-list"));
      $("#more-section").hidden = false;
    }
  }

  /* floating "Back to top" button for long project pages: shows once the reader is about a screen down */
  function backToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.hidden = true;
    btn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M7 2h2v1h1v1h1v1h1v1h1v2h-3v6H6V8H3V6h1V5h1V4h1V3h1z"/></svg><span>Top</span>';
    btn.setAttribute("aria-label", "Back to top");
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0 });
      var h = $("#project .page-title");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    });
    document.body.appendChild(btn);
    function onScroll() { btn.hidden = window.scrollY < innerHeight * 0.8; }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ================= About: abilities + timeline ================= */

  // 10 blocks; the first `level` of them light up
  function segs(level) {
    var out = "";
    for (var k = 0; k < 10; k++) out += '<i class="' + (k < level ? "on" : k === level ? "next" : "") + '" style="--k:' + k + '"></i>';
    return out;
  }

  // light the blocks one by one and tick the LV number up with them, like levelling up
  var SEG_MS = 90, SKILL_GAP_MS = 220, START_MS = 150;
  function levelUp(group) {
    var end = 0;
    $$(".skill", group).forEach(function (b, i) {
      end = Math.max(end, START_MS + i * SKILL_GAP_MS + 10 * SEG_MS + 500);
      var lv = b.querySelector(".lv"), num = lv.querySelector("b"), target = +lv.dataset.level;
      var base = START_MS + i * SKILL_GAP_MS;
      b.style.setProperty("--base", base + "ms");
      num.textContent = "0";
      for (var n = 1; n <= target; n++) {
        (function (n) {
          setTimeout(function () {
            num.textContent = n;
            if (n === target) lv.classList.add("lvup");
          }, base + n * SEG_MS);
        })(n);
      }
    });
    group.classList.add("in-view");
    // once filled, drop the intro animations so hover / pin effects can't replay them
    setTimeout(function () {
      group.classList.add("filled");
      $$(".lv.lvup", group).forEach(function (lv) { lv.classList.remove("lvup"); });
    }, end);
  }

  function renderAbout() {
    $("#skills").innerHTML = D.skills.map(function (g) {
      return '<article class="skill-group"><header><h3>' + esc(g.group) + "</h3></header>" +
        '<div class="skill-list">' + g.items.map(function (s, si) {
          return '<button type="button" class="skill" style="--i:' + si + '" aria-pressed="false" data-name="' + esc(s.name) + '" data-desc="' + esc(s.desc) + '">' +
            '<span class="skill-top"><b>' + esc(s.name) + '</b><span class="lv" data-level="' + s.level + '">LV <b>' + s.level + "</b> / 10</span></span>" +
            '<span class="bar" role="img" aria-label="' + esc(s.name) + " level " + s.level + ' of 10">' + segs(s.level) + "</span></button>";
        }).join("") + "</div>" +
        '<p class="skill-info" aria-live="polite"></p></article>';
    }).join("");

    // fill each card's bars once, the first time it scrolls into view
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ("IntersectionObserver" in window && !reduce) {
      document.documentElement.classList.add("js-anim");
      $$(".skill .lv b").forEach(function (b) { b.textContent = "0"; });
      var barIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { levelUp(e.target); barIO.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      $$(".skill-group").forEach(function (g) { barIO.observe(g); });
    }

    // description shows on hover / focus / click (click pins it)
    $$(".skill-group").forEach(function (group) {
      var info = group.querySelector(".skill-info");
      var btns = Array.prototype.slice.call(group.querySelectorAll(".skill"));
      function show(b) {
        var html = "<b>" + esc(b.dataset.name) + ":</b> " + esc(b.dataset.desc);
        if (info.innerHTML === html) return;
        info.innerHTML = html;
        info.classList.remove("say"); void info.offsetWidth; info.classList.add("say");
      }
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

  // tabs above the timeline: null = everything (life milestones included), otherwise one project category
  var TL_TABS = [
    { label: "All", cat: null },
    { label: "Game Jam", cat: "GameJam" },
    { label: "Personal", cat: "Personal" },
    { label: "Competition", cat: "Competition" },
    { label: "Class", cat: "Class" },
    { label: "Club", cat: "Club" },
    { label: "Communication", cat: "Communication" }
  ];

  function renderTimeline() {
    var tabs = $("#tl-tabs");
    if (tabs) {
      tabs.innerHTML = TL_TABS.map(function (t, i) {
        var n = t.cat ? D.projects.filter(function (p) { return hasCat(p, t.cat); }).length +
          (D.milestones || []).filter(function (m) { return m.category === t.cat; }).length : null;
        return '<button type="button" class="tl-tab" aria-pressed="' + (i === 0) + '" data-i="' + i + '">' +
          esc(t.label) + (n != null ? " <span>" + n + "</span>" : "") + "</button>";
      }).join("");
      $$(".tl-tab", tabs).forEach(function (b) {
        b.addEventListener("click", function () {
          $$(".tl-tab", tabs).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
          fillTimeline(TL_TABS[+b.dataset.i].cat);
        });
      });
    }
    fillTimeline(null);
  }

  var gaugeRefresh = null;
  function fillTimeline(cat) {
    var events = D.projects.filter(function (p) { return !cat || hasCat(p, cat); }).map(function (p) {
      return { date: p.date, project: p };
    }).concat((D.milestones || []).filter(function (m) { return !cat || m.category === cat; }).map(function (m) {
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
          '<span class="tl-kind">(' + esc(catText(p)) + (p.ongoing ? ", in progress " + pct(p) + "%" : "") + ")</span>" +
          '<p class="tl-note">' + val(p.outcome) + "</p></li>";
      }).join("") + "</ol>";
    }).join("");

    var preview = $("#tl-preview");
    preview.classList.remove("is-open");
    $$(".tl-item").forEach(function (li) {
      li.addEventListener("mouseenter", function () { showPreview(li); });
      li.addEventListener("mouseleave", hidePreview);
      li.addEventListener("focusin", function () { showPreview(li); });
      li.addEventListener("focusout", hidePreview);
    });
    if (preview.dataset.bound) { gaugeRefresh(); return; }
    preview.dataset.bound = "1";
    preview.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    preview.addEventListener("mouseleave", hidePreview);
    preview.addEventListener("focusin", function () { clearTimeout(hideTimer); });
    preview.addEventListener("focusout", hidePreview);
    gaugeRefresh = timelineGauge();
  }

  // preview panel helpers (shared by every tab render)
  var hideTimer = null;
  function previewProject(p) {
    var poster = thumbOf(p);
    return (poster ? '<div class="media"><img src="' + esc(poster) + '" alt=""></div>' : "") +
      '<h3 class="tl-preview-title">' + esc(p.title) + "</h3>" +
      '<p class="card-meta">' + esc(catText(p)) + " · " + (p.ongoing ? "Since " : "") + fmtDate(p.date) + " · " + statusText(p) + "</p>" +
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
  function showPreview(li) {
    var preview = $("#tl-preview");
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
      $("#tl-preview").classList.remove("is-open");
      $$(".tl-item").forEach(function (o) { o.classList.remove("is-active"); });
    }, 150);
  }

  /* ---------- timeline gauge: the spine fills as you scroll, each dot lights up when reached ---------- */

  // returns refresh(), called again after a tab re-renders the list
  function timelineGauge() {
    var list = $("#timeline-list");
    var spine = document.createElement("span");
    spine.className = "tl-spine";
    spine.setAttribute("aria-hidden", "true");
    spine.innerHTML = '<span class="tl-spine-fill"></span>';
    var fill = spine.firstChild;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dots = [];

    // centre of each checkpoint square: year squares are vertically centred, entry squares sit 26px down
    var top = 0, height = 0, dotY = [];
    function measure() {
      if (!dots.length) return;
      var base = list.getBoundingClientRect().top;
      dotY = dots.map(function (d) {
        var r = d.getBoundingClientRect();
        return r.top - base + (d.classList.contains("tl-year") ? r.height / 2 : 26);
      });
      top = dotY[0];
      height = Math.max(1, dotY[dotY.length - 1] - top);
      spine.style.top = top + "px";
      spine.style.height = height + "px";
      // how many 16px blocks fit in each year's rule (the space right of the year text)
      dots.forEach(function (d) {
        if (!d.classList.contains("tl-year")) return;
        var range = document.createRange();
        range.selectNodeContents(d);
        var textRight = range.getBoundingClientRect().right;
        var w = d.getBoundingClientRect().right - textRight - 14;
        d.style.setProperty("--blocks", Math.max(1, Math.ceil(w / 16)));
      });
    }

    var ticking = false;
    function update() {
      ticking = false;
      if (!dots.length) return;
      var line = innerHeight * 0.6 - list.getBoundingClientRect().top; // reading line, in list coordinates
      var f = Math.min(1, Math.max(0, (line - top) / height));
      fill.style.transform = "scaleY(" + f.toFixed(4) + ")";
      dots.forEach(function (d, i) {
        var on = dotY[i] <= line;
        if (on !== d.classList.contains("reached")) d.classList.toggle("reached", on);
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    function refresh() {
      dots = $$(".tl-year, .tl-item", list); // checkpoints in reading order
      list.insertBefore(spine, list.firstChild);
      measure();
      if (reduce) {
        fill.style.transform = "scaleY(1)";
        dots.forEach(function (d) { d.classList.add("reached"); });
      } else {
        update();
      }
    }

    if (!reduce) {
      list.classList.add("tl-gauge");
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", function () { measure(); onScroll(); });
    window.addEventListener("load", function () { measure(); onScroll(); }); // logos change heights once loaded
    refresh();
    return refresh;
  }

  /* ---------- boot ---------- */

  var pages = { home: renderHome, category: renderCategory, project: renderProject, about: renderAbout };
  if (pages[body.dataset.page]) pages[body.dataset.page]();
  renderContact();
  themeToggle();
  toTop();

  /* Top: a sticker button in the bottom right corner, shown once you have scrolled past the first screen */
  function toTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.hidden = true;
    btn.innerHTML = '<span aria-hidden="true">&uarr;</span> Top';
    btn.setAttribute("aria-label", "Back to the top of the page");
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
      var skip = $(".skip-link"); if (skip) skip.focus({ preventScroll: true });
    });
    body.appendChild(btn);
    function update() { btn.hidden = window.scrollY < window.innerHeight * 0.8; }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* light / dark switch at the end of the header. Dark is the default; a click stores the choice
     (the inline script in <head> applies it before paint). */
  function themeToggle() {
    var bar = $(".header-inner");
    if (!bar) return;
    var root = document.documentElement;
    function current() { return root.dataset.theme === "light" ? "light" : "dark"; }
    var moon = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6 1h4v1H8v1H7v2H6v6h1v1h1v1h2v1h3v1h-1v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h3z"/></svg>';
    var sun = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 0h2v2H7zM7 14h2v2H7zM0 7h2v2H0zM14 7h2v2h-2zM2 2h2v2H2zM12 2h2v2h-2zM2 12h2v2H2zM12 12h2v2h-2zM6 4h4v1h1v1h1v4h-1v1h-1v1H6v-1H5v-1H4V6h1V5h1z"/></svg>';
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    function paint() {
      var dark = current() === "dark";
      btn.innerHTML = dark ? sun : moon;
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.title = btn.getAttribute("aria-label");
    }
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      paint();
    });
    paint();
    bar.appendChild(btn);
  }
  /* Row-by-row scroll snap (css "scroll snap") is meant for a mouse wheel. A touchpad sends many small,
     smooth wheel steps plus inertia, and mandatory snapping keeps yanking that to the next stop, which feels
     rough on a Mac. On the first touchpad-like wheel event we switch to free scrolling (.free-scroll) and
     remember it for the rest of the visit. A notched mouse wheel sends steps of about 100px and no sideways
     part, so it keeps the snap. */
  function freeScrollOnTouchpad() {
    var root = document.documentElement, KEY = "free-scroll";
    try { if (sessionStorage.getItem(KEY)) root.classList.add("free-scroll"); } catch (e) {}
    if (root.classList.contains("free-scroll")) return;
    function onWheel(e) {
      if (e.ctrlKey) return;                                   // pinch zoom, not a scroll
      var touchpad = e.deltaMode === 0 && (e.deltaX !== 0 || Math.abs(e.deltaY) < 40);
      if (!touchpad) return;
      window.removeEventListener("wheel", onWheel);
      // keep the card under the middle of the screen where it is while the layout drops its big gaps
      var mid = innerHeight / 2, anchor = null, best = Infinity;
      $$(".tile, .more-link, section").forEach(function (el) {
        var r = el.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (r.height && d < best) { best = d; anchor = el; }
      });
      var before = anchor && anchor.getBoundingClientRect().top;
      root.classList.add("free-scroll");
      if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: "instant" });
      try { sessionStorage.setItem(KEY, "1"); } catch (e2) {}
    }
    window.addEventListener("wheel", onWheel, { passive: true });
  }
  freeScrollOnTouchpad();

  /* Home with snapping on: the hero is one stop, so it has to fit on one screen. Its height follows its width
     (the reel is 16:9), so on short windows narrow the hero until it fits under the header. */
  function fitHero() {
    var hero = $('body[data-page="home"] .hero');
    if (!hero) return;
    var box = hero.querySelector(".container"), header = $(".site-header");
    var snapMQ = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px) and (min-height: 640px)");
    function fit() {
      box.style.maxWidth = "";
      if (!snapMQ.matches || document.documentElement.classList.contains("free-scroll")) return;
      var room = innerHeight - (header ? header.offsetHeight : 0);
      var w = box.offsetWidth;
      // the hero has min-height of one screen now, so measure its content (grid + 24px padding top and bottom)
      while (box.offsetHeight + 48 > room && w > 760) {
        w -= 20;
        box.style.maxWidth = w + "px";
      }
    }
    var t;
    function later() { clearTimeout(t); t = setTimeout(fit, 100); }
    fit();
    addEventListener("resize", later);
    addEventListener("load", fit);
    if (document.fonts) document.fonts.ready.then(fit);
    // the touchpad switch turns snapping off, so the hero can go back to full width
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }
  fitHero();

  /* About: the bio is one snap stop, so on short windows it shrinks (CSS zoom, same line breaks) until it fits
     under the header. Only while snapping is on: free scrolling keeps the normal size. */
  function fitAbout() {
    var box = $('body[data-page="about"] .about > .container');
    if (!box) return;
    var header = $(".site-header");
    var snapMQ = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px) and (min-height: 640px)");
    function fit() {
      box.style.zoom = "";
      if (!snapMQ.matches || document.documentElement.classList.contains("free-scroll")) return;
      var room = innerHeight - (header ? header.offsetHeight : 0) - 48; // 24px of air above and below
      var h = box.offsetHeight;
      if (h > room) box.style.zoom = Math.max(0.6, room / h).toFixed(3);
    }
    var t;
    function later() { clearTimeout(t); t = setTimeout(fit, 100); }
    fit();
    addEventListener("resize", later);
    addEventListener("load", fit);
    if (document.fonts) document.fonts.ready.then(fit);
    new MutationObserver(later).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }
  fitAbout();

  $$(".year").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
