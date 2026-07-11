import { COLLECTION_SETS, CONTENT_MASTERY_TRACKS, COSMETICS } from "./data";
import { masteryProgress } from "./mastery";

const cosmeticIndex = new Map(COSMETICS.map((cosmetic) => [cosmetic.id, cosmetic]));

export function getCosmetic(cosmeticId: string) {
  return cosmeticIndex.get(cosmeticId);
}

export function defaultUnlockedCosmetics() {
  return COSMETICS.filter((cosmetic) => cosmetic.kind === "theme").map((cosmetic) => cosmetic.id);
}

export function deriveUnlockedCosmetics(ownedIds: string[], masteryPoints: Record<string, number>) {
  const unlocked = new Set<string>();

  for (const track of CONTENT_MASTERY_TRACKS) {
    const level = masteryProgress(track.id, masteryPoints[track.id] ?? 0).level;
    for (const milestone of track.milestones) {
      if (milestone.level <= level && milestone.reward.type === "cosmetic") unlocked.add(milestone.reward.cosmeticId);
    }
  }

  for (const set of COLLECTION_SETS) {
    const ownedCount = set.collectibleIds.filter((id) => ownedIds.includes(id)).length;
    for (const reward of set.rewards) {
      if (reward.requiredCount <= ownedCount && reward.reward.type === "cosmetic") unlocked.add(reward.reward.cosmeticId);
    }
  }

  return [...unlocked].filter((id) => cosmeticIndex.has(id));
}

export function reconcileUnlockedCosmetics(
  currentIds: string[],
  ownedIds: string[],
  masteryPoints: Record<string, number>,
) {
  return [...new Set([
    ...defaultUnlockedCosmetics(),
    ...currentIds,
    ...deriveUnlockedCosmetics(ownedIds, masteryPoints),
  ])].filter((id) => cosmeticIndex.has(id));
}
