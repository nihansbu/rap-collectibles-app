import type { SpecializationDefinition } from "./contentTypes";

export const SPECIALIZATIONS: SpecializationDefinition[] = [
  {
    id: "maritime-fishing",
    parentSkillId: "fishing",
    name: "Maritime Fishing",
    description: "Specialized fishing across open seas, trawlers, and dangerous offshore waters.",
    unlockLevel: 30,
    icon: "assets/icons/skills/fishing.webp",
  },
];
