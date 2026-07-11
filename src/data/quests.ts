import type { QuestCampaignDefinition, QuestChapterDefinition, QuestDefinition, QuestRequirement, QuestReward } from "./questTypes";

const HOUR_MS = 60 * 60 * 1000;
const skillIcon = (skillId: string) => `assets/icons/skills/${skillId}.webp`;

function quest(
  id: string,
  chapterId: string | null,
  name: string,
  summary: string,
  skillIconId: string,
  hours: number,
  rapPerHour: number,
  requirements: QuestRequirement[],
  rewards: QuestReward[],
  row: number,
  lane: 0 | 1 | 2,
  campaignFinale = false,
): QuestDefinition {
  return {
    id,
    campaignId: "slayers-oath",
    chapterId,
    name,
    summary,
    startStory: `${summary} The contract is sealed when the expedition begins.`,
    completionStory: `The record of ${name} is added to the Slayer's Oath.`,
    icon: skillIcon(skillIconId),
    totalRapCost: hours * rapPerHour,
    durationMs: hours * HOUR_MS,
    requirements,
    rewards,
    row,
    lane,
    campaignFinale,
  };
}

const firstBloodQuests: QuestDefinition[] = [
  quest("oath-notice-board", "oath-first-blood", "The Notice Board", "A weathered contract marks the first trail beyond the city walls.", "slayer", 4, 1_000, [{ type: "skill", skillId: "slayer", level: 1 }], [{ type: "quest-points", points: 1 }, { type: "skill-xp", skillId: "slayer", amount: 500 }], 0, 1),
  quest("oath-tracks-in-ash", "oath-first-blood", "Tracks in Ash", "Follow scorched tracks before the night wind erases them.", "hunter", 8, 1_000, [{ type: "quest", questId: "oath-notice-board" }, { type: "skill", skillId: "hunter", level: 5 }], [{ type: "quest-points", points: 1 }, { type: "skill-xp", skillId: "hunter", amount: 750 }], 1, 1),
  quest("oath-venom-study", "oath-first-blood", "Venom Study", "An apothecary can identify what poisoned the missing scouts.", "herblore", 12, 1_000, [{ type: "quest", questId: "oath-tracks-in-ash" }, { type: "skill", skillId: "herblore", level: 8 }], [{ type: "quest-points", points: 2 }, { type: "skill-xp", skillId: "herblore", amount: 1_000 }], 2, 0),
  quest("oath-broken-fang", "oath-first-blood", "Broken Fang", "A shattered trophy points toward a larger predator.", "attack", 12, 1_000, [{ type: "quest", questId: "oath-tracks-in-ash" }, { type: "skill", skillId: "attack", level: 8 }], [{ type: "quest-points", points: 2 }, { type: "skill-xp", skillId: "attack", amount: 1_000 }], 2, 2),
  quest("oath-bitter-antidote", "oath-first-blood", "The Bitter Antidote", "Prepare enough antidote for the hunters entering the burrow.", "herblore", 18, 1_200, [{ type: "quest", questId: "oath-venom-study" }], [{ type: "quest-points", points: 2 }, { type: "skill-xp", skillId: "herblore", amount: 1_500 }], 3, 0),
  quest("oath-wardens-blade", "oath-first-blood", "The Warden's Blade", "Earn the confidence of a veteran before the descent.", "defence", 18, 1_200, [{ type: "quest", questId: "oath-broken-fang" }, { type: "collectible", collectibleId: "class-iron-vanguard", label: "Iron Vanguard" }], [{ type: "quest-points", points: 2 }, { type: "skill-xp", skillId: "defence", amount: 1_500 }], 3, 2),
  quest("oath-sealed-burrow", "oath-first-blood", "The Sealed Burrow", "Two paths converge at a door buried beneath old contract stones.", "dungeoneering", 30, 1_500, [{ type: "quest", questId: "oath-bitter-antidote" }, { type: "quest", questId: "oath-wardens-blade" }], [{ type: "quest-points", points: 3 }, { type: "skill-xp", skillId: "dungeoneering", amount: 2_500 }], 4, 1),
  quest("oath-below-first", "oath-first-blood", "Below the First Door", "The first chamber tests whether the contract hunters can hold formation.", "slayer", 42, 1_500, [{ type: "quest", questId: "oath-sealed-burrow" }, { type: "skill", skillId: "slayer", level: 20 }], [{ type: "quest-points", points: 3 }, { type: "skill-xp", skillId: "slayer", amount: 3_500 }], 5, 1),
  quest("oath-burrow-below", "oath-first-blood", "The Burrow Below", "Something beneath the old contracts has begun to wake.", "slayer", 60, 1_800, [{ type: "quest", questId: "oath-below-first" }, { type: "skill", skillId: "slayer", level: 30 }], [{ type: "quest-points", points: 5 }, { type: "skill-xp", skillId: "slayer", amount: 6_000 }], 6, 1),
];

const shadowQuests: QuestDefinition[] = [
  quest("oath-shadow-contract", "oath-contracts-shadow", "A Contract in Shadow", "A second ledger names creatures that leave no ordinary tracks.", "slayer", 24, 2_000, [{ type: "chapter", chapterId: "oath-first-blood" }, { type: "skill", skillId: "slayer", level: 30 }], [{ type: "quest-points", points: 2 }, { type: "skill-xp", skillId: "slayer", amount: 4_000 }], 0, 1),
  quest("oath-whisper-market", "oath-contracts-shadow", "The Whisper Market", "Find the broker selling names taken from forbidden contracts.", "thieving", 30, 2_000, [{ type: "quest", questId: "oath-shadow-contract" }, { type: "skill", skillId: "thieving", level: 20 }], [{ type: "quest-points", points: 2 }, { type: "skill-xp", skillId: "thieving", amount: 4_500 }], 1, 1),
  quest("oath-moonless-trail", "oath-contracts-shadow", "The Moonless Trail", "Track a quarry that moves only between pools of darkness.", "hunter", 36, 2_000, [{ type: "quest", questId: "oath-whisper-market" }, { type: "specialization", specializationId: "slayer-monster-lore", level: 1 }], [{ type: "quest-points", points: 3 }, { type: "specialization-xp", specializationId: "slayer-monster-lore", amount: 2_000 }], 2, 0),
  quest("oath-iron-prayer", "oath-contracts-shadow", "An Iron Prayer", "Consecrate the hunters before they cross the blighted boundary.", "prayer", 36, 2_000, [{ type: "quest", questId: "oath-whisper-market" }, { type: "skill", skillId: "prayer", level: 25 }], [{ type: "quest-points", points: 3 }, { type: "skill-xp", skillId: "prayer", amount: 5_000 }], 2, 2),
  quest("oath-name-eater", "oath-contracts-shadow", "The Name-Eater", "Recover the names erased from the contract ledger.", "necromancy", 48, 2_200, [{ type: "quest", questId: "oath-moonless-trail" }], [{ type: "quest-points", points: 3 }, { type: "skill-xp", skillId: "necromancy", amount: 6_000 }], 3, 0),
  quest("oath-black-bell", "oath-contracts-shadow", "The Black Bell", "Silence the bell that calls beasts from the old forest.", "magic", 48, 2_200, [{ type: "quest", questId: "oath-iron-prayer" }], [{ type: "quest-points", points: 3 }, { type: "skill-xp", skillId: "magic", amount: 6_000 }], 3, 2),
  quest("oath-hollow-court", "oath-contracts-shadow", "The Hollow Court", "Enter the ruined court where both trails were first commissioned.", "slayer", 60, 2_500, [{ type: "quest", questId: "oath-name-eater" }, { type: "quest", questId: "oath-black-bell" }], [{ type: "quest-points", points: 4 }, { type: "skill-xp", skillId: "slayer", amount: 8_000 }], 4, 1),
  quest("oath-contract-blood", "oath-contracts-shadow", "The Contract in Blood", "Rewrite the corrupted contract before its final clause is invoked.", "rune-crafting", 72, 2_500, [{ type: "quest", questId: "oath-hollow-court" }, { type: "quest-points", points: 25 }], [{ type: "quest-points", points: 4 }, { type: "skill-xp", skillId: "rune-crafting", amount: 9_000 }], 5, 1),
  quest("oath-shadow-unbound", "oath-contracts-shadow", "Shadow Unbound", "Hunt the creature released when the blood contract breaks.", "slayer", 96, 2_800, [{ type: "quest", questId: "oath-contract-blood" }, { type: "skill", skillId: "slayer", level: 60 }], [{ type: "quest-points", points: 6 }, { type: "skill-xp", skillId: "slayer", amount: 14_000 }], 6, 1),
];

const veilQuests: QuestDefinition[] = [
  quest("oath-veil-opens", "oath-beasts-veil", "When the Veil Opens", "The final ledger begins where the mortal map ends.", "necromancy", 48, 3_000, [{ type: "chapter", chapterId: "oath-contracts-shadow" }, { type: "skill", skillId: "slayer", level: 60 }], [{ type: "quest-points", points: 3 }, { type: "skill-xp", skillId: "necromancy", amount: 10_000 }], 0, 1),
  quest("oath-pale-menagerie", "oath-beasts-veil", "The Pale Menagerie", "Catalogue predators preserved beyond the veil.", "slayer", 60, 3_000, [{ type: "quest", questId: "oath-veil-opens" }, { type: "specialization", specializationId: "slayer-contract-hunting", level: 1 }], [{ type: "quest-points", points: 4 }, { type: "specialization-xp", specializationId: "slayer-contract-hunting", amount: 5_000 }], 1, 1),
  quest("oath-starved-gate", "oath-beasts-veil", "The Starved Gate", "Open a gate that consumes every ward placed upon it.", "magic", 72, 3_200, [{ type: "quest", questId: "oath-pale-menagerie" }, { type: "skill", skillId: "magic", level: 55 }], [{ type: "quest-points", points: 4 }, { type: "skill-xp", skillId: "magic", amount: 12_000 }], 2, 0),
  quest("oath-bone-orchard", "oath-beasts-veil", "The Bone Orchard", "Cross an orchard grown from the remains of forgotten hunts.", "prayer", 72, 3_200, [{ type: "quest", questId: "oath-pale-menagerie" }, { type: "skill", skillId: "prayer", level: 55 }], [{ type: "quest-points", points: 4 }, { type: "skill-xp", skillId: "prayer", amount: 12_000 }], 2, 2),
  quest("oath-glass-hunter", "oath-beasts-veil", "The Glass Hunter", "Break the reflection that has begun hunting its observers.", "ranged", 96, 3_500, [{ type: "quest", questId: "oath-starved-gate" }], [{ type: "quest-points", points: 5 }, { type: "skill-xp", skillId: "ranged", amount: 16_000 }], 3, 0),
  quest("oath-gravehorn", "oath-beasts-veil", "Gravehorn", "Survive the charge of the beast guarding the old oathstone.", "defence", 96, 3_500, [{ type: "quest", questId: "oath-bone-orchard" }], [{ type: "quest-points", points: 5 }, { type: "skill-xp", skillId: "defence", amount: 16_000 }], 3, 2),
  quest("oath-oathstone", "oath-beasts-veil", "The Oathstone", "Restore the stone that binds every legitimate Slayer contract.", "rune-crafting", 120, 4_000, [{ type: "quest", questId: "oath-glass-hunter" }, { type: "quest", questId: "oath-gravehorn" }], [{ type: "quest-points", points: 6 }, { type: "skill-xp", skillId: "rune-crafting", amount: 22_000 }], 4, 1),
  quest("oath-apex-trail", "oath-beasts-veil", "The Apex Trail", "Follow the oldest trail in the ledger to its living source.", "hunter", 144, 4_000, [{ type: "quest", questId: "oath-oathstone" }, { type: "skill", skillId: "hunter", level: 75 }], [{ type: "quest-points", points: 7 }, { type: "skill-xp", skillId: "hunter", amount: 28_000 }], 5, 1),
  quest("oath-beyond-veil", "oath-beasts-veil", "Beasts Beyond the Veil", "Seal the menagerie and return with the final living contract.", "slayer", 168, 4_500, [{ type: "quest", questId: "oath-apex-trail" }, { type: "skill", skillId: "slayer", level: 90 }], [{ type: "quest-points", points: 8 }, { type: "skill-xp", skillId: "slayer", amount: 40_000 }], 6, 1),
];

const campaignFinale = quest(
  "oath-apex-covenant",
  null,
  "The Apex Covenant",
  "Carry the restored oath before the first and greatest Slayer.",
  "slayer",
  168,
  5_000,
  [{ type: "chapter", chapterId: "oath-beasts-veil" }, { type: "skill", skillId: "slayer", level: 99 }],
  [{ type: "quest-points", points: 15 }, { type: "skill-xp", skillId: "slayer", amount: 75_000 }, { type: "cosmetic", cosmeticId: "title-oathbound" }],
  0,
  1,
  true,
);

export const QUESTS: QuestDefinition[] = [...firstBloodQuests, ...shadowQuests, ...veilQuests, campaignFinale];

export const QUEST_CHAPTERS: QuestChapterDefinition[] = [
  { id: "oath-first-blood", campaignId: "slayers-oath", number: 1, name: "First Blood", summary: "The first contracts lead beneath the old roads.", prologue: "A fresh name has appeared on the notice board in ink that refuses to dry.", epilogue: "The first burrow is silent, but its walls carry a second set of names.", icon: skillIcon("slayer"), questIds: firstBloodQuests.map((entry) => entry.id), bonusQuestPoints: 5 },
  { id: "oath-contracts-shadow", campaignId: "slayers-oath", number: 2, name: "Contracts in Shadow", summary: "Corrupted contracts draw the hunters into a moonless court.", prologue: "The recovered ledger contains pages written in another hand.", epilogue: "The shadow contract burns, revealing a gate beyond the mortal map.", icon: skillIcon("thieving"), questIds: shadowQuests.map((entry) => entry.id), bonusQuestPoints: 8 },
  { id: "oath-beasts-veil", campaignId: "slayers-oath", number: 3, name: "Beasts Beyond the Veil", summary: "The final hunt crosses into a preserved menagerie.", prologue: "The veil opens only for those recorded in the restored ledger.", epilogue: "The menagerie closes and the oathstone speaks the name of its first keeper.", icon: skillIcon("necromancy"), questIds: veilQuests.map((entry) => entry.id), bonusQuestPoints: 12 },
];

export const QUEST_CAMPAIGNS: QuestCampaignDefinition[] = [
  {
    id: "slayers-oath",
    name: "The Slayer's Oath",
    summary: "A long-form Slayer campaign from first contracts to the restored covenant.",
    introduction: "Every Slayer contract descends from an oath whose final page has been missing for generations.",
    finaleText: "The covenant is restored, and the ledger finally records its newest keeper.",
    icon: skillIcon("slayer"),
    chapterIds: QUEST_CHAPTERS.map((chapter) => chapter.id),
    finaleQuestId: campaignFinale.id,
    bonusQuestPoints: 20,
  },
];

export type QuestId = (typeof QUESTS)[number]["id"];
