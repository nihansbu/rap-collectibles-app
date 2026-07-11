import { CONTENT_MASTERY_TRACKS, type ContentMasteryPassive, type ContentMasteryTrack } from "./data";
import {
  CONTENT_MASTERY_LEVEL_RATIOS,
  CONTENT_MASTERY_MAX_LEVEL,
} from "./data/balance/mastery";
import { MAX_CONTENT_MASTERY_ECONOMIC_PERCENT } from "./data/balance/modifiers";

const masteryTrackIndex = new Map(CONTENT_MASTERY_TRACKS.map((track) => [track.id, track]));

export type MasteryProgress = {
  level: number;
  points: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
  isMaxed: boolean;
};

export function getMasteryTrack(trackId: string) {
  return masteryTrackIndex.get(trackId);
}

export function masteryThreshold(track: ContentMasteryTrack, level: number) {
  const safeLevel = Math.min(CONTENT_MASTERY_MAX_LEVEL, Math.max(0, Math.trunc(level)));
  return Math.round(track.targetRap * CONTENT_MASTERY_LEVEL_RATIOS[safeLevel]);
}

export function masteryProgress(trackId: string, points: number): MasteryProgress {
  const track = getMasteryTrack(trackId);
  const safePoints = Number.isFinite(points) ? Math.max(0, points) : 0;
  if (!track) {
    return { level: 0, points: safePoints, currentLevelPoints: 0, nextLevelPoints: 0, progress: 0, isMaxed: false };
  }

  let level = 0;
  for (let candidate = 1; candidate <= CONTENT_MASTERY_MAX_LEVEL; candidate += 1) {
    if (safePoints < masteryThreshold(track, candidate)) break;
    level = candidate;
  }

  const isMaxed = level >= CONTENT_MASTERY_MAX_LEVEL;
  const currentLevelPoints = masteryThreshold(track, level);
  const nextLevelPoints = masteryThreshold(track, Math.min(CONTENT_MASTERY_MAX_LEVEL, level + 1));
  const progress = isMaxed || nextLevelPoints <= currentLevelPoints
    ? 1
    : Math.min(1, Math.max(0, (safePoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)));

  return { level, points: safePoints, currentLevelPoints, nextLevelPoints, progress, isMaxed };
}

export function masteryRingPercent(trackId: string, points: number) {
  return (masteryProgress(trackId, points).level / CONTENT_MASTERY_MAX_LEVEL) * 100;
}

export function masteryPassivePercent(trackId: string, points: number, type: ContentMasteryPassive["type"]) {
  const track = getMasteryTrack(trackId);
  if (!track) return 0;
  const level = masteryProgress(trackId, points).level;
  return track.passiveBonuses
    .filter((bonus) => bonus.type === type)
    .reduce((total, bonus) => total + bonus.percentPerLevel * level, 0);
}

export function masteryEconomicModifiers(trackId: string, points: number) {
  return {
    xpBonusPercent: cappedMasteryPercent(masteryPassivePercent(trackId, points, "content-xp")),
    costReductionPercent: cappedMasteryPercent(masteryPassivePercent(trackId, points, "rap-cost-reduction")),
    runtimeReductionPercent: cappedMasteryPercent(masteryPassivePercent(trackId, points, "runtime-reduction")),
    additionalRollChancePercent: cappedMasteryPercent(masteryPassivePercent(trackId, points, "additional-roll-chance")),
  };
}

export function masteryRewardsBetween(trackId: string, previousPoints: number, nextPoints: number) {
  const track = getMasteryTrack(trackId);
  if (!track) return [];
  const previousLevel = masteryProgress(trackId, previousPoints).level;
  const nextLevel = masteryProgress(trackId, nextPoints).level;
  return track.milestones.filter((milestone) => milestone.level > previousLevel && milestone.level <= nextLevel);
}

export function collectMasteryAccountBonuses(pointsByTrack: Record<string, number>) {
  return CONTENT_MASTERY_TRACKS.flatMap((track) => {
    const level = masteryProgress(track.id, pointsByTrack[track.id] ?? 0).level;
    return track.milestones.flatMap((milestone) => milestone.level <= level && milestone.reward.type === "account-bonus"
      ? [{ ...milestone.reward.bonus, sourceId: track.id, sourceName: track.name }]
      : []);
  });
}

export function masteryAccountBonusPercent(
  pointsByTrack: Record<string, number>,
  type: ReturnType<typeof collectMasteryAccountBonuses>[number]["type"],
  skillId?: string,
) {
  return collectMasteryAccountBonuses(pointsByTrack).reduce((total, bonus) => {
    if (bonus.type !== type) return total;
    if (bonus.type === "skill-xp" && bonus.skillId !== skillId) return total;
    return total + bonus.percent;
  }, 0);
}

export function masteryUnlockedContentIds(pointsByTrack: Record<string, number>) {
  return CONTENT_MASTERY_TRACKS.flatMap((track) => {
    const level = masteryProgress(track.id, pointsByTrack[track.id] ?? 0).level;
    return track.milestones.flatMap((milestone) => milestone.level <= level && milestone.reward.type === "content-unlock"
      ? [milestone.reward.contentId]
      : []);
  });
}

function cappedMasteryPercent(value: number) {
  return Math.min(MAX_CONTENT_MASTERY_ECONOMIC_PERCENT, Math.max(0, value));
}
