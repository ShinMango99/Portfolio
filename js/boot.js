/* First visit to Home: a game-style loading screen. The master reel plays big while a block bar fills
   over its opening title card, then the reel flies into its spot in the hero and the dark backdrop
   falls apart in pixel blocks.
   index.html decides before paint whether to show it (html.is-booting): once per browser session, only
   when Home is where the visit starts, never with reduced motion or data saver. Any key, click, tap or
   wheel skips ahead. main.js takes over the same <video> (BOOT.land), so the reel keeps playing from
   the same frame and the file is loaded only once. */
(function () {
  "use strict";

  var root = document.documentElement;
  var el = document.querySelector(".boot");
  var prof = window.PORTFOLIO && window.PORTFOLIO.profile;
  if (!el) return;
  if (!root.classList.contains("is-booting") || !prof || !prof.reelLoop) {
    root.classList.remove("is-booting");
    el.remove();
    return;
  }

  var BLOCKS = 20;
  var INTRO = prof.reelIntro || 4;   // seconds of the reel the bar spans (its title card)
  var video = el.querySelector("video");
  var back = el.querySelector(".boot-back");
  var frame = el.querySelector(".boot-screen");
  var label = el.querySelector(".boot-label");
  var pct = el.querySelector(".boot-pct");
  var bar = el.querySelector(".boot-bar");
  var hover = matchMedia("(hover: hover)").matches;

  bar.innerHTML = new Array(BLOCKS + 1).join("<i></i>");
  var segs = bar.children;
  var tips = [
    "Every project page has the trailer, my role and a playable link.",
    "Solo, Team and Communication at the top sort my work by how it was made."
  ];
  if (hover) tips.push("Hover a game cover to watch it move.");
  el.querySelector(".boot-tip").innerHTML = "<b>Tip</b> " + tips[Math.floor(Math.random() * tips.length)];
  el.querySelector(".boot-skip span").textContent = hover ? "Press any key to skip" : "Tap to skip";

  // the reel is the clock: the bar reaches 100% as the title card ends. If it can't play, a timer stands in.
  var stuck = false;
  video.muted = true; // the property, not just the attribute, is what lets autoplay start
  video.preload = "auto";
  video.addEventListener("error", function () { stuck = true; }, { once: true });
  video.src = prof.reelLoop;
  var pr = video.play();
  if (pr && pr.catch) pr.catch(function () { stuck = true; });

  var landing = null, afters = [], leaving = false;
  window.BOOT = {
    // main.js: the box in the hero the reel lands in, and what to do with the <video> once it is there.
    // false when the screen is already on its way out.
    land: function (target, cb) {
      if (leaving) return false;
      landing = { target: target, cb: cb };
      return true;
    },
    // run fn once the page is uncovered (right away if it already is)
    after: function (fn) { if (leaving) fn(); else afters.push(fn); }
  };

  var lit = 0, t = 0, prev = 0, raf = 0;
  function tick(now) {
    // count only frames that were drawn, so a tab opened in the background still shows the whole intro
    t += prev ? Math.min(now - prev, 100) / 1000 : 0;
    prev = now;
    var p = Math.min(1, Math.max(video.currentTime / INTRO, t / (stuck ? 1.2 : INTRO * 1.8)));
    for (var n = Math.floor(p * BLOCKS); lit < n; lit++) segs[lit].className = "on";
    pct.textContent = Math.floor(p * 100) + "%";
    if (p < 1) { raf = requestAnimationFrame(tick); return; }
    label.textContent = "Ready";
    el.classList.add("is-ready");
    setTimeout(leave, 400);
  }
  raf = requestAnimationFrame(tick);

  // skip ahead. Keys that scroll and the wheel are swallowed, or the page would jump a section as it shows.
  var SCROLL_KEYS = /^( |Spacebar|PageUp|PageDown|ArrowUp|ArrowDown|Home|End)$/;
  function onKey(e) {
    if (/^(Shift|Control|Alt|Meta)$/.test(e.key)) return;
    if (SCROLL_KEYS.test(e.key)) e.preventDefault();
    leave();
  }
  function onWheel(e) { e.preventDefault(); leave(); }
  addEventListener("keydown", onKey, true);
  addEventListener("wheel", onWheel, { capture: true, passive: false });
  addEventListener("pointerdown", leave, true);

  function leave() {
    if (leaving) return;
    leaving = true;
    cancelAnimationFrame(raf);
    // the page stays locked until the screen is gone, but its own animations (the proof cards unlocking) start now
    root.classList.add("boot-leaving");
    root.classList.remove("is-booting");
    afters.splice(0).forEach(function (fn) { fn(); });
    var to = landing && video.readyState >= 2 && !video.error && onScreen(landing.target);    if (to) {
      var from = frame.getBoundingClientRect();
      frame.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
      frame.style.transform = "translate(" + (to.left - from.left) + "px, " + (to.top - from.top) + "px) scale(" + to.width / from.width + ")";
    }
    crumble(to ? back : el, 440);
    setTimeout(finish, to ? 640 : 480);
  }

  function finish() {
    if (landing) landing.cb(video); // moves the <video> into the hero
    el.remove();
    root.classList.remove("boot-leaving");
    removeEventListener("keydown", onKey, true);
    removeEventListener("wheel", onWheel, { capture: true, passive: false });
    removeEventListener("pointerdown", leave, true);
  }

  function onScreen(target) {
    var r = target.getBoundingClientRect();
    return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight ? r : null;
  }

  // the backdrop falls apart in square blocks, top rows first with a ragged edge: a clip path of the blocks
  // still standing, redrawn in 8 steps (a CSS mask image would blink while each new image decodes)
  function crumble(node, ms) {
    var STEPS = 8;
    var size = Math.max(20, Math.round(innerWidth / 40));
    var cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size);
    var blocks = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        blocks.push({ d: "M" + c * size + " " + r * size + "h" + size + "v" + size + "h-" + size + "z", at: (r / rows) * 0.6 + Math.random() * 0.4 });
      }
    }
    var k = 0;
    (function step() {
      k++;
      var d = "";
      blocks.forEach(function (b) { if (b.at >= k / STEPS) d += b.d; });
      node.style.webkitClipPath = node.style.clipPath = d ? 'path("' + d + '")' : "inset(50%)";
      if (k < STEPS) setTimeout(step, ms / STEPS);
    })();
  }
})();
