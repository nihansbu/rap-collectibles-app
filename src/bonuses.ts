import { collectibles, skills, type AccountBonus, type SkillId } from "./data";

export type OwnedAccountBonus = AccountBonus & {
  collectibleId: string;
  collectibleName: string;
};

const bonusIndex = new Map(
  collectibles
    .filter((item) => item.bonuses && item.bonuses.length > 0)
    .map((item) => [item.id, item] as const),
);

export function collectAccountBonuses(ownedIds: string[]): OwnedAccountBonus[] {
  return ownedIds.flatMap((id) => {
    const item = bonusIndex.get(id);
    if (!item?.bonuses) return [];
    return item.bonuses.map((bonus) => ({
      ...bonus,
      collectibleId: item.id,
      collectibleName: item.name,
    }));
  });
}

export function skillXpBonusPercent(ownedIds: string[], skillId: SkillId) {
  return collectAccountBonuses(ownedIds).reduce((total, bonus) => {
    if (bonus.type === "all-skill-xp") return total + bonus.percent;
    if (bonus.type === "skill-xp" && bonus.skillId === skillId) return total + bonus.percent;
    return total;
  }, 0);
}

export function additionalRollChancePercent(ownedIds: string[]) {
  return collectAccountBonuses(ownedIds).reduce((total, bonus) => {
    if (bonus.type !== "additional-roll-chance") return total;
    return total + bonus.percent;
  }, 0);
}

export function formatBonusLabel(bonus: AccountBonus) {
  if (bonus.type === "all-skill-xp") return `+${formatPercent(bonus.percent)} XP in all Skills`;
  if (bonus.type === "additional-roll-chance") return `+${formatPercent(bonus.percent)} Additional Roll chance`;

  const skill = skills.find((candidate) => candidate.id === bonus.skillId);
  return `+${formatPercent(bonus.percent)} ${skill?.name ?? bonus.skillId} XP`;
}

function formatPercent(percent: number) {
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
}
