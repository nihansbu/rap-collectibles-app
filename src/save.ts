import {
  GAMEPLAY_ACTIVITIES,
  getActivity,
  processActiveActivityRuns,
  seedFromString,
  type ActiveActivityRun,
  type ActivityRunResult,
} from "./activities";
import { ACHIEVEMENTS, collectibles, COSMETICS, CONTENT_MASTERY_TRACKS, SKILL_CAPES, SPECIALIZATIONS, skills, type SkillId, type SpecializationId } from "./data";
import { reconcileAchievements } from "./achievements";
import { reconcileUnlockedSkillCapes } from "./skillCapes";
import { ACTIVITY_OPTIONS, type ActivityId, type ActivityLogEntry } from "./economy";
import { defaultUnlockedCosmetics, reconcileUnlockedCosmetics } from "./cosmetics";
import { type ActiveTraining, MAX_ACTIVE_TRAININGS, processActiveTrainings, TRAINING_WINDOW_HOURS } from "./training";
import { MAX_LEVEL, xpTable } from "./xp";
import { createEmptySpecializationXp } from "./specializations";

export type PlayerState = {
  rp: number;
  lifetimeRap: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
  specializationXp: Record<SpecializationId, number>;
  activeTrainings: ActiveTraining[];
  activityLog: ActivityLogEntry[];
  activeActivityRuns: ActiveActivityRun[];
  activityRunCounts: Record<string, number>;
  activityResults: ActivityRunResult[];
  lastSeenActivityResultId: string | null;
  contentMasteryPoints: Record<string, number>;
  unlockedCosmetics: string[];
  selectedCosmetics: { themeId: string | null; profileBadgeId: string | null; titleId: string | null };
  completedAchievements: Record<string, number>;
  notifiedAchievementIds: string[];
  achievementPoints: number;
  ownedSkillCapes: string[];
  notifiedSkillCapeIds: string[];
};

type SavePlayerV1 = {
  rp: number;
  owned: string[];
  skillXp: Partial<Record<SkillId, number>>;
};

type SavePlayerV2 = SavePlayerV1 & {
  activeTrainings?: ActiveTraining[];
};

type SavePlayerV3 = SavePlayerV2 & {
  lifetimeRap?: number;
  activityLog?: ActivityLogEntry[];
};

type SavePlayerV4 = SavePlayerV3 & {
  activeActivityRuns?: ActiveActivityRun[];
  activityRunCounts?: Record<string, number>;
  activityResults?: ActivityRunResult[];
};

type SavePlayerV5 = SavePlayerV4;

type SavePlayerV6 = SavePlayerV5 & {
  lastSeenActivityResultId?: string | null;
};

type SavePlayerV7 = SavePlayerV6 & {
  contentMasteryPoints?: Record<string, number>;
  sharedDropPoolRollUnits?: Record<string, number>;
  unlockedCosmetics?: string[];
  selectedCosmetics?: { themeId?: string | null; profileBadgeId?: string | null };
};

type SavePlayerV8 = SavePlayerV7 & {
  completedAchievements?: Record<string, number>;
  notifiedAchievementIds?: string[];
  achievementPoints?: number;
  selectedCosmetics?: { themeId?: string | null; profileBadgeId?: string | null; titleId?: string | null };
};

type SavePlayerV9 = SavePlayerV8 & {
  ownedSkillCapes?: string[];
  notifiedSkillCapeIds?: string[];
};

type SavePlayerV10 = SavePlayerV9 & {
  specializationXp?: Partial<Record<SpecializationId, number>>;
};

type SaveFileV1 = {
  version: 1;
  savedAt: string;
  player: SavePlayerV1;
};

type SaveFileV2 = {
  version: 2;
  savedAt: string;
  player: SavePlayerV2;
};

type SaveFileV3 = {
  version: 3;
  savedAt: string;
  player: SavePlayerV3;
};

type SaveFileV4 = {
  version: 4;
  savedAt: string;
  player: SavePlayerV4;
};

type SaveFileV5 = {
  version: 5;
  savedAt: string;
  player: SavePlayerV5;
};

type SaveFileV6 = {
  version: 6;
  revision: number;
  savedAt: string;
  player: SavePlayerV6;
};

type SaveFileV7 = {
  version: 7;
  revision: number;
  savedAt: string;
  player: SavePlayerV7;
};

type SaveFileV8 = {
  version: 8;
  revision: number;
  savedAt: string;
  player: SavePlayerV8;
};

type SaveFileV9 = {
  version: 9;
  revision: number;
  savedAt: string;
  player: SavePlayerV9;
};

type SaveFileV10 = {
  version: 10;
  revision: number;
  savedAt: string;
  player: SavePlayerV10;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type SaveSnapshot = {
  player: PlayerState;
  revision: number;
  savedAt: string | null;
};

export type SaveWriteResult =
  | { ok: true; revision: number; savedAt: string }
  | { ok: false; reason: "unavailable" | "conflict" | "write-failed"; snapshot?: SaveSnapshot };

export const CURRENT_SAVE_VERSION = 10;
export const SAVE_KEY = "rap-collectibles.save.v10";
const LAST_KNOWN_GOOD_KEY = "rap-collectibles.save.lastKnownGood.v10";
const BACKUP_KEYS = ["rap-collectibles.save.backup.v10.1", "rap-collectibles.save.backup.v10.2"];
const BACKUP_TIMESTAMP_KEY = "rap-collectibles.save.backup.v10.timestamp";
const BACKUP_INTERVAL_MS = 5 * 60 * 1000;
const LEGACY_KEYS = [
  "rap-collectibles.save.v9",
  "rap-collectibles.save.lastKnownGood.v9",
  "rap-collectibles.save.backup.v9.1",
  "rap-collectibles.save.backup.v9.2",
  "rap-collectibles.save.v8",
  "rap-collectibles.save.lastKnownGood.v8",
  "rap-collectibles.save.backup.v8.1",
  "rap-collectibles.save.backup.v8.2",
  "rap-collectibles.save.v7",
  "rap-collectibles.save.lastKnownGood.v7",
  "rap-collectibles.save.backup.v7.1",
  "rap-collectibles.save.backup.v7.2",
  "rap-collectibles.save.v6",
  "rap-collectibles.save.lastKnownGood.v6",
  "rap-collectibles.save.backup.v6.1",
  "rap-collectibles.save.backup.v6.2",
  "rap-collectibles.save.v5",
  "rap-collectibles.save.lastKnownGood.v5",
  "rap-collectibles.save.backup.v5.1",
  "rap-collectibles.save.backup.v5.2",
  "rap-collectibles.save.v4",
  "rap-collectibles.save.lastKnownGood.v4",
  "rap-collectibles.save.backup.v4.1",
  "rap-collectibles.save.backup.v4.2",
  "rap-collectibles.save.v3",
  "rap-collectibles.save.lastKnownGood.v3",
  "rap-collectibles.save.backup.v3.1",
  "rap-collectibles.save.backup.v3.2",
  "rap-collectibles.save.v2",
  "rap-collectibles.save.lastKnownGood.v2",
  "rap-collectibles.save.backup.v2.1",
  "rap-collectibles.save.backup.v2.2",
  "rap-collectibles.save.v1",
  "rap-collectibles.save.lastKnownGood",
  "rap-collectibles.save.backup.1",
  "rap-collectibles.save.backup.2",
];
const MAX_RAP = Number.MAX_SAFE_INTEGER;
const MAX_ACTIVITY_LOG_ENTRIES = 8;

const collectibleIds = new Set(collectibles.map((item) => item.id));
const skillIds = new Set(skills.map((skill) => skill.id));
const activityIds = new Set(ACTIVITY_OPTIONS.map((activity) => activity.id));
const gameplayActivityIds = new Set(GAMEPLAY_ACTIVITIES.map((activity) => activity.id));
const masteryTrackIds = new Set(CONTENT_MASTERY_TRACKS.map((track) => track.id));
const specializationIds = new Set(SPECIALIZATIONS.map((specialization) => specialization.id));
const cosmeticIds = new Set(COSMETICS.map((cosmetic) => cosmetic.id));
const achievementIds = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
const skillCapeIds = new Set(SKILL_CAPES.map((cape) => cape.id));

export function createInitialPlayerState(): PlayerState {
  return {
    rp: 0,
    lifetimeRap: 0,
    owned: [],
    skillXp: createEmptySkillXp(),
    specializationXp: createEmptySpecializationXp(),
    activeTrainings: [],
    activityLog: [],
    activeActivityRuns: [],
    activityRunCounts: Object.fromEntries(GAMEPLAY_ACTIVITIES.map((activity) => [activity.id, 0])),
    activityResults: [],
    lastSeenActivityResultId: null,
    contentMasteryPoints: Object.fromEntries(CONTENT_MASTERY_TRACKS.map((track) => [track.id, 0])),
    unlockedCosmetics: defaultUnlockedCosmetics(),
    selectedCosmetics: { themeId: null, profileBadgeId: null, titleId: null },
    completedAchievements: {},
    notifiedAchievementIds: [],
    achievementPoints: 0,
    ownedSkillCapes: [],
    notifiedSkillCapeIds: [],
  };
}

export function loadPlayerState(): PlayerState {
  return loadPlayerSnapshot().player;
}

export function loadPlayerSnapshot(storage: StorageLike | null = getStorage()): SaveSnapshot {
  if (!storage) return { player: createInitialPlayerState(), revision: 0, savedAt: null };

  for (const key of [SAVE_KEY, LAST_KNOWN_GOOD_KEY, ...BACKUP_KEYS, ...LEGACY_KEYS]) {
    const rawSave = storage.getItem(key);
    if (!rawSave) continue;

    const snapshot = parseSaveSnapshot(rawSave);
    if (snapshot) {
      return {
        ...snapshot,
        player: reconcileUnlockedSkillCapesOnPlayer(reconcileAchievements(processActiveActivityRuns(processActiveTrainings(snapshot.player)))),
      };
    }
  }

  return { player: createInitialPlayerState(), revision: 0, savedAt: null };
}

export function savePlayerState(
  player: PlayerState,
  options: { expectedRevision?: number; storage?: StorageLike | null; force?: boolean } = {},
): SaveWriteResult {
  const storage = options.storage === undefined ? getStorage() : options.storage;
  if (!storage) return { ok: false, reason: "unavailable" };

  const currentSnapshot = parseSaveSnapshot(storage.getItem(SAVE_KEY) ?? "");
  if (
    !options.force &&
    options.expectedRevision !== undefined &&
    currentSnapshot &&
    currentSnapshot.revision > options.expectedRevision
  ) {
    return { ok: false, reason: "conflict", snapshot: currentSnapshot };
  }

  const revision = Math.max(currentSnapshot?.revision ?? 0, options.expectedRevision ?? 0) + 1;
  const savedAt = new Date().toISOString();
  const nextSave = serializeSave(player, revision, savedAt);
  if (!parseSaveSnapshot(nextSave)) return { ok: false, reason: "write-failed" };

  try {
    rotateBackups(storage, Date.now());
    storage.setItem(SAVE_KEY, nextSave);
    storage.setItem(LAST_KNOWN_GOOD_KEY, nextSave);
    return { ok: true, revision, savedAt };
  } catch (error) {
    console.warn("Progress could not be saved.", error);
    return { ok: false, reason: "write-failed" };
  }
}

export function exportPlayerState(player: PlayerState): string {
  return serializeSave(reconcileUnlockedSkillCapesOnPlayer(reconcileAchievements(processActiveActivityRuns(processActiveTrainings(player)))), 0, new Date().toISOString());
}

export function importPlayerState(rawSave: string): PlayerState | null {
  const snapshot = parseSaveSnapshot(rawSave);
  return snapshot ? reconcileUnlockedSkillCapesOnPlayer(reconcileAchievements(processActiveActivityRuns(processActiveTrainings(snapshot.player)))) : null;
}

function getStorage(): StorageLike | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window.localStorage;
    const probeKey = "rap-collectibles.storage-probe";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

function serializeSave(player: PlayerState, revision: number, savedAt: string): string {
  const saveFile: SaveFileV10 = {
    version: CURRENT_SAVE_VERSION,
    revision,
    savedAt,
    player: normalizePlayerState(player),
  };

  return JSON.stringify(saveFile);
}

export function parseSaveSnapshot(rawSave: string): SaveSnapshot | null {
  try {
    const parsed = JSON.parse(rawSave) as unknown;
    if (!isSaveFile(parsed)) return null;
    return {
      player: normalizePlayerState(parsed.player),
      revision: "revision" in parsed ? sanitizeInteger(parsed.revision, 0, Number.MAX_SAFE_INTEGER) : 0,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : null,
    };
  } catch {
    return null;
  }
}

function isSaveFile(value: unknown): value is SaveFileV1 | SaveFileV2 | SaveFileV3 | SaveFileV4 | SaveFileV5 | SaveFileV6 | SaveFileV7 | SaveFileV8 | SaveFileV9 | SaveFileV10 {
  if (!value || typeof value !== "object") return false;

  const candidate = value as { version?: unknown; player?: unknown };
  if (![1, 2, 3, 4, 5, 6, 7, 8, 9, CURRENT_SAVE_VERSION].includes(candidate.version as number)) return false;
  if (!candidate.player || typeof candidate.player !== "object") return false;

  return true;
}

function normalizePlayerState(player: SavePlayerV1 | SavePlayerV2 | SavePlayerV3 | SavePlayerV4 | SavePlayerV5 | SavePlayerV6 | SavePlayerV7 | SavePlayerV8 | SavePlayerV9 | SavePlayerV10): PlayerState {
  const sourceSkillXp = player.skillXp && typeof player.skillXp === "object" ? player.skillXp : {};

  const skillXp = Object.fromEntries(
    skills.map((skill) => {
      const rawXp = sourceSkillXp[skill.id];
      return [skill.id, sanitizeNumber(rawXp, 0, xpTable[MAX_LEVEL])];
    }),
  ) as Record<SkillId, number>;
  const sourceSpecializationXp = "specializationXp" in player && player.specializationXp && typeof player.specializationXp === "object"
    ? player.specializationXp
    : {};
  const specializationXp = Object.fromEntries(
    SPECIALIZATIONS.map((specialization) => [
      specialization.id,
      sanitizeNumber(sourceSpecializationXp[specialization.id], 0, xpTable[MAX_LEVEL]),
    ]),
  ) as Record<SpecializationId, number>;

  const owned = Array.isArray(player.owned)
    ? [...new Set(player.owned)].filter((id): id is string => typeof id === "string" && collectibleIds.has(id))
    : [];
  const activityResults = normalizeActivityResults("activityResults" in player ? player.activityResults : undefined);
  const requestedSeenResultId = "lastSeenActivityResultId" in player ? player.lastSeenActivityResultId : null;
  const lastSeenActivityResultId = typeof requestedSeenResultId === "string" && activityResults.some((result) => result.id === requestedSeenResultId)
    ? requestedSeenResultId
    : null;
  const contentMasteryPoints = normalizeIdNumberRecord("contentMasteryPoints" in player ? player.contentMasteryPoints : undefined, masteryTrackIds);
  const unlockedCosmetics = reconcileUnlockedCosmetics(
    normalizeCosmeticIds("unlockedCosmetics" in player ? player.unlockedCosmetics : undefined),
    owned,
    contentMasteryPoints,
  );

  const completedAchievements = normalizeAchievementCompletions(
    "completedAchievements" in player ? player.completedAchievements : undefined,
  );
  const migratedFromLegacyAchievements = !("completedAchievements" in player);
  const ownedSkillCapes = normalizeSkillCapeIds("ownedSkillCapes" in player ? player.ownedSkillCapes : undefined);
  const migratedFromLegacySkillCapes = !("ownedSkillCapes" in player);
  const normalizedPlayer: PlayerState = {
    rp: sanitizeNumber(player.rp, 0, MAX_RAP),
    lifetimeRap: sanitizeNumber("lifetimeRap" in player ? player.lifetimeRap : player.rp, 0, MAX_RAP),
    owned,
    skillXp,
    specializationXp,
    activeTrainings: normalizeActiveTrainings("activeTrainings" in player ? player.activeTrainings : undefined),
    activityLog: normalizeActivityLog("activityLog" in player ? player.activityLog : undefined),
    activeActivityRuns: normalizeActiveActivityRuns("activeActivityRuns" in player ? player.activeActivityRuns : undefined),
    activityRunCounts: normalizeActivityRunCounts("activityRunCounts" in player ? player.activityRunCounts : undefined),
    activityResults,
    lastSeenActivityResultId,
    contentMasteryPoints,
    unlockedCosmetics,
    selectedCosmetics: { themeId: null, profileBadgeId: null, titleId: null },
    completedAchievements,
    notifiedAchievementIds: [],
    achievementPoints: 0,
    ownedSkillCapes,
    notifiedSkillCapeIds: [],
  };

  const reconciled = reconcileUnlockedSkillCapesOnPlayer(reconcileAchievements(normalizedPlayer));
  const notifiedAchievementIds = migratedFromLegacyAchievements
    ? Object.keys(reconciled.completedAchievements)
    : normalizeAchievementIds("notifiedAchievementIds" in player ? player.notifiedAchievementIds : undefined)
      .filter((id) => reconciled.completedAchievements[id] !== undefined);
  const notifiedSkillCapeIds = migratedFromLegacySkillCapes
    ? reconciled.ownedSkillCapes
    : normalizeSkillCapeIds("notifiedSkillCapeIds" in player ? player.notifiedSkillCapeIds : undefined)
      .filter((id) => reconciled.ownedSkillCapes.includes(id));

  return {
    ...reconciled,
    notifiedAchievementIds,
    notifiedSkillCapeIds,
    selectedCosmetics: normalizeSelectedCosmetics(
      "selectedCosmetics" in player ? player.selectedCosmetics : undefined,
      reconciled.unlockedCosmetics,
    ),
  };
}

function normalizeIdNumberRecord(value: unknown, allowedIds: Set<string>) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries([...allowedIds].map((id) => [id, sanitizeNumber(source[id], 0, MAX_RAP)]));
}

function normalizeCosmeticIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value)].filter((id): id is string => typeof id === "string" && cosmeticIds.has(id))
    : [];
}

function normalizeAchievementIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value)].filter((id): id is string => typeof id === "string" && achievementIds.has(id))
    : [];
}

function normalizeAchievementCompletions(value: unknown) {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.fromEntries(
    Object.entries(source)
      .filter(([id, completedAt]) => achievementIds.has(id) && typeof completedAt === "number" && Number.isFinite(completedAt))
      .map(([id, completedAt]) => [id, sanitizeInteger(completedAt, 0, Number.MAX_SAFE_INTEGER)]),
  );
}

function normalizeSkillCapeIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value)].filter((id): id is string => typeof id === "string" && skillCapeIds.has(id))
    : [];
}

function reconcileUnlockedSkillCapesOnPlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    ownedSkillCapes: reconcileUnlockedSkillCapes(player.ownedSkillCapes, player.skillXp),
  };
}

function normalizeSelectedCosmetics(value: unknown, unlockedValue: unknown) {
  const selected = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const unlocked = new Set(normalizeCosmeticIds(unlockedValue));
  const themeId = typeof selected.themeId === "string" && unlocked.has(selected.themeId) ? selected.themeId : null;
  const profileBadgeId = typeof selected.profileBadgeId === "string" && unlocked.has(selected.profileBadgeId) ? selected.profileBadgeId : null;
  const titleId = typeof selected.titleId === "string" && unlocked.has(selected.titleId) ? selected.titleId : null;
  return { themeId, profileBadgeId, titleId };
}

function normalizeActiveTrainings(value: unknown): ActiveTraining[] {
  if (!Array.isArray(value)) return [];

  const usedSkillIds = new Set<SkillId>();
  const normalized: ActiveTraining[] = [];

  for (const training of value) {
    if (!training || typeof training !== "object") continue;

    const candidate = training as ActiveTraining;
    if (typeof candidate.id !== "string") continue;
    if (!skillIds.has(candidate.skillId)) continue;
    if (usedSkillIds.has(candidate.skillId)) continue;
    if (!Number.isFinite(candidate.startedAt)) continue;
    if (!Number.isFinite(candidate.lastUpdatedAt)) continue;
    if (!Number.isFinite(candidate.endsAt)) continue;
    const endsAt = Math.min(candidate.endsAt, candidate.startedAt + TRAINING_WINDOW_HOURS * 60 * 60 * 1000);
    if (endsAt <= candidate.lastUpdatedAt) continue;

    normalized.push({
      id: candidate.id,
      skillId: candidate.skillId,
      startedAt: candidate.startedAt,
      lastUpdatedAt: candidate.lastUpdatedAt,
      endsAt,
    });
    usedSkillIds.add(candidate.skillId);

    if (normalized.length >= MAX_ACTIVE_TRAININGS) break;
  }

  return normalized;
}

function normalizeActivityLog(value: unknown): ActivityLogEntry[] {
  if (!Array.isArray(value)) return [];

  const normalized: ActivityLogEntry[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;

    const candidate = entry as ActivityLogEntry;
    if (typeof candidate.id !== "string") continue;
    if (!activityIds.has(candidate.activityId)) continue;
    if (typeof candidate.name !== "string") continue;
    if (!Number.isFinite(candidate.hours) || candidate.hours <= 0 || candidate.hours > 24) continue;
    if (!Number.isFinite(candidate.rap) || candidate.rap <= 0 || candidate.rap > MAX_RAP) continue;
    if (!Number.isFinite(candidate.loggedAt)) continue;

    normalized.push({
      id: candidate.id,
      activityId: candidate.activityId as ActivityId,
      name: candidate.name,
      hours: sanitizeNumber(candidate.hours, 0, 24),
      rap: sanitizeNumber(candidate.rap, 0, MAX_RAP),
      loggedAt: candidate.loggedAt,
    });

    if (normalized.length >= MAX_ACTIVITY_LOG_ENTRIES) break;
  }

  return normalized;
}

function normalizeActiveActivityRuns(value: unknown): ActiveActivityRun[] {
  if (!Array.isArray(value)) return [];

  const normalized: ActiveActivityRun[] = [];

  for (const run of value) {
    if (!run || typeof run !== "object") continue;

    const candidate = run as ActiveActivityRun;
    if (typeof candidate.id !== "string") continue;
    if (!gameplayActivityIds.has(candidate.activityId)) continue;
    if (!Number.isFinite(candidate.startedAt)) continue;
    if (!Number.isFinite(candidate.endsAt)) continue;
    if (!Number.isFinite(candidate.cost) || candidate.cost < 0 || candidate.cost > MAX_RAP) continue;
    if (candidate.endsAt <= candidate.startedAt) continue;
    const activity = getActivity(candidate.activityId);
    if (!activity) continue;
    const runtimeMs = sanitizeNumber(candidate.runtimeMs, 1_000, 86_400_000);
    const baseRuntimeMs = sanitizeNumber(candidate.baseRuntimeMs, 1_000, 86_400_000);

    normalized.push({
      id: candidate.id,
      activityId: candidate.activityId,
      startedAt: candidate.startedAt,
      endsAt: candidate.endsAt,
      cost: sanitizeNumber(candidate.cost, 0, MAX_RAP),
      baseCost: sanitizeNumber(candidate.baseCost, 0, MAX_RAP) || activity.cost,
      runtimeMs: runtimeMs || Math.max(1_000, candidate.endsAt - candidate.startedAt),
      baseRuntimeMs: baseRuntimeMs || activity.runtimeMs,
      skillAdvantagePercent: sanitizeNumber(candidate.skillAdvantagePercent, 0, 15),
      masteryTrackId: typeof candidate.masteryTrackId === "string" && masteryTrackIds.has(candidate.masteryTrackId)
        ? candidate.masteryTrackId
        : activity.masteryTrackId,
      masteryLevel: sanitizeInteger(candidate.masteryLevel, 0, 50),
      eligibleSpecializationIds: Array.isArray(candidate.eligibleSpecializationIds)
        ? [...new Set(candidate.eligibleSpecializationIds)].filter((id): id is SpecializationId => specializationIds.has(id))
        : [],
      rollSeed: Number.isFinite(candidate.rollSeed)
        ? sanitizeInteger(candidate.rollSeed, 1, 0xffff_ffff)
        : seedFromString(candidate.id),
    });
  }

  return normalized;
}

function normalizeActivityRunCounts(value: unknown): Record<string, number> {
  const normalized: Record<string, number> = {};
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};

  for (const activity of GAMEPLAY_ACTIVITIES) {
    normalized[activity.id] = sanitizeInteger(source[activity.id], 0, MAX_RAP);
  }

  return normalized;
}

function normalizeActivityResults(value: unknown): ActivityRunResult[] {
  if (!Array.isArray(value)) return [];

  const normalized: ActivityRunResult[] = [];

  for (const result of value) {
    if (!result || typeof result !== "object") continue;

    const candidate = result as ActivityRunResult;
    if (typeof candidate.id !== "string") continue;
    if (!gameplayActivityIds.has(candidate.activityId)) continue;
    if (typeof candidate.activityName !== "string") continue;
    if (!Number.isFinite(candidate.completedAt)) continue;
    if (!Number.isFinite(candidate.runCount)) continue;
    if (candidate.droppedCollectibleId !== undefined && !collectibleIds.has(candidate.droppedCollectibleId)) continue;
    if (!Array.isArray(candidate.xp)) continue;

    const xp = candidate.xp
      .filter((entry) => skillIds.has(entry.skillId) && Number.isFinite(entry.amount) && entry.amount >= 0)
      .map((entry) => ({
        skillId: entry.skillId,
        amount: sanitizeNumber(entry.amount, 0, xpTable[MAX_LEVEL]),
        bonusPercent: sanitizeNumber(entry.bonusPercent, 0, 10_000),
      }));
    const specializationXp = Array.isArray(candidate.specializationXp)
      ? candidate.specializationXp
        .filter((entry) => specializationIds.has(entry.specializationId) && Number.isFinite(entry.amount) && entry.amount >= 0)
        .map((entry) => ({
          specializationId: entry.specializationId,
          amount: sanitizeNumber(entry.amount, 0, xpTable[MAX_LEVEL]),
          bonusPercent: sanitizeNumber(entry.bonusPercent, 0, 10_000),
        }))
      : [];
    const activity = getActivity(candidate.activityId);
    const rolls = Array.isArray(candidate.rolls)
      ? candidate.rolls
        .filter((roll) => roll && typeof roll === "object")
        .map((roll) => {
          const source = roll as ActivityRunResult["rolls"][number];
          return {
            label: typeof source.label === "string" ? source.label : "Roll",
            triggered: Boolean(source.triggered),
            droppedCollectibleId: source.droppedCollectibleId && collectibleIds.has(source.droppedCollectibleId)
              ? source.droppedCollectibleId
              : undefined,
          };
        })
      : [
        { label: "Roll 1", triggered: true, droppedCollectibleId: candidate.droppedCollectibleId },
        { label: "Additional Roll", triggered: false, droppedCollectibleId: undefined },
      ];

    normalized.push({
      id: candidate.id,
      activityId: candidate.activityId,
      activityName: candidate.activityName,
      completedAt: candidate.completedAt,
      runCount: sanitizeInteger(candidate.runCount, 0, MAX_RAP),
      rapSpent: sanitizeNumber(candidate.rapSpent, 0, MAX_RAP),
      baseRapCost: sanitizeNumber(candidate.baseRapCost, 0, MAX_RAP) || activity?.cost || 0,
      runtimeMs: sanitizeNumber(candidate.runtimeMs, 1_000, 86_400_000) || activity?.runtimeMs || 1_000,
      baseRuntimeMs: sanitizeNumber(candidate.baseRuntimeMs, 1_000, 86_400_000) || activity?.runtimeMs || 1_000,
      skillAdvantagePercent: sanitizeNumber(candidate.skillAdvantagePercent, 0, 15),
      additionalRollChancePercent: sanitizeNumber(candidate.additionalRollChancePercent, 0, 100),
      additionalRollTriggered: Boolean(candidate.additionalRollTriggered),
      xp,
      specializationXp,
      rolls,
      droppedCollectibleId: candidate.droppedCollectibleId,
      masteryTrackId: typeof candidate.masteryTrackId === "string" && masteryTrackIds.has(candidate.masteryTrackId)
        ? candidate.masteryTrackId
        : activity?.masteryTrackId ?? "",
      masteryPointsGained: sanitizeNumber(candidate.masteryPointsGained, 0, MAX_RAP),
      masteryLevel: sanitizeInteger(candidate.masteryLevel, 0, 50),
    });

    if (normalized.length >= 6) break;
  }

  return normalized;
}

function createEmptySkillXp() {
  return Object.fromEntries(skills.map((skill) => [skill.id, 0])) as Record<SkillId, number>;
}

function sanitizeNumber(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function sanitizeInteger(value: unknown, min: number, max: number) {
  return Math.trunc(sanitizeNumber(value, min, max));
}

function rotateBackups(storage: StorageLike, now: number) {
  const currentSave = storage.getItem(SAVE_KEY);
  if (!currentSave) return;
  const lastBackupAt = Number(storage.getItem(BACKUP_TIMESTAMP_KEY) ?? 0);
  if (Number.isFinite(lastBackupAt) && now - lastBackupAt < BACKUP_INTERVAL_MS) return;

  const firstBackup = storage.getItem(BACKUP_KEYS[0]);
  if (firstBackup) storage.setItem(BACKUP_KEYS[1], firstBackup);
  storage.setItem(BACKUP_KEYS[0], currentSave);
  storage.setItem(BACKUP_TIMESTAMP_KEY, String(now));
}
