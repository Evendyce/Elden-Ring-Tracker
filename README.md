# Elden Ring — Route/Completionist Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-2ea44f?logo=githubpages\&logoColor=white)](https://evendyce.github.io/Elden-Ring-Tracker/?route=ranni)

An interactive, spoiler‑aware checklist for a **Ranni Route** (and future routes) through *Elden Ring*, built as a static web app. Track bosses, dungeons, NPC quest breakpoints, missables, and gear — with progress saved locally and export/import support.

---

## ✨ Features

* **Routes dropdown** — Choose which run you’re following (data‑driven via `public/data/manifest.json`).
* **Per‑route progress** — LocalStorage state is namespaced per route, so switching routes won’t mix your checkboxes.
* **Single‑column, collapsible phases** — Clean reading flow; each phase and section is a `<details>` block.
* **Search & filters** — Type filters (`boss`, `dungeon`, `npc`, `gear`, `talisman`, `ash`, `map`, `quest`, `warning`) + “Incomplete only”.
* **Fast toggling** — *Shift‑click* any checkbox to toggle the entire section.
* **Custom notes** — Add your own checklist items (goes under Phase 1 → “Custom”).
* **Export/Import** — Download/upload your progress as JSON.
* **Shareable URLs** — Route is in the URL as `?route=ranni` for easy sharing.

---

## 🚀 Live

**GitHub Pages:** [https://evendyce.github.io/Elden-Ring-Tracker/?route=ranni](https://evendyce.github.io/Elden-Ring-Tracker/?route=ranni)

> If you see a cached version after deploying, hard‑refresh (Ctrl/Cmd + Shift + R). Pages can take a minute to update.

---

## 🗂️ Project layout

```
Elden-Ring-Tracker/
├─ public/
│  ├─ index.html          # main entry (serves the app)
│  ├─ tracker.css         # UI styles
│  ├─ app.v5.js           # main app logic (route loader + UI)
│  └─ data/
│     ├─ manifest.json    # list of available routes
│     └─ ranni.json       # current route (you can add more)
└─ .github/
   └─ workflows/
      └─ pages.yml        # deploys /public to GitHub Pages
```

---

## 🛠️ Local development

Because routes are fetched as JSON, run a tiny local server (instead of opening the HTML directly):

```bash
# from the repo root
python -m http.server 8000
# then open http://localhost:8000/public
```

VS Code users: the **Live Server** extension works great as well.

---

## 🌐 Deploying to GitHub Pages (via Actions)

This repo ships with a minimal workflow that publishes the **`public/`** folder.

`.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: public
      - id: deployment
        uses: actions/deploy-pages@v4
```

After the first run completes, the public site lives at:

```
https://<your-username>.github.io/<repo-name>/
```

---

## 📦 Data model (route JSON)

Each route file (`public/data/*.json`) has a simple shape:

```jsonc
{
  "phases": [
    {
      "id": "p1",
      "title": "Phase 1 — Limgrave & Weeping Peninsula (Lv 1–25)",
      "tag": "Start",
      "sections": [
        {
          "name": "Core Steps",
          "items": [
            { "id": "p1-core-1", "type": "quest", "label": "Start as Samurai (Uchigatana bleed base)" }
          ]
        }
      ]
    }
  ]
}
```

**Allowed `type` values:** `boss`, `dungeon`, `npc`, `gear`, `talisman`, `ash`, `map`, `quest`, `warning`

> Make sure item `id`s are unique within a route. Progress keys are saved per route, so overlap between routes is OK.

### `manifest.json`

```json
{
  "routes": [
    { "id": "ranni", "name": "Ranni Route (Completionist)", "file": "ranni.json" }
  ],
  "default": "ranni"
}
```

---

## ➕ Adding a new route

1. Duplicate `public/data/ranni.json` → `public/data/<your-route>.json` and edit the content.
2. Append the new route to `public/data/manifest.json`:

   ```json
   { "id": "all_endings", "name": "All Endings (Everything)", "file": "all_endings.json" }
   ```
3. Load it from the app via the **Routes** dropdown, or link directly with `?route=all_endings`.

> Tip: keep `id` prefixes (like `p1-`, `p2-`, etc.) consistent for easier diffing and future tooling.

---

## 🧭 Usage tips

* **Shift‑click** a checkbox to toggle all items in that section.
* Use the **filters** to focus on bosses, dungeons, NPCs, etc.
* The **warning** tag highlights missables/timing (e.g., *Bolt of Gransax before Ashen Capital*).
* Add personal notes with the **Add your own item** control (under Phase 1 → “Custom”).

---

## 🗺️ Roadmap / planned features

* **Markdown export** (grouped by phase with ✅/⬜ markers for sharing).
* **More routes:** All‑Endings route, Challenge runs (e.g., RL1, NG+), DLC permutations.
* **Micro‑beats expansion:** every catacomb/evergaol fully broken out per region.
* **NPC quest helpers:** dynamic hints for when a step becomes available.
* **Search params:** include search text and filters in the URL for sharable views.
* **Mobile niceties:** sticky section headers, bigger taps, optional compact mode.
* **Optional cloud sync** (behind a toggle) via GitHub Gist or a simple backend.

> Have ideas? Open an issue or PR!

---

## 🤝 Contributing

PRs welcome! Please keep PRs small and focused.

* Add or update a route file under `public/data/`.
* Update `manifest.json` when adding a new route.
* Keep IDs stable where possible to preserve users’ progress.

---

## 🔧 Troubleshooting

* **Blank page / 404:** Ensure the deployed artifact contains `public/index.html` at its root.
* **Stale content:** Hard‑refresh (Ctrl/Cmd + Shift + R). Pages caches aggressively.
* **Local file CORS:** Open via a local server (see *Local development*); don’t double‑click the HTML.
* **Paths on Pages:** Use **relative paths** (already done) so project pages like `/Elden-Ring-Tracker/` work.
* **Jekyll quirks:** If you add files or folders starting with `_`, include a blank `public/.nojekyll` file.

---

## 📝 License
**Code:** MIT — see `LICENSE`.

**Guide Content:** CC BY‑NC‑SA 4.0 — see `CONTENT_LICENSE.md`.

**Trademarks:** This is a fan‑made project; see `DISCLAIMER.md`.

---

## 🙏 Credits

Design & build: **Evendyce** + a very enthusiastic co‑pilot.

*Elden Ring* © FromSoftware/Bandai Namco. This project is fan‑made and non‑commercial.
