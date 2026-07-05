export type CategoryId = "characters" | "skills" | "pets" | "mounts";

export type SkillId =
  | "agility"
  | "archaeology"
  | "attack"
  | "construction"
  | "cooking"
  | "crafting"
  | "defence"
  | "divination"
  | "dungeoneering"
  | "farming"
  | "firemaking"
  | "fishing"
  | "fletching"
  | "herblore"
  | "hitpoints"
  | "hunter"
  | "invention"
  | "magic"
  | "mining"
  | "necromancy"
  | "prayer"
  | "ranged"
  | "rune-crafting"
  | "sailing"
  | "slayer"
  | "smithing"
  | "strength"
  | "summoning"
  | "thieving"
  | "woodcutting";

export type Requirement =
  | { type: "skill"; skillId: SkillId; level: number }
  | { type: "collectible"; collectibleId: string; label: string };

export type Collectible = {
  id: string;
  category: Exclude<CategoryId, "skills">;
  name: string;
  description: string;
  type: string;
  icon?: string;
  cost: number;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  requirements: Requirement[];
};

export type SkillDefinition = {
  id: SkillId;
  name: string;
  source: "RuneScape" | "Old School RuneScape" | "Both";
  icon?: string;
};

export const categories: Array<{ id: CategoryId; name: string; totalLabel: string }> = [
  { id: "characters", name: "Characters", totalLabel: "Collected characters" },
  { id: "skills", name: "Skills", totalLabel: "Trained skills" },
  { id: "pets", name: "Pets", totalLabel: "Collected pets" },
  { id: "mounts", name: "Mounts", totalLabel: "Collected mounts" },
];

export const skills: SkillDefinition[] = [
  { id: "agility", name: "Agility", source: "Both", icon: "assets/icons/skills/agility.webp" },
  { id: "archaeology", name: "Archaeology", source: "RuneScape" },
  { id: "attack", name: "Attack", source: "Both", icon: "assets/icons/skills/attack.webp" },
  { id: "construction", name: "Construction", source: "Both" },
  { id: "cooking", name: "Cooking", source: "Both" },
  { id: "crafting", name: "Crafting", source: "Both" },
  { id: "defence", name: "Defence", source: "Both" },
  { id: "divination", name: "Divination", source: "RuneScape" },
  { id: "dungeoneering", name: "Dungeoneering", source: "RuneScape" },
  { id: "farming", name: "Farming", source: "Both" },
  { id: "firemaking", name: "Firemaking", source: "Both" },
  { id: "fishing", name: "Fishing", source: "Both" },
  { id: "fletching", name: "Fletching", source: "Both" },
  { id: "herblore", name: "Herblore", source: "Both", icon: "assets/icons/skills/herblore.webp" },
  { id: "hitpoints", name: "Hitpoints", source: "Old School RuneScape" },
  { id: "hunter", name: "Hunter", source: "Both" },
  { id: "invention", name: "Invention", source: "RuneScape" },
  { id: "magic", name: "Magic", source: "Both", icon: "assets/icons/skills/magic.webp" },
  { id: "mining", name: "Mining", source: "Both", icon: "assets/icons/skills/mining.webp" },
  { id: "necromancy", name: "Necromancy", source: "RuneScape" },
  { id: "prayer", name: "Prayer", source: "Both" },
  { id: "ranged", name: "Ranged", source: "Both" },
  { id: "rune-crafting", name: "Rune Crafting", source: "Both" },
  { id: "sailing", name: "Sailing", source: "Old School RuneScape" },
  { id: "slayer", name: "Slayer", source: "Both" },
  { id: "smithing", name: "Smithing", source: "Both" },
  { id: "strength", name: "Strength", source: "Both" },
  { id: "summoning", name: "Summoning", source: "RuneScape" },
  { id: "thieving", name: "Thieving", source: "Both" },
  { id: "woodcutting", name: "Woodcutting", source: "Both" },
];

export const collectibles: Collectible[] = [
  {
    id: "character-warden",
    category: "characters",
    name: "Alden the Warden",
    description: "A disciplined human guardian sworn to protect old roads and border keeps.",
    type: "Guardian",
    cost: 12_000,
    rarity: "Common",
    requirements: [],
  },
  {
    id: "character-mycelle",
    category: "characters",
    name: "Mycelle Greenhand",
    description: "A forest-born herbalist who understands roots, spores, and quiet magic.",
    type: "Herbalist",
    cost: 28_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "herblore", level: 25 }],
  },
  {
    id: "character-kael",
    category: "characters",
    name: "Kael Emberlane",
    description: "A fire-touched battlemage with a talent for dangerous shortcuts.",
    type: "Battlemage",
    cost: 55_000,
    rarity: "Rare",
    requirements: [
      { type: "skill", skillId: "magic", level: 45 },
      { type: "skill", skillId: "firemaking", level: 35 },
    ],
  },
  {
    id: "character-seris",
    category: "characters",
    name: "Seris Moonveil",
    description: "A silent ranger who follows tracks that most eyes cannot see.",
    type: "Ranger",
    cost: 85_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "ranged", level: 62 },
      { type: "skill", skillId: "hunter", level: 58 },
    ],
  },
  {
    id: "character-brannoc",
    category: "characters",
    name: "Brannoc Ironwake",
    description: "A dwarven smith whose oaths are carved into every blade he carries.",
    type: "Smith",
    cost: 72_000,
    rarity: "Rare",
    requirements: [
      { type: "skill", skillId: "smithing", level: 60 },
      { type: "skill", skillId: "mining", level: 50 },
    ],
  },
  {
    id: "character-elyra",
    category: "characters",
    name: "Elyra Starfall",
    description: "An elven astronomer who reads omens in falling light.",
    type: "Astronomer",
    cost: 110_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "divination", level: 70 },
      { type: "skill", skillId: "magic", level: 64 },
    ],
  },
  {
    id: "character-orren",
    category: "characters",
    name: "Orren Tidecaller",
    description: "A coastal mystic who treats every voyage as a test of courage.",
    type: "Mystic",
    cost: 38_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "sailing", level: 30 }],
  },
  {
    id: "character-voss",
    category: "characters",
    name: "Voss Gravebound",
    description: "A solemn necromancer followed by whispers from forgotten halls.",
    type: "Necromancer",
    cost: 160_000,
    rarity: "Legendary",
    requirements: [
      { type: "skill", skillId: "necromancy", level: 85 },
      { type: "skill", skillId: "prayer", level: 72 },
    ],
  },
  {
    id: "pet-mote",
    category: "pets",
    name: "Lantern Mote",
    description: "A warm little spirit that glows brighter after long journeys.",
    type: "Spirit",
    cost: 8_000,
    rarity: "Common",
    requirements: [],
  },
  {
    id: "pet-spriggan",
    category: "pets",
    name: "Pocket Spriggan",
    description: "A tiny woodland companion with leaves that change color by mood.",
    type: "Woodland",
    cost: 18_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "woodcutting", level: 20 }],
  },
  {
    id: "pet-imp",
    category: "pets",
    name: "Cinder Imp",
    description: "A mischievous familiar that hoards sparks and warm stones.",
    type: "Demon",
    cost: 42_000,
    rarity: "Rare",
    requirements: [{ type: "skill", skillId: "firemaking", level: 44 }],
  },
  {
    id: "pet-orb",
    category: "pets",
    name: "Runic Orb",
    description: "A floating companion that hums softly near old runes.",
    type: "Arcane",
    cost: 76_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "rune-crafting", level: 60 },
      { type: "skill", skillId: "magic", level: 55 },
    ],
  },
  {
    id: "pet-crab",
    category: "pets",
    name: "Compass Crab",
    description: "A clever shore pet that always points one claw toward home.",
    type: "Aquatic",
    cost: 26_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "fishing", level: 28 }],
  },
  {
    id: "pet-wyrmling",
    category: "pets",
    name: "Glass Wyrmling",
    description: "A translucent little wyrm that curls around polished gems.",
    type: "Wyrm",
    cost: 120_000,
    rarity: "Legendary",
    requirements: [
      { type: "skill", skillId: "crafting", level: 76 },
      { type: "collectible", collectibleId: "pet-orb", label: "Runic Orb" },
    ],
  },
  {
    id: "mount-pony",
    category: "mounts",
    name: "Stable Pony",
    description: "A reliable first mount for new collectors.",
    type: "Beast",
    icon: "assets/icons/mounts/stable-pony.webp",
    cost: 10_000,
    rarity: "Common",
    requirements: [],
  },
  {
    id: "mount-wolf",
    category: "mounts",
    name: "Greyfang Wolf",
    description: "A swift wolf mount raised by northern pathfinders.",
    type: "Beast",
    cost: 24_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "hunter", level: 18 }],
  },
  {
    id: "mount-stag",
    category: "mounts",
    name: "Verdant Stag",
    description: "A proud forest stag whose antlers bloom with rare herbs.",
    type: "Beast",
    icon: "assets/icons/mounts/verdant-stag.webp",
    cost: 90_000,
    rarity: "Epic",
    requirements: [{ type: "skill", skillId: "herblore", level: 73 }],
  },
  {
    id: "mount-ram",
    category: "mounts",
    name: "Granite Ram",
    description: "A sure-footed mountain ram with armor-like stone plates.",
    type: "Beast",
    cost: 65_000,
    rarity: "Rare",
    requirements: [
      { type: "skill", skillId: "mining", level: 55 },
      { type: "skill", skillId: "smithing", level: 45 },
    ],
  },
  {
    id: "mount-drake",
    category: "mounts",
    name: "Ashwing Drake",
    description: "A young drake with ember-veined wings and an impatient temper.",
    type: "Drake",
    icon: "assets/icons/mounts/ashwing-drake.webp",
    cost: 180_000,
    rarity: "Legendary",
    requirements: [
      { type: "skill", skillId: "magic", level: 80 },
      { type: "skill", skillId: "slayer", level: 75 },
      { type: "collectible", collectibleId: "mount-stag", label: "Verdant Stag" },
    ],
  },
  {
    id: "mount-skiff",
    category: "mounts",
    name: "Moonlit Skiff",
    description: "A small enchanted boat that glides over water and mist.",
    type: "Aquatic",
    cost: 58_000,
    rarity: "Rare",
    requirements: [{ type: "skill", skillId: "sailing", level: 50 }],
  },
  {
    id: "mount-spider",
    category: "mounts",
    name: "Silkclimb Spider",
    description: "A trained cavern mount prized by miners and deep scouts.",
    type: "Beast",
    cost: 96_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "dungeoneering", level: 68 },
      { type: "skill", skillId: "agility", level: 54 },
    ],
  },
  {
    id: "mount-golem",
    category: "mounts",
    name: "Runestone Golem",
    description: "A slow but tireless construct animated by ancient rune work.",
    type: "Construct",
    cost: 145_000,
    rarity: "Legendary",
    requirements: [
      { type: "skill", skillId: "rune-crafting", level: 82 },
      { type: "skill", skillId: "construction", level: 70 },
    ],
  },
];
