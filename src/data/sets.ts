import type { CollectionSetDefinition } from "./contentTypes";

export const COLLECTION_SETS: CollectionSetDefinition[] = [
  {
    id: "set-trawlers-wake",
    name: "Trawler's Wake",
    description: "Relics, companions, and tools carried home from dangerous fishing waters.",
    color: "#6578d8",
    emblem: "anchor",
    collectibleIds: ["pet-trawler-gull", "tool-dragon-harpoon", "mount-brine-ray", "tool-storm-harpoon"],
    rewards: [
      { requiredCount: 2, label: "Trawler Hand Badge", reward: { type: "cosmetic", cosmeticId: "badge-trawler-hand" } },
    ],
  },
];
