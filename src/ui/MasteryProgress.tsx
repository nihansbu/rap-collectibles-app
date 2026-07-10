import { CONTENT_MASTERY_TRACKS } from "../data";
import { formatNumber } from "../format";
import { masteryEconomicModifiers, masteryProgress } from "../mastery";

export function MasteryProgress({ trackId, points, compact = false }: { trackId: string; points: number; compact?: boolean }) {
  const track = CONTENT_MASTERY_TRACKS.find((candidate) => candidate.id === trackId);
  if (!track) return null;
  const progress = masteryProgress(trackId, points);
  const modifiers = masteryEconomicModifiers(trackId, points);
  const passiveLabel = [
    modifiers.xpBonusPercent > 0 ? `+${modifiers.xpBonusPercent}% XP` : null,
    modifiers.costReductionPercent > 0 ? `-${modifiers.costReductionPercent}% RAP` : null,
    modifiers.runtimeReductionPercent > 0 ? `-${modifiers.runtimeReductionPercent}% time` : null,
    modifiers.additionalRollChancePercent > 0 ? `+${modifiers.additionalRollChancePercent}% roll` : null,
  ].filter(Boolean).join(", ");

  if (compact) {
    return (
      <span className="mastery-compact" aria-label={`${track.name}: Level ${progress.level} of 10`}>
        <span className="mastery-compact-copy"><strong>M{progress.level}</strong><small>{progress.isMaxed ? "Mastered" : `${Math.round(progress.progress * 100)}%`}</small></span>
        <span className="mastery-track"><span style={{ width: `${progress.progress * 100}%` }} /></span>
      </span>
    );
  }

  return (
    <section className="mastery-panel" aria-label={`${track.name} progress`}>
      <div className="mastery-heading">
        <span><small>Content Mastery</small><strong>Level {progress.level} / 10</strong></span>
        <span>{progress.isMaxed ? "Mastered" : `${formatNumber(progress.points)} / ${formatNumber(progress.nextLevelPoints)}`}</span>
      </div>
      <div className="mastery-track"><span style={{ width: `${progress.progress * 100}%` }} /></div>
      <div className="mastery-summary">
        <span>{passiveLabel || "No passive bonus yet"}</span>
        <span>{formatNumber(track.targetRap)} RAP total target</span>
      </div>
      {track.milestones.length > 0 && (
        <div className="mastery-milestones">
          {track.milestones.map((milestone) => (
            <span key={milestone.level} className={milestone.level <= progress.level ? "earned" : ""}>
              <strong>M{milestone.level}</strong>{milestone.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

