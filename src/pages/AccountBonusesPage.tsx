import { ChartNoAxesColumnIncreasing, Clover, Gauge, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { collectAccountBonuses, formatBonusLabel, skillXpBonusPercent } from "../bonuses";
import { CONTENT_MASTERY_TRACKS, skills } from "../data";
import { BONUS_DISPLAY_RANK_THRESHOLDS } from "../data/balance/modifiers";
import { collectMasteryAccountBonuses, masteryAccountBonusPercent, masteryEconomicModifiers, masteryProgress } from "../mastery";
import type { PlayerState } from "../save";
import { collectSetAccountBonuses, setAccountBonusPercent } from "../sets";

export function AccountBonusesPage({ player }: { player: PlayerState }) {
  const ownedBonuses = collectAccountBonuses(player.owned);
  const milestoneBonuses = collectMasteryAccountBonuses(player.contentMasteryPoints);
  const setBonuses = collectSetAccountBonuses(player.owned);
  const activeMasteries = CONTENT_MASTERY_TRACKS.flatMap((track) => {
    const points = player.contentMasteryPoints[track.id] ?? 0;
    const level = masteryProgress(track.id, points).level;
    return level > 0 ? [{ track, level, modifiers: masteryEconomicModifiers(track.id, points) }] : [];
  });
  const skillBonuses = skills.map((skill) => ({
    skill,
    percent: skillXpBonusPercent(player.owned, skill.id)
      + setAccountBonusPercent(player.owned, "skill-xp", skill.id)
      + setAccountBonusPercent(player.owned, "all-skill-xp")
      + masteryAccountBonusPercent(player.contentMasteryPoints, "skill-xp", skill.id)
      + masteryAccountBonusPercent(player.contentMasteryPoints, "all-skill-xp"),
  }));

  return (
    <div className="account-bonuses-page">
      <section className="bonus-hero">
        <ChartNoAxesColumnIncreasing size={24} />
        <span><small>Permanent Account Power</small><strong>{ownedBonuses.length + milestoneBonuses.length + setBonuses.length + activeMasteries.length} active sources</strong></span>
      </section>

      <BonusSection title="Skill XP" icon={<Gauge size={18} />}>
        <div className="skill-bonus-grid">
          {skillBonuses.map(({ skill, percent }) => <SkillBonusTile key={skill.id} name={skill.name} percent={percent} />)}
        </div>
      </BonusSection>

      <BonusSection title="Rolls & Luck" icon={<Clover size={18} />}>
        <BonusSources bonuses={ownedBonuses.filter((bonus) => bonus.type === "additional-roll-chance")} empty={[...milestoneBonuses, ...setBonuses].some((bonus) => bonus.type === "additional-roll-chance") ? undefined : "No Roll or Luck bonuses active."} />
        <MasteryBonusSources bonuses={milestoneBonuses.filter((bonus) => bonus.type === "additional-roll-chance")} />
        <SetBonusSources bonuses={setBonuses.filter((bonus) => bonus.type === "additional-roll-chance")} />
      </BonusSection>

      <BonusSection title="Adventure" icon={<ChartNoAxesColumnIncreasing size={18} />}>
        {activeMasteries.map(({ track, level, modifiers }) => (
          <div key={track.id} className="bonus-source-row">
            <span><strong>{track.name}</strong><small>Mastery Level {level}</small></span>
            <strong>{formatModifierSummary(modifiers)}</strong>
          </div>
        ))}
        <BonusSources
          bonuses={ownedBonuses.filter((bonus) => ["adventure-xp", "adventure-runtime-reduction", "adventure-cost-reduction"].includes(bonus.type))}
          empty={activeMasteries.length === 0 && ![...milestoneBonuses, ...setBonuses].some((bonus) => ["adventure-xp", "adventure-runtime-reduction", "adventure-cost-reduction"].includes(bonus.type)) ? "No Adventure bonuses active." : undefined}
        />
        <MasteryBonusSources bonuses={milestoneBonuses.filter((bonus) => ["adventure-xp", "adventure-runtime-reduction", "adventure-cost-reduction"].includes(bonus.type))} />
        <SetBonusSources bonuses={setBonuses.filter((bonus) => ["adventure-xp", "adventure-runtime-reduction", "adventure-cost-reduction"].includes(bonus.type))} />
      </BonusSection>

      <BonusSection title="Resistances" icon={<ShieldCheck size={18} />}>
        <BonusSources bonuses={ownedBonuses.filter((bonus) => bonus.type === "resistance")} empty={[...milestoneBonuses, ...setBonuses].some((bonus) => bonus.type === "resistance") ? undefined : "No Resistances discovered."} />
        <MasteryBonusSources bonuses={milestoneBonuses.filter((bonus) => bonus.type === "resistance")} />
        <SetBonusSources bonuses={setBonuses.filter((bonus) => bonus.type === "resistance")} />
      </BonusSection>
    </div>
  );
}

function BonusSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="bonus-section"><header>{icon}<h2>{title}</h2></header>{children}</section>;
}

function SkillBonusTile({ name, percent }: { name: string; percent: number }) {
  let rank = 0;
  for (let index = 0; index < BONUS_DISPLAY_RANK_THRESHOLDS.length; index += 1) {
    if (percent >= BONUS_DISPLAY_RANK_THRESHOLDS[index]) rank = index;
  }
  const lower = BONUS_DISPLAY_RANK_THRESHOLDS[rank];
  const upper = BONUS_DISPLAY_RANK_THRESHOLDS[Math.min(BONUS_DISPLAY_RANK_THRESHOLDS.length - 1, rank + 1)];
  const progress = upper === lower ? 100 : Math.min(100, Math.max(0, ((percent - lower) / (upper - lower)) * 100));
  return <div className={`skill-bonus-tile rank-${rank}`}><strong>{name}</strong><span>+{percent}%</span><small>Rank {rank}</small><span className="bonus-rank-track"><span style={{ width: `${progress}%` }} /></span></div>;
}

function BonusSources({ bonuses, empty }: { bonuses: ReturnType<typeof collectAccountBonuses>; empty?: string }) {
  if (bonuses.length === 0) return empty ? <p className="bonus-empty">{empty}</p> : null;
  return <>{bonuses.map((bonus) => <div key={`${bonus.collectibleId}-${bonus.type}`} className="bonus-source-row"><span><strong>{bonus.collectibleName}</strong><small>Collectible</small></span><strong>{formatBonusLabel(bonus)}</strong></div>)}</>;
}

function MasteryBonusSources({ bonuses }: { bonuses: ReturnType<typeof collectMasteryAccountBonuses> }) {
  return <>{bonuses.map((bonus) => <div key={`${bonus.sourceId}-${bonus.type}`} className="bonus-source-row"><span><strong>{bonus.sourceName}</strong><small>Mastery Milestone</small></span><strong>{formatBonusLabel(bonus)}</strong></div>)}</>;
}

function SetBonusSources({ bonuses }: { bonuses: ReturnType<typeof collectSetAccountBonuses> }) {
  return <>{bonuses.map((bonus) => <div key={`${bonus.sourceId}-${bonus.type}`} className="bonus-source-row"><span><strong>{bonus.sourceName}</strong><small>Collection Set</small></span><strong>{formatBonusLabel(bonus)}</strong></div>)}</>;
}

function formatModifierSummary(modifiers: ReturnType<typeof masteryEconomicModifiers>) {
  const values = [modifiers.xpBonusPercent ? `+${modifiers.xpBonusPercent}% XP` : "", modifiers.costReductionPercent ? `-${modifiers.costReductionPercent}% RAP` : "", modifiers.runtimeReductionPercent ? `-${modifiers.runtimeReductionPercent}% time` : ""].filter(Boolean);
  return values.join(" · ") || "Milestone progress";
}
