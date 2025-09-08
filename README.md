# Life OS — Etherious (Static PWA)

A lightweight, **offline-capable** website for your daily/weekly planning, goals, job search pipeline, and health tracking.

## Features
- LocalStorage persistence (edits are auto-saved)
- Import/Export JSON backups
- Print-friendly views
- Dark/Light theme toggle
- Installable as a PWA (works offline)
- Pure HTML/CSS/JS (no build step, no frameworks)

## Quick Start (local)
Just open `index.html` in a modern browser. To enable service worker (offline) locally, serve with any static server:
```bash
# Python
python3 -m http.server 5173
# Or Node
npx http-server -p 5173
```
Then visit http://localhost:5173

## Deploy Options
### GitHub Pages (free)
1. Create a new repo and push these files.
2. In repo Settings → Pages, choose **Deploy from branch**, select `main` and `/ (root)`.
3. Your site will be available at `https://<your-username>.github.io/<repo-name>/`.

### Netlify (free tier)
- Drag-and-drop the folder onto Netlify dashboard **or** connect your repo; set build command to **None** and publish directory to `/`.

### Vercel (free tier)
- Import the repo in Vercel, Framework preset: **Other** (no build). Output directory: `/`.

### Cloudflare Pages
- Create a new project from the repo, Framework: **None**. Output directory `/`.

## Customize
- Edit section labels and defaults in `app.js` (`state.data`).
- Adjust colors in `index.html` (CSS variables in `:root` and `[data-theme="light"]`).
- Add sections: modify `state.tabs` and create a corresponding `*View()`.

## Data Safety
This app stores data in your browser’s localStorage. For multi-device sync, regularly **Export JSON** and import on your other device—or host a simple private repo to keep backups.

## License
MIT
