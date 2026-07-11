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
    expect(JSON.parse(exported).version).toBe(7);
    expect(importPlayerState(exported)).toEqual(player);
  });
});
