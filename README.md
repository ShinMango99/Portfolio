# Jaemin Cho · Game Developer Portfolio (rough draft)

Static single-page portfolio for GitHub Pages: **https://shinmango99.github.io/Portfolio/**

Plain HTML + CSS + vanilla JS, no build step. This is a rough draft: plain layout, Times New Roman,
empty icon boxes. The earlier pixel-style version is kept in `초안/`.

```
index.html       page shell
css/style.css    styles (colours/fonts are the variables at the top)
js/data.js       ALL content: profile, skills, milestones, projects
js/main.js       rendering only
assets/          images, videos, icons (empty for now)
```

All paths must stay **relative** (`assets/img/a.png`, never `/assets/...`) because the site lives under `/Portfolio/`.

## Preview locally

```bash
python -m http.server 8000
```

Open http://localhost:8000. Anything still `"TODO"` in `data.js` shows as a grey **[TODO]** on the page.

## Edit content (js/data.js)

- **Timeline:** built automatically from `projects` + `milestones`, oldest first (2022 → now).
  Add a life event: `{ date: "2025-08", title: "Returned to school" }` (`YYYY-MM` or `YYYY-MM-DD`).
- **Projects:** `id` (also the link: `#shh` jumps to the card), `title`, `category`, `date`, `ongoing`,
  `completion` (0 to 1), `links {itch, instagram, youtube}`, `summary`, `role`, `tools`, `team`, `outcome`.
- **Thumbnails:** `poster` if set, otherwise the YouTube thumbnail, otherwise an empty box.
- **Hide a row:** set a field to `null` (e.g. `team: null`); `"TODO"` shows a grey [TODO] instead.
- **Timeline logos / ranges:** milestones accept `image` (small round logo) and `end` (date range).
- **Hero:** `profile.photo` = profile picture, `profile.featured` = project id whose trailer is shown at the top right.

## Add a trailer

YouTube: put the link in `links.youtube` (it loads only when "Play trailer" is clicked).

Local mp4 (keep under ~25 MB; GitHub's limit is 100 MB):

```bash
ffmpeg -i input.mp4 -vf "scale='min(1280,iw)':-2,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart assets/video/shh.mp4
```

Then set `video: "assets/video/shh.mp4"`. Order: local mp4 → YouTube → "no trailer yet" box.

## Turn on GitHub Pages

1. Push this folder to a repository named **Portfolio** (`index.html` at the root).
2. **Settings → Pages → Deploy from a branch → main / (root) → Save**.
3. The site appears at https://shinmango99.github.io/Portfolio/ after a minute or two.

`Cho_Jaemin_Content_List.xlsx` is excluded by `.gitignore`.
