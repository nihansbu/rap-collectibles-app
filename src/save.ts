import { collectibles, skills, type SkillId } from "./data";
import { MAX_LEVEL, xpTable } from "./xp";

export type PlayerState = {
  rp: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
};

type SaveFileV1 = {
  version: 1;
  savedAt: string;
  player: {
    rp: number;
    owned: string[];
    skillXp: Partial<Record<SkillId, number>>;
  };
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const CURRENT_SAVE_VERSION = 1;
const SAVE_KEY = "rap-collectibles.save.v1";
const LAST_KNOWN_GOOD_KEY = "rap-collectibles.save.lastKnownGood";
const BACKUP_KEYS = ["rap-collectibles.save.backup.1", "rap-collectibles.save.backup.2"];
const MAX_RP = Number.MAX_SAFE_INTEGER;

const collectibleIds = new Set(collectibles.map((item) => item.id));

export function createInitialPlayerState(): PlayerState {
  return {
    rp: 0,
    owned: [],
    skillXp: Object.fromEntries(skills.map((skill) => [skill.id, 0])) as Record<SkillId, number>,
  };
}

export function loadPlayerState(): PlayerState {
  const storage = getStorage();
  if (!storage) return createInitialPlayerState();

  for (const key of [SAVE_KEY, LAST_KNOWN_GOOD_KEY, ...BACKUP_KEYS]) {
    const rawSave = storage.getItem(key);
    if (!rawSave) continue;

    const player = parsePlayerState(rawSave);
    if (player) return player;
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
  const saveFile: SaveFileV1 = {
    version: CURRENT_SAVE_VERSION,
    savedAt: new Date().toISOString(),
    player: normalizePlayerState(player),
  };

  return JSON.stringify(saveFile);
}

function parsePlayerState(rawSave: string): PlayerState | null {
  try {
    const parsed = JSON.parse(rawSave) as unknown;
    if (!isSaveFileV1(parsed)) return null;
    return normalizePlayerState(parsed.player);
  } catch {
    return null;
  }
}

function isSaveFileV1(value: unknown): value is SaveFileV1 {
  if (!value || typeof value !== "object") return false;

  const candidate = value as { version?: unknown; player?: unknown };
  if (candidate.version !== CURRENT_SAVE_VERSION) return false;
  if (!candidate.player || typeof candidate.player !== "object") return false;

  return true;
}

function normalizePlayerState(player: SaveFileV1["player"]): PlayerState {
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
    rp: sanitizeNumber(player.rp, 0, MAX_RP),
    owned,
    skillXp,
  };
}

function sanitizeNumber(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function rotateBackups(storage: StorageLike) {
  const currentSave = storage.getItem(SAVE_KEY);
  if (!currentSave) return;

  const firstBackup = storage.getItem(BACKUP_KEYS[0]);
  if (firstBackup) storage.setItem(BACKUP_KEYS[1], firstBackup);
  storage.setItem(BACKUP_KEYS[0], currentSave);
}
