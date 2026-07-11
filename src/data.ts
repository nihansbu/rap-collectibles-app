export type { AccountBonus, CategoryId, Collectible, Requirement, SkillDefinition, SkillId } from "./data/types";
export { categories } from "./data/categories";
export { skills } from "./data/skills";
export { COLLECTION_SETS } from "./data/sets";
export { CONTENT_MASTERY_TRACKS } from "./data/mastery";
export { CHASER_ITEMS } from "./data/chaserItems";
export { SPECIALIZATIONS } from "./data/specializations";
export type { SpecializationId } from "./data/specializations";
export { COSMETICS } from "./data/cosmetics";
export { ACHIEVEMENTS } from "./data/achievements";
export { SKILL_CAPES } from "./data/skillCapes";
export { QUESTS, QUEST_CHAPTERS, QUEST_CAMPAIGNS } from "./data/quests";
export type { QuestCampaignDefinition, QuestChapterDefinition, QuestDefinition, QuestRequirement, QuestReward } from "./data/questTypes";
export type {
  CollectionSetDefinition,
  CollectionSetReward,
  ContentKind,
  ContentMasteryMilestone,
  ContentMasteryPassive,
  ContentMasteryTrack,
  CosmeticDefinition,
  CosmeticKind,
  AchievementCategory,
  AchievementCollectibleFilter,
  AchievementCondition,
  AchievementDefinition,
  AchievementReward,
  SkillCapeDefinition,
  SkillCapeTier,
  ChaserItemDefinition,
  SpecializationDefinition,
} from "./data/contentTypes";

import { charactersCollectibles } from "./data/collectibles/characters";
import { classesCollectibles } from "./data/collectibles/classes";
import { mountsCollectibles } from "./data/collectibles/mounts";
import { petsCollectibles } from "./data/collectibles/pets";
import { racesCollectibles } from "./data/collectibles/races";
import { toolsCollectibles } from "./data/collectibles/tools";
import type { Collectible } from "./data/types";

export const collectibles: Collectible[] = [
  ...classesCollectibles,
  ...racesCollectibles,
  ...charactersCollectibles,
  ...toolsCollectibles,
  ...petsCollectibles,
  ...mountsCollectibles,
];
