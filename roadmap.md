# Product Roadmap

This file tracks implementation order, dependencies, and acceptance criteria. Detailed game rules live in `game_design.md`; technical knowledge lives in `project_memory.md`.

## Now: Progression Foundation

- [x] Rename the gameplay hub to `World` and repeatable gameplay runs to `Adventures`; keep real-life earning under `Activity Log`.
- [x] Centralize placeholder economy, XP, Mastery, modifier, and drop values in typed balance data.
- [x] Add generic Content Mastery tracks from Level 0 to 50, progressed by base RAP cost rather than discounted cost.
- [x] Make Adventure XP shares total 100% and validate that invariant at build time.
- [x] Replace shared Chaser Roll Units with globally unique fixed-chance Chaser items, shared ownership, explicit eligible activities, and no Bad Luck Protection.
- [x] Add a balance report for RAP-per-hour, Mastery time, expected drops, and bonus stacking.
- [x] Add save v10 migration for local Mastery, Specialization XP/run-start eligibility, removal of shared Roll Units, and Cosmetic entitlements.
- [x] Remove content families/routes and enforce one unique local Mastery track per repeatable activity.

Acceptance criteria:

- Changing a Mastery target, curve ratio, reward value, XP share, or drop denominator requires a data edit rather than component changes.
- Existing saves migrate without losing RAP, Skills, owned Collectibles, training, or active Adventures.
- Tests reject invalid XP totals, missing references, duplicate IDs, and malformed Mastery rewards.

## Next: Player-Facing Progression

- [x] Show compact Mastery rank/ring on Adventure overview and detail views, with passive effect and milestone data available in the system.
- [x] Add an Account Bonuses page grouped into Skill XP, Rolls & Luck, Adventure modifiers, and future resistance groups.
- [x] Add cross-category Collection Sets and a dedicated Codex Sets view.
- [x] Rename the player-facing `Characters` category to `Heroes`.
- [x] Add Profile foundations for Badges and curated Themes without character-specific progression.
- [x] Make the initial Theme collection directly selectable and keep Badge rewards progression-gated.
- [x] Add a machine-readable Skill Acquisition Matrix.
- [x] Add the account-wide Achievement foundation with non-spendable AP, multi-stage series, title rewards, completion notifications, and a dedicated overview.
- [x] Introduce the `Vault` parent area under `Collectibles` with `Sets` and `Skill Capes` as the first subpages, including all 99/120 Skill Cape definitions, assets, unlock reconciliation, and notifications.
- [x] Add a global Inspect view for raster icons and images without changing surrounding card actions.
- [x] Simplify Adventure overview/detail presentation and add shared focused Info Panels for Requirements and Drops.
- [x] Present primary Skill and Collectible artwork on their detail pages, remove the Skill-detail Vault block, and eliminate the separate primary image-preview step.
- [x] Route every Collectible purchase through its detail panel, remove tile Quick Buy, prevent owned items from reopening purchase confirmation, and simplify Skill training to one 72-hour Start/Stop action.
- [x] Add the first playable Skill Specialization pilot: Maritime Fishing unlocks from Fishing 30, uses the main Level 1-120 XP curve, gains additional XP from Fisher's Trawler, and has compact overview/detail UI.
- [x] Populate every Skill with three broad provisional Specializations at parent-Skill Levels 30, 60, and 90, while leaving unconnected tracks visible but without XP sources.
- [x] Make topbar and browser Back follow deterministic hierarchy, including Specialization-to-Skill, detail-to-list, Vault children-to-Vault, and utility origin restoration.
- [x] Add the data-driven Quest/Campaign foundation with Account-first menu order, three-level Quest navigation, up to three fairly funded background Quests, permanent Quest Points, save v11 migration, completion notifications, Handbook coverage, and the complete `The Slayer's Oath` pilot.

Acceptance criteria:

- New Adventures, Sets, bonuses, and Cosmetics can be added through typed data.
- Account Bonus sources are inspectable and totals use one documented modifier order.
- Set completion is derived from owned Collectibles; Sets are not a second inventory.
- Direct Skill Training remains available until every Skill has a Level 1 gameplay source.
- Achievement progress is derived from existing account state; completion rewards remain idempotent across reloads and save migration.
- Vault progress is derived from Sets and Skill levels; all 60 Skill Capes have stable data IDs, Skill-specific icons, and save migration coverage.
- Quest completion and rewards are deterministic and idempotent; parallel funding, zero-RAP waiting, fixed hierarchy, and 320px/390px mobile layouts are validated.

## Later: Content Expansion

- Connect the provisional Specialization catalog to suitable Adventures, further Quest Campaigns, Minigames, and Bosses; revise names or unlock levels where actual content requires it.
- More Quest Campaigns and Chapter stories; Minigames and Bossing as independent activities using shared account Skills, Specializations, Collectibles, and explicit prerequisites.
- Skill Mastery 1-100 after normal Level 120.
- More Heroes, Sets, Profile rewards, Themes, Tile Styles, and unlock animations.
- Expand the provisional Achievement catalog, balance AP values, add rare exceptional Collectible rewards, and introduce further AP-threshold Title Achievements.
- User-defined real-life Activities and timestamp-based Activity timers.
- Native HealthKit and Health Connect adapters while preserving manual logging.
- Cloud accounts and cross-device synchronization before broad public release.

## Locked Rules

- RAP is the shared currency and Content Mastery uses undiscounted base RAP as progress.
- Content Mastery has Levels 0-50; Skill Mastery is a separate future system after Level 120.
- Adventure XP shares total 100% before bonuses.
- Specialization XP is explicitly additional to the 100% core Adventure Skill split and is only awarded when unlocked at run start.
- Every repeatable activity has its own Mastery track; routes and shared content families are out of scope.
- Global Chaser ownership is shared across eligible activities, but chance is fixed per completion with no Roll Units or Bad Luck Protection.
- Progression is account-based; Heroes do not have separate levels, inventories, or saves.
- Released content remains available. Themes and event-styled Sets do not create FOMO.
- Cosmetics are earned through play or expansion content, not designed around microtransactions.
- Achievement Points are permanent account score, never an expendable currency or RAP substitute.
- Quest Points are permanent account score separate from AP and RAP. Quests have no cancellation, random drops, routes, or Content Mastery; at most three progress in parallel and wait without backcharging when RAP reaches zero.

## Provisional Balance Values

The following remain placeholders until balance reports and play data justify locking them:

- RAP earning rates
- Adventure costs and runtimes
- Mastery targets and threshold ratios
- XP rates and Skill Advantage caps
- Drop denominators and Bad Luck Protection thresholds
- Account and Mastery bonus percentages
- Requirements and Specialization unlock levels
- Achievement Point values and reward thresholds
- Quest RAP costs, durations, Quest Point rewards, requirements, and Chapter/Campaign bonuses
