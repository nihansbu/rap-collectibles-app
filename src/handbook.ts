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
          "World contains repeatable Adventures, Collectibles contains your Codex and Skills, Account shows permanent bonuses and presentation rewards, and Log Activity turns real-life activities into RAP.",
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
          "RAP means Real Life Activity Points. It is the shared currency for Skill training, direct Collectible unlocks, and repeatable Adventures.",
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
          "Some Collectibles can be bought with RAP. Others are exclusive drops from Adventures and still appear in their normal Codex category.",
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
    id: "skill-training",
    title: "Skill Training",
    summary: "Spend RAP over time to train up to three Skills at once.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "Training sessions can run for 1, 2, 5, or 12 hours. Up to three different Skills can train concurrently.",
          "Training consumes RAP gradually and pauses when no RAP remains. Timestamped progress continues correctly after the app is closed or reloaded.",
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
          "Adventure XP shares total 100% before bonuses. Current short runtimes make the complete loop practical to test.",
        ],
      },
    ],
    relatedEntryIds: ["skill-advantage", "activity-results", "drop-tables", "requirements"],
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
    summary: "How Adventure-exclusive and shared Chaser Collectibles are rolled and awarded.",
    category: "rewards",
    sections: [
      {
        paragraphs: [
          "Every unowned Collectible in an Adventure's Drop Table is rolled when the Adventure finishes. If several rolls succeed, the rarest successful item is awarded.",
          "Shared Chaser Pools can appear in multiple Adventures, Minigames, or Bosses. Their progress uses normalized Roll Units based on undiscounted base RAP.",
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
    summary: "Permanent Level 0-10 progress for Adventures and future World content.",
    category: "progression",
    sections: [
      {
        paragraphs: [
          "Every completed Adventure adds its undiscounted base RAP cost to the linked Mastery track. Cost reductions never reduce Mastery earned.",
          "Each track has ten levels, modest passive bonuses, and selected milestone rewards. Mastery targets and rewards are configured per content family.",
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
    id: "profile-cosmetics",
    title: "Profile And Cosmetics",
    summary: "Account-wide Badges, Themes, portraits, and presentation rewards.",
    category: "account",
    sections: [
      {
        paragraphs: [
          "Profile rewards customize the account without creating separate Hero progression. Curated Themes preserve contrast and readability while changing the Codex presentation.",
          "The current Theme collection is available from the start so players can choose their presentation immediately. Future Themes can still be connected to Mastery, Sets, Adventures, or other expansion content.",
          "Profile Badges remain progression rewards. Locked Cosmetics remain visible with their source when a later reward is not yet earned.",
        ],
      },
    ],
    relatedEntryIds: ["collection-sets", "content-mastery", "collectibles"],
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
          "The app saves progress automatically in this browser. RAP, Skills, Collectibles, Adventure runs, Mastery, results, Cosmetics, and manual logs are restored on reload.",
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
    entryIds: ["getting-started", "rap", "activities", "collectibles", "account-bonuses", "manual-activity-log"],
  },
  collectibles: {
    id: "collectibles",
    title: "Collectibles",
    intro: "The Collectibles overview is your Codex. It shows permanent unlock progress across every category and your combined Skill total.",
    entryIds: ["collectibles", "codex-states", "requirements", "account-bonuses"],
  },
  world: {
    id: "world",
    title: "World",
    intro: "World contains Adventures and will later contain Minigames and Bossing built on shared Requirements, Mastery, rewards, and Drop Pools.",
    entryIds: ["activities", "content-mastery", "requirements", "skill-advantage", "activity-results"],
  },
  adventures: {
    id: "adventures",
    title: "Adventures",
    intro: "This page lists repeatable Adventures, their effective RAP cost, Mastery, run count, availability, and active state.",
    entryIds: ["activities", "content-mastery", "requirements", "skill-advantage", "activity-results", "drop-tables", "bad-luck-protection"],
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
    entryIds: ["collection-sets", "collectibles", "profile-cosmetics", "account-bonuses"],
  },
  profile: {
    id: "profile",
    title: "Profile",
    intro: "Profile applies account-wide Badges and curated Themes earned through permanent progression.",
    entryIds: ["profile-cosmetics", "collection-sets", "content-mastery"],
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
    intro: "The Skills grid shows all Skill levels at once. Open a Skill to inspect XP progress and begin a timed training session.",
    entryIds: ["skills", "skill-training", "rap", "requirements"],
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
    intro: "This detail page shows a Collectible's source, status, cost, requirements, and permanent Account Bonuses.",
    entryIds: ["collectibles", "requirements", "codex-states", "account-bonuses"],
  },
  "skill-detail": {
    id: "skill-detail",
    title: "Skill Details",
    intro: "This detail page shows the Skill's current level, XP progress, training state, and available training durations.",
    entryIds: ["skills", "skill-training", "rap", "requirements"],
  },
  "activity-detail": {
    id: "activity-detail",
    title: "Adventure Details",
    intro: "This detail page shows the Adventure's requirements, Mastery, Skill Advantage, effective cost, runtime, XP split, and complete Drop Table.",
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
