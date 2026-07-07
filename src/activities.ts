import { additionalRollChancePercent, skillXpBonusPercent } from "./bonuses";
import { collectibles, type Requirement, type SkillId } from "./data";
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
  name: string;
  description: string;
  type: string;
  cost: number;
  runtimeMs: number;
  requirements: Requirement[];
  xpRewards: ActivityXpReward[];
  drops: ActivityDrop[];
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
};

export type ActivityPlayerState = {
  rp: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
  activeActivityRuns: ActiveActivityRun[];
  activityRunCounts: Record<string, number>;
  activityResults: ActivityRunResult[];
};

const MAX_ACTIVITY_RESULTS = 6;
const RUN_TIME_MS = 3_000;
const MAX_SKILL_ADVANTAGE_PERCENT = 15;

export const GAMEPLAY_ACTIVITIES: GameplayActivity[] = [
  {
    id: "fishers-trawler",
    name: "Fisher's Trawler",
    description: "Crew a battered trawler through rough water for Fishing XP and rare sea-bound companions.",
    type: "Fishing",
    cost: 10_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "fishing", level: 40 }],
    xpRewards: [
      { skillId: "fishing", share: 0.5 },
      { skillId: "cooking", share: 0.25 },
    ],
    drops: [
      { collectibleId: "pet-trawler-gull", chance: 500 },
      { collectibleId: "tool-dragon-harpoon", chance: 750 },
      { collectibleId: "mount-brine-ray", chance: 2_500 },
      { collectibleId: "tool-storm-harpoon", chance: 25_000 },
    ],
  },
  {
    id: "haunted-burial",
    name: "Haunted Burial",
    description: "Settle old graves and recover solemn keepsakes from the dusk fields.",
    type: "Ritual",
    cost: 12_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "prayer", level: 25 }],
    xpRewards: [
      { skillId: "prayer", share: 0.5 },
      { skillId: "necromancy", share: 0.25 },
    ],
    drops: [],
  },
  {
    id: "ember-kiln",
    name: "Ember Kiln",
    description: "Work a volatile kiln where careful heat turns ore and ash into useful craft.",
    type: "Crafting",
    cost: 9_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "firemaking", level: 20 }],
    xpRewards: [
      { skillId: "firemaking", share: 0.35 },
      { skillId: "smithing", share: 0.25 },
      { skillId: "crafting", share: 0.15 },
    ],
    drops: [],
  },
  {
    id: "deep-mine-survey",
    name: "Deep Mine Survey",
    description: "Chart unstable tunnels for mining crews and mark the safest routes back out.",
    type: "Gathering",
    cost: 11_000,
    runtimeMs: RUN_TIME_MS,
    requirements: [{ type: "skill", skillId: "mining", level: 30 }],
    xpRewards: [
      { skillId: "mining", share: 0.5 },
      { skillId: "dungeoneering", share: 0.25 },
    ],
    drops: [],
  },
];

export function getActivity(activityId: string) {
  return GAMEPLAY_ACTIVITIES.find((activity) => activity.id === activityId);
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

export function effectiveActivityRun(activity: GameplayActivity, player: Pick<ActivityPlayerState, "skillXp">) {
  const advantage = activitySkillAdvantage(activity, player);
  const cost = Math.max(0, Math.round(activity.cost * (1 - advantage.costReductionPercent / 100)));
  const runtimeMs = Math.max(1_000, Math.round(activity.runtimeMs * (1 - advantage.runtimeReductionPercent / 100)));

  return {
    cost,
    baseCost: activity.cost,
    runtimeMs,
    baseRuntimeMs: activity.runtimeMs,
    advantage,
  };
}

export function canStartActivity(activity: GameplayActivity, player: ActivityPlayerState) {
  const run = effectiveActivityRun(activity, player);
  return player.rp >= run.cost && activityRequirementsMet(activity, player) && !isActivityRunning(player, activity.id);
}

export function isActivityRunning(player: Pick<ActivityPlayerState, "activeActivityRuns">, activityId: GameplayActivityId) {
  return player.activeActivityRuns.some((run) => run.activityId === activityId);
}

export function startActivityRun<T extends ActivityPlayerState>(player: T, activityId: GameplayActivityId, now = Date.now()): T {
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
  random = Math.random,
): T {
  if (player.activeActivityRuns.length === 0) return player;

  let nextPlayer = {
    ...player,
    owned: [...player.owned],
    skillXp: { ...player.skillXp },
    activityRunCounts: { ...player.activityRunCounts },
    activityResults: [...player.activityResults],
    activeActivityRuns: [] as ActiveActivityRun[],
  };

  for (const run of player.activeActivityRuns) {
    const activity = getActivity(run.activityId);
    if (!activity) continue;

    if (run.endsAt > now) {
      nextPlayer.activeActivityRuns.push(run);
      continue;
    }

    nextPlayer = completeActivityRun(nextPlayer, activity, run, now, random);
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
  now: number,
  random: () => number,
): T {
  const completedRuns = (player.activityRunCounts[activity.id] ?? 0) + 1;
  const skillAdvantagePercent = sanitizePercent(run.skillAdvantagePercent);
  const additionalChance = additionalRollChancePercent(player.owned);
  const primaryRoll = rollActivityDrop(activity, player.owned, completedRuns, random);
  const additionalRollTriggered = activity.drops.length > 0 && additionalChance > 0 && random() < additionalChance / 100;
  const additionalRoll = additionalRollTriggered
    ? rollActivityDrop(activity, player.owned, completedRuns, random)
    : undefined;
  const droppedCollectibleId = selectRarestDrop(activity, [primaryRoll, additionalRoll].filter((id): id is string => !!id));
  const xp = awardActivityXp(player, activity, run, skillAdvantagePercent);
  const owned = droppedCollectibleId && !player.owned.includes(droppedCollectibleId)
    ? [...player.owned, droppedCollectibleId]
    : player.owned;

  const rolls: ActivityRollResult[] = [
    { label: "Roll 1", triggered: true, droppedCollectibleId: primaryRoll },
    { label: "Additional Roll", triggered: additionalRollTriggered, droppedCollectibleId: additionalRoll },
  ];

  const result: ActivityRunResult = {
    id: `${run.id}-result-${now}`,
    activityId: activity.id,
    activityName: activity.name,
    completedAt: now,
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
  };

  return {
    ...player,
    owned,
    skillXp: { ...player.skillXp },
    activityRunCounts: { ...player.activityRunCounts, [activity.id]: completedRuns },
    activityResults: [result, ...player.activityResults].slice(0, MAX_ACTIVITY_RESULTS),
  };
}

function awardActivityXp(
  player: ActivityPlayerState,
  activity: GameplayActivity,
  run: ActiveActivityRun,
  skillAdvantagePercent: number,
) {
  const gained: Array<{ skillId: SkillId; amount: number; bonusPercent: number }> = [];

  for (const reward of activity.xpRewards) {
    const currentXp = player.skillXp[reward.skillId] ?? 0;
    const level = levelFromXp(currentXp);
    const accountBonus = skillXpBonusPercent(player.owned, reward.skillId);
    const bonusPercent = accountBonus + skillAdvantagePercent;
    const amount = Math.min(
      xpTable[MAX_LEVEL] - currentXp,
      run.baseCost * trainingXpPerRap(level) * reward.share * (1 + bonusPercent / 100),
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
    const aChance = activity.drops.find((drop) => drop.collectibleId === a)?.chance ?? 0;
    const bChance = activity.drops.find((drop) => drop.collectibleId === b)?.chance ?? 0;
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

export function activityDropItem(drop: ActivityDrop) {
  return collectibles.find((item) => item.id === drop.collectibleId);
}
