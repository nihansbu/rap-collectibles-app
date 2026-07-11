import { Check, Crown, Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SKILL_CAPES, skills, type SkillCapeDefinition } from "../data";
import { formatNumber } from "../format";
import { isSkillCapeUnlocked, skillCapeSummary, skillCapeTierLabel } from "../skillCapes";
import type { PlayerState } from "../save";

type CapeFilter = "all" | "99" | "120" | "unlocked" | "locked";

export function SkillCapesPage({ player, onOpenSkill }: { player: PlayerState; onOpenSkill: (skillId: SkillCapeDefinition["skillId"]) => void }) {
  const [filter, setFilter] = useState<CapeFilter>("all");
  const [query, setQuery] = useState("");
  const summary = skillCapeSummary(player.ownedSkillCapes);
  const visibleCapes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return SKILL_CAPES.filter((cape) => {
      const unlocked = player.ownedSkillCapes.includes(cape.id) || isSkillCapeUnlocked(cape, player.skillXp);
      if (filter === "99" && cape.tier !== 99) return false;
      if (filter === "120" && cape.tier !== 120) return false;
      if (filter === "unlocked" && !unlocked) return false;
      if (filter === "locked" && unlocked) return false;
      if (!normalizedQuery) return true;
      const skill = skills.find((candidate) => candidate.id === cape.skillId);
      return `${cape.name} ${skill?.name ?? ""}`.toLocaleLowerCase().includes(normalizedQuery);
    });
  }, [filter, player.ownedSkillCapes, player.skillXp, query]);

  return <div className="skill-capes-page">
    <section className="skill-cape-hero">
      <span className="skill-cape-hero-icon"><Crown size={28} /></span>
      <span><small>Vault · Skill Milestones</small><strong>{formatNumber(summary.total)}/{formatNumber(summary.totalCapes)} Capes</strong><p>{summary.level99}/30 Level 99 · {summary.level120}/30 Level 120</p></span>
    </section>
    <label className="skill-cape-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Skills or Capes" /></label>
    <div className="skill-cape-filter-row" aria-label="Skill Cape filters">
      {(["all", "99", "120", "unlocked", "locked"] as CapeFilter[]).map((option) => (
        <button key={option} className={filter === option ? "active" : ""} onClick={() => setFilter(option)}>
          {option === "all" ? "All" : option === "99" ? "Level 99" : option === "120" ? "Level 120" : option[0].toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
    <section className="skill-cape-grid" aria-live="polite">
      {visibleCapes.map((cape) => <SkillCapeCard key={cape.id} cape={cape} player={player} onOpen={() => onOpenSkill(cape.skillId)} />)}
    </section>
  </div>;
}

function SkillCapeCard({ cape, player, onOpen }: { cape: SkillCapeDefinition; player: PlayerState; onOpen: () => void }) {
  const unlocked = player.ownedSkillCapes.includes(cape.id) || isSkillCapeUnlocked(cape, player.skillXp);
  const skill = skills.find((candidate) => candidate.id === cape.skillId);
  return <button className={`skill-cape-card ${unlocked ? "unlocked" : "locked"}`} onClick={onOpen} aria-label={`${cape.name}, ${unlocked ? "unlocked" : "locked"}`}>
    <span className="skill-cape-art"><img src={`./${cape.icon}`} alt="" draggable="false" />{unlocked ? <span className="skill-cape-owned"><Check size={11} /></span> : <span className="skill-cape-lock"><Lock size={11} /></span>}</span>
    <strong>{skill?.name ?? cape.skillId}</strong>
    <small>{skillCapeTierLabel(cape.tier)}</small>
  </button>;
}
