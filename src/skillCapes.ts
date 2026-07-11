import { SKILL_CAPES, skills, type SkillCapeDefinition, type SkillCapeTier, type SkillId } from "./data";
import { levelFromXp } from "./xp";

const skillCapeIndex = new Map(SKILL_CAPES.map((cape) => [cape.id, cape]));

export function getSkillCape(id: string) {
  return skillCapeIndex.get(id);
}

export function getSkillCapesForSkill(skillId: SkillId) {
  return SKILL_CAPES.filter((cape) => cape.skillId === skillId);
}

export function isSkillCapeUnlocked(cape: SkillCapeDefinition, skillXp: Record<SkillId, number>) {
  return levelFromXp(skillXp[cape.skillId] ?? 0) >= cape.tier;
}

export function deriveUnlockedSkillCapes(skillXp: Record<SkillId, number>) {
  return SKILL_CAPES.filter((cape) => isSkillCapeUnlocked(cape, skillXp)).map((cape) => cape.id);
}

export function reconcileUnlockedSkillCapes(currentIds: string[], skillXp: Record<SkillId, number>) {
  return [...new Set([...currentIds, ...deriveUnlockedSkillCapes(skillXp)])]
    .filter((id) => skillCapeIndex.has(id));
}

export function skillCapeSummary(unlockedIds: string[]) {
  const unlocked = new Set(unlockedIds);
  const level99 = SKILL_CAPES.filter((cape) => cape.tier === 99 && unlocked.has(cape.id)).length;
  const level120 = SKILL_CAPES.filter((cape) => cape.tier === 120 && unlocked.has(cape.id)).length;
  return {
    level99,
    level120,
    total: level99 + level120,
    totalLevel99: skills.length,
    totalLevel120: skills.length,
    totalCapes: SKILL_CAPES.length,
  };
}

export function skillCapeTierLabel(tier: SkillCapeTier) {
  return tier === 99 ? "Level 99" : "Level 120";
}
