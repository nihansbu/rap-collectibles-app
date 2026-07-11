import { describe, expect, it } from "vitest";
import { sharedDropEntryChance, rollUnitsForBaseRap } from "../src/dropPools";
import { masteryEconomicModifiers, masteryProgress, masteryRewardsBetween, masteryThreshold } from "../src/mastery";
import { CONTENT_MASTERY_TRACKS } from "../src/data";

describe("Content Mastery", () => {
  const track = CONTENT_MASTERY_TRACKS.find((candidate) => candidate.id === "mastery-fishers-trawler")!;

  it("derives levels from configurable target RAP", () => {
    expect(masteryThreshold(track, 25)).toBe(2_500_000);
    expect(masteryProgress(track.id, 2_499_999).level).toBe(24);
    expect(masteryProgress(track.id, 2_500_000).level).toBe(25);
    expect(masteryProgress(track.id, 5_000_000)).toMatchObject({ level: 50, isMaxed: true, progress: 1 });
  });

  it("scales modest passive bonuses and returns crossed milestones", () => {
    expect(masteryEconomicModifiers(track.id, 5_000_000).xpBonusPercent).toBe(5);
    expect(masteryRewardsBetween(track.id, 799_999, 800_000).map((reward) => reward.level)).toEqual([8]);
  });
});

describe("shared Chaser Roll Units", () => {
  it("normalizes runs by undiscounted base RAP", () => {
    expect(rollUnitsForBaseRap(10_000)).toBe(1);
    expect(rollUnitsForBaseRap(50_000)).toBe(5);
  });

  it("activates protection from accumulated Roll Units", () => {
    expect(sharedDropEntryChance(500, 999).multiplier).toBe(1);
    expect(sharedDropEntryChance(500, 1_000)).toMatchObject({ multiplier: 3, isProtected: true, protectedAt: 1_000 });
  });
});
