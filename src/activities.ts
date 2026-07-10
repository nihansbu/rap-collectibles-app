import { accountBonusPercent, additionalRollChancePercent, skillXpBonusPercent } from "./bonuses";
import { collectibles, type Requirement, type SkillId } from "./data";
import { PROTOTYPE_ADVENTURE_RUNTIME_MS } from "./data/balance/economy";
import { MAX_SKILL_ADVANTAGE_PERCENT } from "./data/balance/modifiers";
import { getSharedDropPool, rollSharedDropPool, rollUnitsForBaseRap } from "./dropPools";
import { masteryAccountBonusPercent, masteryEconomicModifiers, masteryProgress, masteryRewardsBetween } from "./mastery";
import { reconcileUnlockedCosmetics } from "./cosmetics";
import { setAccountBonusPercent } from "./sets";
import { trainingXpPerRap } from "./training";
import { levelFromXp, xpTable, MAX_LEVEL } from "./xp";

export type GameplayActivityId = "fishers-trawler" | "haunted-burial" | "ember-kiln" | "deep-mine-survey";

export type ActivityXpReward = {
  skillId: SkillId;
  share: number;
};

export type ActivityDrop = {
  collectibleId: string;
  chance: number;
};

export type GameplayActivity = {
  id: GameplayActivityId;
  familyId: string;
  masteryTrackId: string;
  name: string;
  description: string;
  type: string;
  cost: number;
  runtimeMs: number;
  requirements: Requirement[];
  xpRewards: ActivityXpReward[];
  drops: ActivityDrop[];
  sharedDropPoolIds: string[];
};

export type ActivitySkillAdvantage = {
  percent: number;
  xpBonusPercent: number;
  costReductionPercent: number;
  runtimeReductionPercent: number;
};

export type ActiveActivityRun = {
  id: string;
  activityId: GameplayActivityId;
  startedAt: number;
  endsAt: number;
  cost: number;
  baseCost: number;
  runtimeMs: number;
  baseRuntimeMs: number;
  skillAdvantagePercent: number;
  masteryTrackId: string;
  masteryLevel: number;
  rollSeed: number;
};

export type ActivityRollResult = {
  label: string;
  triggered: boolean;
  droppedCollectibleId?: string;
};

export type ActivityRunResult = {
  id: string;
  activityId: GameplayActivityId;
  activityName: string;
  completedAt: number;
  runCount: number;
  rapSpent: number;
  baseRapCost: number;
  runtimeMs: number;
  baseRuntimeMs: number;
  skillAdvantagePercent: number;
  additionalRollChancePercent: number;
  additionalRollTriggered: boolean;
  xp: Array<{ skillId: SkillId; amount: number; bonusPercent: number }>;
  rolls: ActivityRollResult[];
  droppedCollectibleId?: string;
  masteryTrackId: string;
  masteryPointsGained: number;
  masteryLevel: number;
};

export type ActivityPlayerState = {
  rp: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
  activeActivityRuns: ActiveActivityRun[];
  activityRunCounts: Record<string, number>;
  activityResults: ActivityRunResult[];
  contentMasteryPoints: Record<string, number>;
  sharedDropPoolRollUnits: Record<string, number>;
  unlockedCosmetics: string[];
};

const MAX_ACTIVITY_RESULTS = 6;
const RUN_TIME_MS = PROTOTYPE_ADVENTURE_RUNTIME_MS;

export const GAMEPLAY_ACTIVITIES: GameplayActivity[] = [
  {
    id: "fishers-trawler",
    familyId: "family-fishing-trawler",
    masteryTrackId: "mastery-fishers-trawler",
    name: "Fisher's Trawler",
    description: "Crew a battered trawler through rough water for Fishing XP and rare sea-bound companions.",
    type: "Fishing",
    cost: 10_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "fishing", level: 40 }],
    xpRewards: [
      { skillId: "fishing", share: 0.75 },
      { skillId: "cooking", share: 0.25 },
    ],
    drops: [
      { collectibleId: "pet-trawler-gull", chance: 500 },
      { collectibleId: "tool-dragon-harpoon", chance: 750 },
      { collectibleId: "mount-brine-ray", chance: 2_500 },
    ],
    sharedDropPoolIds: ["fishing-chaser-pool"],
  },
  {
    id: "haunted-burial",
    familyId: "family-haunted-burial",
    masteryTrackId: "mastery-haunted-burial",
    name: "Haunted Burial",
    description: "Settle old graves and recover solemn keepsakes from the dusk fields.",
    type: "Ritual",
    cost: 12_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "prayer", level: 25 }],
    xpRewards: [
      { skillId: "prayer", share: 0.75 },
      { skillId: "necromancy", share: 0.25 },
    ],
    drops: [],
    sharedDropPoolIds: [],
  },
  {
    id: "ember-kiln",
    familyId: "family-ember-kiln",
    masteryTrackId: "mastery-ember-kiln",
    name: "Ember Kiln",
    description: "Work a volatile kiln where careful heat turns ore and ash into useful craft.",
    type: "Crafting",
    cost: 9_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "firemaking", level: 20 }],
    xpRewards: [
      { skillId: "firemaking", share: 0.45 },
      { skillId: "smithing", share: 0.35 },
      { skillId: "crafting", share: 0.2 },
    ],
    drops: [],
    sharedDropPoolIds: [],
  },
  {
    id: "deep-mine-survey",
    familyId: "family-deep-mine-survey",
    masteryTrackId: "mastery-deep-mine-survey",
    name: "Deep Mine Survey",
    description: "Chart unstable tunnels for mining crews and mark the safest routes back out.",
    type: "Gathering",
    cost: 11_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "mining", level: 30 }],
    xpRewards: [
      { skillId: "mining", share: 0.75 },
      { skillId: "dungeoneering", share: 0.25 },
    ],
    drops: [],
    sharedDropPoolIds: [],
  },
];

const activityIndex = new Map(GAMEPLAY_ACTIVITIES.map((activity) => [activity.id, activity]));

export function getActivity(activityId: string) {
  return activityIndex.get(activityId as GameplayActivityId);
}

export function activityRequirementsMet(activity: GameplayActivity, player: Pick<ActivityPlayerState, "owned" | "skillXp">) {
  return activity.requirements.every((requirement) => {
    if (requirement.type === "collectible") return player.owned.includes(requirement.collectibleId);
    return levelFromXp(player.skillXp[requirement.skillId] ?? 0) >= requirement.level;
  });
}

export function activitySkillAdvantage(activity: GameplayActivity, player: Pick<ActivityPlayerState, "skillXp">): ActivitySkillAdvantage {
  const skillRequirements = activity.requirements.filter((requirement): requirement is Extract<Requirement, { type: "skill" }> => requirement.type === "skill");
  if (skillRequirements.length === 0) {
    return { percent: 0, xpBonusPercent: 0, costReductionPercent: 0, runtimeReductionPercent: 0 };
  }

  const averageProgress = skillRequirements.reduce((total, requirement) => {
    const currentLevel = levelFromXp(player.skillXp[requirement.skillId] ?? 0);
    if (currentLevel <= requirement.level) return total;
    const remainingLevels = Math.max(1, MAX_LEVEL - requirement.level);
    return total + Math.min(1, (currentLevel - requirement.level) / remainingLevels);
  }, 0) / skillRequirements.length;

  const percent = roundPercent(averageProgress * MAX_SKILL_ADVANTAGE_PERCENT);
  return {
    percent,
    xpBonusPercent: percent,
    costReductionPercent: percent,
    runtimeReductionPercent: percent,
  };
}

export function effectiveActivityRun(
  activity: GameplayActivity,
  player: Pick<ActivityPlayerState, "skillXp" | "contentMasteryPoints" | "owned">,
) {
  const advantage = activitySkillAdvantage(activity, player);
  const mastery = masteryEconomicModifiers(activity.masteryTrackId, player.contentMasteryPoints[activity.masteryTrackId] ?? 0);
  const accountCostReduction = accountBonusPercent(player.owned, "adventure-cost-reduction")
    + setAccountBonusPercent(player.owned, "adventure-cost-reduction")
    + masteryAccountBonusPercent(player.contentMasteryPoints, "adventure-cost-reduction");
  const accountRuntimeReduction = accountBonusPercent(player.owned, "adventure-runtime-reduction")
    + setAccountBonusPercent(player.owned, "adventure-runtime-reduction")
    + masteryAccountBonusPercent(player.contentMasteryPoints, "adventure-runtime-reduction");
  const costReductionPercent = advantage.costReductionPercent + mastery.costReductionPercent + accountCostReduction;
  const runtimeReductionPercent = advantage.runtimeReductionPercent + mastery.runtimeReductionPercent + accountRuntimeReduction;
  const cost = Math.max(0, Math.round(activity.cost * (1 - Math.min(90, costReductionPercent) / 100)));
  const runtimeMs = Math.max(1_000, Math.round(activity.runtimeMs * (1 - Math.min(90, runtimeReductionPercent) / 100)));

  return {
    cost,
    baseCost: activity.cost,
    runtimeMs,
    baseRuntimeMs: activity.runtimeMs,
    advantage,
    mastery,
  };
}

export function canStartActivity(activity: GameplayActivity, player: ActivityPlayerState) {
  const run = effectiveActivityRun(activity, player);
  return player.rp >= run.cost && activityRequirementsMet(activity, player) && !isActivityRunning(player, activity.id);
}

export function isActivityRunning(player: Pick<ActivityPlayerState, "activeActivityRuns">, activityId: GameplayActivityId) {
  return player.activeActivityRuns.some((run) => run.activityId === activityId);
}

export function startActivityRun<T extends ActivityPlayerState>(
  player: T,
  activityId: GameplayActivityId,
  now = Date.now(),
  rollSeed = createRunSeed(),
): T {
  const current = processActiveActivityRuns(player, now);
  const activity = getActivity(activityId);
  if (!activity) return current;

  const effective = effectiveActivityRun(activity, current);
  if (current.rp < effective.cost || !activityRequirementsMet(activity, current) || isActivityRunning(current, activity.id)) return current;

  const run: ActiveActivityRun = {
    id: `${activity.id}-${now}`,
    activityId: activity.id,
    startedAt: now,
    endsAt: now + effective.runtimeMs,
    cost: effective.cost,
    baseCost: effective.baseCost,
    runtimeMs: effective.runtimeMs,
    baseRuntimeMs: effective.baseRuntimeMs,
    skillAdvantagePercent: effective.advantage.percent,
    masteryTrackId: activity.masteryTrackId,
    masteryLevel: masteryProgress(activity.masteryTrackId, current.contentMasteryPoints[activity.masteryTrackId] ?? 0).level,
    rollSeed: normalizeSeed(rollSeed),
  };

  return {
    ...current,
    rp: current.rp - effective.cost,
    activeActivityRuns: [...current.activeActivityRuns, run],
  };
}

export function processActiveActivityRuns<T extends ActivityPlayerState>(
  player: T,
  now = Date.now(),
): T {
  if (player.activeActivityRuns.length === 0) return player;

  let nextPlayer = {
    ...player,
    owned: [...player.owned],
    skillXp: { ...player.skillXp },
    activityRunCounts: { ...player.activityRunCounts },
    activityResults: [...player.activityResults],
    contentMasteryPoints: { ...player.contentMasteryPoints },
    sharedDropPoolRollUnits: { ...player.sharedDropPoolRollUnits },
    unlockedCosmetics: [...player.unlockedCosmetics],
    activeActivityRuns: [] as ActiveActivityRun[],
  };

  for (const run of player.activeActivityRuns) {
    const activity = getActivity(run.activityId);
    if (!activity) continue;

    if (run.endsAt > now) {
      nextPlayer.activeActivityRuns.push(run);
      continue;
    }

    nextPlayer = completeActivityRun(nextPlayer, activity, run);
  }

  return nextPlayer;
}

export function activityDropChance(drop: ActivityDrop, completedRuns: number) {
  const badLuckActiveAt = drop.chance * 2;
  const numerator = completedRuns >= badLuckActiveAt ? 3 : 1;
  return {
    numerator,
    denominator: drop.chance,
    badLuckActiveAt,
    isProtected: numerator > 1,
  };
}

export function formatDropChance(drop: ActivityDrop, completedRuns: number) {
  const chance = activityDropChance(drop, completedRuns);
  return chance.numerator === 1 ? `1 / ${chance.denominator}` : `${chance.numerator} / ${chance.denominator}`;
}

function completeActivityRun<T extends ActivityPlayerState>(
  player: T,
  activity: GameplayActivity,
  run: ActiveActivityRun,
): T {
  const random = seededRandom(run.rollSeed);
  const completedRuns = (player.activityRunCounts[activity.id] ?? 0) + 1;
  const skillAdvantagePercent = sanitizePercent(run.skillAdvantagePercent);
  const masteryRollChance = masteryEconomicModifiers(
    activity.masteryTrackId,
    player.contentMasteryPoints[activity.masteryTrackId] ?? 0,
  ).additionalRollChancePercent;
  const additionalChance = additionalRollChancePercent(player.owned)
    + setAccountBonusPercent(player.owned, "additional-roll-chance")
    + masteryAccountBonusPercent(player.contentMasteryPoints, "additional-roll-chance")
    + masteryRollChance;
  const primaryRoll = rollActivityDrop(activity, player.owned, completedRuns, random);
  const additionalRollTriggered = activity.drops.length > 0 && additionalChance > 0 && random() < additionalChance / 100;
  const additionalRoll = additionalRollTriggered
    ? rollActivityDrop(activity, player.owned, completedRuns, random)
    : undefined;
  const rollUnits = rollUnitsForBaseRap(run.baseCost);
  const sharedRolls = activity.sharedDropPoolIds.map((poolId) => {
    const pool = getSharedDropPool(poolId);
    const accumulatedUnits = player.sharedDropPoolRollUnits[poolId] ?? 0;
    const drop = pool ? rollSharedDropPool(pool, player.owned, accumulatedUnits, rollUnits, random) : undefined;
    return { poolId, poolName: pool?.name ?? poolId, drop, accumulatedUnits };
  });
  const droppedCollectibleId = selectRarestDrop(
    activity,
    [primaryRoll, additionalRoll, ...sharedRolls.map((roll) => roll.drop)].filter((id): id is string => !!id),
  );
  const xp = awardActivityXp(player, activity, run, skillAdvantagePercent);
  const owned = droppedCollectibleId && !player.owned.includes(droppedCollectibleId)
    ? [...player.owned, droppedCollectibleId]
    : player.owned;

  const rolls: ActivityRollResult[] = [
    { label: "Roll 1", triggered: true, droppedCollectibleId: primaryRoll },
    { label: "Additional Roll", triggered: additionalRollTriggered, droppedCollectibleId: additionalRoll },
  ];
  for (const sharedRoll of sharedRolls) {
    rolls.push({ label: sharedRoll.poolName, triggered: true, droppedCollectibleId: sharedRoll.drop });
  }

  const previousMasteryPoints = player.contentMasteryPoints[activity.masteryTrackId] ?? 0;
  const nextMasteryPoints = previousMasteryPoints + run.baseCost;
  const masteryRewards = masteryRewardsBetween(activity.masteryTrackId, previousMasteryPoints, nextMasteryPoints);
  const masteryCollectibleIds = masteryRewards.flatMap((milestone) => milestone.reward.type === "collectible" ? [milestone.reward.collectibleId] : []);
  const ownedWithMasteryRewards = [...new Set([...owned, ...masteryCollectibleIds])];
  const masteryUnlockedCosmetics = [...new Set([
    ...player.unlockedCosmetics,
    ...masteryRewards.flatMap((milestone) => milestone.reward.type === "cosmetic" ? [milestone.reward.cosmeticId] : []),
  ])];
  const sharedDropPoolRollUnits = { ...player.sharedDropPoolRollUnits };
  for (const sharedRoll of sharedRolls) {
    sharedDropPoolRollUnits[sharedRoll.poolId] = sharedRoll.accumulatedUnits + rollUnits;
  }
  const newMasteryLevel = masteryProgress(activity.masteryTrackId, nextMasteryPoints).level;
  const nextContentMasteryPoints = { ...player.contentMasteryPoints, [activity.masteryTrackId]: nextMasteryPoints };
  const unlockedCosmetics = reconcileUnlockedCosmetics(masteryUnlockedCosmetics, ownedWithMasteryRewards, nextContentMasteryPoints);

  const result: ActivityRunResult = {
    id: `${run.id}-result`,
    activityId: activity.id,
    activityName: activity.name,
    completedAt: run.endsAt,
    runCount: completedRuns,
    rapSpent: run.cost,
    baseRapCost: run.baseCost,
    runtimeMs: run.runtimeMs,
    baseRuntimeMs: run.baseRuntimeMs,
    skillAdvantagePercent,
    additionalRollChancePercent: additionalChance,
    additionalRollTriggered,
    xp,
    rolls,
    droppedCollectibleId,
    masteryTrackId: activity.masteryTrackId,
    masteryPointsGained: run.baseCost,
    masteryLevel: newMasteryLevel,
  };

  return {
    ...player,
    owned: ownedWithMasteryRewards,
    skillXp: { ...player.skillXp },
    activityRunCounts: { ...player.activityRunCounts, [activity.id]: completedRuns },
    activityResults: [result, ...player.activityResults].slice(0, MAX_ACTIVITY_RESULTS),
    contentMasteryPoints: nextContentMasteryPoints,
    sharedDropPoolRollUnits,
    unlockedCosmetics,
  };
}

function awardActivityXp(
  player: ActivityPlayerState,
  activity: GameplayActivity,
  run: ActiveActivityRun,
  skillAdvantagePercent: number,
) {
  const gained: Array<{ skillId: SkillId; amount: number; bonusPercent: number }> = [];
  const masteryBonus = masteryEconomicModifiers(activity.masteryTrackId, player.contentMasteryPoints[activity.masteryTrackId] ?? 0).xpBonusPercent;
  const adventureBonus = accountBonusPercent(player.owned, "adventure-xp")
    + setAccountBonusPercent(player.owned, "adventure-xp")
    + masteryAccountBonusPercent(player.contentMasteryPoints, "adventure-xp");

  for (const reward of activity.xpRewards) {
    const currentXp = player.skillXp[reward.skillId] ?? 0;
    const level = levelFromXp(currentXp);
    const accountBonus = skillXpBonusPercent(player.owned, reward.skillId)
      + setAccountBonusPercent(player.owned, "skill-xp", reward.skillId)
      + setAccountBonusPercent(player.owned, "all-skill-xp")
      + masteryAccountBonusPercent(player.contentMasteryPoints, "skill-xp", reward.skillId)
      + masteryAccountBonusPercent(player.contentMasteryPoints, "all-skill-xp")
      + adventureBonus;
    const bonusMultiplier = (1 + accountBonus / 100) * (1 + masteryBonus / 100) * (1 + skillAdvantagePercent / 100);
    const bonusPercent = (bonusMultiplier - 1) * 100;
    const amount = Math.min(
      xpTable[MAX_LEVEL] - currentXp,
      run.baseCost * trainingXpPerRap(level) * reward.share * bonusMultiplier,
    );
    if (amount <= 0) continue;
    player.skillXp[reward.skillId] = currentXp + amount;
    gained.push({ skillId: reward.skillId, amount, bonusPercent });
  }

  return gained;
}

function rollActivityDrop(
  activity: GameplayActivity,
  owned: string[],
  completedRuns: number,
  random: () => number,
) {
  const hits = activity.drops.filter((drop) => {
    if (owned.includes(drop.collectibleId)) return false;
    const chance = activityDropChance(drop, completedRuns);
    return random() < chance.numerator / chance.denominator;
  });

  if (hits.length === 0) return undefined;
  return hits.sort((a, b) => b.chance - a.chance)[0].collectibleId;
}

function selectRarestDrop(activity: GameplayActivity, collectibleIds: string[]) {
  if (collectibleIds.length === 0) return undefined;

  return collectibleIds.sort((a, b) => {
    const aChance = dropDenominator(activity, a);
    const bChance = dropDenominator(activity, b);
    return bChance - aChance;
  })[0];
}

function sanitizePercent(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(MAX_SKILL_ADVANTAGE_PERCENT, value);
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function dropDenominator(activity: GameplayActivity, collectibleId: string) {
  const directChance = activity.drops.find((drop) => drop.collectibleId === collectibleId)?.chance;
  if (directChance) return directChance;
  for (const poolId of activity.sharedDropPoolIds) {
    const chance = getSharedDropPool(poolId)?.entries.find((entry) => entry.collectibleId === collectibleId)?.denominator;
    if (chance) return chance;
  }
  return 0;
}

export function seedFromString(value: string) {
  let seed = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    seed ^= value.charCodeAt(index);
    seed = Math.imul(seed, 16_777_619);
  }
  return normalizeSeed(seed);
}

function createRunSeed() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  return seedFromString(`${Date.now()}-${Math.random()}`);
}

function normalizeSeed(seed: number) {
  if (!Number.isFinite(seed)) return 1;
  return (Math.trunc(seed) >>> 0) || 1;
}

function seededRandom(seed: number) {
  let state = normalizeSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function activityDropItem(drop: ActivityDrop) {
  return collectibles.find((item) => item.id === drop.collectibleId);
}
