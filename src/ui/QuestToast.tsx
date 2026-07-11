import { Check, ScrollText } from "lucide-react";
import type { QuestDefinition } from "../data";

export function QuestToast({ quest, onClose }: { quest: QuestDefinition; onClose: () => void }) {
  const qp = quest.rewards.filter((reward) => reward.type === "quest-points").reduce((sum, reward) => sum + reward.points, 0);
  return (
    <aside className="quest-toast" role="status" aria-live="polite">
      <span className="quest-toast-icon"><ScrollText size={22} /></span>
      <span><small>Quest Completed · +{qp} QP</small><strong>{quest.name}</strong><em>Rewards granted</em></span>
      <button onClick={onClose} aria-label="Dismiss quest notification"><Check size={16} /></button>
    </aside>
  );
}
