# Lizhe Chen — personal website

React + Vite portfolio in a cassette-futurist style on a Swiss grid, with a voxel / pixel layer: paper and ink with the four tape-stripe colours (red, orange, yellow, brown), a bold grotesk for display, mono labels, amber CRT readouts, and pixel type only as an accent. Photos and screenshots are shown untouched (no posterize or scanline filters). A CRT boot screen plays once per session (click or any key skips it). The hero puts the copy on the left and a large portrait in a cassette-shell frame on the right, over a voxel plinth of cassettes, a CRT terminal, a speaker and a VU meter. Each featured paper has a small looping voxel diagram of its core idea next to the paper's own figure. Everything animated is drawn on the CPU into low-resolution 2D canvases (no WebGL): static voxels are baked once, each frame costs well under 1 ms, loops are capped at 20–24 fps and stop when off screen or in a background tab, so office machines without a discrete GPU run it comfortably. Two themes and bilingual content. Animation respects the operating system's reduced-motion setting. Films load only on explicit playback.

## Local development

Node.js 22 or later:

```sh
npm ci
npm run metrics
npm run dev -- --host 127.0.0.1
```

Validation and production preview:

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

## Data refresh

- **GitHub stars and forks:** public repository API, refreshed when the tab opens or becomes visible if cached data is older than 5 minutes, then every 5 minutes while visible. No browser tokens. Public rate limits or network failures retain the last successful reading.
- **Latest release and Bilibili video views/likes:** `.github/workflows/pages.yml` collects data on every deployment and hourly, at minute 23 UTC. The same workflow builds and deploys GitHub Pages. The browser checks the published snapshot every 5 minutes. This is periodic synchronization, not instant push delivery; Actions and Pages propagation can be delayed.
- **Google Scholar:** profile links only, as requested. No scraping, third-party key, citation count or inferred Scholar publication total.
- **TapTap award figures:** historical competition results, not current Bilibili statistics.

`scripts/update-metrics.mjs` writes `data/metrics.json`. Each source has its own successful `updatedAt`, attempt timestamp and status. Failures keep the last successful value and timestamp; first-run failures display an em dash, never a fabricated zero. CI first reads the previously published snapshot to preserve data across fresh runners. The checked-in snapshot is a further fallback. No scheduled commits are necessary.

GitHub Actions supplies its built-in `GITHUB_TOKEN` to the collector. No new secrets are needed. Bilibili uses its public web endpoint without cookies; availability from GitHub-hosted runners may vary with platform restrictions. Failed sources emit workflow warnings without taking the website down. Refresh timestamps and source status are retained internally; the UI displays only compact project stars and video counts, per the owner’s preference.

The schedule only becomes active after this branch is merged into the repository's default branch and the existing Pages workflow is enabled. On public repositories, GitHub may disable scheduled workflows after 60 days of repository inactivity; re-enable the workflow in Actions if needed. See [GitHub schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Editing

- `src/content.js`: bilingual profile, projects, publications, education, work and honors.
- `src/main.jsx`: page composition, masthead, hero, archives and footer.
- `src/boot.jsx`: once-per-session CRT boot screen.
- `src/hero.jsx`: hero copy, portrait and data bar.
- `src/voxel.js`: CPU voxel renderer (2:1 dimetric, painter-sorted, face-culled, cached cube sprites, cast shadows), 3×5 pixel font and label chips. Colours are drawn flat, with no post-processing pass.
- `src/voxel-hero.js`: the hero diorama. `src/diagrams.js`: the five paper diagrams.
- `src/sections.jsx`: journey J-cards (work and education details live here), paper tabs with voxel diagrams and figures, paper index cards, Infernux monitor, project rack units, game VHS shelf, honors wall and the figure lightbox.
- `src/cassette.css`: the whole visual system, palette, responsive rules and reduced-motion handling.
- `src/motion.jsx`: reduced-motion context and click-to-play video player.
- `src/live-data.jsx`, `src/metrics-core.js`: metrics UI, cache and shared validation.
- `scripts/update-metrics.mjs`: collection. Video IDs are derived from content automatically.

To add a game, set a Bilibili player URL with its `bvid` in `src/content.js`, then run `npm run metrics`. Its cover, views and likes will be collected automatically. Bilibili covers load directly with no-referrer as resized WebP thumbnails (`@960w_540h_1c.webp`); the play control remains usable if the cover fails. Live GitHub requests start only after the page has loaded, because the build already ships an hourly snapshot.

## Images

Site images are WebP. After adding or replacing an image under `img/`, run `npm run images`: files larger than 1600 px or 160 KB are re-encoded in place, and a 960 px `-sm.webp` variant is written for inline display. The full file is only fetched by the lightbox. The portrait is imported through Vite, so it gets a hashed URL and is preloaded from `index.html`.

External reference: [GitHub API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## Typography and content verification

Latin display and reading text uses Archivo (variable width and weight); Chinese uses the system UI font (PingFang SC, Microsoft YaHei, Source Han Sans / Noto Sans CJK), so no CJK web font is downloaded. Labels use JetBrains Mono, CRT readouts VT323, and small pixel accents Silkscreen; only their Latin subsets are bundled. All are open-licensed and self-hosted through Fontsource.

See [publication audit](docs/publication-audit.md) for all 14 verified records and the author-confirmed ACL acceptance for Innate Reasoning. Software lists contain only Infernux and EmbodiChain. The résumé is the user-supplied PDF copied verbatim on 2026-09-08.

The homepage greeting reflects the author’s current exploration of Agentic Runtime and next-generation AI-native games and engines. The Infernux feature is limited to its film deck and links. See [paper image provenance](docs/paper-images.md).

Social and action links use local SVG icons with outlined controls. Without WebGL the hero falls back to a static cassette illustration. The Infernux image is the current official README/editor showcase; website and documentation point to infernux-engine.com.
