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
- Collection categories should be tile-based, for example Characters, Classes, Races, Skills, Tools, Mounts, Pets, Items, and future categories.
- The setting is high fantasy.
- Characters are collectibles too. A player may own multiple characters, but they are not actively played in the first version.
- Characters may later have fantasy races and classes.
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

- `src/App.tsx`: app shell, navigation state, player-state actions, autosave loop, and page/detail routing.
- `src/activities.ts`: repeatable Adventure activity definitions, active run processing, XP reward splitting, drop rolls, and Bad Luck Protection helpers.
- `src/bonuses.ts`: account-wide bonus collection and formatting helpers for owned Collectibles.
- `src/catalog.ts`: catalog selectors and rules such as collectible lookup, category filtering, requirement state, unlock state, status grouping, and catalog ordering.
- `src/data.ts`: stable public facade that re-exports modular catalog data.
- `src/data/types.ts`: shared catalog types.
- `src/data/categories.ts`: category definitions.
- `src/data/skills.ts`: skill definitions.
- `src/data/collectibles/*.ts`: Collectible definitions split by category.
- `src/economy.ts`: early manual activity RAP rates, activity log types, and collectible rarity cost bands.
- `src/format.ts`: shared number, percent, and timestamp formatting helpers.
- `src/handbook.ts`: scalable Handbook article registry, categories, page-context definitions, related-entry links, and contextual selectors.
- `src/pages/`: page-level UI components such as `MainMenuPage` and `HandbookPage`.
- `src/save.ts`: versioned local save/load system, v1/v2/v3-to-v4 migration, validation, normalization, active training persistence, active Activity run persistence, offline processing, activity log persistence, and backup rotation for player progress.
- `src/training.ts`: skill training durations, XP rates, concurrent training rules, timestamp processing, and formatting helpers.
- `src/ui/`: reusable UI components such as `TopBar`, dialogs, icon renderers, and tile visuals.
- `src/xp.ts`: RuneScape-style XP curve and level helpers.
- `src/styles.css`: mobile-only visual styling.
- `index.html`: Vite HTML entry.
- `scripts/prepare-icon-prompts.mjs`: reads modular collectible files under `src/data/collectibles/` with the TypeScript AST and writes missing collectible icon prompts to `tmp/icon-pipeline/missing-icons.jsonl`.
- `scripts/normalize-icon.py`: converts chroma-key generated icon sources into transparent 256x256 WebP files.

## Architecture Overview

The first prototype is a mobile-only React app. Navigation is intentionally simple and page-to-page:

- Home page title: `Menu`.
- The main menu is a compact dashboard based on the approved icon-first mockup. Adventure, direct Collectibles categories, and manual Log Activity use the same unframed section and tile language.
- The `Collectibles` page is the Codex overview. Main category tiles appear in order: Characters, Classes, Races, Skills, Tools, Pets, Mounts.
- The `Adventure` page is the gameplay entry point. Its first subpage is `Activities`.
- The `Handbook` is a player-facing contextual wiki for systems that should not clutter the main gameplay UI. Every topbar exposes it through a compact book icon.
- No bottom navigation in the first prototype.
- A sticky topbar always shows the current page name, a contextual Handbook button, current RAP, and a plus button that grants 10,000 RAP.
- Subpages use a back button in the topbar.
- Collection pages share the same card, filter, sort, full-content detail view, and purchase dialog patterns.
- Classes and Races are implemented as standard collectible categories using the `type` field for broad grouping rather than nested subpages.
- Collectible pages use three visual status groups: `owned` green, `ready` yellow when requirements are met regardless of current RAP, and `locked` red when requirements are missing. The default sort groups tiles in that order.
- Collectible pages expose horizontal type filters generated from the current category's `Collectible.type` values.
- The Collectible detail view includes a status pill, RAP cost, rarity/type metadata, requirements, and a dedicated purchase panel.
- Save Status, Export Save, Import Save, and recent Activity history are intentionally not shown on the main dashboard. The save engine still autosaves locally; backup controls can move to a future Settings/account area.
- The main menu shows quick manual activity logging. Manual Activity tiles use tap to log one hour and long-press to open the Activity info/detail view.
- The Collectibles page shows category progress bars, completion percentages, and recent unlocks.
- Manual activity logging is the first tracking placeholder. A one-hour activity tap grants RAP using fixed rates from `src/economy.ts` and writes a recent activity entry into the save file.
- Gameplay Activities are separate from manual real-life activity logging. Activities live under `Adventure`, cost RAP, run for a short timestamped duration in the prototype, award reduced skill XP, and can drop exclusive collectibles.
- Activity-only collectible drops still appear in their normal Codex categories. Unowned Activity drops render as red locked tiles with an indigo source strip. Owned Activity drops render as indigo source-owned tiles. They cannot be bought directly.
- Tools are standard Collectibles. Some are direct purchases and some are Activity drops. Tools can grant account-wide bonuses without introducing inventory or equipment slots.
- Skills have their own page but live under Collectibles as a category tile.
- Direct main-menu entries remember their origin: backing out of a category or Activities page opened from the main dashboard returns to the main dashboard, not to the older intermediate overview page.
- Tapping a direct-purchase Collectible card is the primary buy action and opens the purchase confirmation when the item is affordable and requirements are met. Long-pressing opens the full-content detail view under the topbar.
- Tapping an unavailable, owned, or Activity-drop Collectible falls back to the detail view because there is no valid buy action.
- Tapping an Activity card starts the run when requirements and RAP are sufficient. Long-pressing opens the full-content Activity detail view with requirements, runtime, XP split, Drop Table, Bad Luck Protection state, and a Start Run action.
- Skill cards still open the Skill detail view because training requires choosing a duration.
- The Activity Drop Table keeps Bad Luck Protection compact. Detailed rule explanations belong in the Handbook.
- Katalogdaten are modularized by domain/category. `src/data.ts` remains the stable import facade so existing systems can keep importing from `./data`.
- Catalog lookup and unlock rules live in `src/catalog.ts` rather than page components. Future database/indexing work should attach at this selector layer before touching UI components.
- The app still uses a static client-side catalog and local save data. A real backend database is not needed for GitHub Pages yet; consider IndexedDB first for very large local player histories, and a server/cloud database when accounts or cross-device sync become active requirements.

Implemented early systems:

- RAP wallet: persisted through versioned browser `localStorage`.
- Lifetime RAP and recent manual activity log: persisted through versioned browser `localStorage`.
- Active skill training: supports 1, 2, 5, and 12 hour training jobs with up to three concurrent skills.
- Training jobs are persisted in the save file and processed from timestamps on reload, so elapsed offline/closed-app time is applied deterministically.
- Active gameplay Activity runs: supports timestamped short runs, persisted in save v5 and processed from timestamps on reload.
- Activity run counts and recent Activity results are persisted in save v5.
- Activity saves migrate to v5 for richer Activity run/result data while still accepting v1-v4 saves.
- Activity results now include RAP spent, runtime, Skill Advantage, Additional Roll state, roll rows, XP awarded, XP bonus percentages, and optional dropped Collectible ID.
- Account Bonuses are derived from owned Collectibles at runtime. The first implemented bonus types are skill-specific XP, all-skill XP, and Additional Roll chance.
- Skill Advantage is calculated from Activity skill requirements and grants up to +15% Activity XP, -15% RAP cost, and -15% runtime as the player approaches Level 120 above the requirement.
- Handbook content is data-driven in `src/handbook.ts` and rendered by `src/pages/HandbookPage.tsx`. It currently contains 17 reusable entries across five categories, supports search, category filters, related topics, contextual page introductions, and direct return to the originating page/detail view. The schema is intended to scale past 200 entries without changing page components.
- Skill progression: implemented as XP per skill using tiered XP/hour rates while spending 10,000 RAP/hour per active skill.
- Collectible catalog: implemented as modular static data under `src/data/`, exposed through `src/data.ts`, and queried through `src/catalog.ts`.
- Purchase/unlock logic: implemented with RAP costs and requirements.
- Codex collection overview: implemented as category progress tiles.
- Codex progress overview: category tiles show `current/total`, percentage, and a progress bar. Skills use total skill level out of maximum total level.
- Unlock feedback: purchases show a centered unlock confirmation with icon, name, category, and an `Added to Codex` message. The home page also keeps the latest in-session unlocks.
- Mobile-only UI navigation: implemented with topbar and page state.
- Planned collection subpage direction: replace text-heavy list cards with dense icon-based grids. The approved mockup direction uses five compact tiles per row for Skills and a similar icon-first grid for Mounts.

## Data Model Notes

Likely entities:

- Player profile: current RAP, lifetime RAP, owned collectible IDs, skill levels.
- Activity log entry: activity ID, display name, hours, RAP granted, and timestamp.
- Gameplay Activity: ID, name, type, RAP cost, runtime, requirements, XP reward split, Drop Table, and Bad Luck Protection state derived from run count.
- Active Activity run: activity ID, startedAt, endsAt, prepaid effective RAP cost, base RAP cost, effective runtime, base runtime, and Skill Advantage percent.
- Activity result: completed activity, run count, RAP spent, runtime, Skill Advantage, Additional Roll state, roll rows, XP awarded, XP bonus percentages, and optional dropped collectible ID.
- Skill: ID, display name, source game(s), XP, derived level, max level 120.
- Collectible: ID, name, category, rarity, RAP cost, requirements, unlock state, optional source such as an Activity drop, and optional Account Bonuses.
- Collectible Account Bonuses: optional `bonuses` array in `src/data.ts`; current bonus types are `skill-xp`, `all-skill-xp`, and `additional-roll-chance`.
- Requirement: skill ID plus required level.
- Category: ID, display name, total count, unlocked count.
- Class/Race grouping: use `Collectible.type` for broad labels such as `Melee Tank`, `Magic Support`, `Dwarf`, or `Machine`. Avoid deeper subpage routing until content volume proves it is needed.
- Collectible status logic: do not treat missing RAP as a red lock. Red means progression requirements are missing; yellow means the entry is qualified by requirements and may only need RAP.
- Activity-only collectible drops are not directly purchasable. If unowned, they stay locked/red with an indigo source strip; if owned, the tile uses an indigo owned source state.
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
- Current committed Mount icon batch covers all 8 mounts with transparent 256x256 WebP assets in the approved gritty old-school inventory style.
- Current committed Pet icon batch covers all 6 pets with transparent 256x256 WebP assets. `Pocket Spriggan` is represented by a woodland leaf/root charm because direct Spriggan/Woodland familiar prompts were rejected by the image-generation safety system.
- Current committed Class icon batch covers all 8 classes with transparent 256x256 WebP assets. Class visuals are equipment/emblem objects rather than character portraits, so they remain distinct from the Characters category.
- Remaining collectible icon coverage gap after the first Activity implementation: 18 missing icons across Characters, Races, and the two new Activity-only drops.

## Commit And Push Policy

- Code and program changes must be committed and pushed when a task is finished.
- Design-only documentation changes should be recorded in the docs, but should not trigger their own commit/push.
- Design-only documentation changes can be included with the next commit/push that contains code or program changes.
- When player-facing mechanics are added or changed, review and update the in-app Handbook as part of the same implementation.

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
- Prepare missing collectible icon prompts: `npm run icons:prepare`
- Normalize one generated icon source: `python scripts\normalize-icon.py --input tmp\icon-pipeline\source\<id>-alpha.png --out public\assets\icons\<category>\<id>.webp --key "#00ff00"`

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
- Classes and Races category expansion verified locally with Playwright at `390x844` against `http://127.0.0.1:5173/`:
  - Collectibles overview shows Characters, Classes, Races, Skills, Pets, and Mounts in order
  - Classes and Races each start with 8 entries
  - Class and Race detail panels show type and RAP cost through the shared collectible detail view
  - buying Highland Human persists through reload and updates Races progress to `1/8`
  - no console warnings/errors and no failed requests
- Collectible status color grouping verified locally with Playwright at `390x844` against `http://127.0.0.1:5173/`:
  - owned tiles use the `owned` status and sort first
  - requirement-ready tiles use the `ready` status even with `0 RAP`
  - missing-requirement tiles use the `locked` status and show the lock icon
  - ready and owned tiles do not show the lock icon
  - Classes and Races both show the new status behavior
  - Skills do not receive collectible status classes
- Type filters, detail panel, and save import/export verified locally with Playwright at `390x844` against `http://127.0.0.1:5173/`:
  - Export Save downloads a `rap-collectibles-save-YYYY-MM-DD.json` file
  - Import Save accepts valid v2 save JSON and replaces local player progress
  - imported RAP and owned collectible progress render after import
  - Classes can be filtered by type, for example `Melee Tank`
  - collectible detail panels show status and purchase messaging
- Codex progress, unlock feedback, v3 saves, and manual activity logging verified locally with Playwright at `390x844` against `http://127.0.0.1:5173/`:
  - v2 saves migrate into the new v3 save key
  - all six category tiles render progress bars and percentages
  - Skills display total level progress such as `30/3600` and `1%`
  - tapping `Walking` grants 20,000 RAP, updates lifetime RAP, and adds a recent activity entry
  - buying Highland Human shows the unlock notice and adds it to Recent Unlocks
  - Races progress updates to `1/8` and `13%`
  - locked requirement detail rows show a requirement icon, current level, required level, and `Needed`
  - no console warnings/errors and no failed requests
- Mount icon pipeline verified locally:
  - `npm run icons:prepare` reports 38 collectibles and 30 remaining missing icons after the full Mount pass
  - all 8 Mount data entries now reference transparent WebP icon assets
  - generated Mount sources were copied from `C:\Users\nikla\.codex\generated_images\...` into ignored `tmp/icon-pipeline/source`
  - chroma-key removal used the installed Image Gen helper plus `scripts/normalize-icon.py`
  - contact sheet inspection confirmed all Mounts are background-free and visually consistent enough for compact grid tiles
- Pet icon pipeline verified locally:
  - `npm run icons:prepare` reports 38 collectibles and 24 remaining missing icons after the full Pet pass
  - all 6 Pet data entries now reference transparent WebP icon assets
  - generated Pet sources were copied from `C:\Users\nikla\.codex\generated_images\...` into ignored `tmp/icon-pipeline/source`
  - chroma-key removal used the installed Image Gen helper plus `scripts/normalize-icon.py`
  - mobile Playwright check confirmed 6 Pet tiles and 6 loaded Pet images, with no console warnings/errors and no failed requests
- Class icon pipeline verified locally:
  - `npm run icons:prepare` reports 38 collectibles and 16 remaining missing icons after the full Class pass
  - all 8 Class data entries now reference transparent WebP icon assets
  - generated Class sources were copied from `C:\Users\nikla\.codex\generated_images\...` into ignored `tmp/icon-pipeline/source`
  - chroma-key removal used the installed Image Gen helper plus `scripts/normalize-icon.py`
  - mobile Playwright check confirmed 8 Class tiles and 8 loaded Class images, with no console warnings/errors and no failed requests
- Adventure Activities verified locally:
  - Browser plugin path was attempted first, but the in-app browser returned `Browser is not available: iab`; Playwright was used as fallback.
  - `npm run build` succeeds after adding `src/activities.ts`, save v4, main menu navigation, and Activity UI.
  - Mobile Playwright check at `390x844` confirmed the app opens on `Menu`, navigates to `Collectibles`, and Activity-only `Trawler Gull` appears under `Pets` with `Source: Fisher's Trawler` and a disabled `Activity Drop` action.
  - Mobile Playwright check confirmed `Menu -> Adventure -> Activities -> Fisher's Trawler`, requirement display, `Current 1 / 500` base drop chance, starting a 3-second run, RAP decreasing from 50,000 to 40,000, run count persistence, saved activity result persistence, and Fishing XP gain.
  - Mobile Playwright check confirmed Bad Luck Protection display at 1,000 runs: `Current 3 / 500` and active protection copy.
  - No console warnings/errors and no failed requests were observed in the Activity QA run.
- Handbook verified locally:
  - Browser plugin path was attempted first, but the in-app browser returned `Browser is not available: iab`; Playwright was used as fallback.
  - `npm run build` succeeds after adding the Handbook page.
  - Mobile Playwright check at `390x844` confirmed `Menu -> Handbook` renders Handbook sections including Bad Luck Protection.
  - Mobile Playwright check confirmed `Menu -> Adventure -> Activities -> Fisher's Trawler` still renders the Drop Table, shows compact chance text, shows `Protected` when Bad Luck Protection is active, and no longer visibly repeats the full Bad Luck Protection explanation in the Drop Table.
  - No console warnings/errors and no failed requests were observed in the Handbook QA run.
- Tools, Account Bonuses, and Activity Result Panels verified locally:
  - Browser plugin path was attempted first, but the in-app browser returned `Browser is not available: iab`; Playwright was used as fallback.
  - `npm run build` succeeds after adding `src/bonuses.ts`, save v5, Tools, Activity Result Panel, Skill Advantage, Account Bonuses, and Additional Roll state.
  - Mobile Playwright check at `390x844` confirmed `Collectibles -> Tools` shows `Harpoon`, `Dragon Harpoon`, and `Storm Harpoon`.
  - Mobile Playwright check confirmed `Harpoon` shows `+2% Fishing XP`, can be bought with 20,000 RAP from a fresh save, and appears as a normal Tool collectible.
  - Mobile Playwright check confirmed `Adventure` no longer shows the old `Recent Activity Results` list.
  - Mobile Playwright check confirmed `Fisher's Trawler` shows Skill Advantage, owned Tool bonuses, the expanded Drop Table including `Storm Harpoon` at `1 / 25000`, and a result panel after completion.
  - The Activity Result Panel showed RAP spent, runtime, XP by skill, Roll 1, Additional Roll, and the active Additional Roll chance from `Storm Harpoon`.
  - No console warnings/errors and no failed requests were observed in the Tools/Activity Result QA run.
- Architecture refactor verified locally:
  - `npm run build` succeeds after splitting catalog data, adding `src/catalog.ts`, adding `src/format.ts`, and extracting shared UI/page components.
  - `npm run icons:prepare` succeeds after updating the icon prompt pipeline for modular `src/data/collectibles/*.ts` files. It currently reports 43 Collectibles and 21 missing icons.
  - `src/data.ts` is now a small stable facade, while category-specific data lives under `src/data/collectibles/`.
  - `src/App.tsx` was reduced from about 59.9 KB to about 41.7 KB by moving shared rules, formatting, visual primitives, dialogs, TopBar, Main Menu, and Handbook into separate modules.
  - No gameplay behavior was intentionally changed in this refactor.
- Dashboard navigation and Long Press interactions verified locally:
  - `npm run build` succeeds after adding the compact main dashboard, origin-aware Back routing, manual Activity detail view, and shared `useLongPress` helper.
  - `npm run icons:prepare` succeeds and still reports 43 Collectibles with 21 missing icons.
  - Mobile Playwright check at `390x844` confirmed the main dashboard shows Adventure, Collectibles, and Log Activity on the first page.
  - Mobile Playwright check confirmed tapping Walking grants RAP, long-pressing Reading opens the manual Activity detail view, tapping Skills opens the Skills page directly, and Back returns to the main dashboard.
  - Mobile Playwright check confirmed tapping Stable Pony opens the purchase confirmation while long-pressing the same Mount opens its detail view.
  - Mobile Playwright check confirmed long-pressing Fisher's Trawler opens its Activity detail view.
  - No console warnings/errors and no failed requests were observed in the dashboard/Long Press QA run.
- Mockup dashboard and contextual Handbook verified locally on 2026-07-09:
  - `npm run build` succeeds with the data-driven Handbook registry and redesigned main dashboard.
  - The Codex in-app Browser is available again and was used at `390x844` for the required rendered verification.
  - The redesigned Menu fits Adventure, Collectibles, and Log Activity within the first `390x844` viewport with no horizontal overflow. A `360x800` check also showed no clipped tile labels or topbar overflow.
  - Save Status, Export Save, Import Save, and recent Activity history are absent from the main dashboard; local autosave still works.
  - The topbar book icon opens the correct Main Menu, Activities, and Fisher's Trawler contextual guides.
  - Opening the book again reaches the complete index; search for `Bad Luck` returns one article, article navigation works, and Back restores the exact Activity detail view.
  - Tapping Walking still grants 20,000 RAP and no console warnings/errors were observed.

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

2026-07-05: Save v3 with manual activity logging.

- Original problem: the app still relied on the debug RAP plus button for earning and did not expose a player-facing first version of real-life activity earning.
- Successful solution: add `src/economy.ts` with fixed one-hour activity RAP rates, extend the save file to v3 with `lifetimeRap` and `activityLog`, migrate v1/v2 saves, and render a compact `Log Activity` panel plus Save Status on the Collectibles home page.
- Why it works: the activity system is data-driven and uses the same RAP wallet as the rest of the app, so future real tracking can replace the manual tap source while preserving the save shape and economy constants.
- Files involved: `src/economy.ts`, `src/save.ts`, `src/App.tsx`, `src/styles.css`.
- Commands used: `npm run build`, local Playwright mobile activity/save QA through `node`.

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

2026-07-05: Reusable collectible icon pipeline and full Mount icon pass.

- Original problem: non-Skill collectibles still used placeholder category icons or earlier Mount art with baked-in backgrounds/glows, which conflicted with the approved transparent old-school inventory icon direction.
- Successful solution: add `scripts/prepare-icon-prompts.mjs` to produce missing-icon prompts and target paths from `src/data.ts`, add `scripts/normalize-icon.py` to center transparent 256x256 WebP icons, regenerate all Mount icons on chroma-key backgrounds, remove the key locally, and wire all Mount entries to asset paths.
- Why it works: source generation, chroma-key removal, normalization, and data wiring are now repeatable. The UI remains responsible for tile backgrounds, lock state, owned state, and glows; image files are reusable subject-only assets.
- Files involved: `scripts/prepare-icon-prompts.mjs`, `scripts/normalize-icon.py`, `src/data.ts`, `public/assets/icons/mounts/*.webp`, `package.json`, `.gitignore`.
- Commands used: built-in Image Gen, `npm run icons:prepare`, `remove_chroma_key.py`, `python scripts\normalize-icon.py`, contact sheet inspection with Pillow.

2026-07-05: Full Pet icon pass.

- Original problem: Pets still used placeholder category icons, leaving the category visually inconsistent with Skills and Mounts.
- Successful solution: generate six Pet source images through the built-in Image Gen tool, remove chroma-key backgrounds locally, normalize to transparent 256x256 WebP assets, and wire all Pet entries in `src/data.ts`.
- Important detail: direct Spriggan/Woodland familiar prompts were rejected by the image-generation safety system, so `Pocket Spriggan` is represented by a woodland leaf/root charm while preserving the category/type meaning.
- Files involved: `src/data.ts`, `public/assets/icons/pets/*.webp`, `project_memory.md`, `game_design.md`.
- Commands used: built-in Image Gen, `remove_chroma_key.py`, `python scripts\normalize-icon.py`, `npm run icons:prepare`, `npm run build`, local Playwright mobile Pet asset check.

2026-07-05: Full Class icon pass.

- Original problem: Classes still used placeholder category icons, and the app needed a distinct visual language so Classes would not be confused with Characters.
- Successful solution: generate eight Class icons as equipment/emblem objects, remove chroma-key backgrounds locally, normalize to transparent 256x256 WebP assets, and wire all Class entries in `src/data.ts`.
- Why it works: class icons communicate roles through gear and symbols rather than portraits, which keeps the compact grid readable and leaves portraits/figures for the Characters category.
- Files involved: `src/data.ts`, `public/assets/icons/classes/*.webp`, `project_memory.md`, `game_design.md`.
- Commands used: built-in Image Gen, `remove_chroma_key.py`, `python scripts\normalize-icon.py`, `npm run icons:prepare`, `npm run build`, local Playwright mobile Class asset check.

2026-07-06: Adventure Activities with Activity-only drops.

- Original problem: the app had collection and skill progression, but no repeatable gameplay system that spent RAP for rewards, XP, and rare source-specific collectible drops.
- Successful solution: add `src/activities.ts` with data-driven Activity definitions and processing, add save v4 fields for active Activity runs, run counts, and recent Activity results, split navigation into `Menu`, `Collectibles`, and `Adventure`, and mark Activity-only Collectibles with `source`.
- Why it works: Activity runs are timestamped and prepaid, so they survive reloads without creating free rewards. The processor awards XP at 75% of direct training efficiency using reward shares such as 50% + 25%, rolls every unowned drop, and awards at most one collectible by choosing the rarest successful roll. Bad Luck Protection is derived from run count and triples chance once runs reach twice the drop denominator.
- Files involved: `src/activities.ts`, `src/App.tsx`, `src/data.ts`, `src/save.ts`, `src/styles.css`, `project_memory.md`, `game_design.md`.
- Commands used: `npm run build`, local Playwright mobile Activity QA through `node`, `view_image` inspection of the QA screenshot.

2026-07-06: In-app Handbook.

- Original problem: system explanations such as Bad Luck Protection are important but make core Activity panels too dense if repeated everywhere.
- Successful solution: add a player-facing `Handbook` page from the main menu and move detailed system explanations there. Keep Activity Drop Tables compact by showing base/current chance and `Protected` only when active.
- Why it works: complex mechanics remain discoverable without bloating the main gameplay UI. Future player-facing mechanics now have a defined place for explanation.
- Files involved: `src/App.tsx`, `src/styles.css`, `project_memory.md`, `game_design.md`.
- Commands used: `npm run build`, local Playwright mobile Handbook QA through `node`, `view_image` inspection of the Activity Drop Table screenshot.

2026-07-08: Tools, Account Bonuses, Skill Advantage, and Activity Results.

- Original problem: Activities needed more long-term progression hooks than simple XP and rare drops, while the UI needed a clearer completion moment than a small recent-results list.
- Successful solution: add `src/bonuses.ts`, the `Tools` Collectibles category, bonus metadata on Collectibles, save v5 Activity run/result fields, Skill Advantage economics, expanded Fisher's Trawler drops, and a full Activity Result Panel.
- Why it works: Account Bonuses are derived from owned Collectibles, so adding future bonus-granting drops is data-first. Skill Advantage is computed from existing skill requirements, so Activities automatically reward over-leveling without custom per-Activity code. Activity Results are saved as structured rows, so the UI can display Roll 1, Additional Roll, XP, RAP spent, and drops after reload-safe timestamp processing.
- Files involved: `src/data.ts`, `src/bonuses.ts`, `src/activities.ts`, `src/save.ts`, `src/App.tsx`, `src/styles.css`, `project_memory.md`, `game_design.md`.
- Commands used: `npm run build`, local Playwright mobile Tools/Activity Result QA through `node`.

2026-07-08: Architecture refactor for modular catalog and UI structure.

- Original problem: `src/App.tsx` and `src/data.ts` were becoming too large and mixed UI, catalog rules, helper formatting, and static content. This would make future large content patches harder and risk inconsistent rule changes across pages.
- Successful solution: split catalog data into `src/data/` modules, keep `src/data.ts` as a stable facade, add `src/catalog.ts` for lookup/unlock/status selectors, add `src/format.ts`, and extract reusable UI/page components to `src/ui/` and `src/pages/`.
- Asset pipeline detail: `scripts/prepare-icon-prompts.mjs` now reads `src/data/collectibles/*.ts`; keeping it pointed at the old facade would produce `Collectibles: 0`.
- Why it works: systems can still import the public catalog from `./data`, but future category additions now happen in smaller files. UI components call selectors such as `getCollectiblesByCategory`, `getCollectibleById`, `collectibleStatus`, and `requirementsMet`, which gives the project a clear future insertion point for indexing, IndexedDB, or backend catalog loading.
- Database decision: do not add a server database for the current GitHub Pages prototype. Static TypeScript catalog data plus selector/index modules is the right current layer. Revisit IndexedDB for large local logs/histories and a backend database for account/cloud-sync requirements.
- Files involved: `src/App.tsx`, `src/catalog.ts`, `src/format.ts`, `src/data.ts`, `src/data/**`, `src/pages/**`, `src/ui/**`, `project_memory.md`, `game_design.md`.
- Commands used: `npm run build`, `npm run icons:prepare`.

2026-07-09: Contextual Handbook wiki and unified main dashboard.

- Original problem: the main menu mixed three visual systems, detached the Handbook from page context, and spent a large part of the screen on save controls. The static Handbook page would also become unmanageable with hundreds of mechanics.
- Successful solution: use the selected compact mockup as the dashboard target, remove save/history controls from the Menu, move the Handbook to a global topbar action, and add `src/handbook.ts` as a reusable article/context registry. `HandbookPage` now supports contextual introductions, relevant entries, full index browsing, search, category filters, related topics, and article detail views.
- Why it works: pages only resolve a Handbook context while mechanics remain single-source articles. Opening the Handbook stores both the origin page and active detail view, so Back restores the exact prior state. The same registry can grow beyond 200 entries without adding page-specific Handbook components.
- Important implementation detail: `.app-shell` uses `width: min(100%, 430px)` rather than `100vw`; the latter included desktop scrollbar width and produced a horizontal overflow during long Handbook pages.
- Files involved: `src/handbook.ts`, `src/pages/HandbookPage.tsx`, `src/pages/MainMenuPage.tsx`, `src/ui/TopBar.tsx`, `src/App.tsx`, `src/styles.css`, `game_design.md`, `project_memory.md`.
- Commands and tools used: `npm run build`, Vite dev server, Codex in-app Browser at `390x844` and `360x800`, side-by-side mockup comparison.

## Known Issues

- Need to avoid feature creep. First prototype should remain RAP button plus simple mount purchasing and Codex progress.
- Progress is currently persisted locally in the browser only. Clearing browser site data, switching browsers/devices, or using private mode can still lose local progress. Cloud sync/export-import is a planned future hardening step.
- Current manual Activity Log is a placeholder and always logs exactly 1 hour per tap. Duration choice, editing, deletion, anti-cheat, and real sensor integrations are not implemented yet.
- Non-Skill collectible icon coverage is not complete yet. The original Mounts, Pets, and Classes are complete; Characters, Races, and the first two Activity-only drops still need generated transparent icons.
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
