import type { AccountBonus, Requirement, SkillId } from "./types";

export type ContentKind = "adventure" | "minigame" | "boss";

export type ContentMasteryPassive =
  | { type: "content-xp"; percentPerLevel: number }
  | { type: "rap-cost-reduction"; percentPerLevel: number }
  | { type: "runtime-reduction"; percentPerLevel: number }
  | { type: "additional-roll-chance"; percentPerLevel: number };

export type ContentMasteryMilestoneReward =
  | { type: "cosmetic"; cosmeticId: string }
  | { type: "content-unlock"; contentId: string }
  | { type: "account-bonus"; bonus: AccountBonus }
  | { type: "collectible"; collectibleId: string };

export type ContentMasteryMilestone = {
  level: number;
  label: string;
  reward: ContentMasteryMilestoneReward;
};

export type ContentMasteryTrack = {
  id: string;
  name: string;
  contentKind: ContentKind;
  targetRap: number;
  passiveBonuses: ContentMasteryPassive[];
  milestones: ContentMasteryMilestone[];
};

export type SharedDropPoolEntry = {
  collectibleId: string;
  denominator: number;
};

export type SharedDropPool = {
  id: string;
  name: string;
  entries: SharedDropPoolEntry[];
};

export type AdventureXpReward = {
  skillId: SkillId;
  share: number;
};

export type AdventureDefinitionBase = {
  id: string;
  familyId: string;
  masteryTrackId: string;
  name: string;
  description: string;
  type: string;
  baseRapCost: number;
  runtimeMs: number;
  requirements: Requirement[];
  xpRewards: AdventureXpReward[];
  sharedDropPoolIds: string[];
};

export type ContentFamily = {
  id: string;
  name: string;
  contentKind: ContentKind;
  description: string;
  masteryTrackId: string;
  contentIds: string[];
};

export type CosmeticKind = "profile-badge" | "theme" | "title" | "portrait" | "tile-style" | "unlock-animation";

export type CosmeticDefinition = {
  id: string;
  name: string;
  kind: CosmeticKind;
  description: string;
  theme?: {
    canvas: string;
    panel: string;
    accent: string;
    success: string;
    danger: string;
  };
};

export type CollectionSetReward =
  | { type: "cosmetic"; cosmeticId: string }
  | { type: "account-bonus"; bonus: AccountBonus };

export type CollectionSetDefinition = {
  id: string;
  name: string;
  description: string;
  color: string;
  emblem: string;
  collectibleIds: string[];
  rewards: Array<{ requiredCount: number; label: string; reward: CollectionSetReward }>;
};

