export type HandbookCategoryId = "basics" | "progression" | "adventure" | "rewards" | "account";

export type HandbookSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type HandbookEntry = {
  id: string;
  title: string;
  summary: string;
  category: HandbookCategoryId;
  sections: HandbookSection[];
  relatedEntryIds?: string[];
};

export type HandbookContext = {
  id: string;
  title: string;
  intro: string;
  entryIds: string[];
};

export const handbookCategories: Array<{ id: HandbookCategoryId; name: string }> = [
  { id: "basics", name: "Basics" },
  { id: "progression", name: "Progression" },
  { id: "adventure", name: "World" },
  { id: "rewards", name: "Rewards" },
  { id: "account", name: "Account" },
];

export const handbookEntries: HandbookEntry[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    summary: "The main account loop and the three areas available from the Menu.",
    category: "basics",
    sections: [
      {
        paragraphs: [
          "Earn Real Life Activity Points, spend them on progression, and grow a permanent collection over time.",
          "World contains repeatable Adventures and long-running Quests, Collectibles contains your Codex and Skills, Account shows permanent bonuses and presentation rewards, and Log Activity turns real-life activities into RAP.",
        ],
      },
    ],
    relatedEntryIds: ["rap", "collectibles", "activities", "manual-activity-log"],
  },
  {
    id: "rap",
    title: "Real Life Activity Points",
    summary: "How RAP is earned, stored, and spent across the account.",
    category: "basics",
    sections: [
      {
        paragraphs: [
          "RAP means Real Life Activity Points. It is the shared currency for Skill training, direct Collectible unlocks, repeatable Adventures, and the funded time of active Quests.",
          "The prototype also includes a temporary plus button that grants 10,000 RAP for testing.",
        ],
      },
    ],
    relatedEntryIds: ["manual-activity-log", "skill-training", "activities"],
  },
  {
    id: "manual-activity-log",
    title: "Log Activity",
    summary: "Convert a recorded hour of real-life activity into RAP.",
    category: "basics",
    sections: [
      {
        paragraphs: [
          "Each Log Activity tile currently represents one hour. A short tap immediately adds the displayed RAP reward to the account.",
          "Long-pressing a tile opens its detail view. Real sensors, custom durations, editing, and validation are planned for a later tracking system.",
        ],
      },
    ],
    relatedEntryIds: ["rap", "save-progress"],
  },
  {
    id: "collectibles",
    title: "Collectibles and the Codex",
    summary: "Permanent unlocks organized by category and source.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "Heroes, Classes, Races, Tools, Pets, and Mounts are permanent account unlocks. Skills also live in the Codex as long-term progression.",
          "Tap any Collectible to open its detail page. Eligible direct purchases are confirmed there; collection tiles never buy immediately. Other Collectibles are exclusive drops from Adventures and still appear in their normal Codex category.",
        ],
      },
    ],
    relatedEntryIds: ["codex-states", "requirements", "tools", "account-bonuses"],
  },
  {
    id: "codex-states",
    title: "Codex States",
    summary: "The colors that communicate owned, ready, and locked Collectibles.",
    category: "progression",
    sections: [
      {
        bullets: [
          "Green means owned.",
          "Yellow means progression requirements are met, even if more RAP is needed.",
          "Red means a requirement is missing or a source drop has not been obtained.",
          "Indigo identifies Collectibles obtained from Adventures.",
        ],
      },
    ],
    relatedEntryIds: ["collectibles", "requirements", "drop-tables"],
  },
  {
    id: "icon-inspect",
    title: "Inspecting Icons",
    summary: "Open secondary collectible, Cape, Adventure, or system artwork at a larger size.",
    category: "basics",
    sections: [
      {
        paragraphs: [
          "Primary Skill and Collectible artwork is shown larger at the top of its detail page, so those pages do not need a separate image-preview step. Secondary artwork such as Requirements, Adventure Drops, Capes, and system icons can still be inspected when you want a closer look.",
          "Close an Inspect view with the X button, by tapping outside the panel, or with Escape on a keyboard. The underlying card action is not triggered when secondary artwork is inspected.",
        ],
      },
    ],
    relatedEntryIds: ["collectibles", "skills", "skill-capes"],
  },
  {
    id: "requirements",
    title: "Requirements",
    summary: "Skill levels and Collectible ownership can gate progression.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "A requirement must be met before a locked Collectible can be bought or an Adventure can be started. Requirements can reference Skill levels or other permanent Collectibles.",
          "RAP is a cost, not a progression requirement. A qualified Collectible remains yellow when the account only lacks RAP.",
        ],
      },
    ],
    relatedEntryIds: ["codex-states", "skills", "activities"],
  },
  {
    id: "skills",
    title: "Skills",
    summary: "RuneScape-style XP progression from Level 1 to Level 120.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "Skills begin at Level 1 and currently use the established prototype XP curve. Their levels unlock Collectibles and Adventures throughout the account.",
          "The combined Skill roster contains the Skills from RuneScape and Old School RuneScape, using Hitpoints and Runecrafting as the canonical names.",
        ],
      },
    ],
    relatedEntryIds: ["skill-training", "requirements", "skill-advantage"],
  },
  {
    id: "skill-specializations",
    title: "Skill Specializations",
    summary: "World-trained Level 1-120 progression linked to a parent Skill.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "A specialization unlocks automatically when its parent Skill reaches the listed level. It has its own XP and Level 1-120 progression, but it cannot be trained with RAP directly.",
          "Eligible World activities award specialization XP in addition to their core Skill XP. Eligibility is fixed when a run starts, and locked specializations receive no retroactive XP.",
          "Every Skill currently has three broad specialization tracks, unlocked at parent Skill Levels 30, 60, and 90. These unlock levels are provisional while their World content is developed.",
          "Maritime Fishing is the first connected specialization. Fisher's Trawler awards it 25% additional base XP while its normal Fishing and Cooking split remains 100%. Tracks without a connected XP source are visible for planning but cannot gain XP yet.",
        ],
      },
    ],
    relatedEntryIds: ["skills", "activities", "content-mastery"],
  },
  {
    id: "skill-training",
    title: "Skill Training",
    summary: "Spend RAP over time to train up to three Skills at once.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "One button starts a 72-hour training window. Up to three different Skills can train concurrently, and an expired Skill can be started again for a fresh 72-hour window.",
          "Training consumes RAP gradually and stops when no RAP remains. Active training can be stopped at any time without a fee or XP penalty, and timestamped progress continues correctly after the app is closed or reloaded.",
        ],
      },
    ],
    relatedEntryIds: ["skills", "rap", "save-progress"],
  },
  {
    id: "activities",
    title: "Adventures",
    summary: "Repeatable World content that spends RAP for XP, Mastery, and rare drops.",
    category: "adventure",
    sections: [
      {
        paragraphs: [
          "An Adventure has a RAP cost, runtime, requirements, XP rewards, Content Mastery, and an optional Drop Table. A started run is saved by timestamp and can finish after a reload.",
          "Core Adventure XP shares total 100% before bonuses. Eligible activities may also grant clearly separated specialization XP on top of that core total.",
          "Each Adventure is an independent activity with fixed requirements, rewards, drops, run count, and Mastery. Adventures do not contain routes or share progression families.",
        ],
      },
    ],
    relatedEntryIds: ["skill-advantage", "activity-results", "drop-tables", "requirements"],
  },
  {
    id: "quests",
    title: "Quests and Campaigns",
    summary: "One-time long-form World content organized into Chapters and Campaigns.",
    category: "adventure",
    sections: [
      {
        paragraphs: [
          "Quests are expensive one-time background journeys. Campaigns contain two to seven Chapters, and every released normal Chapter contains a vertical path of nine to twenty-five Quests.",
          "A Quest has deterministic requirements, duration, RAP cost, story, and rewards. It has no random drops, Bad Luck Protection, Objectives, or Content Mastery.",
          "Quest Points are a permanent non-spendable score derived from completed Quests, Chapters, and Campaigns. They are entirely separate from Achievement Points.",
        ],
      },
    ],
    relatedEntryIds: ["quest-funding", "quest-states", "requirements", "save-progress"],
  },
  {
    id: "quest-funding",
    title: "Quest Funding",
    summary: "RAP continuously finances the active time of up to three Quests.",
    category: "adventure",
    sections: [
      {
        paragraphs: [
          "A Quest displays its total RAP cost, total duration, and derived RAP per hour. Starting requires enough RAP to fund one combined hour across all active Quests.",
          "Up to three Quests progress in parallel. Their hourly rates are added together, and all receive the same amount of funded time until RAP runs out.",
          "An unfunded Quest remains active but waits for RAP. It resumes from the moment new RAP is added; paused time is never charged or granted retroactively. Quests cannot be cancelled or manually paused.",
        ],
      },
    ],
    relatedEntryIds: ["quests", "quest-states", "rap", "save-progress"],
  },
  {
    id: "quest-states",
    title: "Quest States",
    summary: "The consistent colors used across Campaign, Chapter, and Quest screens.",
    category: "adventure",
    sections: [
      {
        bullets: [
          "Gray means structural requirements are missing.",
          "Yellow means requirements are met; the detail page explains any remaining RAP needed to start.",
          "Indigo means a Quest is active and funded.",
          "Muted indigo means the Quest is active but waiting for RAP.",
          "Green means the Quest, Chapter, or Campaign is permanently completed.",
        ],
      },
    ],
    relatedEntryIds: ["quests", "quest-funding", "codex-states"],
  },
  {
    id: "skill-advantage",
    title: "Skill Advantage",
    summary: "Levels above an Adventure requirement improve its efficiency.",
    category: "adventure",
    sections: [
      {
        paragraphs: [
          "Levels above an Adventure's minimum Skill requirement scale toward a maximum advantage at Level 120.",
          "At maximum advantage, the Adventure gains up to 15% more XP, costs up to 15% less RAP, and runs up to 15% faster.",
        ],
      },
    ],
    relatedEntryIds: ["activities", "skills", "account-bonuses"],
  },
  {
    id: "activity-results",
    title: "Adventure Results",
    summary: "The completion panel for costs, XP, rolls, and drops.",
    category: "adventure",
    sections: [
      {
        paragraphs: [
          "When an Adventure finishes, its result records RAP spent, effective runtime, XP by Skill, Mastery earned, the normal roll, any Additional Roll, and the awarded Collectible.",
          "Only one Collectible can be awarded by a completed run, even when several drop rolls succeed.",
        ],
      },
    ],
    relatedEntryIds: ["activities", "drop-tables", "additional-rolls"],
  },
  {
    id: "drop-tables",
    title: "Drop Tables",
    summary: "How local Adventure drops and global Chaser Collectibles are rolled and awarded.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "Every unowned Collectible in an Adventure's Drop Table is rolled when the Adventure finishes. If several rolls succeed, the rarest successful item is awarded.",
          "A global Chaser item can appear in multiple independent activities. It always keeps the same fixed chance and global owned state, has no Roll Units or Bad Luck Protection, and cannot be awarded twice.",
          "Owned drops are skipped, so a completed source collection no longer competes with unfinished drops.",
        ],
      },
    ],
    relatedEntryIds: ["bad-luck-protection", "additional-rolls", "codex-states"],
  },
  {
    id: "bad-luck-protection",
    title: "Bad Luck Protection",
    summary: "A deterministic boost for drops that remain unowned after many runs.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "When completed runs reach twice a drop's base denominator, that drop's chance is tripled until it is obtained.",
          "For example, a 1 / 500 drop becomes 3 / 500 at 1,000 completed runs.",
          "Bad Luck Protection only applies to an Adventure's normal local drops. Global Chaser items always retain their fixed chance.",
        ],
      },
    ],
    relatedEntryIds: ["drop-tables", "activity-results"],
  },
  {
    id: "additional-rolls",
    title: "Additional Rolls",
    summary: "Account bonuses can create an extra Adventure drop roll.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "Additional Roll chance begins at zero and is increased by rare permanent Collectibles. A successful check creates one extra pass over the Adventure Drop Table.",
          "The result panel shows whether the Additional Roll triggered and what it rolled.",
        ],
      },
    ],
    relatedEntryIds: ["account-bonuses", "drop-tables", "activity-results"],
  },
  {
    id: "tools",
    title: "Tools",
    summary: "Permanent utility Collectibles such as Harpoons and Hammers.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "Tools are permanent Collectibles rather than inventory items. Some can be bought directly, while rare Tools come from Adventures.",
          "A Tool can grant a small account-wide bonus without needing to be equipped.",
        ],
      },
    ],
    relatedEntryIds: ["collectibles", "account-bonuses", "drop-tables"],
  },
  {
    id: "content-mastery",
    title: "Content Mastery",
    summary: "Permanent Level 0-50 progress for Adventures and future World content.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "Every completed Adventure adds its undiscounted base RAP cost to the linked Mastery track. Cost reductions never reduce Mastery earned, and Mastery never blocks access to an Adventure.",
          "Each activity owns exactly one fifty-level Mastery track. Only that activity advances it, and its numerical bonuses only affect that activity. The circular ring fills from neutral at Level 0 to complete gold at Level 50.",
        ],
      },
    ],
    relatedEntryIds: ["activities", "account-bonuses", "drop-tables"],
  },
  {
    id: "collection-sets",
    title: "Collection Sets",
    summary: "Cross-category groups with permanent progress and rewards.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "Sets can contain Heroes, Tools, Pets, Mounts, or other Collectibles at the same time. Set progress is derived from the Codex and is never a second inventory.",
          "Event-styled Sets remain available permanently. Completing thresholds can unlock Profile Badges, Themes, or simple Account Bonuses.",
        ],
      },
    ],
    relatedEntryIds: ["collectibles", "profile-cosmetics", "account-bonuses"],
  },
  {
    id: "achievements",
    title: "Achievements And Points",
    summary: "Permanent account goals, Achievement Points, series, and profile rewards.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "Achievements watch account progress across RAP, Skills, the Codex, Adventures, Sets, and Content Mastery. Multi-stage series award each stage separately, and every Achievement can only be completed once.",
          "Achievement Points are a permanent score, not a spendable currency. Some Achievements can require a previous AP total and then unlock account-wide presentation rewards.",
          "Achievement rewards focus on Profile customization such as Titles, Badges, Themes, portraits, tile styles, and unlock animations. Collectible rewards are supported for exceptional future goals but are intended to remain rare.",
        ],
      },
    ],
    relatedEntryIds: ["profile-cosmetics", "collectibles", "content-mastery", "save-progress"],
  },
  {
    id: "vault",
    title: "The Vault",
    summary: "A prestige home for Sets and Skill Capes.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "The Vault is a special collection area inside Collectibles. It keeps long-term milestone rewards separate from ordinary purchasable Codex entries.",
          "Sets track cross-category collection progress, while Skill Capes track Level 99 and Level 120 milestones for every Skill.",
        ],
      },
    ],
    relatedEntryIds: ["collection-sets", "skill-capes", "collectibles", "save-progress"],
  },
  {
    id: "skill-capes",
    title: "Skill Capes",
    summary: "Level 99 and Level 120 milestone capes for every Skill.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "Each Skill has a Skill Cape earned at Level 99 and a Master Cape earned at Level 120. These are permanent account rewards and are not bought with RAP.",
          "The Vault shows all 60 capes with their Skill-specific icons, milestone level, and locked or unlocked state. The Cape icons share a common silhouette while using the Skill's own emblem and palette for instant recognition.",
          "When a Skill reaches Level 99 or Level 120, the corresponding Cape is added to the account and a one-time unlock notification appears.",
        ],
      },
    ],
    relatedEntryIds: ["skills", "skill-training", "collection-sets", "save-progress"],
  },
  {
    id: "profile-cosmetics",
    title: "Profile And Cosmetics",
    summary: "Account-wide Titles, Badges, Themes, portraits, and presentation rewards.",
    category: "account",
    sections: [
      {
        paragraphs: [
          "Profile rewards customize the account without creating separate Hero progression. Curated Themes preserve contrast and readability while changing the Codex presentation.",
          "The current Theme collection is available from the start so players can choose their presentation immediately. Future Themes can still be connected to Mastery, Sets, Adventures, or other expansion content.",
          "Titles and Profile Badges remain earned progression rewards. Choose one unlocked Title on the Profile page or display no Title. Locked Cosmetics remain visible until their source is completed.",
        ],
      },
    ],
    relatedEntryIds: ["achievements", "collection-sets", "content-mastery", "collectibles"],
  },
  {
    id: "account-bonuses",
    title: "Account Bonuses",
    summary: "Permanent passive bonuses derived from owned Collectibles.",
    category: "account",
    sections: [
      {
        paragraphs: [
          "Account Bonuses are always active once their Collectible is owned. Current bonus types include Skill-specific XP, all-Skill XP, and Additional Roll chance.",
          "Collectible Account Bonuses are additive within their base category. The Account subtotal, Content Mastery, and Skill Advantage then apply as separate multipliers so every source remains inspectable.",
        ],
      },
    ],
    relatedEntryIds: ["tools", "skill-advantage", "additional-rolls"],
  },
  {
    id: "save-progress",
    title: "Saving Progress",
    summary: "How local progress, active jobs, and offline time are preserved.",
    category: "account",
    sections: [
      {
        paragraphs: [
          "The app saves progress automatically in this browser. RAP, Skills, Specializations, Collectibles, Adventure runs, Mastery, results, Achievements, Titles, Cosmetics, and manual logs are restored on reload.",
          "Settings shows the latest local save state and provides JSON export and import. Export a backup before clearing site data or changing devices.",
          "A newer save from another open tab takes priority, preventing an older tab from silently overwriting progress. Cross-device cloud saves are planned for a later account system.",
        ],
      },
    ],
    relatedEntryIds: ["skill-training", "activities", "manual-activity-log"],
  },
];

const contextDefinitions: Record<string, HandbookContext> = {
  "main-menu": {
    id: "main-menu",
    title: "Main Menu",
    intro: "The Menu is your account hub. Open World Adventures, browse the Codex, inspect Account progression, or log real-life activity for RAP.",
    entryIds: ["getting-started", "rap", "activities", "collectibles", "achievements", "account-bonuses", "manual-activity-log"],
  },
  collectibles: {
    id: "collectibles",
    title: "Collectibles",
    intro: "The Collectibles overview is your Codex. It shows permanent unlock progress across every category and your combined Skill total.",
    entryIds: ["collectibles", "codex-states", "icon-inspect", "requirements", "account-bonuses"],
  },
  world: {
    id: "world",
    title: "World",
    intro: "World contains repeatable Adventures and one-time long-form Quests linked by account Skills, Specializations, Collectibles, and explicit requirements.",
    entryIds: ["activities", "quests", "quest-funding", "content-mastery", "requirements", "activity-results"],
  },
  adventures: {
    id: "adventures",
    title: "Adventures",
    intro: "This page lists repeatable Adventures with compact icons, their Mastery rank, run count, availability, and active state.",
    entryIds: ["activities", "content-mastery", "requirements", "skill-advantage", "activity-results", "drop-tables", "bad-luck-protection"],
  },
  quests: {
    id: "quests",
    title: "Quests",
    intro: "Quests are expensive, non-cancellable background journeys arranged into Campaigns, Chapter grids, and vertical Quest trees.",
    entryIds: ["quests", "quest-funding", "quest-states", "requirements", "rap", "save-progress"],
  },
  bonuses: {
    id: "bonuses",
    title: "Account Bonuses",
    intro: "This page groups permanent Skill XP, Roll, Adventure, and future Resistance bonuses while preserving every source.",
    entryIds: ["account-bonuses", "content-mastery", "tools", "additional-rolls"],
  },
  sets: {
    id: "sets",
    title: "Collection Sets",
    intro: "This Codex view groups Collectibles across categories and shows permanent threshold rewards without time-limited availability.",
    entryIds: ["collection-sets", "skill-capes", "icon-inspect", "collectibles", "profile-cosmetics", "account-bonuses"],
  },
  vault: {
    id: "vault",
    title: "Vault",
    intro: "The Vault contains prestige collections such as cross-category Sets and Skill Capes earned from Level 99 and Level 120 milestones.",
    entryIds: ["collection-sets", "skill-capes", "icon-inspect", "skills", "profile-cosmetics", "save-progress"],
  },
  "skill-capes": {
    id: "skill-capes",
    title: "Skill Capes",
    intro: "This page shows the 99er and 120er Skill Capes earned from the account's Skill levels.",
    entryIds: ["skill-capes", "icon-inspect", "skills", "skill-training", "vault", "save-progress"],
  },
  profile: {
    id: "profile",
    title: "Profile",
    intro: "Profile applies account-wide Titles, Badges, and curated Themes earned through permanent progression.",
    entryIds: ["profile-cosmetics", "achievements", "collection-sets", "content-mastery"],
  },
  achievements: {
    id: "achievements",
    title: "Achievements",
    intro: "This page tracks permanent account goals, progress toward each condition, non-spendable Achievement Points, and presentation rewards.",
    entryIds: ["achievements", "profile-cosmetics", "collectibles", "content-mastery", "save-progress"],
  },
  settings: {
    id: "settings",
    title: "Settings",
    intro: "Settings shows whether progress is stored locally and provides manual save, export, and import tools for browser backups.",
    entryIds: ["save-progress", "rap", "skill-training", "activities"],
  },
  "category:characters": {
    id: "category:characters",
    title: "Heroes",
    intro: "Heroes are permanent named figures in the Codex. They may unlock Profile rewards but never create separate character progression.",
    entryIds: ["collectibles", "codex-states", "requirements"],
  },
  "category:classes": {
    id: "category:classes",
    title: "Classes",
    intro: "Classes are permanent role Collectibles grouped by type, such as melee, ranged, magic, tank, damage, or support.",
    entryIds: ["collectibles", "codex-states", "requirements"],
  },
  "category:races": {
    id: "category:races",
    title: "Races",
    intro: "Races are permanent people and ancestry Collectibles grouped by broad types such as Human, Elf, Dwarf, Orc, or Machine.",
    entryIds: ["collectibles", "codex-states", "requirements"],
  },
  "category:skills": {
    id: "category:skills",
    title: "Skills",
    intro: "The Skills grid shows all Skill levels and compact specialization unlock dots. Open a Skill to inspect both progression layers.",
    entryIds: ["skills", "skill-specializations", "icon-inspect", "skill-training", "rap", "requirements"],
  },
  "category:tools": {
    id: "category:tools",
    title: "Tools",
    intro: "Tools are permanent utility Collectibles. They can be direct purchases or rare Adventure drops and may grant passive Account Bonuses.",
    entryIds: ["tools", "account-bonuses", "collectibles", "drop-tables"],
  },
  "category:pets": {
    id: "category:pets",
    title: "Pets",
    intro: "Pets are permanent companion Collectibles obtained through direct unlocks and special sources such as Adventures.",
    entryIds: ["collectibles", "codex-states", "requirements", "drop-tables"],
  },
  "category:mounts": {
    id: "category:mounts",
    title: "Mounts",
    intro: "Mounts are permanent travel Collectibles. Some require specific Skill levels or ownership of earlier Mounts.",
    entryIds: ["collectibles", "codex-states", "requirements", "drop-tables"],
  },
  "collectible-detail": {
    id: "collectible-detail",
    title: "Collectible Details",
    intro: "Every Collectible opens this detail page first. It shows the artwork above its source, status, cost, requirements, and permanent Account Bonuses; eligible direct purchases are confirmed from here.",
    entryIds: ["collectibles", "requirements", "codex-states", "account-bonuses"],
  },
  "skill-detail": {
    id: "skill-detail",
    title: "Skill Details",
    intro: "This detail page shows the Skill artwork, XP progress, one Start or Stop action, and its World-trained specializations.",
    entryIds: ["skills", "skill-specializations", "skill-training", "rap", "requirements"],
  },
  "activity-detail": {
    id: "activity-detail",
    title: "Adventure Details",
    intro: "This detail page shows the Adventure icon and Mastery rank, compact requirements, cost, runtime, XP rewards, drops, and the run action. Tap a requirement or drop for its focused Info Panel.",
    entryIds: ["activities", "content-mastery", "requirements", "skill-advantage", "drop-tables", "bad-luck-protection", "additional-rolls", "activity-results"],
  },
  "manual-activity-detail": {
    id: "manual-activity-detail",
    title: "Log Activity",
    intro: "This detail page confirms the real-life activity, fixed one-hour duration, and RAP reward before logging it.",
    entryIds: ["manual-activity-log", "rap", "save-progress"],
  },
};

export function createHandbookContext(
  id: string,
  overrides: Partial<Pick<HandbookContext, "title" | "intro" | "entryIds">> = {},
): HandbookContext {
  const base = contextDefinitions[id] ?? contextDefinitions["main-menu"];
  return { ...base, ...overrides, id };
}

export function getHandbookEntry(id: string) {
  return handbookEntries.find((entry) => entry.id === id);
}

export function getContextEntries(context: HandbookContext) {
  return context.entryIds.flatMap((id) => {
    const entry = getHandbookEntry(id);
    return entry ? [entry] : [];
  });
}
