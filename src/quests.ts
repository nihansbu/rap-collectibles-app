import {
  COSMETICS,
  QUESTS,
  QUEST_CAMPAIGNS,
  QUEST_CHAPTERS,
  type QuestCampaignDefinition,
  type QuestChapterDefinition,
  type QuestDefinition,
  type QuestRequirement,
  type SkillId,
  type SpecializationId,
} from "./data";
import { levelFromXp, MAX_LEVEL, xpTable } from "./xp";

export type ActiveQuest = {
  id: string;
  questId: string;
  startedAt: number;
  lastProcessedAt: number;
  fundedMs: number;
  rapSpent: number;
};

export type QuestPlayerState = {
  rp: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
  specializationXp: Record<SpecializationId, number>;
  unlockedCosmetics: string[];
  activeQuests: ActiveQuest[];
  completedQuests: Record<string, number>;
  notifiedQuestIds: string[];
};

export type QuestStatus = "locked" | "ready" | "active" | "waiting" | "completed";

export const MAX_ACTIVE_QUESTS = 3;
export const QUEST_START_FUNDING_HOURS = 1;
export const HOUR_MS = 60 * 60 * 1000;
const TIME_EPSILON_MS = 0.001;

const questIndex = new Map(QUESTS.map((entry) => [entry.id, entry]));
const chapterIndex = new Map(QUEST_CHAPTERS.map((entry) => [entry.id, entry]));
const campaignIndex = new Map(QUEST_CAMPAIGNS.map((entry) => [entry.id, entry]));
const cosmeticIds = new Set(COSMETICS.map((entry) => entry.id));

export function getQuest(id: string) {
  return questIndex.get(id);
}

export function getQuestChapter(id: string) {
  return chapterIndex.get(id);
}

export function getQuestCampaign(id: string) {
  return campaignIndex.get(id);
}

export function questsForChapter(chapterId: string) {
  const chapter = getQuestChapter(chapterId);
  return chapter ? chapter.questIds.map(getQuest).filter((entry): entry is QuestDefinition => Boolean(entry)) : [];
}

export function chaptersForCampaign(campaignId: string) {
  const campaign = getQuestCampaign(campaignId);
  return campaign ? campaign.chapterIds.map(getQuestChapter).filter((entry): entry is QuestChapterDefinition => Boolean(entry)) : [];
}

export function questRapPerHour(quest: QuestDefinition) {
  return quest.totalRapCost / (quest.durationMs / HOUR_MS);
}

export function questStartRap(quest: QuestDefinition) {
  return questRapPerHour(quest) * QUEST_START_FUNDING_HOURS;
}

export function requiredRapToStartQuest(player: Pick<QuestPlayerState, "activeQuests">, quest: QuestDefinition) {
  return (activeQuestRapPerHour(player) + questRapPerHour(quest)) * QUEST_START_FUNDING_HOURS;
}

export function questPoints(player: Pick<QuestPlayerState, "completedQuests">) {
  let total = 0;
  for (const quest of QUESTS) {
    if (!isQuestCompleted(player, quest.id)) continue;
    total += quest.rewards
      .filter((reward) => reward.type === "quest-points")
      .reduce((sum, reward) => sum + reward.points, 0);
  }
  for (const chapter of QUEST_CHAPTERS) {
    if (isChapterCompleted(player, chapter.id)) total += chapter.bonusQuestPoints;
  }
  for (const campaign of QUEST_CAMPAIGNS) {
    if (isCampaignCompleted(player, campaign.id)) total += campaign.bonusQuestPoints;
  }
  return total;
}

export function isQuestCompleted(player: Pick<QuestPlayerState, "completedQuests">, questId: string) {
  return player.completedQuests[questId] !== undefined;
}

export function isChapterCompleted(player: Pick<QuestPlayerState, "completedQuests">, chapterId: string) {
  const chapter = getQuestChapter(chapterId);
  return Boolean(chapter && chapter.questIds.every((questId) => isQuestCompleted(player, questId)));
}

export function isCampaignCompleted(player: Pick<QuestPlayerState, "completedQuests">, campaignId: string) {
  const campaign = getQuestCampaign(campaignId);
  return Boolean(campaign && isQuestCompleted(player, campaign.finaleQuestId));
}

export function campaignCompletedChapterCount(player: Pick<QuestPlayerState, "completedQuests">, campaignId: string) {
  return chaptersForCampaign(campaignId).filter((chapter) => isChapterCompleted(player, chapter.id)).length;
}

export function campaignHasActiveQuest(player: Pick<QuestPlayerState, "activeQuests">, campaignId: string) {
  return player.activeQuests.some((active) => getQuest(active.questId)?.campaignId === campaignId);
}

export function chapterHasActiveQuest(player: Pick<QuestPlayerState, "activeQuests">, chapterId: string) {
  return player.activeQuests.some((active) => getQuest(active.questId)?.chapterId === chapterId);
}

export function questRequirementsMet(player: QuestPlayerState, quest: QuestDefinition) {
  return quest.requirements.every((requirement) => questRequirementMet(player, requirement));
}

export function questRequirementMet(player: QuestPlayerState, requirement: QuestRequirement) {
  switch (requirement.type) {
    case "skill": return levelFromXp(player.skillXp[requirement.skillId] ?? 0) >= requirement.level;
    case "specialization": return levelFromXp(player.specializationXp[requirement.specializationId] ?? 0) >= requirement.level;
    case "collectible": return player.owned.includes(requirement.collectibleId);
    case "quest": return isQuestCompleted(player, requirement.questId);
    case "chapter": return isChapterCompleted(player, requirement.chapterId);
    case "quest-points": return questPoints(player) >= requirement.points;
  }
}

export function questStatus(player: QuestPlayerState, quest: QuestDefinition): QuestStatus {
  if (isQuestCompleted(player, quest.id)) return "completed";
  if (player.activeQuests.some((active) => active.questId === quest.id)) return player.rp > TIME_EPSILON_MS ? "active" : "waiting";
  return questRequirementsMet(player, quest) ? "ready" : "locked";
}

export function canStartQuest(player: QuestPlayerState, quest: QuestDefinition) {
  return (
    !isQuestCompleted(player, quest.id) &&
    !player.activeQuests.some((active) => active.questId === quest.id) &&
    player.activeQuests.length < MAX_ACTIVE_QUESTS &&
    questRequirementsMet(player, quest) &&
    player.rp >= requiredRapToStartQuest(player, quest)
  );
}

export function startQuest<T extends QuestPlayerState>(player: T, questId: string, now = Date.now()): T {
  const current = processActiveQuests(player, now);
  const questDefinition = getQuest(questId);
  if (!questDefinition || !canStartQuest(current, questDefinition)) return current;
  return {
    ...current,
    activeQuests: [
      ...current.activeQuests,
      { id: `${questId}-${now}`, questId, startedAt: now, lastProcessedAt: now, fundedMs: 0, rapSpent: 0 },
    ],
  };
}

export function processActiveQuests<T extends QuestPlayerState>(player: T, now = Date.now()): T {
  if (player.activeQuests.length === 0) return player;

  let current = { ...player, activeQuests: player.activeQuests.map((entry) => ({ ...entry })) } as T;
  let rp = Math.max(0, current.rp);
  let activeQuests = current.activeQuests.filter((active) => {
    const definition = getQuest(active.questId);
    return Boolean(definition && !isQuestCompleted(current, active.questId) && active.fundedMs < definition.durationMs);
  });

  for (let guard = 0; guard < 2_000; guard += 1) {
    const eligible = activeQuests.filter((active) => active.lastProcessedAt < now - TIME_EPSILON_MS);
    if (eligible.length === 0) break;

    if (rp <= TIME_EPSILON_MS) {
      activeQuests = activeQuests.map((active) => active.lastProcessedAt < now ? { ...active, lastProcessedAt: now } : active);
      rp = 0;
      break;
    }

    const cursor = Math.min(...eligible.map((active) => active.lastProcessedAt));
    const cohort = eligible.filter((active) => Math.abs(active.lastProcessedAt - cursor) <= TIME_EPSILON_MS);
    const nextCursor = Math.min(
      ...eligible.filter((active) => active.lastProcessedAt > cursor + TIME_EPSILON_MS).map((active) => active.lastProcessedAt),
      Number.POSITIVE_INFINITY,
    );
    let elapsedMs = Math.min(now - cursor, nextCursor - cursor);
    let rapPerMs = 0;

    for (const active of cohort) {
      const definition = getQuest(active.questId)!;
      elapsedMs = Math.min(elapsedMs, definition.durationMs - active.fundedMs);
      rapPerMs += definition.totalRapCost / definition.durationMs;
    }

    elapsedMs = Math.min(elapsedMs, rp / rapPerMs);
    if (!Number.isFinite(elapsedMs) || elapsedMs <= TIME_EPSILON_MS) {
      activeQuests = activeQuests.map((active) => active.lastProcessedAt < now ? { ...active, lastProcessedAt: now } : active);
      break;
    }

    let spent = 0;
    const completed: Array<{ quest: QuestDefinition; completedAt: number }> = [];
    activeQuests = activeQuests.map((active) => {
      if (!cohort.some((entry) => entry.id === active.id)) return active;
      const definition = getQuest(active.questId)!;
      const questSpent = elapsedMs * (definition.totalRapCost / definition.durationMs);
      const fundedMs = Math.min(definition.durationMs, active.fundedMs + elapsedMs);
      spent += questSpent;
      if (fundedMs >= definition.durationMs - TIME_EPSILON_MS) completed.push({ quest: definition, completedAt: cursor + elapsedMs });
      return { ...active, fundedMs, rapSpent: Math.min(definition.totalRapCost, active.rapSpent + questSpent), lastProcessedAt: cursor + elapsedMs };
    });
    rp = Math.max(0, rp - spent);
    current = { ...current, rp, activeQuests };

    for (const entry of completed) {
      current = completeQuest(current, entry.quest, entry.completedAt);
      rp = current.rp;
      activeQuests = current.activeQuests;
    }

    if (rp <= TIME_EPSILON_MS) {
      activeQuests = activeQuests.map((active) => active.lastProcessedAt < now ? { ...active, lastProcessedAt: now } : active);
      rp = 0;
      break;
    }
  }

  return { ...current, rp, activeQuests };
}

export function remainingQuestMs(active: ActiveQuest, quest: QuestDefinition) {
  return Math.max(0, quest.durationMs - active.fundedMs);
}

export function questProgress(active: ActiveQuest, quest: QuestDefinition) {
  return Math.min(1, Math.max(0, active.fundedMs / quest.durationMs));
}

export function activeQuestRapPerHour(player: Pick<QuestPlayerState, "activeQuests">) {
  return player.activeQuests.reduce((total, active) => {
    const definition = getQuest(active.questId);
    return total + (definition ? questRapPerHour(definition) : 0);
  }, 0);
}

export function fundedQuestRunwayMs(player: Pick<QuestPlayerState, "activeQuests" | "rp">) {
  const rate = activeQuestRapPerHour(player);
  return rate > 0 ? (player.rp / rate) * HOUR_MS : 0;
}

function completeQuest<T extends QuestPlayerState>(player: T, quest: QuestDefinition, completedAt: number): T {
  if (isQuestCompleted(player, quest.id)) return player;
  let next: QuestPlayerState = {
    ...player,
    activeQuests: player.activeQuests.filter((active) => active.questId !== quest.id),
    completedQuests: { ...player.completedQuests, [quest.id]: completedAt },
  };

  for (const reward of quest.rewards) {
    switch (reward.type) {
      case "quest-points": break;
      case "rap": next = { ...next, rp: next.rp + reward.amount }; break;
      case "skill-xp": next = { ...next, skillXp: { ...next.skillXp, [reward.skillId]: Math.min(xpTable[MAX_LEVEL], (next.skillXp[reward.skillId] ?? 0) + reward.amount) } }; break;
      case "specialization-xp": next = { ...next, specializationXp: { ...next.specializationXp, [reward.specializationId]: Math.min(xpTable[MAX_LEVEL], (next.specializationXp[reward.specializationId] ?? 0) + reward.amount) } }; break;
      case "cosmetic": if (cosmeticIds.has(reward.cosmeticId)) next = { ...next, unlockedCosmetics: [...new Set([...next.unlockedCosmetics, reward.cosmeticId])] }; break;
      case "collectible": next = { ...next, owned: [...new Set([...next.owned, reward.collectibleId])] }; break;
    }
  }

  return next as T;
}

export function campaignProgress(player: Pick<QuestPlayerState, "completedQuests" | "activeQuests">, campaign: QuestCampaignDefinition) {
  const completed = campaignCompletedChapterCount(player as QuestPlayerState, campaign.id);
  return { completed, total: campaign.chapterIds.length };
}
