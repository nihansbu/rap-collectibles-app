export type { AccountBonus, CategoryId, Collectible, Requirement, SkillDefinition, SkillId } from "./data/types";
export { categories } from "./data/categories";
export { skills } from "./data/skills";

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
