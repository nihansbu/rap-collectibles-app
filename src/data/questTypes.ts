import type { SkillId } from "./types";
import type { SpecializationId } from "./specializations";

export type QuestRequirement =
  | { type: "skill"; skillId: SkillId; level: number }
  | { type: "specialization"; specializationId: SpecializationId; level: number }
  | { type: "collectible"; collectibleId: string; label: string }
  | { type: "quest"; questId: string }
  | { type: "chapter"; chapterId: string }
  | { type: "quest-points"; points: number };

export type QuestReward =
  | { type: "quest-points"; points: number }
  | { type: "skill-xp"; skillId: SkillId; amount: number }
  | { type: "specialization-xp"; specializationId: SpecializationId; amount: number }
  | { type: "rap"; amount: number }
  | { type: "cosmetic"; cosmeticId: string }
  | { type: "collectible"; collectibleId: string };

export type QuestDefinition = {
  id: string;
  campaignId: string;
  chapterId: string | null;
  name: string;
  summary: string;
  startStory: string;
  completionStory: string;
  icon: string;
  totalRapCost: number;
  durationMs: number;
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  row: number;
  lane: 0 | 1 | 2;
  campaignFinale?: boolean;
};

export type QuestChapterDefinition = {
  id: string;
  campaignId: string;
  number: number;
  name: string;
  summary: string;
  prologue: string;
  epilogue: string;
  icon: string;
  questIds: string[];
  bonusQuestPoints: number;
};

export type QuestCampaignDefinition = {
  id: string;
  name: string;
  summary: string;
  introduction: string;
  finaleText: string;
  icon: string;
  chapterIds: string[];
  finaleQuestId: string;
  bonusQuestPoints: number;
};
