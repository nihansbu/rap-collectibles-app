import { GAMEPLAY_ACTIVITIES } from "./activities";
import { skills, type SkillId } from "./data";

export type SkillAcquisitionSource = {
  id: string;
  name: string;
  kind: "direct-training" | "adventure" | "minigame" | "boss";
  minimumLevel: number;
  xpShare: number;
  transitional?: boolean;
};

export type SkillAcquisitionRow = {
  skillId: SkillId;
  skillName: string;
  sources: SkillAcquisitionSource[];
  hasLevelOneGameplaySource: boolean;
};

export function buildSkillAcquisitionMatrix(): SkillAcquisitionRow[] {
  return skills.map((skill) => {
    const gameplaySources = GAMEPLAY_ACTIVITIES.flatMap((adventure) => {
      const reward = adventure.xpRewards.find((candidate) => candidate.skillId === skill.id);
      if (!reward) return [];
      const skillRequirement = adventure.requirements.find(
        (requirement) => requirement.type === "skill" && requirement.skillId === skill.id,
      );
      return [{
        id: adventure.id,
        name: adventure.name,
        kind: "adventure" as const,
        minimumLevel: skillRequirement?.type === "skill" ? skillRequirement.level : 1,
        xpShare: reward.share,
      }];
    });
    const sources: SkillAcquisitionSource[] = [
      { id: `direct-${skill.id}`, name: "Direct Training", kind: "direct-training", minimumLevel: 1, xpShare: 1, transitional: true },
      ...gameplaySources,
    ];
    return {
      skillId: skill.id,
      skillName: skill.name,
      sources,
      hasLevelOneGameplaySource: gameplaySources.some((source) => source.minimumLevel <= 1),
    };
  });
}

export function canRetireDirectTraining() {
  return buildSkillAcquisitionMatrix().every((row) => row.hasLevelOneGameplaySource);
}

