import { describe, expect, it } from "vitest";
import { masteryEconomicModifiers, masteryProgress, masteryRewardsBetween, masteryThreshold } from "../src/mastery";
import { CONTENT_MASTERY_TRACKS } from "../src/data";
import { rollChaserItem } from "../src/chasers";

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

describe("global Chaser items", () => {
  const chaser = { id: "test", name: "Test", collectibleId: "item", denominator: 100, eligibleActivityIds: ["a"] };

  it("uses one fixed independent chance without protection state", () => {
    expect(rollChaserItem(chaser, [], () => 0.009)).toBe("item");
    expect(rollChaserItem(chaser, [], () => 0.01)).toBeUndefined();
  });

  it("never awards an already owned global collectible twice", () => {
    expect(rollChaserItem(chaser, ["item"], () => 0)).toBeUndefined();
  });
});
