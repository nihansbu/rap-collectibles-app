import { type SkillId } from "./data";
import { MAX_LEVEL, levelFromXp, xpTable } from "./xp";

export type ActiveTraining = {
  id: string;
  skillId: SkillId;
  startedAt: number;
  lastUpdatedAt: number;
  endsAt: number;
};

export type TrainablePlayerState = {
  rp: number;
  skillXp: Record<SkillId, number>;
  activeTrainings: ActiveTraining[];
};

export const MAX_ACTIVE_TRAININGS = 3;
export const TRAINING_RAP_PER_HOUR = 10_000;
export const TRAINING_DURATIONS = [
  { hours: 1, label: "Train 1 Hour" },
  { hours: 2, label: "Train 2 Hours" },
  { hours: 5, label: "Train 5 Hours" },
  { hours: 12, label: "Train 12 Hours" },
] as const;

const HOUR_MS = 60 * 60 * 1000;
const RAP_PER_MS = TRAINING_RAP_PER_HOUR / HOUR_MS;
const TIME_EPSILON_MS = 0.001;

export function trainingXpPerHour(level: number) {
  if (level >= 110) return 18_000;
  if (level >= 100) return 16_000;
  if (level >= 90) return 14_000;
  if (level >= 70) return 12_000;
  if (level >= 50) return 10_000;
  if (level >= 30) return 8_000;
  if (level >= 10) return 6_000;
  return 4_000;
}

export function trainingXpPerRap(level: number) {
  return trainingXpPerHour(level) / TRAINING_RAP_PER_HOUR;
}

export function isSkillTraining(player: TrainablePlayerState, skillId: SkillId) {
  return player.activeTrainings.some((training) => training.skillId === skillId);
}

export function startSkillTraining<T extends TrainablePlayerState>(
  player: T,
  skillId: SkillId,
  hours: number,
  now = Date.now(),
): T {
  const current = processActiveTrainings(player, now);
  const currentXp = current.skillXp[skillId] ?? 0;
  if (currentXp >= xpTable[MAX_LEVEL]) return current;

  const existing = current.activeTrainings.find((training) => training.skillId === skillId);
  if (!existing && current.activeTrainings.length >= MAX_ACTIVE_TRAININGS) return current;

  const durationMs = hours * HOUR_MS;
  const activeTrainings = existing
    ? current.activeTrainings.map((training) =>
        training.skillId === skillId
          ? { ...training, endsAt: Math.max(training.endsAt, now) + durationMs }
          : training,
      )
    : [
        ...current.activeTrainings,
        {
          id: `${skillId}-${now}`,
          skillId,
          startedAt: now,
          lastUpdatedAt: now,
          endsAt: now + durationMs,
        },
      ];

  return { ...current, activeTrainings };
}

export function processActiveTrainings<T extends TrainablePlayerState>(player: T, now = Date.now()): T {
  if (player.activeTrainings.length === 0) return player;

  let rp = clampNonNegative(player.rp);
  const skillXp = { ...player.skillXp };
  let activeTrainings = player.activeTrainings
    .filter(isValidTrainingWindow)
    .map((training) => ({ ...training }));

  if (activeTrainings.length === 0) {
    return { ...player, rp, skillXp, activeTrainings };
  }

  // Advance between actual events (another job catching up, a level boundary,
  // a job ending, or RAP running out) instead of simulating every second.
  for (let guard = 0; guard < 2_000; guard += 1) {
    const eligible = activeTrainings.filter((training) => {
      const xp = skillXp[training.skillId] ?? 0;
      return training.lastUpdatedAt < Math.min(training.endsAt, now) && xp < xpTable[MAX_LEVEL];
    });

    if (eligible.length === 0) break;
    if (rp <= 0) {
      activeTrainings = [];
      break;
    }

    const cursor = Math.min(...eligible.map((training) => training.lastUpdatedAt));
    const cohort = eligible.filter((training) => Math.abs(training.lastUpdatedAt - cursor) < TIME_EPSILON_MS);
    const nextCursor = Math.min(
      ...eligible
        .filter((training) => training.lastUpdatedAt > cursor + TIME_EPSILON_MS)
        .map((training) => training.lastUpdatedAt),
      Number.POSITIVE_INFINITY,
    );
    const nextEnd = Math.min(...cohort.map((training) => Math.min(training.endsAt, now)));
    let elapsedMs = Math.min(nextEnd - cursor, nextCursor - cursor);

    for (const training of cohort) {
      const currentXp = skillXp[training.skillId] ?? 0;
      const level = levelFromXp(currentXp);
      const nextLevelXp = xpTable[Math.min(MAX_LEVEL, level + 1)];
      const xpPerRap = trainingXpPerRap(level);
      const timeToLevelMs = (nextLevelXp - currentXp) / (xpPerRap * RAP_PER_MS);
      elapsedMs = Math.min(elapsedMs, timeToLevelMs);
    }

    const timeUntilRapRunsOutMs = rp / (cohort.length * RAP_PER_MS);
    elapsedMs = Math.min(elapsedMs, timeUntilRapRunsOutMs);
    if (!Number.isFinite(elapsedMs) || elapsedMs <= TIME_EPSILON_MS) break;

    const spentPerTraining = rapForElapsed(elapsedMs);
    for (const training of cohort) {
      const currentXp = skillXp[training.skillId] ?? 0;
      const level = levelFromXp(currentXp);
      const remainingXp = xpTable[MAX_LEVEL] - currentXp;
      const gainedXp = Math.min(remainingXp, spentPerTraining * trainingXpPerRap(level));
      skillXp[training.skillId] = currentXp + gainedXp;
      training.lastUpdatedAt += elapsedMs;
    }

    rp = Math.max(0, rp - spentPerTraining * cohort.length);

    activeTrainings = activeTrainings.filter((training) => {
      const xp = skillXp[training.skillId] ?? 0;
      return rp > TIME_EPSILON_MS && training.lastUpdatedAt < training.endsAt && xp < xpTable[MAX_LEVEL];
    });
  }

  return { ...player, rp, skillXp, activeTrainings };
}

export function remainingTrainingMs(training: ActiveTraining, now = Date.now()) {
  return Math.max(0, training.endsAt - now);
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function rapForElapsed(ms: number) {
  return (TRAINING_RAP_PER_HOUR * ms) / HOUR_MS;
}

function isValidTrainingWindow(training: ActiveTraining) {
  return (
    Number.isFinite(training.startedAt) &&
    Number.isFinite(training.lastUpdatedAt) &&
    Number.isFinite(training.endsAt) &&
    training.startedAt <= training.lastUpdatedAt &&
    training.endsAt > training.lastUpdatedAt
  );
}

function clampNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
