import {
  ACHIEVEMENTS,
  collectibles,
  COLLECTION_SETS,
  type AchievementCollectibleFilter,
  type AchievementDefinition,
  type SkillId,
  skills,
} from "./data";
import { reconcileUnlockedCosmetics } from "./cosmetics";
import { masteryProgress } from "./mastery";
import { levelFromXp } from "./xp";

export type AchievementProgress = {
  current: number;
  target: number;
  complete: boolean;
};

export type AchievementStateShape = {
  lifetimeRap: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
  activityRunCounts: Record<string, number>;
  contentMasteryPoints: Record<string, number>;
  unlockedCosmetics: string[];
  completedAchievements: Record<string, number>;
  notifiedAchievementIds: string[];
  achievementPoints: number;
};

const achievementIndex = new Map(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]));

export function getAchievement(id: string) {
  return achievementIndex.get(id);
}

export function achievementPointTotal(completedAchievements: Record<string, number>) {
  return Object.keys(completedAchievements).reduce(
    (total, id) => total + (achievementIndex.get(id)?.points ?? 0),
    0,
  );
}

export function achievementProgress(
  achievement: AchievementDefinition,
  player: Pick<AchievementStateShape,
    "lifetimeRap" | "owned" | "skillXp" | "activityRunCounts" | "contentMasteryPoints" | "achievementPoints"
  >,
): AchievementProgress {
  const condition = achievement.condition;

  if (condition.type === "lifetime-rap") {
    return progress(player.lifetimeRap, condition.amount);
  }

  if (condition.type === "skill-level") {
    const current = condition.skillId
      ? levelFromXp(player.skillXp[condition.skillId] ?? 0)
      : Math.max(...skills.map((skill) => levelFromXp(player.skillXp[skill.id] ?? 0)));
    return progress(current, condition.level);
  }

  if (condition.type === "total-skill-level") {
    const current = skills.reduce((total, skill) => total + levelFromXp(player.skillXp[skill.id] ?? 0), 0);
    return progress(current, condition.level);
  }

  if (condition.type === "collectibles-owned") {
    const matching = collectiblesMatching(condition.filter);
    const owned = new Set(player.owned);
    return progress(matching.filter((item) => owned.has(item.id)).length, condition.count);
  }

  if (condition.type === "collectibles-complete") {
    const matching = collectiblesMatching(condition.filter);
    const owned = new Set(player.owned);
    const current = matching.filter((item) => owned.has(item.id)).length;
    return { current, target: matching.length, complete: matching.length > 0 && current >= matching.length };
  }

  if (condition.type === "set-complete") {
    const sets = condition.setId
      ? COLLECTION_SETS.filter((set) => set.id === condition.setId)
      : COLLECTION_SETS;
    const owned = new Set(player.owned);
    const current = sets.filter((set) => set.collectibleIds.every((id) => owned.has(id))).length;
    return progress(current, 1);
  }

  if (condition.type === "activity-runs") {
    const current = condition.activityId
      ? player.activityRunCounts[condition.activityId] ?? 0
      : Object.values(player.activityRunCounts).reduce((total, runs) => total + runs, 0);
    return progress(current, condition.count);
  }

  if (condition.type === "mastery-level") {
    return progress(
      masteryProgress(condition.trackId, player.contentMasteryPoints[condition.trackId] ?? 0).level,
      condition.level,
    );
  }

  return progress(player.achievementPoints, condition.points);
}

export function reconcileAchievements<T extends AchievementStateShape>(player: T, completedAt = Date.now()): T {
  const completedAchievements = { ...player.completedAchievements };
  const owned = new Set(player.owned);
  const unlockedCosmetics = new Set(player.unlockedCosmetics);
  let achievementPoints = achievementPointTotal(completedAchievements);
  let changed = true;

  while (changed) {
    changed = false;
    const snapshot = {
      ...player,
      owned: [...owned],
      completedAchievements,
      achievementPoints,
    };

    for (const achievement of ACHIEVEMENTS) {
      if (completedAchievements[achievement.id] !== undefined) continue;
      if (!achievementProgress(achievement, snapshot).complete) continue;

      completedAchievements[achievement.id] = completedAt;
      achievementPoints += achievement.points;
      changed = true;

      for (const reward of achievement.rewards ?? []) {
        if (reward.type === "cosmetic") unlockedCosmetics.add(reward.cosmeticId);
        if (reward.type === "collectible") owned.add(reward.collectibleId);
      }
    }
  }

  const reconciledCosmetics = reconcileUnlockedCosmetics(
    [...unlockedCosmetics],
    [...owned],
    player.contentMasteryPoints,
  );

  return {
    ...player,
    owned: [...owned],
    unlockedCosmetics: reconciledCosmetics,
    completedAchievements,
    achievementPoints,
  };
}

function collectiblesMatching(filter?: AchievementCollectibleFilter) {
  if (!filter) return collectibles;
  return collectibles.filter((item) => {
    if (filter.category && item.category !== filter.category) return false;
    if (filter.type && item.type !== filter.type) return false;
    if (filter.sourceActivityId && item.source?.activityId !== filter.sourceActivityId) return false;
    if (filter.tags?.some((tag) => !item.tags?.includes(tag))) return false;
    return true;
  });
}

function progress(current: number, target: number): AchievementProgress {
  const safeTarget = Math.max(1, target);
  const safeCurrent = Math.max(0, current);
  return { current: safeCurrent, target: safeTarget, complete: safeCurrent >= safeTarget };
}
