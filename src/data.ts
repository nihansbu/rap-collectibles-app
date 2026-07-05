export type CategoryId = "characters" | "classes" | "races" | "skills" | "pets" | "mounts";

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
  { id: "classes", name: "Classes", totalLabel: "Unlocked classes" },
  { id: "races", name: "Races", totalLabel: "Unlocked races" },
  { id: "skills", name: "Skills", totalLabel: "Trained skills" },
  { id: "pets", name: "Pets", totalLabel: "Collected pets" },
  { id: "mounts", name: "Mounts", totalLabel: "Collected mounts" },
];

export const skills: SkillDefinition[] = [
  { id: "agility", name: "Agility", source: "Both", icon: "assets/icons/skills/agility.webp" },
  { id: "archaeology", name: "Archaeology", source: "RuneScape", icon: "assets/icons/skills/archaeology.webp" },
  { id: "attack", name: "Attack", source: "Both", icon: "assets/icons/skills/attack.webp" },
  { id: "construction", name: "Construction", source: "Both", icon: "assets/icons/skills/construction.webp" },
  { id: "cooking", name: "Cooking", source: "Both", icon: "assets/icons/skills/cooking.webp" },
  { id: "crafting", name: "Crafting", source: "Both", icon: "assets/icons/skills/crafting.webp" },
  { id: "defence", name: "Defence", source: "Both", icon: "assets/icons/skills/defence.webp" },
  { id: "divination", name: "Divination", source: "RuneScape", icon: "assets/icons/skills/divination.webp" },
  { id: "dungeoneering", name: "Dungeoneering", source: "RuneScape", icon: "assets/icons/skills/dungeoneering.webp" },
  { id: "farming", name: "Farming", source: "Both", icon: "assets/icons/skills/farming.webp" },
  { id: "firemaking", name: "Firemaking", source: "Both", icon: "assets/icons/skills/firemaking.webp" },
  { id: "fishing", name: "Fishing", source: "Both", icon: "assets/icons/skills/fishing.webp" },
  { id: "fletching", name: "Fletching", source: "Both", icon: "assets/icons/skills/fletching.webp" },
  { id: "herblore", name: "Herblore", source: "Both", icon: "assets/icons/skills/herblore.webp" },
  { id: "hitpoints", name: "Hitpoints", source: "Old School RuneScape", icon: "assets/icons/skills/hitpoints.webp" },
  { id: "hunter", name: "Hunter", source: "Both", icon: "assets/icons/skills/hunter.webp" },
  { id: "invention", name: "Invention", source: "RuneScape", icon: "assets/icons/skills/invention.webp" },
  { id: "magic", name: "Magic", source: "Both", icon: "assets/icons/skills/magic.webp" },
  { id: "mining", name: "Mining", source: "Both", icon: "assets/icons/skills/mining.webp" },
  { id: "necromancy", name: "Necromancy", source: "RuneScape", icon: "assets/icons/skills/necromancy.webp" },
  { id: "prayer", name: "Prayer", source: "Both", icon: "assets/icons/skills/prayer.webp" },
  { id: "ranged", name: "Ranged", source: "Both", icon: "assets/icons/skills/ranged.webp" },
  { id: "rune-crafting", name: "Runecrafting", source: "Both", icon: "assets/icons/skills/rune-crafting.webp" },
  { id: "sailing", name: "Sailing", source: "Old School RuneScape", icon: "assets/icons/skills/sailing.webp" },
  { id: "slayer", name: "Slayer", source: "Both", icon: "assets/icons/skills/slayer.webp" },
  { id: "smithing", name: "Smithing", source: "Both", icon: "assets/icons/skills/smithing.webp" },
  { id: "strength", name: "Strength", source: "Both", icon: "assets/icons/skills/strength.webp" },
  { id: "summoning", name: "Summoning", source: "RuneScape", icon: "assets/icons/skills/summoning.webp" },
  { id: "thieving", name: "Thieving", source: "Both", icon: "assets/icons/skills/thieving.webp" },
  { id: "woodcutting", name: "Woodcutting", source: "Both", icon: "assets/icons/skills/woodcutting.webp" },
];

export const collectibles: Collectible[] = [
  {
    id: "class-iron-vanguard",
    category: "classes",
    name: "Iron Vanguard",
    description: "A front-line defender trained to hold ground when the battle line breaks.",
    type: "Melee Tank",
    cost: 14_000,
    rarity: "Common",
    requirements: [],
  },
  {
    id: "class-blade-dancer",
    category: "classes",
    name: "Blade Dancer",
    description: "A fast melee striker who turns footwork and timing into lethal pressure.",
    type: "Melee DPS",
    cost: 26_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "attack", level: 20 }],
  },
  {
    id: "class-oathkeeper",
    category: "classes",
    name: "Oathkeeper",
    description: "A disciplined support fighter who protects allies through vows and presence.",
    type: "Melee Support",
    cost: 38_000,
    rarity: "Rare",
    requirements: [
      { type: "skill", skillId: "defence", level: 32 },
      { type: "skill", skillId: "prayer", level: 24 },
    ],
  },
  {
    id: "class-deadeye",
    category: "classes",
    name: "Deadeye",
    description: "A patient ranged damage dealer who waits for one clean shot.",
    type: "Ranged DPS",
    cost: 24_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "ranged", level: 22 }],
  },
  {
    id: "class-trail-warden",
    category: "classes",
    name: "Trail Warden",
    description: "A ranged support scout who keeps companions supplied, hidden, and moving.",
    type: "Ranged Support",
    cost: 44_000,
    rarity: "Rare",
    requirements: [
      { type: "skill", skillId: "ranged", level: 35 },
      { type: "skill", skillId: "hunter", level: 30 },
    ],
  },
  {
    id: "class-ember-mage",
    category: "classes",
    name: "Ember Mage",
    description: "A volatile spellcaster who specializes in controlled destruction.",
    type: "Magic DPS",
    cost: 30_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "magic", level: 25 }],
  },
  {
    id: "class-rune-sage",
    category: "classes",
    name: "Rune Sage",
    description: "A magical support class that shapes wards, sigils, and battlefield focus.",
    type: "Magic Support",
    cost: 62_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "magic", level: 50 },
      { type: "skill", skillId: "rune-crafting", level: 45 },
    ],
  },
  {
    id: "class-hexblade",
    category: "classes",
    name: "Hexblade",
    description: "A hybrid fighter who binds blade work and curse magic into one style.",
    type: "Hybrid",
    cost: 95_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "attack", level: 58 },
      { type: "skill", skillId: "magic", level: 58 },
      { type: "collectible", collectibleId: "class-blade-dancer", label: "Blade Dancer" },
    ],
  },
  {
    id: "race-highland-human",
    category: "races",
    name: "Highland Human",
    description: "Hardy mountain folk raised among stone roads, cold rain, and old oaths.",
    type: "Human",
    cost: 10_000,
    rarity: "Common",
    requirements: [],
  },
  {
    id: "race-moon-elf",
    category: "races",
    name: "Moon Elf",
    description: "An elven people known for star maps, quiet magic, and long memory.",
    type: "Elf",
    cost: 24_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "magic", level: 18 }],
  },
  {
    id: "race-ironhold-dwarf",
    category: "races",
    name: "Ironhold Dwarf",
    description: "A dwarven people whose halls are built around mines, anvils, and oath-stones.",
    type: "Dwarf",
    cost: 24_000,
    rarity: "Uncommon",
    requirements: [{ type: "skill", skillId: "mining", level: 18 }],
  },
  {
    id: "race-ashen-orc",
    category: "races",
    name: "Ashen Orc",
    description: "An orc people from volcanic badlands, respected for endurance and war chants.",
    type: "Orc",
    cost: 34_000,
    rarity: "Rare",
    requirements: [{ type: "skill", skillId: "strength", level: 30 }],
  },
  {
    id: "race-mire-goblin",
    category: "races",
    name: "Mire Goblin",
    description: "Clever wetland scavengers with a talent for traps, bargains, and survival.",
    type: "Goblin",
    cost: 18_000,
    rarity: "Common",
    requirements: [{ type: "skill", skillId: "thieving", level: 12 }],
  },
  {
    id: "race-stoneback-troll",
    category: "races",
    name: "Stoneback Troll",
    description: "A troll people with granite-like hide and a patient, stubborn temperament.",
    type: "Troll",
    cost: 70_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "defence", level: 55 },
      { type: "skill", skillId: "mining", level: 40 },
    ],
  },
  {
    id: "race-brassbound",
    category: "races",
    name: "Brassbound",
    description: "A machine people of engraved plates, memory cores, and ritual maintenance.",
    type: "Machine",
    cost: 88_000,
    rarity: "Epic",
    requirements: [
      { type: "skill", skillId: "smithing", level: 55 },
      { type: "skill", skillId: "invention", level: 40 },
    ],
  },
  {
    id: "race-duskborne",
    category: "races",
    name: "Duskborne",
    description: "A grave-touched people who live between ancestral rites and forbidden magic.",
    type: "Undead",
    cost: 120_000,
    rarity: "Legendary",
    requirements: [
      { type: "skill", skillId: "necromancy", level: 72 },
      { type: "collectible", collectibleId: "race-highland-human", label: "Highland Human" },
    ],
  },
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
    icon: "assets/icons/mounts/greyfang-wolf.webp",
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
    icon: "assets/icons/mounts/granite-ram.webp",
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
    icon: "assets/icons/mounts/moonlit-skiff.webp",
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
    icon: "assets/icons/mounts/silkclimb-spider.webp",
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
    icon: "assets/icons/mounts/runestone-golem.webp",
    cost: 145_000,
    rarity: "Legendary",
    requirements: [
      { type: "skill", skillId: "rune-crafting", level: 82 },
      { type: "skill", skillId: "construction", level: 70 },
    ],
  },
];
