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
const TRAINING_STEP_MS = 1_000;

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
    .filter((training) => isValidTrainingWindow(training, now))
    .map((training) => ({ ...training }));

  if (activeTrainings.length === 0) {
    return { ...player, rp, skillXp, activeTrainings };
  }

  for (let guard = 0; guard < 100_000; guard += 1) {
    const eligible = activeTrainings.filter((training) => {
      const xp = skillXp[training.skillId] ?? 0;
      return training.lastUpdatedAt < Math.min(training.endsAt, now) && xp < xpTable[MAX_LEVEL];
    });

    if (eligible.length === 0) break;
    if (rp <= 0) {
      activeTrainings = [];
      break;
    }

    const nextAt = Math.min(
      now,
      ...eligible.map((training) => Math.min(training.lastUpdatedAt + TRAINING_STEP_MS, training.endsAt)),
    );

    const demands = eligible.map((training) => ({
      training,
      elapsedMs: Math.max(0, nextAt - training.lastUpdatedAt),
    }));
    const totalRapDemand = demands.reduce((total, demand) => total + rapForElapsed(demand.elapsedMs), 0);
    if (totalRapDemand <= 0) break;

    const factor = Math.min(1, rp / totalRapDemand);
    let spentTotal = 0;

    for (const { training, elapsedMs } of demands) {
      const spentRap = rapForElapsed(elapsedMs) * factor;
      if (spentRap <= 0) continue;

      const currentXp = skillXp[training.skillId] ?? 0;
      const level = levelFromXp(currentXp);
      const remainingXp = xpTable[MAX_LEVEL] - currentXp;
      const gainedXp = Math.min(remainingXp, spentRap * trainingXpPerRap(level));
      skillXp[training.skillId] = currentXp + gainedXp;
      spentTotal += spentRap;
      training.lastUpdatedAt += elapsedMs * factor;
    }

    rp = Math.max(0, rp - spentTotal);

    activeTrainings = activeTrainings.filter((training) => {
      const xp = skillXp[training.skillId] ?? 0;
      return rp > 0 && training.lastUpdatedAt < training.endsAt && xp < xpTable[MAX_LEVEL];
    });

    if (factor < 1) {
      activeTrainings = [];
      break;
    }
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

function isValidTrainingWindow(training: ActiveTraining, now: number) {
  return (
    Number.isFinite(training.startedAt) &&
    Number.isFinite(training.lastUpdatedAt) &&
    Number.isFinite(training.endsAt) &&
    training.endsAt > training.lastUpdatedAt &&
    training.endsAt > now - HOUR_MS * 24
  );
}

function clampNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
