import type { ContentMasteryTrack } from "./contentTypes";

export const CONTENT_MASTERY_TRACKS: ContentMasteryTrack[] = [
  {
    id: "mastery-fishers-trawler",
    name: "Fishing Trawler Mastery",
    contentKind: "adventure",
    targetRap: 5_000_000,
    passiveBonuses: [{ type: "content-xp", percentPerLevel: 0.1 }],
    milestones: [
      { level: 8, label: "Trawler Hand Badge", reward: { type: "cosmetic", cosmeticId: "badge-trawler-hand" } },
    ],
  },
  {
    id: "mastery-haunted-burial",
    name: "Haunted Burial Mastery",
    contentKind: "adventure",
    targetRap: 2_500_000,
    passiveBonuses: [{ type: "runtime-reduction", percentPerLevel: 0.08 }],
    milestones: [],
  },
  {
    id: "mastery-ember-kiln",
    name: "Ember Kiln Mastery",
    contentKind: "adventure",
    targetRap: 2_500_000,
    passiveBonuses: [{ type: "rap-cost-reduction", percentPerLevel: 0.08 }],
    milestones: [],
  },
  {
    id: "mastery-deep-mine-survey",
    name: "Deep Mine Survey Mastery",
    contentKind: "adventure",
    targetRap: 2_500_000,
    passiveBonuses: [{ type: "content-xp", percentPerLevel: 0.1 }],
    milestones: [],
  },
];
