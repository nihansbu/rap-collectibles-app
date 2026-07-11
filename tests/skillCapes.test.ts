import { describe, expect, it } from "vitest";
import { SKILL_CAPES, skills, type SkillId } from "../src/data";
import {
  deriveUnlockedSkillCapes,
  getSkillCapesForSkill,
  isSkillCapeUnlocked,
  reconcileUnlockedSkillCapes,
  skillCapeSummary,
} from "../src/skillCapes";
import { xpForLevel } from "../src/xp";

describe("Skill Capes", () => {
  it("creates a Level 99 and Level 120 cape for every Skill", () => {
    expect(SKILL_CAPES).toHaveLength(skills.length * 2);
    for (const skill of skills) {
      expect(getSkillCapesForSkill(skill.id).map((cape) => cape.tier)).toEqual([99, 120]);
    }
  });

  it("unlocks milestone capes from the derived Skill level", () => {
    const skillXp = Object.fromEntries(skills.map((skill) => [skill.id, 0])) as Record<SkillId, number>;
    const firstSkill = skills[0];
    skillXp[firstSkill.id] = xpForLevel(99);

    const unlocked = deriveUnlockedSkillCapes(skillXp);
    expect(unlocked).toContain(`skill-cape-${firstSkill.id}-99`);
    expect(unlocked).not.toContain(`skill-cape-${firstSkill.id}-120`);
    expect(isSkillCapeUnlocked(getSkillCapesForSkill(firstSkill.id)[0], skillXp)).toBe(true);
    expect(isSkillCapeUnlocked(getSkillCapesForSkill(firstSkill.id)[1], skillXp)).toBe(false);
  });

  it("reconciles unlocks idempotently and summarizes both tiers", () => {
    const skillXp = Object.fromEntries(skills.map((skill) => [skill.id, xpForLevel(120)])) as Record<SkillId, number>;
    const firstPass = reconcileUnlockedSkillCapes([], skillXp);
    const secondPass = reconcileUnlockedSkillCapes(firstPass, skillXp);
    expect(firstPass).toHaveLength(SKILL_CAPES.length);
    expect(secondPass).toEqual(firstPass);
    expect(skillCapeSummary(firstPass)).toMatchObject({ total: 60, level99: 30, level120: 30 });
  });
});
