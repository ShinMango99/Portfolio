# Jaemin Cho · Game Developer Portfolio

A static, single-page portfolio for GitHub Pages:
**https://shinmango99.github.io/Portfolio/**

Plain HTML + CSS + vanilla JS. No framework, no build step.

```
index.html          page shell (sections, modal)
css/style.css       all styles; palette is the 8 variables at the top of :root
js/data.js          ALL content: profile, skills, categories, projects
js/sprites.js       temporary 16x16 pixel sprites (string grids -> inline SVG)
js/main.js          rendering + interactions (no content here)
assets/img/         posters / thumbnails (<id>.jpg) and og.png (social preview)
assets/video/       trailers (<id>.mp4)
assets/pixel/       your own pixel art (overrides the generated sprites), favicon
.nojekyll           tells GitHub Pages to serve files as-is
```

The site is served from the sub-path `/Portfolio/`, so **every path must be relative**
(`assets/img/a.png`, never `/assets/img/a.png`).

## Preview locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Add `?todo` to the URL (http://localhost:8000/?todo) to
highlight every field that is still `"TODO"` in red. Without it, TODO fields are shown
as a neutral "Details coming soon" and TODO contact links are hidden.

## Edit content (js/data.js)

Everything visible on the page comes from `js/data.js`.

- **Hero text:** `profile.intro`, and `profile.typedPhrases` for the rotating "I'm confident in ___." words.
- **Featured project next to the hero:** `profile.featured` = a project `id`.
- **Contact:** `profile.contact.email` / `linkedin` (replace `"TODO"`).
- **Skills:** `skills[].items[]` with `name`, `level` (0 to 10), `desc`. Levels of 5 or less get a mint "leveling up" bar.
- **Projects:** one object per entry. They are sorted automatically: ongoing first, then newest date.

| field | meaning |
|---|---|
| `id` | unique, URL-safe. Also the deep link: `.../Portfolio/#shh` opens that project |
| `title`, `category` | category must be a key of `categories` (GameJam, Class, Club, Competition, Personal, Teaching) |
| `date` | `YYYY-MM-DD` (start date if ongoing) |
| `ongoing`, `completion`, `status` | `ongoing: true` puts it under **NOW**; `completion` 0 to 1 drives the progress bar |
| `featured` | `true` adds the FEATURED ribbon and pins it first in Selected Work |
| `links` | `{ itch, instagram, youtube }`, `null` to hide a button |
| `summary` | one line for the timeline / cards |
| `description` | longer text for the modal (falls back to `summary`) |
| `role`, `tools`, `team`, `outcome` | shown in the modal; `outcome` is the "RESULT" line on the timeline |
| `poster` | thumbnail / trailer poster image |
| `video` | local trailer, e.g. `"assets/video/shh.mp4"` |
| `preview` | optional GIF shown in the timeline preview panel |
| `pixel` | optional PNG that replaces the generated sprite |

Teaching entries (category `Teaching`) appear in the timeline and in the Teaching & Community section,
not in Selected Work.

## Add a trailer video

1. Compress it (keep each file under ~25 MB; GitHub rejects files over 100 MB):

   ```bash
   ffmpeg -i input.mp4 -vf "scale='min(1280,iw)':-2,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart assets/video/shh.mp4
   ```

   Still too big? Raise `-crf` (28 to 30) or scale to 960. Add `-an` to drop audio.
   For the muted hover preview a shorter clip is enough: add `-t 15`.

2. Optional poster frame:

   ```bash
   ffmpeg -ss 00:00:03 -i assets/video/shh.mp4 -frames:v 1 -q:v 3 assets/img/shh.jpg
   ```

3. In `js/data.js` set `video: "assets/video/shh.mp4"` and `poster: "assets/img/shh.jpg"`.

**Fallback order:** local mp4 → `links.youtube` (loaded as a youtube-nocookie iframe only after the
play button is clicked) → pixel "Trailer coming soon" card (with an Instagram button if there is a link).
If the mp4 path is wrong, the player switches to the next fallback instead of showing a broken player.

## Swap the pixel art

The temporary sprites live in `js/sprites.js`. To use your own art, without touching code:

- **A project's icon:** set `pixel: "assets/pixel/shh.png"` on that project.
- **A category icon** (GameJam, Class, …): set `pixel` on the category in `categories`.
- **A skill group icon:** set `pixel` on the group in `skills`.
- **Hero character:** set `profile.pixel: "assets/pixel/hero.png"` (shown static; the generated one bobs and blinks).

Export at 16×16 (or any multiple, like 64×64) as PNG with transparency. It is scaled with
`image-rendering: pixelated`, so it stays crisp. To tweak a generated sprite instead, edit
its string grid in `js/sprites.js` (one character = one pixel; `.` is transparent).

`assets/pixel/favicon.svg`, `favicon-32.png` and `assets/img/og.png` (the social preview, 1200×630)
are generated placeholders too; replace them with files of the same names.

## Turn on GitHub Pages

1. Push this folder to the `Portfolio` repository (files at the repo root, `index.html` at the top level).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   Branch: **main**, folder: **/ (root)** → Save.
3. After a minute the site is live at https://shinmango99.github.io/Portfolio/.

Do not commit `Cho_Jaemin_Content_List.xlsx`; it is listed in `.gitignore`.

## Accessibility and motion

- Every hover effect also works on keyboard focus and tap (skill chips, timeline preview, card previews).
- `prefers-reduced-motion: reduce` turns off typing, bobbing, scroll-driven animations, hover pops,
  video previews and the level-up popup. The timeline is shown fully "lit" instead.
- The timeline spine uses CSS scroll-driven animations where supported, with a JS fallback.
