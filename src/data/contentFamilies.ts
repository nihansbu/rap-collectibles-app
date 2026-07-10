import type { ContentFamily } from "./contentTypes";

export const CONTENT_FAMILIES: ContentFamily[] = [
  {
    id: "family-fishing-trawler",
    name: "Fishing Trawler",
    contentKind: "adventure",
    description: "A family of fishing routes that share permanent Mastery.",
    masteryTrackId: "mastery-fishers-trawler",
    contentIds: ["fishers-trawler"],
  },
  {
    id: "family-haunted-burial",
    name: "Haunted Burial",
    contentKind: "adventure",
    description: "Ritual Adventures in haunted burial grounds.",
    masteryTrackId: "mastery-haunted-burial",
    contentIds: ["haunted-burial"],
  },
  {
    id: "family-ember-kiln",
    name: "Ember Kiln",
    contentKind: "adventure",
    description: "Crafting Adventures around volatile heat and ore.",
    masteryTrackId: "mastery-ember-kiln",
    contentIds: ["ember-kiln"],
  },
  {
    id: "family-deep-mine-survey",
    name: "Deep Mine Survey",
    contentKind: "adventure",
    description: "Gathering Adventures through unstable tunnels.",
    masteryTrackId: "mastery-deep-mine-survey",
    contentIds: ["deep-mine-survey"],
  },
];

