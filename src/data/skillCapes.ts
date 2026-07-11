import type { SkillCapeDefinition } from "./contentTypes";
import { skills } from "./skills";

export const SKILL_CAPES: SkillCapeDefinition[] = skills.flatMap((skill) => ([
  {
    id: `skill-cape-${skill.id}-99`,
    skillId: skill.id,
    tier: 99,
    name: `${skill.name} Skill Cape`,
    description: `A ceremonial cape earned by reaching Level 99 in ${skill.name}.`,
    icon: `assets/icons/skill-capes/skill-cape-${skill.id}-99.webp`,
  },
  {
    id: `skill-cape-${skill.id}-120`,
    skillId: skill.id,
    tier: 120,
    name: `${skill.name} Master Cape`,
    description: `A masterwork cape earned by reaching Level 120 in ${skill.name}.`,
    icon: `assets/icons/skill-capes/skill-cape-${skill.id}-120.webp`,
  },
]));
