import { SPECIALIZATIONS, type SkillId, type SpecializationId } from "./data";
import { levelFromXp } from "./xp";

const specializationIndex = new Map(SPECIALIZATIONS.map((specialization) => [specialization.id, specialization]));

export function getSpecialization(id: string) {
  return specializationIndex.get(id as SpecializationId);
}

export function specializationsForSkill(skillId: SkillId) {
  return SPECIALIZATIONS.filter((specialization) => specialization.parentSkillId === skillId);
}

export function specializationUnlocked(
  specializationId: SpecializationId,
  skillXp: Record<SkillId, number>,
) {
  const specialization = getSpecialization(specializationId);
  return !!specialization && levelFromXp(skillXp[specialization.parentSkillId] ?? 0) >= specialization.unlockLevel;
}

export function createEmptySpecializationXp() {
  return Object.fromEntries(SPECIALIZATIONS.map((specialization) => [specialization.id, 0])) as Record<SpecializationId, number>;
}
