import type { CategoryId } from "./types";

export const categories: Array<{ id: CategoryId; name: string; totalLabel: string }> = [
  { id: "characters", name: "Characters", totalLabel: "Collected characters" },
  { id: "classes", name: "Classes", totalLabel: "Unlocked classes" },
  { id: "races", name: "Races", totalLabel: "Unlocked races" },
  { id: "skills", name: "Skills", totalLabel: "Trained skills" },
  { id: "tools", name: "Tools", totalLabel: "Unlocked tools" },
  { id: "pets", name: "Pets", totalLabel: "Collected pets" },
  { id: "mounts", name: "Mounts", totalLabel: "Collected mounts" },
];
