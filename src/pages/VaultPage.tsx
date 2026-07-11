import { Archive, ChevronRight, Crown, Layers3 } from "lucide-react";
import { formatNumber } from "../format";
import { skillCapeSummary } from "../skillCapes";
import type { PlayerState } from "../save";

export function VaultPage({ player, setProgress, onOpenSets, onOpenSkillCapes }: {
  player: PlayerState;
  setProgress: { completed: number; total: number };
  onOpenSets: () => void;
  onOpenSkillCapes: () => void;
}) {
  const capes = skillCapeSummary(player.ownedSkillCapes);
  return <div className="vault-page">
    <section className="vault-hero">
      <span className="vault-hero-icon"><Archive size={28} /></span>
      <span><small>Special Collections</small><strong>The Vault</strong><p>Prestige collections earned through long-term progression.</p></span>
    </section>
    <section className="vault-grid" aria-label="Vault collections">
      <button className="vault-card" onClick={onOpenSets}>
        <span className="vault-card-icon"><Layers3 size={24} /></span>
        <span><small>Cross-category collection</small><strong>Sets</strong><p>{setProgress.completed}/{setProgress.total} complete</p></span>
        <ChevronRight size={18} />
      </button>
      <button className="vault-card" onClick={onOpenSkillCapes}>
        <span className="vault-card-icon"><Crown size={24} /></span>
        <span><small>Skill milestones</small><strong>Skill Capes</strong><p>{formatNumber(capes.total)}/{formatNumber(capes.totalCapes)} unlocked</p></span>
        <ChevronRight size={18} />
      </button>
    </section>
  </div>;
}
