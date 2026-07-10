import { SHARED_DROP_POOLS, type SharedDropPool } from "./data";
import {
  BAD_LUCK_CHANCE_MULTIPLIER,
  BAD_LUCK_THRESHOLD_MULTIPLIER,
  CHASER_ROLL_UNIT_RAP,
} from "./data/balance/drops";

const dropPoolIndex = new Map(SHARED_DROP_POOLS.map((pool) => [pool.id, pool]));

export function getSharedDropPool(poolId: string) {
  return dropPoolIndex.get(poolId);
}

export function rollUnitsForBaseRap(baseRapCost: number) {
  if (!Number.isFinite(baseRapCost) || baseRapCost <= 0) return 0;
  return baseRapCost / CHASER_ROLL_UNIT_RAP;
}

export function sharedDropEntryChance(denominator: number, accumulatedRollUnits: number, unitsThisRun = 1) {
  const safeDenominator = Math.max(1, denominator);
  const protectedAt = safeDenominator * BAD_LUCK_THRESHOLD_MULTIPLIER;
  const multiplier = accumulatedRollUnits >= protectedAt ? BAD_LUCK_CHANCE_MULTIPLIER : 1;
  const singleUnitChance = Math.min(1, multiplier / safeDenominator);
  const chanceThisRun = 1 - Math.pow(1 - singleUnitChance, Math.max(0, unitsThisRun));
  return { chanceThisRun, multiplier, protectedAt, isProtected: multiplier > 1 };
}

export function rollSharedDropPool(
  pool: SharedDropPool,
  ownedIds: string[],
  accumulatedRollUnits: number,
  unitsThisRun: number,
  random: () => number,
) {
  const hits = pool.entries.filter((entry) => {
    if (ownedIds.includes(entry.collectibleId)) return false;
    return random() < sharedDropEntryChance(entry.denominator, accumulatedRollUnits, unitsThisRun).chanceThisRun;
  });
  return hits.sort((a, b) => b.denominator - a.denominator)[0]?.collectibleId;
}

