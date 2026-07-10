import { describe, expect, it } from "vitest";
import {
  activityDropChance,
  processActiveActivityRuns,
  startActivityRun,
} from "../src/activities";
import { createInitialPlayerState } from "../src/save";
import { xpForLevel } from "../src/xp";

describe("gameplay Activities", () => {
  it("produces the same completion result for the same persisted run seed", () => {
    const player = createInitialPlayerState();
    player.rp = 10_000;
    player.skillXp.fishing = xpForLevel(40);
    const running = startActivityRun(player, "fishers-trawler", 1_000, 123_456);

    const first = processActiveActivityRuns(running, 10_000);
    const second = processActiveActivityRuns(running, 10_000);

    expect(first.activityResults[0]).toEqual(second.activityResults[0]);
    expect(first.activeActivityRuns).toHaveLength(0);
    expect(first.activityResults[0].id).toBe(`${running.activeActivityRuns[0].id}-result`);
  });

  it("activates Bad Luck Protection at twice the denominator", () => {
    const drop = { collectibleId: "pet-trawler-gull", chance: 500 };
    expect(activityDropChance(drop, 999).numerator).toBe(1);
    expect(activityDropChance(drop, 1_000)).toMatchObject({ numerator: 3, denominator: 500, isProtected: true });
  });
});
