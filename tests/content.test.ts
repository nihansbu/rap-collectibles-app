import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { GAMEPLAY_ACTIVITIES } from "../src/activities";
import {
  categories,
  collectibles,
  COLLECTION_SETS,
  CHASER_ITEMS,
  CONTENT_MASTERY_TRACKS,
  COSMETICS,
  ACHIEVEMENTS,
  SPECIALIZATIONS,
  QUESTS,
  QUEST_CHAPTERS,
  QUEST_CAMPAIGNS,
  SKILL_CAPES,
  skills,
} from "../src/data";
import { XP_SHARE_EPSILON } from "../src/data/balance/xp";

describe("content catalog", () => {
  const skillIds = new Set<string>(skills.map((skill) => skill.id));
  const collectibleIds = new Set<string>(collectibles.map((item) => item.id));
  const activityIds = new Set<string>(GAMEPLAY_ACTIVITIES.map((activity) => activity.id));
  const masteryIds = new Set(CONTENT_MASTERY_TRACKS.map((track) => track.id));
  const cosmeticIds = new Set(COSMETICS.map((cosmetic) => cosmetic.id));
  const chaserIds = new Set(CHASER_ITEMS.map((chaser) => chaser.id));
  const specializationIds = new Set(SPECIALIZATIONS.map((specialization) => specialization.id));
  const achievementIds = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
  const skillCapeIds = new Set(SKILL_CAPES.map((cape) => cape.id));

  it("uses unique stable IDs", () => {
    expect(skillIds.size).toBe(skills.length);
    expect(collectibleIds.size).toBe(collectibles.length);
    expect(activityIds.size).toBe(GAMEPLAY_ACTIVITIES.length);
    expect(masteryIds.size).toBe(CONTENT_MASTERY_TRACKS.length);
    expect(cosmeticIds.size).toBe(COSMETICS.length);
    expect(chaserIds.size).toBe(CHASER_ITEMS.length);
    expect(specializationIds.size).toBe(SPECIALIZATIONS.length);
    expect(achievementIds.size).toBe(ACHIEVEMENTS.length);
    expect(skillCapeIds.size).toBe(SKILL_CAPES.length);
    expect(SKILL_CAPES).toHaveLength(skills.length * 2);
  });

  it("resolves every icon and content reference", () => {
    for (const skill of skills) {
      expect(skill.icon, `${skill.id} needs an icon`).toBeTruthy();
      expect(existsSync(resolve("public", skill.icon ?? "")), `${skill.id} icon is missing`).toBe(true);
    }

    for (const cape of SKILL_CAPES) {
      expect(skillIds.has(cape.skillId), `${cape.id} references a missing Skill`).toBe(true);
      expect([99, 120]).toContain(cape.tier);
      expect(cape.icon, `${cape.id} needs an icon`).toBeTruthy();
      expect(existsSync(resolve("public", cape.icon)), `${cape.id} icon is missing`).toBe(true);
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
    const usedMasteryIds = new Set<string>();
    for (const activity of GAMEPLAY_ACTIVITIES) {
      const share = activity.xpRewards.reduce((total, reward) => total + reward.share, 0);
      expect(Math.abs(share - 1), `${activity.id} XP share must total 100%`).toBeLessThan(XP_SHARE_EPSILON);
      expect(masteryIds.has(activity.masteryTrackId), `${activity.id} Mastery track`).toBe(true);
      expect(usedMasteryIds.has(activity.masteryTrackId), `${activity.id} must have local Mastery`).toBe(false);
      usedMasteryIds.add(activity.masteryTrackId);
      for (const reward of activity.xpRewards) expect(skillIds.has(reward.skillId)).toBe(true);
      for (const reward of activity.specializationXpRewards) {
        expect(specializationIds.has(reward.specializationId)).toBe(true);
        expect(reward.share).toBeGreaterThan(0);
      }
      for (const drop of activity.drops) {
        expect(collectibleIds.has(drop.collectibleId), `${drop.collectibleId} must exist`).toBe(true);
        expect(drop.chance).toBeGreaterThanOrEqual(1);
        const item = collectibles.find((candidate) => candidate.id === drop.collectibleId);
        expect(item?.source).toMatchObject({ type: "activity", activityId: activity.id });
      }
    }
  });

  it("resolves Mastery, Chaser, Specialization, Set, and Cosmetic references", () => {
    for (const track of CONTENT_MASTERY_TRACKS) {
      expect(track.targetRap).toBeGreaterThan(0);
      for (const passive of track.passiveBonuses) {
        expect(passive.percentPerLevel).toBeGreaterThan(0);
        expect(passive.percentPerLevel * 10).toBeLessThanOrEqual(10);
      }
      for (const milestone of track.milestones) {
        expect(milestone.level).toBeGreaterThanOrEqual(1);
        expect(milestone.level).toBeLessThanOrEqual(50);
        if (milestone.reward.type === "cosmetic") expect(cosmeticIds.has(milestone.reward.cosmeticId)).toBe(true);
        if (milestone.reward.type === "collectible") expect(collectibleIds.has(milestone.reward.collectibleId)).toBe(true);
        if (milestone.reward.type === "account-bonus") expect(milestone.reward.bonus.percent).toBeGreaterThan(0);
      }
    }
    for (const chaser of CHASER_ITEMS) {
      expect(collectibleIds.has(chaser.collectibleId)).toBe(true);
      expect(chaser.denominator).toBeGreaterThan(1);
      for (const activityId of chaser.eligibleActivityIds) expect(activityIds.has(activityId)).toBe(true);
    }
    for (const specialization of SPECIALIZATIONS) {
      expect(skillIds.has(specialization.parentSkillId)).toBe(true);
      expect(specialization.unlockLevel).toBeGreaterThanOrEqual(1);
      expect(specialization.unlockLevel).toBeLessThanOrEqual(120);
      expect(existsSync(resolve("public", specialization.icon)), `${specialization.id} icon is missing`).toBe(true);
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
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.points).toBeGreaterThan(0);
      if (achievement.condition.type === "set-complete" && achievement.condition.setId) {
        const setId = achievement.condition.setId;
        expect(COLLECTION_SETS.some((set) => set.id === setId)).toBe(true);
      }
      if (achievement.condition.type === "mastery-level") expect(masteryIds.has(achievement.condition.trackId)).toBe(true);
      if (achievement.condition.type === "activity-runs" && achievement.condition.activityId) expect(activityIds.has(achievement.condition.activityId)).toBe(true);
      for (const reward of achievement.rewards ?? []) {
        if (reward.type === "cosmetic") expect(cosmeticIds.has(reward.cosmeticId)).toBe(true);
        if (reward.type === "collectible") expect(collectibleIds.has(reward.collectibleId)).toBe(true);
      }
    }
  });

  it("provides three broad specialization milestones for every Skill", () => {
    expect(SPECIALIZATIONS).toHaveLength(skills.length * 3);
    for (const skill of skills) {
      const skillSpecializations = SPECIALIZATIONS.filter((specialization) => specialization.parentSkillId === skill.id);
      expect(skillSpecializations, `${skill.name} specialization count`).toHaveLength(3);
      expect(skillSpecializations.map((specialization) => specialization.unlockLevel)).toEqual([30, 60, 90]);
      for (const specialization of skillSpecializations) {
        expect(specialization.name.trim().length).toBeGreaterThan(2);
        expect(specialization.description.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it("keeps category definitions aligned with the catalog", () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    for (const item of collectibles) expect(categoryIds.has(item.category)).toBe(true);
    expect(categoryIds.has("skills")).toBe(true);
  });

  it("keeps the Quest campaign graph valid and acyclic", () => {
    const questIds = new Set(QUESTS.map((quest) => quest.id));
    const chapterIds = new Set(QUEST_CHAPTERS.map((chapter) => chapter.id));
    const campaignIds = new Set(QUEST_CAMPAIGNS.map((campaign) => campaign.id));
    expect(questIds.size).toBe(QUESTS.length);
    expect(chapterIds.size).toBe(QUEST_CHAPTERS.length);
    expect(campaignIds.size).toBe(QUEST_CAMPAIGNS.length);

    for (const campaign of QUEST_CAMPAIGNS) {
      expect(campaign.chapterIds.length).toBeGreaterThanOrEqual(2);
      expect(campaign.chapterIds.length).toBeLessThanOrEqual(7);
      expect(questIds.has(campaign.finaleQuestId)).toBe(true);
      const campaignFinales = QUESTS.filter((quest) => quest.campaignId === campaign.id && quest.campaignFinale);
      expect(campaignFinales).toHaveLength(1);
      expect(campaignFinales[0]).toMatchObject({ id: campaign.finaleQuestId, chapterId: null });
      for (const chapterId of campaign.chapterIds) expect(chapterIds.has(chapterId)).toBe(true);
    }
    for (const chapter of QUEST_CHAPTERS) {
      expect(campaignIds.has(chapter.campaignId)).toBe(true);
      expect(chapter.questIds.length).toBeGreaterThanOrEqual(9);
      expect(chapter.questIds.length).toBeLessThanOrEqual(25);
      for (const questId of chapter.questIds) expect(questIds.has(questId)).toBe(true);
    }
    for (const quest of QUESTS) {
      expect(campaignIds.has(quest.campaignId)).toBe(true);
      if (quest.chapterId) expect(chapterIds.has(quest.chapterId)).toBe(true);
      if (quest.campaignFinale) expect(quest.chapterId).toBeNull();
      expect(quest.totalRapCost).toBeGreaterThan(0);
      expect(quest.durationMs).toBeGreaterThan(0);
      expect(quest.lane).toBeGreaterThanOrEqual(0);
      expect(quest.lane).toBeLessThanOrEqual(2);
      for (const requirement of quest.requirements) {
        if (requirement.type === "quest") expect(questIds.has(requirement.questId)).toBe(true);
        if (requirement.type === "chapter") expect(chapterIds.has(requirement.chapterId)).toBe(true);
        if (requirement.type === "collectible") expect(collectibleIds.has(requirement.collectibleId)).toBe(true);
        if (requirement.type === "skill") expect(skillIds.has(requirement.skillId)).toBe(true);
        if (requirement.type === "specialization") expect(specializationIds.has(requirement.specializationId)).toBe(true);
      }
      for (const reward of quest.rewards) {
        if (reward.type === "collectible") expect(collectibleIds.has(reward.collectibleId)).toBe(true);
        if (reward.type === "cosmetic") expect(cosmeticIds.has(reward.cosmeticId)).toBe(true);
        if (reward.type === "skill-xp") expect(skillIds.has(reward.skillId)).toBe(true);
        if (reward.type === "specialization-xp") expect(specializationIds.has(reward.specializationId)).toBe(true);
      }
    }

    const dependencies = new Map(QUESTS.map((quest) => [quest.id, quest.requirements.filter((requirement) => requirement.type === "quest").map((requirement) => requirement.questId)]));
    const visiting = new Set<string>();
    const visited = new Set<string>();
    function visit(id: string) {
      expect(visiting.has(id), `Quest cycle at ${id}`).toBe(false);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dependency of dependencies.get(id) ?? []) visit(dependency);
      visiting.delete(id);
      visited.add(id);
    }
    for (const id of questIds) visit(id);
  });
});
