export type { AccountBonus, CategoryId, Collectible, Requirement, SkillDefinition, SkillId } from "./data/types";
export { categories } from "./data/categories";
export { skills } from "./data/skills";
export { COLLECTION_SETS } from "./data/sets";
export { CONTENT_MASTERY_TRACKS } from "./data/mastery";
export { SHARED_DROP_POOLS } from "./data/dropPools";
export { COSMETICS } from "./data/cosmetics";
export { ACHIEVEMENTS } from "./data/achievements";
export { CONTENT_FAMILIES } from "./data/contentFamilies";
export type {
  CollectionSetDefinition,
  CollectionSetReward,
  ContentFamily,
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
  SharedDropPool,
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
