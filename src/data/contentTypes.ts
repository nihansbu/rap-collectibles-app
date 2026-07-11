import type { AccountBonus, Requirement, SkillId } from "./types";
import type { CategoryId } from "./types";

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

export type AchievementCategory = "account" | "skills" | "collection" | "adventures" | "mastery";

export type AchievementCollectibleFilter = {
  category?: Exclude<CategoryId, "skills">;
  tags?: string[];
  type?: string;
  sourceActivityId?: string;
};

export type AchievementCondition =
  | { type: "lifetime-rap"; amount: number }
  | { type: "skill-level"; level: number; skillId?: SkillId }
  | { type: "total-skill-level"; level: number }
  | { type: "collectibles-owned"; count: number; filter?: AchievementCollectibleFilter }
  | { type: "collectibles-complete"; filter: AchievementCollectibleFilter }
  | { type: "set-complete"; setId?: string }
  | { type: "activity-runs"; count: number; activityId?: string }
  | { type: "mastery-level"; level: number; trackId: string }
  | { type: "achievement-points"; points: number };

export type AchievementReward =
  | { type: "cosmetic"; cosmeticId: string }
  | { type: "collectible"; collectibleId: string };

export type SkillCapeTier = 99 | 120;

export type SkillCapeDefinition = {
  id: string;
  skillId: SkillId;
  tier: SkillCapeTier;
  name: string;
  description: string;
  icon: string;
};

export type AchievementDefinition = {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  points: number;
  condition: AchievementCondition;
  rewards?: AchievementReward[];
  hidden?: boolean;
  series?: { id: string; stage: number; totalStages: number };
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
