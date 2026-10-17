/*
 * Temporary 16x16 pixel sprites, drawn as string grids and rendered to
 * inline SVG. Replace any of them without touching code by setting the
 * "pixel" field of an entry in js/data.js to a PNG in assets/pixel/.
 *
 * One character = one pixel. "." is transparent; other letters map to
 * PALETTE below.
 */
(function () {
  "use strict";

  var PALETTE = {
    k: "#14121f", // outline
    w: "#f4ead5", // paper
    y: "#ffcc4d", // gold
    m: "#5ee6a8", // mint
    r: "#ff6b8b", // rose
    s: "#5bc0ff", // sky
    v: "#b18cff", // violet
    f: "#f6c7a1", // skin
    h: "#3b2a4a", // hair
    d: "#2b2840", // dark cloth
    n: "#1d2b4a", // screen navy
    o: "#9a5b34", // wood
    g: "#2f5d50"  // chalkboard
  };

  var HERO = [
    "........mm......",
    ".......mm.......",
    ".....kkkkkk.....",
    "....kyyyyyyk....",
    "...kyyyyyyyyk...",
    "...khhhhhhhhk...",
    "...khffffffhk...",
    "...kfkffffkfk...",
    "...kfkffffkfk...",
    "....kffrrffk....",
    ".....kkkkkk.....",
    "....kssssssk....",
    "...kfssssssfk...",
    "....kssssssk....",
    "....kddkkddk....",
    "....kkk..kkk...."
  ];
  var HERO_BLINK = HERO.slice();
  HERO_BLINK[7] = "...kffffffffk...";
  HERO_BLINK[8] = "...kfkkffkkfk...";

  var SPRITES = {
    hero: HERO,
    heroBlink: HERO_BLINK,

    programming: [
      "................",
      ".kkkkkkkkkkkkkk.",
      ".knnnnnnnnnnnnk.",
      ".knnnnnnnnnnnnk.",
      ".knnnmnnnmmnnnk.",
      ".knnmnnnnmnmnnk.",
      ".knmnnnnmnnnmnk.",
      ".knnmnnmnnnmnnk.",
      ".knnnmnmnnmnnnk.",
      ".knnnnnnnnnnnnk.",
      ".knnnnnnnnnnnnk.",
      ".kkkkkkkkkkkkkk.",
      "......kwwk......",
      "....kkkkkkkk....",
      "...kwwwwwwwwk...",
      "...kkkkkkkkkk..."
    ],

    engine: [
      "................",
      "......kkkk......",
      "..kk..kyyk..kk..",
      "..kykkkyykkkyk..",
      "..kyyyyyyyyyyk..",
      "...kyykkkkyyk...",
      ".kkkyk....kykkk.",
      ".kyyyk....kyyyk.",
      ".kyyyk....kyyyk.",
      ".kkkyk....kykkk.",
      "...kyykkkkyyk...",
      "..kyyyyyyyyyyk..",
      "..kykkkyykkkyk..",
      "..kk..kyyk..kk..",
      "......kkkk......",
      "................"
    ],

    art: [
      "................",
      "....kkkkkkk.....",
      "..kkwwwwwwwkk...",
      ".kwwrrwwwsswwk..",
      ".kwwrrwwwsswwwk.",
      "kwwwwwwwwwwwwwk.",
      "kwmmwwwkkkwwwwk.",
      "kwmmwwk...kwyyk.",
      "kwwwwwk...kwyyk.",
      "kwwwwwwkkkwwwwk.",
      ".kwvvwwwwwwwwk..",
      ".kwvvwwwwwwwk...",
      "..kkwwwwwwkk....",
      "....kkkkkk......",
      "................",
      "................"
    ],

    communication: [
      "................",
      ".kkkkkkkkkkkkk..",
      "kwwwwwwwwwwwwwk.",
      "kwwwwwwwwwwwwwk.",
      "kwwsswwsswwsswk.",
      "kwwsswwsswwsswk.",
      "kwwwwwwwwwwwwwk.",
      ".kkkkwwkkkkkkk..",
      "....kwk.........",
      "....kk..kkkkkkk.",
      ".......kmmmmmmmk",
      ".......kmmmmmmmk",
      "........kkkkkmkk",
      ".............kk.",
      "................",
      "................"
    ],

    gamejam: [
      "................",
      "................",
      "................",
      "................",
      "...kkkkkkkkkk...",
      "..kwwwwwwwwwwk..",
      ".kwwkwwwwwwrwwk.",
      ".kwkkkwwwwrwswk.",
      ".kwwkwwwwwwywwk.",
      ".kwwwwwkkwwwwwk.",
      ".kwwwwk..kwwwwk.",
      "..kkkk....kkkk..",
      "................",
      "................",
      "................",
      "................"
    ],

    class: [
      "................",
      "..kkkkkkkkkkkk..",
      "..kskssssssssk..",
      "..kskswwwwwwsk..",
      "..kskskkkkkksk..",
      "..kskssssssssk..",
      "..kskssssssssk..",
      "..kskssssssssk..",
      "..kskssssssssk..",
      "..kskssssssssk..",
      "..kskssssssssk..",
      "..kskwwwwwwwwk..",
      "..kkkkkkkkkkkk..",
      "................",
      "................",
      "................"
    ],

    club: [
      "................",
      "................",
      "................",
      "...kkk....kkk...",
      "..kfffk..kfffk..",
      "..kfffk..kfffk..",
      "...kkk....kkk...",
      "..kmmmk..kmmmk..",
      ".kmmmmmkkmmmmmk.",
      ".kmmmmmkkmmmmmk.",
      ".kmmmmmkkmmmmmk.",
      ".kkkkkkkkkkkkkk.",
      "................",
      "................",
      "................",
      "................"
    ],

    competition: [
      "................",
      "..kkkkkkkkkkkk..",
      ".kkyyyyyyyyyykk.",
      "k.kyyyywyyyyyk.k",
      "k.kyyywyyyyyyk.k",
      ".kkyyyyyyyyyykk.",
      "...kyyyyyyyyk...",
      "....kyyyyyyk....",
      ".....kyyyyk.....",
      "......kyyk......",
      "......kyyk......",
      ".....kkyykk.....",
      "....kyyyyyyk....",
      "...kkkkkkkkkk...",
      "...koooooooook..",
      "...kkkkkkkkkk..."
    ],

    personal: [
      "................",
      "................",
      "..kkkk....kkkk..",
      ".kvvvvk..kvvvvk.",
      "kvvwwvvkkvvvvvvk",
      "kvwwvvvvvvvvvvvk",
      "kvwvvvvvvvvvvvvk",
      "kvvvvvvvvvvvvvvk",
      ".kvvvvvvvvvvvvk.",
      "..kvvvvvvvvvvk..",
      "...kvvvvvvvvk...",
      "....kvvvvvvk....",
      ".....kvvvvk.....",
      "......kvvk......",
      ".......kk.......",
      "................"
    ],

    teaching: [
      "................",
      "kkkkkkkkkkkkkkkk",
      "kooooooooooooook",
      "koggggggggggggok",
      "kogwwgggggggggok",
      "koggwwgwgwggggok",
      "koggggggwwwwggok",
      "koggggggggggggok",
      "koggwwwwwgggggok",
      "koggggggggggggok",
      "kooooooooooooook",
      "kkkkkkkkkkkkkkkk",
      "...kk......kk...",
      "..kk........kk..",
      ".kk..........kk.",
      "................"
    ]
  };

  function normalize(rows) {
    var out = [];
    for (var i = 0; i < 16; i++) {
      var row = rows[i] || "";
      while (row.length < 16) row += ".";
      out.push(row.slice(0, 16));
    }
    return out;
  }

  // Builds an SVG string; merges horizontal runs of the same colour.
  function svg(name, label, extraClass) {
    var rows = SPRITES[name];
    if (!rows) return "";
    rows = normalize(rows);
    var rects = "";
    for (var y = 0; y < 16; y++) {
      var x = 0;
      while (x < 16) {
        var c = rows[y][x];
        var run = 1;
        while (x + run < 16 && rows[y][x + run] === c) run++;
        if (c !== "." && PALETTE[c]) {
          rects += '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' + PALETTE[c] + '"/>';
        }
        x += run;
      }
    }
    var a11y = label
      ? ' role="img" aria-label="' + String(label).replace(/"/g, "&quot;") + '"'
      : ' aria-hidden="true" focusable="false"';
    return (
      '<svg class="sprite' + (extraClass ? " " + extraClass : "") + '" viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"' +
      a11y + ">" + rects + "</svg>"
    );
  }

  window.Sprites = { svg: svg, names: Object.keys(SPRITES), palette: PALETTE };
})();
