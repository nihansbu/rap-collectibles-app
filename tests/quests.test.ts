import { describe, expect, it } from "vitest";
import { createInitialPlayerState } from "../src/save";
import { QUESTS, QUEST_CHAPTERS } from "../src/data";
import { HOUR_MS, MAX_ACTIVE_QUESTS, processActiveQuests, questPoints, startQuest } from "../src/quests";
import { xpForLevel } from "../src/xp";

describe("quest progression", () => {
  it("requires one funded hour and never starts the same quest twice", () => {
    const player = createInitialPlayerState();
    player.rp = 999;
    const blocked = startQuest(player, "oath-notice-board", 1_000);
    expect(blocked.activeQuests).toEqual([]);

    player.rp = 1_000;
    const started = startQuest(player, "oath-notice-board", 1_000);
    expect(started.activeQuests).toHaveLength(1);
    expect(startQuest(started, "oath-notice-board", 1_000).activeQuests).toHaveLength(1);
  });

  it("caps concurrent Quest progress at three active Quests", () => {
    const player = createInitialPlayerState();
    player.rp = 100_000;
    player.activeQuests = ["oath-venom-study", "oath-broken-fang", "oath-bitter-antidote"].map((questId, index) => ({
      id: `${questId}-${index}`,
      questId,
      startedAt: 1_000,
      lastProcessedAt: 1_000,
      fundedMs: 0,
      rapSpent: 0,
    }));

    const unchanged = startQuest(player, "oath-notice-board", 1_000);
    expect(unchanged.activeQuests).toHaveLength(MAX_ACTIVE_QUESTS);
    expect(unchanged.activeQuests.some((quest) => quest.questId === "oath-notice-board")).toBe(false);
  });

  it("funds parallel quests fairly at the combined hourly rate", () => {
    const player = branchReadyPlayer();
    player.rp = 10_000;
    const first = startQuest(player, "oath-venom-study", 1_000);
    const both = startQuest(first, "oath-broken-fang", 1_000);
    const processed = processActiveQuests(both, 1_000 + 2 * HOUR_MS);

    expect(processed.rp).toBeCloseTo(6_000);
    expect(processed.activeQuests).toHaveLength(2);
    expect(processed.activeQuests.every((quest) => quest.fundedMs === 2 * HOUR_MS)).toBe(true);
  });

  it("pauses all quests when RAP runs out and does not backcharge paused time", () => {
    const player = branchReadyPlayer();
    player.rp = 2_000;
    const both = startQuest(startQuest(player, "oath-venom-study", 1_000), "oath-broken-fang", 1_000);
    const exhausted = processActiveQuests(both, 1_000 + 4 * HOUR_MS);
    expect(exhausted.rp).toBe(0);
    expect(exhausted.activeQuests.every((quest) => quest.fundedMs === HOUR_MS)).toBe(true);
    expect(exhausted.activeQuests.every((quest) => quest.lastProcessedAt === 1_000 + 4 * HOUR_MS)).toBe(true);

    const caughtUpWhileEmpty = processActiveQuests(exhausted, 1_000 + 10 * HOUR_MS);
    const refilled = { ...caughtUpWhileEmpty, rp: 2_000 };
    const resumed = processActiveQuests(refilled, 1_000 + 11 * HOUR_MS);
    expect(resumed.activeQuests.every((quest) => quest.fundedMs === 2 * HOUR_MS)).toBe(true);
  });

  it("completes and rewards a quest exactly once", () => {
    const player = createInitialPlayerState();
    player.rp = 2_000;
    player.activeQuests = [{
      id: "oath-notice-board-1000",
      questId: "oath-notice-board",
      startedAt: 1_000,
      lastProcessedAt: 1_000,
      fundedMs: 3 * HOUR_MS,
      rapSpent: 3_000,
    }];
    const completed = processActiveQuests(player, 1_000 + HOUR_MS);
    expect(completed.activeQuests).toEqual([]);
    expect(completed.completedQuests).toHaveProperty("oath-notice-board");
    expect(questPoints(completed)).toBe(1);
    expect(completed.skillXp.slayer).toBe(500);

    const repeated = processActiveQuests(completed, 1_000 + 10 * HOUR_MS);
    expect(repeated.skillXp.slayer).toBe(500);
    expect(questPoints(repeated)).toBe(1);
  });

  it("adds Chapter Quest Points only after every Quest in the Chapter is complete", () => {
    const player = createInitialPlayerState();
    const chapter = QUEST_CHAPTERS.find((entry) => entry.id === "oath-first-blood")!;
    const chapterQuests = QUESTS.filter((quest) => chapter.questIds.includes(quest.id));
    const questRewardPoints = chapterQuests.flatMap((quest) => quest.rewards)
      .reduce((total, reward) => total + (reward.type === "quest-points" ? reward.points : 0), 0);

    for (const questId of chapter.questIds.slice(0, -1)) player.completedQuests[questId] = 100;
    expect(questPoints(player)).toBeLessThan(questRewardPoints + chapter.bonusQuestPoints);

    player.completedQuests[chapter.questIds.at(-1)!] = 200;
    expect(questPoints(player)).toBe(questRewardPoints + chapter.bonusQuestPoints);
  });
});

function branchReadyPlayer() {
  const player = createInitialPlayerState();
  player.completedQuests = { "oath-notice-board": 100, "oath-tracks-in-ash": 200 };
  player.skillXp.herblore = xpForLevel(8);
  player.skillXp.attack = xpForLevel(8);
  return player;
}
