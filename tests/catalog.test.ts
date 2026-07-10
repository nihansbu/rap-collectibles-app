import { describe, expect, it } from "vitest";
import {
  canUnlock,
  collectibleActionLabel,
  collectibleSortIndex,
  collectibleStatus,
  collectibleStatusRank,
  getCollectibleById,
  getCollectiblesByCategory,
  getRequirementState,
  highestRequirement,
  isActivityDrop,
  requirementsMet,
  skillName,
  skillNameFontSize,
  sourceActivityFor,
} from "../src/catalog";
import { collectibles } from "../src/data";
import { createInitialPlayerState } from "../src/save";
import { xpTable } from "../src/xp";

describe("catalog rules", () => {
  it("indexes catalog entries and categories", () => {
    const item = collectibles[0];
    expect(getCollectibleById(item.id)).toBe(item);
    expect(getCollectiblesByCategory(item.category)).toContain(item);
    expect(collectibleSortIndex(item)).toBeGreaterThanOrEqual(0);
    expect(skillName("fishing")).toBe("Fishing");
  });

  it("keeps currency separate from progression status", () => {
    const player = createInitialPlayerState();
    const direct = collectibles.find((item) => !isActivityDrop(item) && item.requirements.length === 0)!;
    expect(collectibleStatus(direct, player)).toBe("ready");
    expect(canUnlock(direct, player)).toBe(false);
    expect(collectibleActionLabel(direct, player)).toBe("Not enough RAP");

    const funded = { ...player, rp: direct.cost };
    expect(canUnlock(direct, funded)).toBe(true);
    expect(collectibleActionLabel(direct, funded)).toBe("Buy");
    expect(collectibleStatusRank(direct, funded)).toBe(1);
  });

  it("evaluates skill requirements and ownership", () => {
    const item = collectibles.find((candidate) => candidate.requirements.some((requirement) => requirement.type === "skill"))!;
    const requirement = item.requirements.find((candidate) => candidate.type === "skill")!;
    const player = createInitialPlayerState();
    expect(requirementsMet(item, player)).toBe(false);
    expect(getRequirementState(requirement, player).met).toBe(false);
    expect(highestRequirement(item)).toBeGreaterThan(1);

    const trained = { ...player, skillXp: { ...player.skillXp, [requirement.skillId]: xpTable[requirement.level] } };
    expect(getRequirementState(requirement, trained).met).toBe(true);
  });

  it("keeps activity drops source-only", () => {
    const drop = collectibles.find(isActivityDrop)!;
    const player = { ...createInitialPlayerState(), rp: Number.MAX_SAFE_INTEGER };
    expect(sourceActivityFor(drop)).not.toBeNull();
    expect(canUnlock(drop, player)).toBe(false);
    expect(collectibleActionLabel(drop, player)).toBe("Adventure Drop");
    expect(collectibleStatus(drop, player)).toBe("locked");
  });

  it("uses readable skill label sizes", () => {
    expect(Number.parseFloat(skillNameFontSize("Necromancy"))).toBeGreaterThanOrEqual(9);
    expect(Number.parseFloat(skillNameFontSize("Attack"))).toBeGreaterThanOrEqual(10);
  });
});
