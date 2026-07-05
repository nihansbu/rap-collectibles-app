import { collectibles, skills, type SkillId } from "./data";
import { ACTIVITY_OPTIONS, type ActivityId, type ActivityLogEntry } from "./economy";
import { type ActiveTraining, MAX_ACTIVE_TRAININGS, processActiveTrainings } from "./training";
import { MAX_LEVEL, xpTable } from "./xp";

export type PlayerState = {
  rp: number;
  lifetimeRap: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
  activeTrainings: ActiveTraining[];
  activityLog: ActivityLogEntry[];
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

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const CURRENT_SAVE_VERSION = 3;
const SAVE_KEY = "rap-collectibles.save.v3";
const LAST_KNOWN_GOOD_KEY = "rap-collectibles.save.lastKnownGood.v3";
const BACKUP_KEYS = ["rap-collectibles.save.backup.v3.1", "rap-collectibles.save.backup.v3.2"];
const LEGACY_KEYS = [
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

export function createInitialPlayerState(): PlayerState {
  return {
    rp: 0,
    lifetimeRap: 0,
    owned: [],
    skillXp: createEmptySkillXp(),
    activeTrainings: [],
    activityLog: [],
  };
}

export function loadPlayerState(): PlayerState {
  const storage = getStorage();
  if (!storage) return createInitialPlayerState();

  for (const key of [SAVE_KEY, LAST_KNOWN_GOOD_KEY, ...BACKUP_KEYS, ...LEGACY_KEYS]) {
    const rawSave = storage.getItem(key);
    if (!rawSave) continue;

    const player = parsePlayerState(rawSave);
    if (player) return processActiveTrainings(player);
  }

  return createInitialPlayerState();
}

export function savePlayerState(player: PlayerState): void {
  const storage = getStorage();
  if (!storage) return;

  const nextSave = serializeSave(player);
  if (!parsePlayerState(nextSave)) return;

  try {
    rotateBackups(storage);
    storage.setItem(SAVE_KEY, nextSave);
    storage.setItem(LAST_KNOWN_GOOD_KEY, nextSave);
  } catch (error) {
    console.warn("Progress could not be saved.", error);
  }
}

export function exportPlayerState(player: PlayerState): string {
  return serializeSave(processActiveTrainings(player));
}

export function importPlayerState(rawSave: string): PlayerState | null {
  const player = parsePlayerState(rawSave);
  return player ? processActiveTrainings(player) : null;
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

function serializeSave(player: PlayerState): string {
  const saveFile: SaveFileV3 = {
    version: CURRENT_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    player: normalizePlayerState(player),
  };

  return JSON.stringify(saveFile);
}

function parsePlayerState(rawSave: string): PlayerState | null {
  try {
    const parsed = JSON.parse(rawSave) as unknown;
    if (!isSaveFile(parsed)) return null;
    return normalizePlayerState(parsed.player);
  } catch {
    return null;
  }
}

function isSaveFile(value: unknown): value is SaveFileV1 | SaveFileV2 | SaveFileV3 {
  if (!value || typeof value !== "object") return false;

  const candidate = value as { version?: unknown; player?: unknown };
  if (candidate.version !== 1 && candidate.version !== 2 && candidate.version !== CURRENT_SAVE_VERSION) return false;
  if (!candidate.player || typeof candidate.player !== "object") return false;

  return true;
}

function normalizePlayerState(player: SavePlayerV1 | SavePlayerV2 | SavePlayerV3): PlayerState {
  const sourceSkillXp = player.skillXp && typeof player.skillXp === "object" ? player.skillXp : {};

  const skillXp = Object.fromEntries(
    skills.map((skill) => {
      const rawXp = sourceSkillXp[skill.id];
      return [skill.id, sanitizeNumber(rawXp, 0, xpTable[MAX_LEVEL])];
    }),
  ) as Record<SkillId, number>;

  const owned = Array.isArray(player.owned)
    ? [...new Set(player.owned)].filter((id): id is string => typeof id === "string" && collectibleIds.has(id))
    : [];

  return {
    rp: sanitizeNumber(player.rp, 0, MAX_RAP),
    lifetimeRap: sanitizeNumber("lifetimeRap" in player ? player.lifetimeRap : player.rp, 0, MAX_RAP),
    owned,
    skillXp,
    activeTrainings: normalizeActiveTrainings("activeTrainings" in player ? player.activeTrainings : undefined),
    activityLog: normalizeActivityLog("activityLog" in player ? player.activityLog : undefined),
  };
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
    if (candidate.endsAt <= candidate.lastUpdatedAt) continue;

    normalized.push({
      id: candidate.id,
      skillId: candidate.skillId,
      startedAt: candidate.startedAt,
      lastUpdatedAt: candidate.lastUpdatedAt,
      endsAt: candidate.endsAt,
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

function createEmptySkillXp() {
  return Object.fromEntries(skills.map((skill) => [skill.id, 0])) as Record<SkillId, number>;
}

function sanitizeNumber(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function rotateBackups(storage: StorageLike) {
  const currentSave = storage.getItem(SAVE_KEY);
  if (!currentSave) return;

  const firstBackup = storage.getItem(BACKUP_KEYS[0]);
  if (firstBackup) storage.setItem(BACKUP_KEYS[1], firstBackup);
  storage.setItem(BACKUP_KEYS[0], currentSave);
}
