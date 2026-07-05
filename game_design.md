# Game Design

## Vision

A mobile-only high-fantasy collector app where real-life effort is represented by RAP, short for Real Life Activity Points. The player earns RAP, spends RAP, trains RuneScape-inspired skills, and unlocks collectibles such as mounts, pets, characters, races/peoples, classes, and items.

The product should feel like a collection and progression companion, not a traditional game. Characters and collectibles matter because they are owned, unlocked, and shown in the Codex, not because the player directly controls them in gameplay.

## Core Loop

Initial prototype loop:

1. Player presses a button.
2. Player receives 10,000 RAP.
3. Player spends RAP on mounts.
4. Player sees unlocked mounts and category progress in the Codex.

Long-term loop:

1. Player earns RAP from real-life activities.
2. Player trains skills with RAP.
3. Player meets skill requirements for collectibles.
4. Player spends RAP to unlock collectibles.
5. Player watches Codex completion increase.

## RAP

RAP means Real Life Activity Points.

Design rules:

- RAP is the only currency at the start.
- RAP can be used for all purchases and skill training.
- The first prototype uses a simple grant button instead of real tracking.
- Real activity tracking can be added later without changing the core economy.

## Collections And Codex

The Codex is the central collection overview. It should make the player feel immediate progress.

The Codex starts as the main `Collectibles` page and should show category tiles in this order:

- Characters
- Skills
- Pets
- Mounts

Each tile should show progress as unlocked count out of total count, for example Mounts 3/20.

Inside a category, the player should see all entries:

- unlocked collectibles shown clearly
- locked collectibles shown as silhouettes, frames, or disabled cards
- requirements visible where useful
- RAP cost visible for purchasable entries

## Collectibles

Initial focus: mounts.

Planned collectible types:

- Mounts
- Pets
- Characters
- Skills
- Races/peoples
- Classes
- Items
- Future high-fantasy categories

Collectibles can require:

- RAP cost
- one or more skill levels
- possible future prerequisites such as owning another collectible

Example:

- Mount: Verdant Stag
- Cost: 25,000 RAP
- Requirement: Herblore level 73

## Characters

Characters are collectible entities, not playable avatars in the first version.

Design direction:

- Player can own multiple characters.
- Characters may have race/people and class.
- Races/peoples and classes may be unlockable collectible categories.
- Characters are part of the fantasy identity and collection fantasy.

## Skill System

Skills are trained with RAP.

Design rules:

- Use only skills that exist in RuneScape 3 and/or Old School RuneScape.
- Do not invent new skills.
- Skills serve primarily as progression gates for collectibles.
- Skill training should remain simple at first: spend RAP to increase skill level.

Skill requirement example:

- Herblore level 73 required to buy a specific mount.

Skill naming decision:

- Use `Hitpoints`.
- Use `Rune Crafting`.

## First Screen Concept

The first usable screen should focus on the mount purchase loop.

Current first screen elements:

- RAP balance at the top.
- Button: gain 10,000 RP.
- Page title in the topbar.
- Four category tiles: Characters, Skills, Pets, Mounts.
- No bottom navigation.
- Subpages are reached by tapping category tiles.

Collection subpages should show:

- dense icon-based grid tiles
- as many visible entries as practical on mobile
- icon as the main visual element
- name
- at most one secondary info line
- owned/unlockable/locked state
- filters for All, Owned, Unlockable, Locked
- sorting for cost and requirement level
- a full-content detail panel for more information
- a confirmation dialog before purchase

Interaction decision:

- Tapping any collectible or skill card opens its detail panel.
- The detail panel fills the content area under the topbar.
- Buying collectibles and training skills happens from the detail panel, not directly from the list card.
- Native browser text selection should never appear during normal app interaction.

Grid tile direction:

- Subpages should move away from text-heavy list cards toward dense icon grids.
- Skills should use very compact tiles, likely five columns per row on mobile.
- Skills show only icon, skill name, and current level such as `Lv. 73`.
- Pets show icon, pet name, and pet type.
- Mounts show icon, mount name, and mount type.
- Characters can show icon/portrait, character name, and class/archetype.
- Costs, descriptions, requirements, source game, rarity, and actions belong in the full-content detail panel.
- Scroll behavior must remain available on every subpage when content exceeds the viewport.

Icon art direction:

- Follow the approved dense grid mockup style for Skills and Mounts.
- Icons should be high-fantasy inventory/codex icons with strong readable silhouettes.
- Preferred look: dark emerald/charcoal background, muted gold accents, centered object, crisp painterly game-icon rendering, readable at small sizes.
- Icon images should not contain baked-in text. Text stays native UI.
- Icons should work inside compact square tiles and larger detail panels.
- Approved test-batch subjects: Agility, Attack, Magic, Mining, Herblore, Stable Pony, Verdant Stag, Ashwing Drake.
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

## Current MVP Scope

Build only:

- RAP balance.
- Button to gain 10,000 RAP.
- Mount purchasing with RAP.
- Skill levels required by some mounts.
- Simple RAP-based skill training.
- Codex overview with category progress.
- All RuneScape/Old School RuneScape skills, max level 120.
- Shared collection page pattern for Characters, Pets, and Mounts.

Avoid for MVP:

- Real activity tracking.
- Combat.
- Quests.
- Inventory complexity.
- Equipment stats.
- Social systems.
- Multiple currencies.
