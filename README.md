# Idle Life

Mobile-first high-fantasy collection and progression app. Real-life activities award RAP (Real Life Activity Points), which fund skill training, collectible unlocks, and repeatable Adventure activities.

## Development

```bash
npm install
npm run dev
```

Run the complete quality gate before committing:

```bash
npm run check
npm run test:coverage
```

The production build is deployed to GitHub Pages from `main` by `.github/workflows/deploy-pages.yml`.

## Data And Saves

- Static game content lives under `src/data/` and is validated by `tests/content.test.ts`.
- Browser progress uses a versioned local save in `src/save.ts`.
- Settings provides manual save, JSON export, and JSON import.
- The app has no account or cloud synchronization yet. Export a backup before clearing browser storage or changing devices.

## Development Tools

Production hides prototype controls and future menu entries. Append `?dev=1` to enable the RAP grant button and development placeholders.

Read `project_memory.md` before architecture or workflow changes and `game_design.md` before gameplay or content changes.
