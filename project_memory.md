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
- `src/xp.ts`: RuneScape-style XP curve and level helpers.
- `src/styles.css`: mobile-only visual styling.
- `index.html`: Vite HTML entry.

## Architecture Overview

The first prototype is a mobile-only React app. Navigation is intentionally simple and page-to-page:

- Home page title: `Collectibles`.
- Main category tiles in order: Characters, Skills, Pets, Mounts.
- No bottom navigation in the first prototype.
- A sticky topbar always shows the current page name, current RP, and a plus button that grants 10,000 RP.
- Subpages use a back button in the topbar.
- Collection pages share the same card, filter, sort, full-content detail view, and purchase dialog patterns.
- Skills have their own page but live under Collectibles as a category tile.
- Tapping a collectible or skill card opens a full-content detail view under the topbar. Lists no longer trigger immediate buy/train actions.

Expected early systems:

- RAP wallet: implemented as local React state.
- Skill progression: implemented as XP per skill, with 1 RP spent = 1 XP gained.
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

- The user approved the generated mockup style for compact Skills and Mounts grids.
- Use the internal image generator for icon creation.
- Target icon source size should likely be square, for example 512x512 PNG/WebP.
- Store generated project icons under a stable public asset path such as `public/assets/icons/{category}/{id}.webp`.
- Data entries should reference icons by path instead of hardcoded component icons.
- Start with a small test batch before generating all assets: a few Skills and a few Mounts.
- Do not bake text into icon images.
- The icon style should be consistent: high-fantasy inventory icon, centered subject, dark emerald/charcoal background, muted gold accent/rim light, crisp painterly rendering, readable at small tile sizes.
- Icons must support both compact grid tiles and larger detail views.
- Current icon asset pipeline uses built-in Image Gen output copied into `public/assets/icons/...`, then resized to 512x512 WebP at roughly quality 82 with Pillow.
- Use relative icon paths in app data, for example `assets/icons/skills/agility.webp`, so GitHub Pages project-subpath deployment works.
- Current committed test batch covers Skills: Agility, Attack, Magic, Mining, Herblore; Mounts: Stable Pony, Verdant Stag, Ashwing Drake.

## Commit And Push Policy

- Code and program changes must be committed and pushed when a task is finished.
- Design-only documentation changes should be recorded in the docs, but should not trigger their own commit/push.
- Design-only documentation changes can be included with the next commit/push that contains code or program changes.

## RuneScape/OSRS Skill Source Notes

The app should use only skills that exist in RuneScape 3 and/or Old School RuneScape. No custom skills should be added.

Current verified source notes as of 2026-07-04:

- RuneScape official game guide lists skills including Archaeology and Necromancy.
- Old School RuneScape official Sailing page states Sailing is out now and describes it as OSRS's first new skill.
- OSRS and RuneScape naming differs for some equivalent concepts. The app has settled on `Hitpoints` and `Rune Crafting` as the visible canonical names.

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
- Rune Crafting
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
- Convert copied generated icons to optimized WebP: use Pillow to resize source PNGs to 512x512 and save as WebP quality 82 under `public/assets/icons/...`.

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
  - plus button grants 10,000 RP
  - Skills page opens and a skill can be trained by spending up to 10,000 RP
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

## Known Issues

- Need to avoid feature creep. First prototype should remain RAP button plus simple mount purchasing and Codex progress.
- State is currently in-memory only. Refreshing the page resets RP, owned collectibles, and skill XP.
- Native browser text selection should stay disabled across the app. If Android/Chrome selection overlays reappear, check the global CSS `user-select: none`, `-webkit-touch-callout: none`, and the document-level event listeners in `src/App.tsx`.
- `127.0.0.1` links do not work from a phone because they point to the phone itself. Use the Windows host LAN IP, for example `http://192.168.0.203:5173`, while both devices are on the same network.
- `.codex-remote-attachments/` must stay ignored; it contains chat-uploaded local attachments and should not be committed.
- New GitHub Pages repositories may need Pages enabled before `actions/deploy-pages` can create a deployment. If the deploy job returns a 404 deployment creation error, enable Pages with `build_type=workflow` and rerun the workflow.
- When the user sends only screenshots/images without a written change request, do not edit files or implement changes. Describe what is visible in the images and wait for an explicit instruction.

## Lessons Learned

- Keep the initial version extremely simple. The intended first playable loop is not real activity tracking yet; it is a simulated RAP grant button and a purchase/unlock flow.
- The RuneScape XP formula works well for this prototype: level XP is `floor(sum(floor(i + 300 * 2^(i/7))) / 4)`, producing about 13 million XP for level 99 and about 104 million XP for level 120.
- A reusable requirements model should support future prerequisite types. Current implemented types are skill requirements and collectible ownership requirements.
