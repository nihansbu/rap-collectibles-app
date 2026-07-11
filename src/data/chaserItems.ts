import type { ChaserItemDefinition } from "./contentTypes";

export const CHASER_ITEMS: ChaserItemDefinition[] = [
  {
    id: "chaser-storm-harpoon",
    name: "Storm Harpoon Chaser",
    collectibleId: "tool-storm-harpoon",
    denominator: 25_000,
    eligibleActivityIds: ["fishers-trawler"],
  },
];
