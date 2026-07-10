import type { CosmeticDefinition } from "./contentTypes";

export const COSMETICS: CosmeticDefinition[] = [
  {
    id: "badge-trawler-hand",
    name: "Trawler Hand",
    kind: "profile-badge",
    description: "A salt-worn badge earned through Fishing Trawler Mastery.",
  },
  {
    id: "theme-storm-weaver",
    name: "Storm Weaver",
    kind: "theme",
    description: "A permanent storm-lit Codex theme earned through mastery and collection.",
    theme: {
      canvas: "#10141a",
      panel: "#18202a",
      accent: "#8fa7ff",
      success: "#79d5ad",
      danger: "#ef7b73",
    },
  },
];

