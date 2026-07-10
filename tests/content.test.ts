import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GAMEPLAY_ACTIVITIES } from "../src/activities";
import { categories, collectibles, skills } from "../src/data";

describe("content catalog", () => {
  const skillIds = new Set<string>(skills.map((skill) => skill.id));
  const collectibleIds = new Set<string>(collectibles.map((item) => item.id));
  const activityIds = new Set<string>(GAMEPLAY_ACTIVITIES.map((activity) => activity.id));

  it("uses unique stable IDs", () => {
    expect(skillIds.size).toBe(skills.length);
    expect(collectibleIds.size).toBe(collectibles.length);
    expect(activityIds.size).toBe(GAMEPLAY_ACTIVITIES.length);
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

  it("keeps Activity rewards internally consistent", () => {
    for (const activity of GAMEPLAY_ACTIVITIES) {
      const share = activity.xpRewards.reduce((total, reward) => total + reward.share, 0);
      expect(share, `${activity.id} XP share`).toBeGreaterThan(0);
      expect(share, `${activity.id} XP share`).toBeLessThanOrEqual(0.75);
      for (const reward of activity.xpRewards) expect(skillIds.has(reward.skillId)).toBe(true);
      for (const drop of activity.drops) {
        expect(collectibleIds.has(drop.collectibleId), `${drop.collectibleId} must exist`).toBe(true);
        expect(drop.chance).toBeGreaterThanOrEqual(1);
        const item = collectibles.find((candidate) => candidate.id === drop.collectibleId);
        expect(item?.source).toMatchObject({ type: "activity", activityId: activity.id });
      }
    }
  });

  it("keeps category definitions aligned with the catalog", () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    for (const item of collectibles) expect(categoryIds.has(item.category)).toBe(true);
    expect(categoryIds.has("skills")).toBe(true);
  });
});
