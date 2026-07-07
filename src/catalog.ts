import { getActivity } from "./activities";
import { collectibles, skills, type CategoryId, type Collectible, type Requirement, type SkillId } from "./data";
import type { PlayerState } from "./save";
import { levelFromXp } from "./xp";

export type CollectibleStatus = "owned" | "ready" | "locked";

const collectibleIndex = new Map(collectibles.map((item, index) => [item.id, index]));

export const rarityClass: Record<Collectible["rarity"], string> = {
  Common: "rarity-common",
  Uncommon: "rarity-uncommon",
  Rare: "rarity-rare",
  Epic: "rarity-epic",
  Legendary: "rarity-legendary",
};

export const statusLabel: Record<CollectibleStatus, string> = {
  owned: "Owned",
  ready: "Ready",
  locked: "Locked",
};

export function skillName(skillId: SkillId) {
  return skills.find((skill) => skill.id === skillId)?.name ?? skillId;
}

export function highestRequirement(item: Collectible) {
  return item.requirements.reduce((highest, requirement) => {
    if (requirement.type !== "skill") return highest;
    return Math.max(highest, requirement.level);
  }, 0);
}

export function getCollectibleById(id: string) {
  return collectibles.find((item) => item.id === id);
}

export function getCollectiblesByCategory(category: Collectible["category"]) {
  return collectibles.filter((item) => item.category === category);
}

export function collectibleSortIndex(item: Collectible) {
  return collectibleIndex.get(item.id) ?? Number.MAX_SAFE_INTEGER;
}

export function getRequirementState(requirement: Requirement, player: PlayerState) {
  if (requirement.type === "collectible") {
    return {
      label: requirement.label,
      met: player.owned.includes(requirement.collectibleId),
      current: player.owned.includes(requirement.collectibleId) ? "Owned" : "Missing",
    };
  }

  const currentLevel = levelFromXp(player.skillXp[requirement.skillId]);
  return {
    label: `${skillName(requirement.skillId)} ${requirement.level}`,
    met: currentLevel >= requirement.level,
    current: `Level ${currentLevel}`,
  };
}

export function requirementsMet(item: Collectible, player: PlayerState) {
  return item.requirements.every((requirement) => getRequirementState(requirement, player).met);
}

export function isActivityDrop(item: Collectible) {
  return item.source?.type === "activity";
}

export function sourceActivityFor(item: Collectible) {
  return item.source?.type === "activity" ? getActivity(item.source.activityId) : null;
}

export function canUnlock(item: Collectible, player: PlayerState) {
  if (isActivityDrop(item)) return false;
  return player.rp >= item.cost && requirementsMet(item, player);
}

export function collectibleActionLabel(item: Collectible, player: PlayerState) {
  if (player.owned.includes(item.id)) return "Unlocked";
  if (isActivityDrop(item)) return "Activity Drop";
  if (!requirementsMet(item, player)) return "Requirements not met";
  if (player.rp < item.cost) return "Not enough RAP";
  return "Buy";
}

export function collectibleStatus(item: Collectible, player: PlayerState): CollectibleStatus {
  if (player.owned.includes(item.id)) return "owned";
  if (isActivityDrop(item)) return "locked";
  if (requirementsMet(item, player)) return "ready";
  return "locked";
}

export function collectibleStatusRank(item: Collectible, player: PlayerState) {
  const status = collectibleStatus(item, player);
  if (status === "owned") return 0;
  if (status === "ready") return 1;
  return 2;
}

export function skillNameFontSize(name: string) {
  if (name.length >= 12) return "7.2px";
  if (name.length >= 11) return "7.7px";
  if (name.length >= 10) return "8.4px";
  return "10px";
}

export function categoryForSkill(skillId: SkillId): CategoryId {
  void skillId;
  return "skills";
}
