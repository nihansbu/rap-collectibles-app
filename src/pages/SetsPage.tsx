import { Anchor, Check, Lock } from "lucide-react";
import type { CSSProperties } from "react";
import { getCollectibleById } from "../catalog";
import { COLLECTION_SETS } from "../data";
import type { PlayerState } from "../save";

export function SetsPage({ player }: { player: PlayerState }) {
  return <div className="sets-page">{COLLECTION_SETS.map((set) => {
    const ownedCount = set.collectibleIds.filter((id) => player.owned.includes(id)).length;
    const percent = Math.round((ownedCount / set.collectibleIds.length) * 100);
    return <section key={set.id} className="set-panel" style={{ "--set-color": set.color } as CSSProperties}>
      <header><span className="set-emblem"><Anchor size={22} /></span><span><small>Collection Set</small><h2>{set.name}</h2></span><strong>{ownedCount}/{set.collectibleIds.length}</strong></header>
      <p>{set.description}</p>
      <div className="set-progress"><span style={{ width: `${percent}%` }} /></div>
      <div className="set-items">{set.collectibleIds.map((id) => {
        const item = getCollectibleById(id);
        const owned = player.owned.includes(id);
        return <span key={id} className={owned ? "owned" : ""}>{owned ? <Check size={12} /> : <Lock size={12} />}<small>{item?.name ?? id}</small></span>;
      })}</div>
      <div className="set-rewards">{set.rewards.map((reward) => <div key={reward.requiredCount} className={ownedCount >= reward.requiredCount ? "earned" : ""}><strong>{reward.requiredCount}/{set.collectibleIds.length}</strong><span>{reward.label}</span></div>)}</div>
    </section>;
  })}</div>;
}
