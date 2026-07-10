import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GAMEPLAY_ACTIVITIES } from "../src/activities";
import {
  categories,
  collectibles,
  COLLECTION_SETS,
  CONTENT_FAMILIES,
  CONTENT_MASTERY_TRACKS,
  COSMETICS,
  SHARED_DROP_POOLS,
  skills,
} from "../src/data";
import { XP_SHARE_EPSILON } from "../src/data/balance/xp";

describe("content catalog", () => {
  const skillIds = new Set<string>(skills.map((skill) => skill.id));
  const collectibleIds = new Set<string>(collectibles.map((item) => item.id));
  const activityIds = new Set<string>(GAMEPLAY_ACTIVITIES.map((activity) => activity.id));
  const masteryIds = new Set(CONTENT_MASTERY_TRACKS.map((track) => track.id));
  const cosmeticIds = new Set(COSMETICS.map((cosmetic) => cosmetic.id));
  const dropPoolIds = new Set(SHARED_DROP_POOLS.map((pool) => pool.id));
  const familyIds = new Set(CONTENT_FAMILIES.map((family) => family.id));

  it("uses unique stable IDs", () => {
    expect(skillIds.size).toBe(skills.length);
    expect(collectibleIds.size).toBe(collectibles.length);
    expect(activityIds.size).toBe(GAMEPLAY_ACTIVITIES.length);
    expect(masteryIds.size).toBe(CONTENT_MASTERY_TRACKS.length);
    expect(cosmeticIds.size).toBe(COSMETICS.length);
    expect(dropPoolIds.size).toBe(SHARED_DROP_POOLS.length);
    expect(familyIds.size).toBe(CONTENT_FAMILIES.length);
  });

  it("resolves every icon and content reference", () => {
    for (const skill of skills) {
      expect(skill.icon, `${skill.id} needs an icon`).toBeTruthy();
      expect(existsSync(resolve("public", skill.icon ?? "")), `${skill.id} icon is missing`).toBe(true);
    }

    for (const item of collectibles) {
      expect(item.icon, `${item.id} needs an icon`).toBeTruthy();
      expect(existsSync(resolve("public", item.icon ?? "")), `${item.id} icon is missing`).toBe(true);
      for (const requirement of item.requirements) {
        if (requirement.type === "skill") expect(skillIds.has(requirement.skillId)).toBe(true);
        else expect(collectibleIds.has(requirement.collectibleId)).toBe(true);
      }
      if (item.source?.type === "activity") expect(activityIds.has(item.source.activityId)).toBe(true);
      for (const bonus of item.bonuses ?? []) {
        expect(bonus.percent).toBeGreaterThan(0);
        if (bonus.type === "skill-xp") expect(skillIds.has(bonus.skillId)).toBe(true);
      }
    }
  });

  it("keeps Adventure rewards internally consistent", () => {
    for (const activity of GAMEPLAY_ACTIVITIES) {
      const share = activity.xpRewards.reduce((total, reward) => total + reward.share, 0);
      expect(Math.abs(share - 1), `${activity.id} XP share must total 100%`).toBeLessThan(XP_SHARE_EPSILON);
      expect(masteryIds.has(activity.masteryTrackId), `${activity.id} Mastery track`).toBe(true);
      expect(familyIds.has(activity.familyId), `${activity.id} family`).toBe(true);
      for (const poolId of activity.sharedDropPoolIds) expect(dropPoolIds.has(poolId), `${activity.id} shared pool`).toBe(true);
      for (const reward of activity.xpRewards) expect(skillIds.has(reward.skillId)).toBe(true);
      for (const drop of activity.drops) {
        expect(collectibleIds.has(drop.collectibleId), `${drop.collectibleId} must exist`).toBe(true);
        expect(drop.chance).toBeGreaterThanOrEqual(1);
        const item = collectibles.find((candidate) => candidate.id === drop.collectibleId);
        expect(item?.source).toMatchObject({ type: "activity", activityId: activity.id });
      }
    }
  });

  it("resolves Mastery, shared pool, Set, and Cosmetic references", () => {
    for (const track of CONTENT_MASTERY_TRACKS) {
      expect(track.targetRap).toBeGreaterThan(0);
      for (const passive of track.passiveBonuses) {
        expect(passive.percentPerLevel).toBeGreaterThan(0);
        expect(passive.percentPerLevel * 10).toBeLessThanOrEqual(10);
      }
      for (const milestone of track.milestones) {
        expect(milestone.level).toBeGreaterThanOrEqual(1);
        expect(milestone.level).toBeLessThanOrEqual(10);
        if (milestone.reward.type === "cosmetic") expect(cosmeticIds.has(milestone.reward.cosmeticId)).toBe(true);
        if (milestone.reward.type === "collectible") expect(collectibleIds.has(milestone.reward.collectibleId)).toBe(true);
        if (milestone.reward.type === "account-bonus") expect(milestone.reward.bonus.percent).toBeGreaterThan(0);
      }
    }
    for (const family of CONTENT_FAMILIES) {
      expect(masteryIds.has(family.masteryTrackId)).toBe(true);
      for (const contentId of family.contentIds) expect(activityIds.has(contentId)).toBe(true);
    }
    for (const pool of SHARED_DROP_POOLS) {
      for (const entry of pool.entries) {
        expect(collectibleIds.has(entry.collectibleId)).toBe(true);
        expect(entry.denominator).toBeGreaterThan(1);
      }
    }
    for (const set of COLLECTION_SETS) {
      expect(new Set(set.collectibleIds).size).toBe(set.collectibleIds.length);
      for (const id of set.collectibleIds) expect(collectibleIds.has(id)).toBe(true);
      for (const reward of set.rewards) {
        expect(reward.requiredCount).toBeLessThanOrEqual(set.collectibleIds.length);
        if (reward.reward.type === "cosmetic") expect(cosmeticIds.has(reward.reward.cosmeticId)).toBe(true);
        if (reward.reward.type === "account-bonus") expect(reward.reward.bonus.percent).toBeGreaterThan(0);
      }
    }
  });

  it("keeps category definitions aligned with the catalog", () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    for (const item of collectibles) expect(categoryIds.has(item.category)).toBe(true);
    expect(categoryIds.has("skills")).toBe(true);
  });
});
