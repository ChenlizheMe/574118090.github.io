# Lizhe Chen — personal website

React + Vite portfolio in a NASA-Punk visual style. The homepage includes overlapping 3D film cards, separate work and education chronologies with expandable details, and illustrated publication cards, subtle project-card depth, animated metrics, two themes and bilingual content. Animation respects the operating system’s reduced-motion setting. There is no floating motion control. Films load only on explicit playback.

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
- `src/main.jsx`: page composition and archives.
- `src/dynamic.css`, `src/flight.css`, `src/constellation.css`, `src/finish.css`: NASA-Punk layout, typography and shared environmental materials.
- `src/experience-journey.jsx`: separate diagonal work and education timelines with selectable details.
- `src/research-exhibit.jsx`, `src/content-experiences.jsx`: layered paper exhibit, publication reader, project inspection, game theater and honors gallery.
- `src/spatial-field.jsx`: persistent orbital backdrop and animated wire geometry.
- `src/motion.jsx`, `src/video-deck.jsx`: content depth, film carousel, playback and reduced-motion handling.
- `src/live-data.jsx`, `src/metrics-core.js`: metrics UI, cache and shared validation.
- `scripts/update-metrics.mjs`: collection. Video IDs are derived from content automatically.

To add a game, set a Bilibili player URL with its `bvid` in `src/content.js`, then run `npm run metrics`. Its cover, views and likes will be collected automatically. Bilibili covers load directly with no-referrer; the play control remains usable if the cover fails.

External reference: [GitHub API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## Typography and content verification

PingFang SC is the first font choice for both languages, followed by PingFang TC, Microsoft YaHei and Segoe UI. PingFang requires a local installation; no proprietary font files are redistributed. Body copy is 18px, with navigation and metadata at least 16px. Only numeric section IDs and English instrument-bar labels use smaller sizes.

See [publication audit](docs/publication-audit.md) for all 14 verified records and the author-confirmed ACL acceptance for Innate Reasoning. Software lists contain only Infernux and EmbodiChain. The résumé is the user-supplied PDF copied verbatim on 2026-09-08.

The homepage greeting reflects the author’s current exploration of Agentic Runtime and next-generation AI-native games and engines. The Infernux feature is limited to its film deck and links. See [paper image provenance](docs/paper-images.md).

Social and action links use local SVG icons with outlined controls. The hero includes lightweight geometric orbit decoration that respects reduced motion. Video-stage space uses container-relative sizing to accommodate transformed screens. The Infernux image is the current official README/editor showcase; website and documentation point to infernux-engine.com.
