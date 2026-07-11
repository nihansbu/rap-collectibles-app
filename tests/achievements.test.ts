import { describe, expect, it } from "vitest";
import { achievementPointTotal, achievementProgress, reconcileAchievements } from "../src/achievements";
import { ACHIEVEMENTS, collectibles } from "../src/data";
import { createInitialPlayerState } from "../src/save";
import { xpTable } from "../src/xp";

describe("Achievement progression", () => {
  it("completes eligible multi-stage Achievements exactly once", () => {
    const player = createInitialPlayerState();
    player.lifetimeRap = 1_000_000;

    const completed = reconcileAchievements(player, 123_456);
    const repeated = reconcileAchievements(completed, 999_999);

    expect(completed.completedAchievements).toMatchObject({
      "achievement-rap-10k": 123_456,
      "achievement-rap-100k": 123_456,
      "achievement-rap-1m": 123_456,
    });
    expect(completed.achievementPoints).toBe(225);
    expect(repeated.completedAchievements).toEqual(completed.completedAchievements);
    expect(repeated.achievementPoints).toBe(completed.achievementPoints);
  });

  it("derives tag-filtered collection progress from the catalog", () => {
    const player = createInitialPlayerState();
    const achievement = ACHIEVEMENTS.find((entry) => entry.id === "achievement-aquatic-mounts");
    if (!achievement) throw new Error("Aquatic Mount Achievement missing");
    const aquaticMounts = collectibles.filter((item) => item.category === "mounts" && item.tags?.includes("aquatic"));
    player.owned = aquaticMounts.map((item) => item.id);

    expect(aquaticMounts).toHaveLength(2);
    expect(achievementProgress(achievement, player)).toMatchObject({ current: 2, target: 2, complete: true });
  });

  it("chains AP threshold Achievements and unlocks their title rewards", () => {
    const player = createInitialPlayerState();
    player.lifetimeRap = 1_000_000;
    player.owned = collectibles.map((item) => item.id);
    player.activityRunCounts["fishers-trawler"] = 100;
    player.contentMasteryPoints["mastery-fishers-trawler"] = 5_000_000;
    player.skillXp.attack = xpTable[120];

    const completed = reconcileAchievements(player, 42);

    expect(completed.completedAchievements["achievement-points-500"]).toBe(42);
    expect(completed.unlockedCosmetics).toEqual(expect.arrayContaining([
      "title-pathfinder",
      "title-stablemaster",
      "title-achievement-hunter",
    ]));
    expect(completed.achievementPoints).toBe(achievementPointTotal(completed.completedAchievements));
  });
});
