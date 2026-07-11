import type { CosmeticDefinition } from "./contentTypes";

export const COSMETICS: CosmeticDefinition[] = [
  {
    id: "title-pathfinder",
    name: "Pathfinder",
    kind: "title",
    description: "Earned by completing a first Adventure.",
  },
  {
    id: "title-stablemaster",
    name: "Stablemaster",
    kind: "title",
    description: "Earned by completing the current Mount collection.",
  },
  {
    id: "title-achievement-hunter",
    name: "Achievement Hunter",
    kind: "title",
    description: "Earned by building a substantial Achievement Point total.",
  },
  {
    id: "title-oathbound",
    name: "Oathbound",
    kind: "title",
    description: "Earned by restoring the Slayer's Oath through its final campaign quest.",
  },
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
    description: "A storm-lit Codex theme available from the start.",
    theme: {
      canvas: "#10141a",
      panel: "#18202a",
      accent: "#8fa7ff",
      success: "#79d5ad",
      danger: "#ef7b73",
    },
  },
  {
    id: "theme-verdant-warden",
    name: "Verdant Warden",
    kind: "theme",
    description: "A mossy woodland palette for collectors who favor quiet growth.",
    theme: {
      canvas: "#111812",
      panel: "#1b281d",
      accent: "#b7d76f",
      success: "#91d6a1",
      danger: "#ec9278",
    },
  },
  {
    id: "theme-ember-forge",
    name: "Ember Forge",
    kind: "theme",
    description: "A charcoal-and-copper palette inspired by hot metal and deep kilns.",
    theme: {
      canvas: "#1a1210",
      panel: "#2a1c17",
      accent: "#f0a35b",
      success: "#a8d58c",
      danger: "#ff8271",
    },
  },
  {
    id: "theme-moonlit-archive",
    name: "Moonlit Archive",
    kind: "theme",
    description: "A cool midnight palette for a Codex kept beneath old stars.",
    theme: {
      canvas: "#11131d",
      panel: "#1b2030",
      accent: "#b8a7ff",
      success: "#83d8c2",
      danger: "#ee879b",
    },
  },
  {
    id: "theme-sunken-meridian",
    name: "Sunken Meridian",
    kind: "theme",
    description: "A deep-sea palette of teal water, worn brass, and coral warning light.",
    theme: {
      canvas: "#0e181a",
      panel: "#15272a",
      accent: "#e0bc72",
      success: "#76d0bd",
      danger: "#ef866f",
    },
  },
];
