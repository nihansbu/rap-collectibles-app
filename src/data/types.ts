export type CategoryId = "characters" | "classes" | "races" | "skills" | "tools" | "pets" | "mounts";

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

export type AccountBonus =
  | { type: "skill-xp"; skillId: SkillId; percent: number }
  | { type: "all-skill-xp"; percent: number }
  | { type: "additional-roll-chance"; percent: number };

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
  source?: { type: "activity"; activityId: string; label: string };
  bonuses?: AccountBonus[];
};

export type SkillDefinition = {
  id: SkillId;
  name: string;
  source: "RuneScape" | "Old School RuneScape" | "Both";
  icon?: string;
};
