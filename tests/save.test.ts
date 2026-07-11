import { describe, expect, it } from "vitest";
import {
  createInitialPlayerState,
  exportPlayerState,
  importPlayerState,
  loadPlayerSnapshot,
  SAVE_KEY,
  savePlayerState,
  type StorageLike,
} from "../src/save";
import { xpForLevel } from "../src/xp";

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("save system", () => {
  it("migrates a version 1 save into the current player shape", () => {
    const imported = importPlayerState(JSON.stringify({
      version: 1,
      savedAt: "2026-01-01T00:00:00.000Z",
      player: { rp: 123, owned: [], skillXp: {} },
    }));

    expect(imported).not.toBeNull();
    expect(imported?.rp).toBe(123);
    expect(imported?.lastSeenActivityResultId).toBeNull();
    expect(imported?.contentMasteryPoints["mastery-fishers-trawler"]).toBe(0);
    expect(imported?.unlockedCosmetics).toEqual(expect.arrayContaining([
      "theme-storm-weaver",
      "theme-verdant-warden",
      "theme-ember-forge",
      "theme-moonlit-archive",
      "theme-sunken-meridian",
    ]));
    expect(imported?.achievementPoints).toBe(0);
    expect(imported?.completedAchievements).toEqual({});
    expect(imported?.selectedCosmetics.titleId).toBeNull();
    expect(imported?.ownedSkillCapes).toEqual([]);
    expect(imported?.notifiedSkillCapeIds).toEqual([]);
    expect(Object.keys(imported?.skillXp ?? {})).toHaveLength(30);
  });

  it("rejects a stale writer instead of overwriting a newer revision", () => {
    const storage = new MemoryStorage();
    const player = createInitialPlayerState();
    const first = savePlayerState(player, { expectedRevision: 0, storage });
    const stale = savePlayerState({ ...player, rp: 99_999 }, { expectedRevision: 0, storage });

    expect(first).toMatchObject({ ok: true, revision: 1 });
    expect(stale).toMatchObject({ ok: false, reason: "conflict" });
    expect(loadPlayerSnapshot(storage).player.rp).toBe(0);
  });

  it("falls back to a valid legacy save when the primary value is corrupted", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, "not-json");
    storage.setItem("rap-collectibles.save.v5", JSON.stringify({
      version: 5,
      savedAt: "2026-01-01T00:00:00.000Z",
      player: { rp: 555, owned: [], skillXp: {} },
    }));

    expect(loadPlayerSnapshot(storage).player.rp).toBe(555);
  });

  it("round-trips current saves", () => {
    const player = createInitialPlayerState();
    player.rp = 42_000;
    player.lastSeenActivityResultId = null;
    player.contentMasteryPoints["mastery-fishers-trawler"] = 250_000;

    const exported = exportPlayerState(player);
    expect(JSON.parse(exported).version).toBe(9);
    expect(importPlayerState(exported)).toEqual(player);
  });

  it("backfills legacy Achievement progress without replaying notification toasts", () => {
    const imported = importPlayerState(JSON.stringify({
      version: 7,
      revision: 3,
      savedAt: "2026-01-01T00:00:00.000Z",
      player: { rp: 123, lifetimeRap: 100_000, owned: [], skillXp: {} },
    }));

    expect(imported?.completedAchievements).toHaveProperty("achievement-rap-10k");
    expect(imported?.completedAchievements).toHaveProperty("achievement-rap-100k");
    expect(imported?.notifiedAchievementIds).toEqual(expect.arrayContaining([
      "achievement-rap-10k",
      "achievement-rap-100k",
    ]));
  });

  it("backfills Skill Cape entitlements from legacy Skill XP without replaying notifications", () => {
    const imported = importPlayerState(JSON.stringify({
      version: 8,
      revision: 4,
      savedAt: "2026-01-01T00:00:00.000Z",
      player: {
        rp: 123,
        lifetimeRap: 123,
        owned: [],
        skillXp: { fishing: xpForLevel(99) },
      },
    }));

    expect(imported?.ownedSkillCapes).toContain("skill-cape-fishing-99");
    expect(imported?.ownedSkillCapes).not.toContain("skill-cape-fishing-120");
    expect(imported?.notifiedSkillCapeIds).toContain("skill-cape-fishing-99");
  });
});
