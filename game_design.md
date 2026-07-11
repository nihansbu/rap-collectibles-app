# Game Design

## Vision

A mobile-only high-fantasy collector app where real-life effort is represented by RAP, short for Real Life Activity Points. The player earns RAP, spends RAP, trains fantasy skills, and unlocks collectibles such as mounts, pets, heroes, races, classes, tools, and cosmetics.

The product should feel like a collection and progression companion, not a traditional game. Heroes and Collectibles matter because they are owned, unlocked, and shown in the Codex, not because the player directly controls separate characters.

## Core Loop

Initial prototype loop:

1. Player presses a button.
2. Player receives 10,000 RAP.
3. Player spends RAP on mounts.
4. Player sees unlocked mounts and category progress in the Codex.

Long-term loop:

1. Player earns RAP from real-life activities.
2. Player trains skills with RAP.
3. Player meets skill requirements for collectibles and repeatable Adventures.
4. Player spends RAP to unlock direct-purchase collectibles or run Adventures.
5. Adventures award skill XP, Mastery, and can drop exclusive collectibles.
6. Player watches Codex completion increase.
7. Player keeps up to three costly one-time Quests progressing in the background for story, Quest Points, XP, and rare profile rewards.

## RAP

RAP means Real Life Activity Points.

Design rules:

- RAP is the only currency at the start.
- RAP can be used for all purchases and skill training.
- RAP can be spent on repeatable gameplay Adventures.
- RAP continuously funds active one-time Quests at each Quest's displayed hourly rate.
- A simple RAP grant button remains available only as a development tool; it is not part of the production player flow.
- The first player-facing earning placeholder is a manual `Log Activity` panel. Each tap logs 1 hour and grants RAP immediately.
- Real activity tracking can be added later without changing the core economy.
- Real-life earning entries are called `Activities`; repeatable in-game content is called `Adventures` and lives under `World`.

Current manual activity rates:

- Walking: 20,000 RAP/hour
- Reading: 15,000 RAP/hour
- Podcast: 15,000 RAP/hour
- Gym: 45,000 RAP/hour
- Work: 10,000 RAP/hour
- Music Practice: 20,000 RAP/hour

Early collectible cost bands:

- Common: 8,000-20,000 RAP
- Uncommon: 18,000-40,000 RAP
- Rare: 40,000-85,000 RAP
- Epic: 75,000-160,000 RAP
- Legendary: 150,000-350,000 RAP

## Handbook

The Handbook is a player-facing in-app wiki available from the book icon in every topbar.

Design rules:

- The Handbook should explain core systems that are important but too detailed for the main UI.
- The Handbook is not a developer design document; it should use clear in-game language.
- Whenever a new mechanic is added or an existing mechanic changes, the Handbook must be reviewed and updated if that mechanic affects player-facing rules.
- Detailed system explanations should prefer the Handbook over repeated dense copy inside core gameplay panels.
- Opening the Handbook from a page first shows a short explanation of that page and a curated set of relevant entries.
- Opening the book icon again from a contextual guide opens the complete Handbook index.
- Back returns to the exact origin, including an open Skill, Collectible, Adventure, or manual Activity detail view.
- Entries are reusable wiki articles. A mechanic such as Bad Luck Protection should be written once and linked from every relevant page context.
- The full Handbook must remain practical at 200 or more entries through search, categories, related topics, and a data-driven article registry.

Current Handbook topics:

- Basics
- RAP
- Skills
- Adventures
- Quests and Campaigns
- Quest Funding and States
- Tools
- Account Bonuses
- Drops
- Additional Roll
- Bad Luck Protection
- Codex States
- Requirements
- Skill Training
- Skill Advantage
- Adventure Results
- Saving Progress

## Save And Device Experience

- Player progress autosaves locally and must survive long-running accounts without replaying elapsed time in one-second loops.
- Completed Adventure rewards are deterministic once a run starts; reloading cannot reroll a result.
- Settings shows save state and provides portable JSON export/import.
- Cloud synchronization and accounts are future systems. The current player-facing boundary must state that progress belongs to the current browser.
- The app is installable as a portrait PWA and keeps its application shell available offline.

## Icon Art Direction

Collectible and system icons are reusable transparent assets in a gritty, matte, old-school MMORPG inventory style. They must never contain a frame, tile, card, background, text, or number; the surrounding UI provides those layers.

New icons should remain readable at small sizes while introducing measured variety across the collection: distinct silhouettes, poses or orientations, materials, palettes, and one memorable prop or construction detail. Characters and races should not all be helmeted armored busts. Pets, mounts, tools, classes, and UI symbols should each retain their category identity without becoming visually interchangeable. Existing approved icons can remain in use, but future additions should follow this broader variation rule.

Secondary raster images shown in the UI expose an Inspect action that enlarges the artwork without changing the surrounding card action or progression state. Primary Skill and Collectible artwork is presented directly and prominently on its detail page instead of opening a separate image-preview dialog. Inspect views reuse the transparent asset and close through X, backdrop tap, or Escape.

The RAP wallet uses a compact transparent activity sigil above the numeric RAP value in the TopBar. It is a UI symbol, not a second currency or a decorative tile.

## Collections And Codex

The Codex is the central collection overview. It should make the player feel immediate progress.

The Codex starts as the main `Collectibles` page and should show category tiles in this order:

- Heroes
- Classes
- Races
- Skills
- Tools
- Pets
- Mounts

Each tile should show progress as unlocked count out of total count, for example Mounts 3/20, plus a percentage and progress bar. Skills use total skill level out of maximum total level.

Dense Skill and Collectible grids prioritize legibility over a fixed tile count: four columns on narrow phones and five on wider mobile screens.

Purchasing a collectible should give immediate feedback:

- centered unlock notice
- icon
- collectible name
- category/Codex confirmation
- recent unlock shown on the Collectibles overview

Inside a category, the player should see all entries:

- unlocked collectibles shown clearly
- locked collectibles shown as silhouettes, frames, or disabled cards
- requirements visible where useful
- RAP cost visible for purchasable entries

Collectible tile status colors:

- Owned collectibles are green.
- Ready collectibles are yellow when all non-currency requirements are met, even if the player still needs more RAP.
- Locked collectibles are red when at least one non-currency requirement is missing.
- The lock icon should only appear on red locked tiles.
- Default collection ordering is Owned first, then Ready, then Locked.
- Adventure-only drops stay visible in their normal category, such as Pets or Mounts.
- Unowned Adventure-only drops are red locked tiles with an indigo source strip.
- Owned Adventure-only drops use an indigo owned/source tile state.
- Adventure-only drops cannot be bought directly; their detail panel points to the source Adventure.

## Collectibles

Initial focus: mounts.

Planned collectible types:

- Mounts
- Pets
- Heroes
- Classes
- Races
- Skills
- Tools
- Items
- Future high-fantasy categories

Collectibles can have a source:

- Direct purchase with RAP.
- Adventure Drop from a named Adventure such as `Fisher's Trawler`.

Collectibles can grant Account Bonuses:

- Skill-specific XP bonuses, for example +2% Fishing XP.
- All-Skill XP bonuses later.
- Additional Roll chance for Adventures.

## Tools

Tools are a permanent Collectibles category.

Design decisions:

- Tools are not inventory items and do not use equipment slots in the current prototype.
- Owned Tools are account-wide unlocks.
- Tools can be bought directly or dropped from Adventures.
- Tools can grant simple Account Bonuses.
- Tool icons can be generated later; no new icon pass is required for the first Tools implementation.

Current Tools:

- `Harpoon`: direct purchase, +2% Fishing XP.
- `Dragon Harpoon`: Fisher's Trawler drop, +6% Fishing XP.
- `Storm Harpoon`: Fisher's Trawler chaser drop, +10% Fishing XP and +0.5% Additional Roll chance.

Collectibles can require:

- RAP cost
- one or more skill levels
- possible future prerequisites such as owning another collectible

Example:

- Mount: Verdant Stag
- Cost: 25,000 RAP
- Requirement: Herblore level 73

## Heroes And Account Profile

Heroes are predefined collectible figures, not playable avatars with separate progression.

Design direction:

- The player can collect multiple Heroes.
- Heroes may unlock Profile portraits, Badges, Titles, or Cosmetic variants.
- Races and classes are unlockable collectible categories.
- The account has one customizable Profile assembled from unlocked presentation options.
- Heroes never receive separate levels, inventories, currencies, or save files.

## Achievements And Titles

Implemented design:

- Achievements are permanent, account-wide goals evaluated from RAP, Skills, Collectibles, Sets, Adventures, Content Mastery, and prior Achievement Points.
- Achievement Points (AP) are a cumulative score. They cannot be spent and never replace RAP.
- AP totals do not grant fixed generic ranks. Data-defined Achievements may instead require an AP threshold and award a named reward.
- Multi-stage Achievements use separate one-time stages grouped into a shared series so every stage can grant its own AP and reward.
- Current progress is derived from the existing account state. Only completed IDs, completion timestamps, notification acknowledgement, and resulting unlocks are persisted.
- Collection conditions use typed category filters and optional Collectible tags such as `aquatic`, `land`, and `adventure-drop`.
- Achievement rewards prioritize Profile customization: Titles, Profile Badges, Themes, portraits, Tile Styles, and unlock animations.
- Exceptional Achievements may explicitly award a Mount, Pet, or other Collectible, but these rewards must remain rare and deterministic rather than random.
- Newly completed Achievements appear in a timed, queued notification showing their name, AP, and optional reward.
- The Achievement overview shows total AP, completion percentage, filters, search, category tabs, progress bars, series stages, rewards, and completion dates.
- The initial Achievement definitions and AP values are provisional starter content and require future balancing and expansion.

Titles:

- Titles are account-wide Profile Cosmetics.
- An unlocked Title may be selected on the Profile page, or the player may display no Title.
- The selected Title appears directly under the account name.
- Initial Title rewards are `Pathfinder`, `Stablemaster`, and `Achievement Hunter`.

## Vault

Implemented design:

- `Vault` is the parent area for special, account-wide collection systems within the `Collectibles` section.
- The first Vault subpages will be `Sets` and `Skill Capes`.
- Vault content represents prestigious or milestone-based collections rather than ordinary purchasable Collectibles.
- Sets remain cross-category collection groups with their own progress and rewards.
- Skill Capes remain Skill milestone rewards for Level 99 and Level 120 and are not ordinary Collectible purchases.
- The Vault is intentionally distinct from `Collectibles`, `Achievements`, and `Profile`: Collectibles answers what is owned, Achievements tracks goals, Profile selects presentation, and Vault presents special long-term collections.
- The Vault currently contains a hub, the existing Sets view, and a Skill Capes view with all 60 Skill Capes (30 Skills × two tiers).
- Skill Cape icons share a recognizable cape silhouette but use each Skill's emblem and palette so the associated Skill is identifiable at a glance. Level 99 and Level 120 have distinct base treatments.
- Reaching Level 99 or Level 120 grants the corresponding Cape automatically. Cape grants are permanent, idempotent, persisted, and shown through a one-time unlock toast.

## Classes And Races

Classes and Races are collectible categories under the main `Collectibles` page.

Design decisions:

- Use the English category names `Classes` and `Races`.
- Do not create extra subpages for class or race families yet.
- Use the existing collectible `type` field for grouping and future filtering.
- Every tile follows the standard compact collectible pattern: icon, name, and type.
- Detail panels handle cost, rarity, description, requirements, and purchase action.

Current Class type direction:

- Melee Tank
- Melee DPS
- Melee Support
- Ranged DPS
- Ranged Support
- Magic DPS
- Magic Support
- Hybrid

Current Race type direction:

- Human
- Elf
- Dwarf
- Orc
- Goblin
- Troll
- Machine
- Undead

Race names can be specific variants while the type remains the broader fantasy family. Example: `Ironhold Dwarf` has type `Dwarf`.

## World And Adventures

`World` is the home for repeatable gameplay systems. It is separate from `Collectibles`, because `Collectibles` answers "What do I own?", while `World` answers "What can I do?"

The implemented World subpages are repeatable `Adventures` and one-time long-running `Quests`. Future siblings include `Minigames` and `Bossing`.

Adventure design rules:

- Adventures are repeatable RAP sinks.
- Adventures are not Collectibles.
- Adventures can have Skill and Collectible requirements.
- Adventures cost RAP and have a runtime.
- The prototype runtime is intentionally short, currently around 3 seconds, so the future non-instant design can be tested quickly.
- RAP is paid when the Adventure starts.
- XP, Mastery, and drops are awarded when the Adventure finishes.
- Active Adventure runs and completed run counts are save data.
- Adventure runs are timestamped and process correctly after reload.
- Completed runs show an Adventure Result panel with RAP spent, XP gained, Mastery, rolls, and any dropped Collectible.
- Each Adventure is atomic: fixed requirements, cost, runtime, XP, drops, run count, and local Mastery. There are no route selectors or shared content families.
- Similar future content is added as another independent activity. Account Skills, Specializations, Collectibles, and explicit quest prerequisites provide the cross-content structure.

Adventure XP:

- Adventures award 100% base XP efficiency for their base RAP spend.
- XP can be split across multiple Skills, for example `Fishing 75%` and `Cooking 25%`.
- Reward shares must sum to exactly 100% before Account and Mastery bonuses.
- Account Bonuses can increase the XP for specific Skills or all Skills.
- Skill Advantage can add up to +15% Adventure XP when the player exceeds the Adventure's required Skill level.

Skill Advantage:

- Skill Advantage is based on Skill levels above the Adventure's minimum requirements.
- It scales proportionally from the required level to Level 120.
- Maximum bonus is +15% XP, -15% RAP cost, and -15% runtime.
- The bonus should remain modest so required levels still matter without making Adventures feel mandatory to overlevel first.

Adventure Drop Tables:

- Adventures can contain multiple local Collectible drops and may be an eligible source for a global Chaser item.
- Every unowned drop in the table is rolled on completion.
- A run can award at most one collectible.
- If multiple rolls or drops succeed in one run, the player receives the item with the lower drop chance, meaning the rarer item.
- Owned drops are not awarded again in the current prototype.
- Adventure drops remain visible in their normal Codex category.
- Additional Roll chance can create one extra drop roll after the normal roll.
- Additional Roll starts as a rare Account Bonus, currently +0.5% from Storm Harpoon.
- Chaser items are allowed as very rare drops, for example 1 / 25,000.

Bad Luck Protection:

- Bad Luck Protection should be implemented and explained in the Handbook.
- Once completed runs reach twice the base drop denominator, the chance is tripled.
- Example: a `1 / 500` drop becomes `3 / 500` at 1,000 completed runs.
- Adventure Drop Tables should keep this compact: local drops show their current chance and `Protected` only when active; global Chasers show their fixed chance and `Chaser` or `Owned`.
- Bad Luck Protection does not apply to global Chaser items.

## Quests And Campaigns

`Quests` is the second implemented World system. Quests are expensive one-time background journeys, not Achievements, Adventures, Collectibles, or Content Mastery tracks.

Structure and presentation:

- The Quest overview shows permanent Quest Points, the number of active Quests, and compact Campaign tiles.
- A Campaign contains two to seven ordered Chapters and exactly one Campaign Finale.
- A released normal Chapter contains nine to twenty-five Quests. The first pilot uses nine Quests in each of three Chapters.
- Campaign tiles show one dot per Chapter and an indigo outline while any contained Quest is active.
- Chapter tiles lead to a vertical three-lane Quest tree. The tree may branch and converge, but each Quest remains a single deterministic node.
- Quest detail pages lead with story and status, then show requirements, total RAP cost, duration, derived RAP/hour, rewards, and the Start action.
- The first complete pilot is `The Slayer's Oath`: `First Blood`, `Contracts in Shadow`, `Beasts Beyond the Veil`, and finale `The Apex Covenant`.

Quest rules:

- States are grey `Locked`, gold `Ready`, indigo `Active`, muted indigo `Waiting for RAP`, and green `Completed`.
- Requirements can reference Skills, Specializations, Collectibles, prior Quests, completed Chapters, or Quest Points.
- Starting a Quest requires all requirements, a free active slot, and enough RAP to cover one combined hour across all active Quests after the new Quest is added.
- A maximum of three Quests can be active in parallel.
- Active Quests share elapsed wall-clock time fairly. Their RAP/hour rates are summed, and all receive the same funded duration until RAP is exhausted.
- At zero RAP, Quests remain active in a waiting state. New RAP resumes progress from that moment; paused time is never granted or charged retroactively.
- A started Quest cannot be cancelled or manually paused.
- Completion is timestamp-based, deterministic, idempotent, and safe across reloads and tabs.
- Quests have no player-entered objectives, random drops, Bad Luck Protection, route variants, or Content Mastery.

Quest rewards and progression:

- Quest Points are a permanent non-spendable score, entirely separate from Achievement Points and RAP.
- Quest Points are derived from completed Quest rewards plus Chapter and Campaign completion bonuses.
- Individual Quests can grant Quest Points, Skill XP, Specialization XP, RAP, Cosmetics, or exceptional Collectibles.
- Chapter completion awards bonus Quest Points. Campaign completion requires its Finale and awards a further bonus.
- Major profile rewards belong mainly to Chapter or Campaign milestones. `The Apex Covenant` grants the `Oathbound` Title.
- Balance values in the pilot are provisional until pacing is tested against real RAP earning.

## Content Mastery

Content Mastery is a reusable Level 0-50 progression layer for Adventures and future Minigames and Bosses.

- Every completed run grants Mastery Points equal to its undiscounted base RAP cost.
- Cost reductions never reduce Mastery earned.
- Mastery is progress earned from completed runs, never an entry requirement for the Adventure that grants it.
- Each track defines a configurable target RAP; universal ratio thresholds derive Levels 1-50.
- The Adventure overview and detail page show the rank with a circular ring: neutral at Level 0 and fully gold at Level 50.
- Passive economic bonuses remain modest so new content does not feel punitive.
- Milestones can unlock Cosmetics, Collectibles, or simple Account Bonuses.
- Every repeatable activity owns exactly one Mastery track. No route, family, or sibling activity shares it.
- Mastery bonuses only affect the activity that owns the track.
- Mastery Level is derived from raw saved points so balance values remain data-driven.

Current provisional threshold ratios are 2%, 5%, 10%, 16%, 24%, 34%, 46%, 60%, 80%, and 100% of the configured track target.

## Global Chaser Items

- A Chaser is one globally unique Collectible definition with a fixed denominator and an explicit list of eligible activities.
- Multiple independent Adventures, Minigames, or Bosses may reference the same Chaser without becoming a content family.
- Every eligible completion rolls the same fixed chance independently. Chasers have no Roll Units and no Bad Luck Protection.
- Ownership is account-wide. Once obtained from any source, every eligible Drop Table displays `Owned` and no source can award a duplicate.
- Local Adventure drops retain their own run-based Bad Luck Protection.

## Collection Sets And Cosmetics

- Sets group Collectibles across categories and derive progress directly from the Codex.
- Set rewards can include Profile Badges, curated Themes, or simple Account Bonuses.
- Event-styled Sets remain permanently available and never create FOMO.
- Cosmetics are account-wide presentation unlocks, not separate inventory power.
- Curated Themes control validated color tokens rather than exposing unrestricted color editing.
- The initial Theme collection is directly available from the start so players can choose a presentation immediately. Future Themes may be connected to Adventures, Sets, or Mastery later.
- Profile Badges remain earned rewards; Theme availability and Badge progression are intentionally separate.
- Heroes can unlock Profile rewards but never have separate levels, inventories, currencies, or progression saves.
- Achievement rewards use the same account-wide Cosmetic entitlements and Title selection rather than a separate inventory.

Modifier order:

1. Calculate base XP from undiscounted RAP and the Adventure's 100% Skill share split.
2. Add Collectible Account Bonuses within their own category.
3. Apply the Account subtotal, Content Mastery, and Skill Advantage as separate multipliers.
4. Add RAP cost and runtime reductions within their respective category, subject to central caps.

Current Adventures:

- `Fisher's Trawler`
  - Type: Fishing
  - Cost: 10,000 RAP
  - Runtime: 3 seconds in the prototype
  - Requirement: Fishing 40
  - XP split: Fishing 75%, Cooking 25%
  - Additional Specialization XP: Maritime Fishing 25% when unlocked
  - Direct drops: `Trawler Gull` at 1 / 500, `Dragon Harpoon` at 1 / 750, and `Brine Ray` at 1 / 2,500
  - Global Chaser: `Storm Harpoon` at a fixed 1 / 25,000; currently eligible here
  - Content Mastery target: provisional 5,000,000 base RAP
- `Haunted Burial`
- `Ember Kiln`
- `Deep Mine Survey`

## Skill System

Skills are trained with RAP through time-based training jobs.

Design rules:

- Use only skills that exist in RuneScape 3 and/or Old School RuneScape.
- Do not invent new skills.
- Skills serve primarily as progression gates for collectibles.
- Skill training uses one 72-hour window per Skill, during which RAP is gradually converted into XP over time.
- Up to three skills can train at the same time.
- The Skill detail page has one contextual action: `Start 72h Training` while idle and `Stop Training` while active.
- Stopping is immediate and free. It never removes XP already earned and does not refund RAP already consumed.
- When a window expires, the player must start that Skill again to open a fresh 72-hour window. Active windows cannot be stacked beyond 72 hours.
- Each active skill consumes up to 10,000 RAP/hour. Training can start with less than 10,000 RAP and stops automatically if RAP reaches zero.
- Active training should be visible through an animated gold state on the Skill tile and status copy in the Skill detail panel.
- Training jobs continue through reloads/closed-app time by processing saved timestamps.
- Direct Skill Training is transitional. It remains available until every Skill has at least one Level 1 gameplay acquisition source.
- Specializations are broad sub-disciplines linked to one parent Skill. They unlock automatically from parent Skill levels and have their own Level 1-120 XP using the same curve.
- Specializations cannot be trained with the 72-hour RAP action. They gain additional XP from eligible World activities and are intended to progress more slowly than parent Skills.
- Specialization eligibility is captured when a run starts. Locked tracks receive no XP and no retroactive credit.
- Every current Skill has three broad Specializations at provisional parent-Skill unlock Levels 30, 60, and 90. Names and unlock levels may be revised when concrete World content is connected.
- `Maritime Fishing` is the first connected Specialization. It unlocks at Fishing 30 and is trained by Fisher's Trawler; the remaining catalog entries deliberately have no XP source yet.
- XP/hour should be conservative because later real-world activity can generate roughly 20,000 to 50,000 RAP/hour. Current XP rates per active skill are:
  - Level 1-9: 4,000 XP/hour
  - Level 10-29: 6,000 XP/hour
  - Level 30-49: 8,000 XP/hour
  - Level 50-69: 10,000 XP/hour
  - Level 70-89: 12,000 XP/hour
  - Level 90-99: 14,000 XP/hour
  - Level 100-109: 16,000 XP/hour
  - Level 110-120: 18,000 XP/hour

Skill requirement example:

- Herblore level 73 required to buy a specific mount.

Skill naming decision:

- Use `Hitpoints`.
- Use `Runecrafting`.

Progress persistence decision:

- Player progress must survive normal page reloads.
- RAP, owned collectibles, and skill XP are considered core save data.
- The app is intended for very long-term play over hundreds or thousands of hours, so save-game safety is a core design requirement, not a later polish item.
- Local persistence is acceptable for the current prototype.
- Save export/import is no longer exposed on the main dashboard. A future Settings or account area can restore backup controls without competing with primary gameplay navigation.
- Save v11 includes current RAP, lifetime RAP, owned collectibles, Skill and Specialization XP, active Skill training jobs, active Adventure runs with run-start Specialization eligibility, active and completed Quests, Quest notification acknowledgements, run counts, recent results, recent manual Activity Log entries, local Content Mastery, Cosmetic selections, Achievement completions, notification acknowledgements, AP, selected Title, owned Skill Capes, and Cape notification acknowledgements. Saves v1-v10 migrate forward without fabricated Quest progress; legacy shared Chaser Roll Units are discarded.
- Local autosave continues in the background without a status panel on the main menu.
- Cloud sync is a future priority before the app is treated as durable across devices.

## First Screen Concept

The first usable screen should focus on the mount purchase loop.

Current first screen elements:

- RAP balance at the top.
- Button: gain 10,000 RAP.
- Page title in the topbar.
- Main menu dashboard uses consistent sections for World, Account, Collectibles, and manual Activity Log tiles.
- The Collectibles page contains category tiles for Heroes, Classes, Races, Skills, Tools, Pets, Mounts, and a Vault entry for Sets and Skill Capes.
- Collectibles category tiles show count, percentage, and progress bar.
- The main menu includes a compact manual `Log Activity` grid for one-hour activity entries.
- The Handbook is a global contextual topbar action, not a main-menu tile.
- Save Status, Export Save, Import Save, and recent log history do not occupy the main dashboard.
- No bottom navigation.
- Subpages are reached by tapping compact dashboard/category tiles. If a subpage was opened directly from the main dashboard, Back returns to the dashboard.

Collection subpages should show:

- dense icon-based grid tiles
- as many visible entries as practical on mobile
- icon as the main visual element
- name
- at most one secondary info line
- owned/ready/locked state
- filters for All, Owned, Unlockable, Locked
- type filters generated from the category's current collectible types
- sorting for cost and requirement level
- a full-content detail panel for more information
- a confirmation dialog before purchase

Interaction decision:

- Short tap on every Collectible tile opens its detail/info panel.
- The detail panel fills the content area under the topbar.
- Direct Collectible purchases are initiated only from the detail panel and still use a confirmation dialog before RAP is spent. There is no Quick Buy action on collection tiles.
- Owned Collectibles are never considered unlockable again; their detail action remains disabled and labeled `Unlocked`.
- Adventure tiles use tap to open the Adventure detail view. The detail view contains the Start Adventure action after the player reviews the compact requirements, rewards, and drops.
- Manual Log Activity tiles use tap to log one hour and long press for details.
- Skill tiles open the Skill detail panel on tap because training starts or stops there.
- Skill and Collectible tiles do not intercept their primary artwork with a separate image preview; tapping the tile performs its normal action or opens its detail view.
- Collectible detail panels show status, cost, type, rarity, requirements, and a dedicated unlock/purchase section.
- Skill and Collectible detail panels place a larger primary artwork block above the supporting information. Secondary requirement, drop, Cape, and system artwork may still be inspected when useful.
- Requirement rows should show a requirement icon plus current and needed progress, for example `Attack Level 1 / 20`.
- Native browser text selection should never appear during normal app interaction.

Grid tile direction:

- Subpages should move away from text-heavy list cards toward dense icon grids.
- Skills should use very compact tiles, likely five columns per row on mobile.
- Skills show only icon, skill name, and current level such as `Lv. 73`.
- Classes show icon, class name, and class type.
- Races show icon, race name, and race type.
- Pets show icon, pet name, and pet type.
- Mounts show icon, mount name, and mount type.
- Heroes can show icon/portrait, name, and class/archetype.
- Costs, descriptions, requirements, source game, rarity, and actions belong in the full-content detail panel.
- Scroll behavior must remain available on every subpage when content exceeds the viewport.

Icon art direction:

- Follow the approved dense grid mockup style for Skills and Mounts.
- Icons should be gritty old-school MMORPG / Old School RuneScape-like inventory assets with strong readable silhouettes.
- Icons should be low-detail, matte, slightly rough, and readable at compact mobile tile size.
- Icons must be reusable transparent assets.
- Icons must not include their own frame, border, tile, card, or background. The tile/card background always comes from CSS.
- Avoid high-gloss fantasy illustration, cinematic glow, smoke, sparkles, scene backgrounds, and cute children's-book rendering.
- Icon images should not contain baked-in text. Text stays native UI.
- Icons should work inside compact square tiles and larger detail panels.
- The first full Skill icon pass covers all 30 skills as transparent 256x256 WebP assets.
- The first full Mount icon pass covers all 8 mounts as transparent 256x256 WebP assets.
- The first full Pet icon pass covers all 6 pets as transparent 256x256 WebP assets. Pocket Spriggan currently uses a woodland leaf/root charm visual.
- The first full Class icon pass covers all 8 classes as transparent 256x256 WebP assets. Classes use role equipment/emblems instead of portraits.
- Current content has icon coverage; future Heroes, Races, and Adventure drops must use the documented transparent icon pipeline.
- Use five-column compact grids as the first implementation target for Skills and Collectible subpages, then adjust per-category only if readability suffers.

## Tone And Setting

High fantasy.

The first version should prioritize clarity and fast collection feedback over deep systems.

## Planned Future Features

- Real activity tracking.
- More collection categories.
- Character creation and character collection.
- Unlockable races/peoples.
- Unlockable classes.
- Pets.
- Items.
- Skill-based unlock trees.
- Better Codex presentation with category completion.
- More independent Adventures, local Content Mastery tracks, global Chaser sources, and deeper local Bad Luck Protection tuning.
- Generic Content Mastery Level 0-50 for Adventures, Minigames, and Bosses.
- Globally unique fixed-chance Chaser items across explicit eligible content.
- Cross-category Collection Sets without time-limited availability.
- Account Bonus overview, Heroes, Profile Badges, curated Themes, and earned Cosmetics.
- Expanded Achievement series, AP-threshold rewards, and rare exceptional Collectible rewards.
- Skill Mastery Level 1-100 after normal Skill Level 120; no Level 999 progression.

## Current MVP Scope

Build only:

- RAP balance.
- Button to gain 10,000 RAP.
- Manual one-hour activity logging that grants RAP.
- Mount purchasing with RAP.
- Main Menu ordered as Account, World, Collectibles, and Log Activity. Account shows Profile, Bonuses, then Achievements; World shows Adventures and Quests as equal destinations.
- Contextual Handbook available from every topbar, plus a searchable complete wiki index.
- Repeatable Adventures under World.
- Long-running one-time Quests, Campaigns, Chapter grids, and Quest trees under World.
- Adventure-only Collectible drops visible in their normal Codex categories.
- Bad Luck Protection display for Adventure drops.
- Skill levels required by some mounts.
- Time-based RAP skill training with up to three concurrent skills.
- Codex overview with category progress.
- Codex overview with completion percentage, progress bars, and recent unlocks.
- All RuneScape/Old School RuneScape skills, max level 120.
- Shared collection page pattern for Heroes, Pets, and Mounts.

Still out of scope for the current prototype:

- Real activity tracking.
- Combat.
- Inventory complexity.
- Equipment stats.
- Social systems.
- Multiple currencies.
