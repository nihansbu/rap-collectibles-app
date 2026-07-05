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

- `src/App.tsx`: app shell, pages, purchase dialog, detail sheet, filters, skill training interactions.
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
- Collection pages share the same card, filter, sort, detail sheet, and purchase dialog patterns.
- Skills have their own page but live under Collectibles as a category tile.

Expected early systems:

- RAP wallet: implemented as local React state.
- Skill progression: implemented as XP per skill, with 1 RP spent = 1 XP gained.
- Collectible catalog: implemented in `src/data.ts`.
- Purchase/unlock logic: implemented with RAP costs and requirements.
- Codex collection overview: implemented as category progress tiles.
- Mobile-only UI navigation: implemented with topbar and page state.

## Data Model Notes

Likely entities:

- Player profile: current RAP, lifetime RAP, owned collectible IDs, skill levels.
- Skill: ID, display name, source game(s), XP, derived level, max level 120.
- Collectible: ID, name, category, rarity, RAP cost, requirements, unlock state.
- Requirement: skill ID plus required level.
- Category: ID, display name, total count, unlocked count.

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
  - detail sheet opens from the item info button

2026-07-05:

- First GitHub Pages deployment failed after creating the repository because Pages was not enabled yet. The deploy job failed with `Failed to create deployment (status: 404)` and pointed to repository Pages settings.
- Successful solution: enable Pages with GitHub Actions build type via `gh api --method POST repos/nihansbu/rap-collectibles-app/pages -f build_type=workflow`, then rerun `.github/workflows/deploy-pages.yml`.
- After enabling Pages, workflow run `28722585961` completed successfully and deployed to `https://nihansbu.github.io/rap-collectibles-app/`.
- User-provided phone screenshots confirmed that the GitHub Pages URL loads on Android Chrome and that the Pets page plus item detail sheet render on-device.

## Known Issues

- Need to avoid feature creep. First prototype should remain RAP button plus simple mount purchasing and Codex progress.
- State is currently in-memory only. Refreshing the page resets RP, owned collectibles, and skill XP.
- Long-press native behavior is not fully customized yet; an explicit info button opens the item detail sheet reliably.
- `127.0.0.1` links do not work from a phone because they point to the phone itself. Use the Windows host LAN IP, for example `http://192.168.0.203:5173`, while both devices are on the same network.
- `.codex-remote-attachments/` must stay ignored; it contains chat-uploaded local attachments and should not be committed.
- New GitHub Pages repositories may need Pages enabled before `actions/deploy-pages` can create a deployment. If the deploy job returns a 404 deployment creation error, enable Pages with `build_type=workflow` and rerun the workflow.

## Lessons Learned

- Keep the initial version extremely simple. The intended first playable loop is not real activity tracking yet; it is a simulated RAP grant button and a purchase/unlock flow.
- The RuneScape XP formula works well for this prototype: level XP is `floor(sum(floor(i + 300 * 2^(i/7))) / 4)`, producing about 13 million XP for level 99 and about 104 million XP for level 120.
- A reusable requirements model should support future prerequisite types. Current implemented types are skill requirements and collectible ownership requirements.
