import type { Collectible } from "../types";

export const toolsCollectibles: Collectible[] = [
{
    id: "tool-harpoon",
    category: "tools",
    name: "Harpoon",
    description: "A reliable fishing tool carried by crews who work rough water.",
    type: "Fishing Tool",
    icon: "assets/icons/tools/tool-harpoon.webp",
    cost: 18_000,
    rarity: "Common",
    requirements: [],
    bonuses: [{ type: "skill-xp", skillId: "fishing", percent: 2 }],
  },
{
    id: "tool-dragon-harpoon",
    category: "tools",
    name: "Dragon Harpoon",
    description: "A heavy dragon-forged harpoon prized by trawler veterans.",
    type: "Fishing Tool",
    icon: "assets/icons/tools/tool-dragon-harpoon.webp",
    cost: 0,
    rarity: "Epic",
    requirements: [{ type: "skill", skillId: "fishing", level: 40 }],
    source: { type: "activity", activityId: "fishers-trawler", label: "Fisher's Trawler" },
    bonuses: [{ type: "skill-xp", skillId: "fishing", percent: 6 }],
  },
{
    id: "tool-storm-harpoon",
    category: "tools",
    name: "Storm Harpoon",
    description: "A storm-bitten chaser tool said to pull fortune from black water.",
    type: "Fishing Tool",
    icon: "assets/icons/tools/tool-storm-harpoon.webp",
    cost: 0,
    rarity: "Legendary",
    requirements: [{ type: "skill", skillId: "fishing", level: 40 }],
    source: { type: "activity", activityId: "fishers-trawler", label: "Fisher's Trawler" },
    bonuses: [
      { type: "skill-xp", skillId: "fishing", percent: 10 },
      { type: "additional-roll-chance", percent: 0.5 },
    ],
  }
];
