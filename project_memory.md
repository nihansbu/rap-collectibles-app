# Project Memory

## High-Level Project Description

Mobile-only collector app with light game progression. The app converts Real Life Activity Points (RAP) into unlockable high-fantasy collectibles. The first prototype should stay intentionally simple: the player can press a button to receive RAP, then spend RAP on collectibles such as mounts.

The app is not intended to be a full game at the beginning. There is no combat, world simulation, or active character gameplay. The core loop is:

1. Earn RAP.
2. Spend RAP.
3. Unlock collectibles.
4. View collection progress in the Codex.

## Current Design Decisions

- Currency name: RAP, short for Real Life Activity Points.
- Early prototype earning model: button press grants 10,000 RAP.
- RAP can be spent on all unlockable content.
- No separated currencies for different activity types at this stage.
- Collectibles are the main progression system.
- The Codex is the collection overview and should make progress visible quickly.
- Collection categories should be tile-based, for example Characters, Mounts, Pets, Items, and future categories.
- The setting is high fantasy.
- Characters are collectibles too. A player may own multiple characters, but they are not actively played in the first version.
- Characters may later have fantasy races/peoples and classes.
- Skill levels are trained with RAP.
- Skill levels can be prerequisites for collectible purchases.
- Example unlock requirement: Mount requires Herblore level 73 plus RAP cost.

## Technology Stack

- React 19
- TypeScript
- Vite
- lucide-react for UI icons
- Playwright for local mobile smoke verification
- CSS modules are not used yet; styling is in `src/styles.css`.

## Folder Structure

- `src/App.tsx`: app shell, pages, purchase dialog, full-content detail views, filters, skill training interactions.
- `src/data.ts`: category, skill, collectible, and requirement data.
- `src/save.ts`: versioned local save/load system, v1-to-v2 migration, validation, normalization, active training persistence, offline training processing, and backup rotation for player progress.
- `src/training.ts`: skill training durations, XP rates, concurrent training rules, timestamp processing, and formatting helpers.
- `src/xp.ts`: RuneScape-style XP curve and level helpers.
- `src/styles.css`: mobile-only visual styling.
- `index.html`: Vite HTML entry.

## Architecture Overview

The first prototype is a mobile-only React app. Navigation is intentionally simple and page-to-page:

- Home page title: `Collectibles`.
- Main category tiles in order: Characters, Skills, Pets, Mounts.
- No bottom navigation in the first prototype.
- A sticky topbar always shows the current page name, current RAP, and a plus button that grants 10,000 RAP.
- Subpages use a back button in the topbar.
- Collection pages share the same card, filter, sort, full-content detail view, and purchase dialog patterns.
- Skills have their own page but live under Collectibles as a category tile.
- Tapping a collectible or skill card opens a full-content detail view under the topbar. Lists no longer trigger immediate buy/train actions.

Implemented early systems:

- RAP wallet: persisted through versioned browser `localStorage`.
- Active skill training: supports 1, 2, 5, and 12 hour training jobs with up to three concurrent skills.
- Training jobs are persisted in the save file and processed from timestamps on reload, so elapsed offline/closed-app time is applied deterministically.
- Skill progression: implemented as XP per skill using tiered XP/hour rates while spending 10,000 RAP/hour per active skill.
- Collectible catalog: implemented in `src/data.ts`.
- Purchase/unlock logic: implemented with RAP costs and requirements.
- Codex collection overview: implemented as category progress tiles.
- Mobile-only UI navigation: implemented with topbar and page state.
- Planned collection subpage direction: replace text-heavy list cards with dense icon-based grids. The approved mockup direction uses five compact tiles per row for Skills and a similar icon-first grid for Mounts.

## Data Model Notes

Likely entities:

- Player profile: current RAP, lifetime RAP, owned collectible IDs, skill levels.
- Skill: ID, display name, source game(s), XP, derived level, max level 120.
- Collectible: ID, name, category, rarity, RAP cost, requirements, unlock state.
- Requirement: skill ID plus required level.
- Category: ID, display name, total count, unlocked count.
- Future asset fields should include stable icon paths, for example `icon`, `iconPrompt`, and possibly `type` for the one-line tile subtitle.

## Icon Pipeline Notes

- The user approved the dense grid mockup as the UI direction, but later rejected the first glossy generated Skill and Mount art pass.
- Current icon direction: gritty old-school MMORPG / Old School RuneScape-like low-detail inventory assets.
- Icons must be reusable assets with alpha transparency.
- Icons must never include their own frame, border, tile, card, or background. Tile backgrounds, borders, glows, locked state, and owned state come from CSS.
- Use the internal image generator for icon creation.
- For transparent icons, generate on a flat chroma-key background, then remove the key locally with `C:\Users\nikla\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py`.
- Use `#00ff00` as default chroma key and `#ff00ff` for green-heavy subjects such as Farming or Herblore.
- Normalize final icons to 256x256 WebP with alpha under `public/assets/icons/{category}/{id}.webp`.
- Data entries should reference icons by relative path, for example `assets/icons/skills/agility.webp`, so GitHub Pages project-subpath deployment works.
- Do not bake text into icon images.
- Current committed Skill icon batch covers all 30 skills with transparent 256x256 WebP assets.
- A generic transparent Mount style preview is saved as `public/assets/icons/mounts/_style-preview.webp`; current production Mount icons have not yet been replaced.

## Commit And Push Policy

- Code and program changes must be committed and pushed when a task is finished.
- Design-only documentation changes should be recorded in the docs, but should not trigger their own commit/push.
- Design-only documentation changes can be included with the next commit/push that contains code or program changes.

## RuneScape/OSRS Skill Source Notes

The app should use only skills that exist in RuneScape 3 and/or Old School RuneScape. No custom skills should be added.

Current verified source notes as of 2026-07-04:

- RuneScape official game guide lists skills including Archaeology and Necromancy.
- Old School RuneScape official Sailing page states Sailing is out now and describes it as OSRS's first new skill.
- OSRS and RuneScape naming differs for some equivalent concepts. The app has settled on `Hitpoints` and `Runecrafting` as the visible canonical names.

Candidate combined skill roster to finalize:

- Agility
- Archaeology
- Attack
- Construction
- Cooking
- Crafting
- Defence
- Divination
- Dungeoneering
- Farming
- Firemaking
- Fishing
- Fletching
- Herblore
- Hitpoints
- Hunter
- Invention
- Magic
- Mining
- Necromancy
- Prayer
- Ranged
- Runecrafting
- Sailing
- Slayer
- Smithing
- Strength
- Summoning
- Thieving
- Woodcutting

## Known Working Commands

- Install dependencies: `npm install`
- Install Playwright Chromium browser: `npx playwright install chromium`
- Start development server: `npm run dev`
- Mobile LAN URL on current network: `http://192.168.0.203:5173`
- Build production bundle: `npm run build`
- Deploy: commit and push to `main`; GitHub Actions workflow `.github/workflows/deploy-pages.yml` builds with `npm ci` and `npm run build`, then deploys `dist` to GitHub Pages.
- Enable GitHub Pages for a new repo using Actions: `gh api --method POST repos/nihansbu/rap-collectibles-app/pages -f build_type=workflow`
- Convert generated transparent icons to optimized WebP: remove chroma key with `C:\Users\nikla\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py`, crop to alpha bounds, center on a 256x256 transparent canvas with max subject size around 220px, and save as WebP quality 90 under `public/assets/icons/...`.

## Verified Workflows

2026-07-04:

- `npm run build` succeeds.
- Local dev server starts with `npm run dev -- --port 5173`.
- Dev server is configured with `vite --host 0.0.0.0`, so phones on the same LAN can open the app through the Windows machine's LAN IP instead of `127.0.0.1`.
- GitHub Pages is configured through GitHub Actions. Vite uses `base: "./"` so bundled assets load correctly from a project page subpath such as `/rap-collectibles-app/`.
- Public GitHub repository: `https://github.com/nihansbu/rap-collectibles-app`
- Live GitHub Pages URL: `https://nihansbu.github.io/rap-collectibles-app/`
- Playwright mobile smoke test at `390x844` verified:
  - home page title is `Collectibles`
  - category tile order is Characters, Skills, Pets, Mounts
  - tile counts are Characters 0/8, Skills 0/30, Pets 0/6, Mounts 0/8
  - plus button grants 10,000 RAP
  - Skills page opens and a skill can be trained through duration buttons
  - Mounts page opens
  - tapping an unlockable mount opens a purchase confirmation
  - confirming purchase marks the mount as owned
  - detail view opens from an item card tap

2026-07-05:

- First GitHub Pages deployment failed after creating the repository because Pages was not enabled yet. The deploy job failed with `Failed to create deployment (status: 404)` and pointed to repository Pages settings.
- Successful solution: enable Pages with GitHub Actions build type via `gh api --method POST repos/nihansbu/rap-collectibles-app/pages -f build_type=workflow`, then rerun `.github/workflows/deploy-pages.yml`.
- After enabling Pages, workflow run `28722585961` completed successfully and deployed to `https://nihansbu.github.io/rap-collectibles-app/`.
- User-provided phone screenshots confirmed that the GitHub Pages URL loads on Android Chrome and that the Pets page plus item detail view render on-device.
- Android Chrome screenshots showed unwanted Google text selection overlays after long-pressing app text. Successful solution: disable selection/callouts in CSS and prevent `selectstart`, `contextmenu`, and `dragstart` events at document level, then clear selection ranges on `selectionchange`.
- Dense grid implementation verified with Playwright at `390x844`: Skills render 30 icon tiles with five equal-width tiles in the first row; test batch loads 5 skill images and 3 mount images with no failed requests; card taps open full-content detail views; skill training still works; native text selection remains disabled.
- Versioned local save implementation verified with Playwright at `390x844` against `http://127.0.0.1:5173/`:
  - cleared localStorage
  - added 10,000 RAP
  - reloaded and confirmed RAP persisted
  - trained Agility for 10,000 XP
  - reloaded and confirmed Agility XP persisted
  - bought Stable Pony
  - reloaded and confirmed Stable Pony remained unlocked
  - confirmed `rap-collectibles.save.v1`, `rap-collectibles.save.backup.1`, `rap-collectibles.save.backup.2`, and `rap-collectibles.save.lastKnownGood` exist
  - no console warnings/errors and no failed requests
- Full Skill icon pass verified locally:
  - all 30 skills now have `icon` paths in `src/data.ts`
  - visible skill name is `Runecrafting`
  - generated Skill assets are transparent 256x256 WebP files under `public/assets/icons/skills`
  - mobile Playwright check at `390x844` confirmed 30 skill tiles and 30 loaded images
  - first row still renders as five equal-width tiles
  - Runecrafting detail view opens with the expected title
  - no console warnings/errors and no failed requests
- Timestamped Skill training verified locally with Playwright at `390x844` against `http://127.0.0.1:5173/`:
  - fresh save shows Skills progress as total level `30/3600` on the Collectibles overview
  - visible UI copy uses `RAP` and no standalone `RP`
  - long Skill names stay on one line in the five-column grid
  - `Train 1 Hour`, `Train 2 Hours`, `Train 5 Hours`, and `Train 12 Hours` buttons render in Skill detail
  - starting a training job adds the active detail status, drains RAP over time, and increases XP
  - up to three skills can train concurrently and a fourth is blocked with `Maximum 3 active skills`
  - active skill tiles receive the animated training class
  - v2 save files process elapsed timestamp time on reload and stop training when RAP reaches zero
  - old `rap-collectibles.save.v1` data still loads through the migration path
  - `npm run build` succeeds after the implementation

## Successful Solutions

2026-07-05: Persistent progress save.

- Original problem: refreshing the GitHub Pages app reset RAP, skill XP, and owned collectibles because player progress only lived in React state.
- Successful solution: add `src/save.ts` with a versioned save file in `localStorage`, player-state normalization, unknown-ID filtering, numeric clamping, backup rotation, and a `lastKnownGood` copy. `App.tsx` now lazily loads progress on startup and autosaves whenever `player` changes.
- Why it works: the saved shape is independent of transient React page state, so progress survives reloads while UI navigation still resets cleanly. The loader tolerates future catalog changes by defaulting newly added skills to `0 XP` and dropping removed/unknown collectible IDs.
- Files involved: `src/save.ts`, `src/App.tsx`.
- Commands used: `npm run build`, `npx playwright install chromium`, local Playwright reload smoke test through `node`.

2026-07-05: Timestamped Skill training with offline progress.

- Original problem: Skill training was an immediate spend action, but the design requires hour-based training jobs that continue over time, support up to three concurrent skills, and process elapsed time after reloads.
- Successful solution: add `src/training.ts` as the shared training engine, migrate saves to `rap-collectibles.save.v2`, store `activeTrainings` with `startedAt`, `lastUpdatedAt`, and `endsAt`, process active jobs once per second in React, and process elapsed time once during `loadPlayerState()`.
- Why it works: training state is stored as durable timestamps rather than UI timers. Reload/offline progress is deterministic because the processor consumes RAP and awards XP based on elapsed milliseconds, bounded by available RAP, max level 120, job end time, and the three-skill concurrency cap.
- Files involved: `src/training.ts`, `src/save.ts`, `src/App.tsx`, `src/styles.css`.
- Commands used: `npm run build`, local Playwright mobile training QA through `node`.

2026-07-05: GitHub Pages transient deployment recovery.

- Original problem: after pushing timestamped Skill training, GitHub Actions built the app successfully but the Pages deployment failed with `Deployment failed, try again later`.
- Successful solution: update the Pages actions to v5, restore repository Pages configuration to `build_type=workflow`, rerun the main deploy workflow, then verify the public URL serves the new hashed assets and passes the live Playwright smoke test.
- Failed approach: switching Pages to a classic `gh-pages` branch and pushing the built `dist` also triggered GitHub's internal `pages-build-deployment`, but that failed with the same `Deployment failed, try again later` backend message. Do not treat branch deployment as a fix for this specific failure unless the workflow route is also unavailable after retry.
- Files involved: `.github/workflows/deploy-pages.yml`, `project_memory.md`.
- Commands used: `gh run watch`, `gh run rerun`, `gh api --method PUT repos/nihansbu/rap-collectibles-app/pages -f build_type=workflow`, live Playwright smoke test through `node`.

2026-07-05: Transparent reusable Skill icons.

- Original problem: the first generated Skill icons had their own illustrated backgrounds, frames, and glossy fantasy rendering, which made them less reusable and less aligned with the approved dense-grid mockup.
- Successful solution: generate icons as old-school MMORPG-style subjects on flat chroma-key backgrounds, remove the chroma key locally, crop to alpha bounds, center on a 256x256 transparent canvas, and export WebP with alpha.
- Why it works: CSS owns the tile background and state styling, while the icon file is only the reusable subject. The same asset can now be used in compact tiles, detail panels, Codex views, and future inventory-like surfaces.
- Files involved: `src/data.ts`, `public/assets/icons/skills/*.webp`, `public/assets/icons/mounts/_style-preview.webp`.
- Commands used: built-in Image Gen, `remove_chroma_key.py`, Pillow normalization, `npm run build`, local Playwright mobile asset check.

## Known Issues

- Need to avoid feature creep. First prototype should remain RAP button plus simple mount purchasing and Codex progress.
- Progress is currently persisted locally in the browser only. Clearing browser site data, switching browsers/devices, or using private mode can still lose local progress. Cloud sync/export-import is a planned future hardening step.
- Native browser text selection should stay disabled across the app. If Android/Chrome selection overlays reappear, check the global CSS `user-select: none`, `-webkit-touch-callout: none`, and the document-level event listeners in `src/App.tsx`.
- `127.0.0.1` links do not work from a phone because they point to the phone itself. Use the Windows host LAN IP, for example `http://192.168.0.203:5173`, while both devices are on the same network.
- `.codex-remote-attachments/` must stay ignored; it contains chat-uploaded local attachments and should not be committed.
- New GitHub Pages repositories may need Pages enabled before `actions/deploy-pages` can create a deployment. If the deploy job returns a 404 deployment creation error, enable Pages with `build_type=workflow` and rerun the workflow.
- GitHub Actions Pages deployment actions should stay on Node-24-compatible major versions. On 2026-07-05, `actions/deploy-pages@v4` repeatedly created a deployment and then failed with `Deployment failed, try again later`; the workflow was updated to `actions/upload-pages-artifact@v5` and `actions/deploy-pages@v5`. The first v5 run still hit the same transient Pages backend error, but rerunning after restoring `build_type=workflow` succeeded.
- When the user sends only screenshots/images without a written change request, do not edit files or implement changes. Describe what is visible in the images and wait for an explicit instruction.

## Lessons Learned

- Keep the initial version extremely simple. The intended first playable loop is not real activity tracking yet; it is a simulated RAP grant button and a purchase/unlock flow.
- The RuneScape XP formula works well for this prototype: level XP is `floor(sum(floor(i + 300 * 2^(i/7))) / 4)`, producing about 13 million XP for level 99 and about 104 million XP for level 120.
- A reusable requirements model should support future prerequisite types. Current implemented types are skill requirements and collectible ownership requirements.
