import { COLLECTION_SETS } from "./data";

export function getSetsForCollectible(collectibleId: string) {
  return COLLECTION_SETS.filter((set) => set.collectibleIds.includes(collectibleId));
}

export function collectionSetProgress(setId: string, ownedIds: string[]) {
  const set = COLLECTION_SETS.find((candidate) => candidate.id === setId);
  if (!set) return { owned: 0, total: 0, percent: 0, complete: false };
  const owned = set.collectibleIds.filter((id) => ownedIds.includes(id)).length;
  return { owned, total: set.collectibleIds.length, percent: Math.round((owned / set.collectibleIds.length) * 100), complete: owned === set.collectibleIds.length };
}

export function collectSetAccountBonuses(ownedIds: string[]) {
  return COLLECTION_SETS.flatMap((set) => {
    const ownedCount = set.collectibleIds.filter((id) => ownedIds.includes(id)).length;
    return set.rewards.flatMap((reward) => reward.requiredCount <= ownedCount && reward.reward.type === "account-bonus"
      ? [{ ...reward.reward.bonus, sourceId: set.id, sourceName: set.name }]
      : []);
  });
}

export function setAccountBonusPercent(
  ownedIds: string[],
  type: ReturnType<typeof collectSetAccountBonuses>[number]["type"],
  skillId?: string,
) {
  return collectSetAccountBonuses(ownedIds).reduce((total, bonus) => {
    if (bonus.type !== type) return total;
    if (bonus.type === "skill-xp" && bonus.skillId !== skillId) return total;
    return total + bonus.percent;
  }, 0);
}
