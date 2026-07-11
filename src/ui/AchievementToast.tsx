import { Award, Trophy, X } from "lucide-react";
import { getCollectibleById } from "../catalog";
import { getCosmetic } from "../cosmetics";
import type { AchievementDefinition } from "../data";
import { formatNumber } from "../format";

export function AchievementToast({ achievement, onClose }: { achievement: AchievementDefinition; onClose: () => void }) {
  const rewards = (achievement.rewards ?? []).map((reward) => {
    if (reward.type === "cosmetic") return getCosmetic(reward.cosmeticId)?.name;
    return getCollectibleById(reward.collectibleId)?.name;
  }).filter(Boolean);

  return (
    <aside className="achievement-toast" role="status" aria-live="polite">
      <button onClick={onClose} aria-label="Dismiss Achievement notification"><X size={14} /></button>
      <span className="achievement-toast-icon"><Trophy size={22} /></span>
      <span className="achievement-toast-copy">
        <small>Achievement completed</small>
        <strong>{achievement.name}</strong>
        <span>+{formatNumber(achievement.points)} Achievement Points</span>
        {rewards.length > 0 && <em><Award size={12} /> {rewards.join(" · ")}</em>}
      </span>
    </aside>
  );
}
