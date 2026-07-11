import { CHASER_ITEMS, type ChaserItemDefinition } from "./data";

export function chasersForActivity(activityId: string) {
  return CHASER_ITEMS.filter((chaser) => chaser.eligibleActivityIds.includes(activityId));
}

export function rollChaserItem(chaser: ChaserItemDefinition, ownedIds: string[], random: () => number) {
  if (ownedIds.includes(chaser.collectibleId)) return undefined;
  return random() < 1 / Math.max(1, chaser.denominator) ? chaser.collectibleId : undefined;
}
