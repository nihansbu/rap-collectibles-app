import { Award, Check, Compass, Lock, Search, Sparkles, Trophy } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { achievementProgress } from "../achievements";
import { ACHIEVEMENTS, type AchievementCategory, type AchievementDefinition } from "../data";
import { getCollectibleById } from "../catalog";
import { getCosmetic } from "../cosmetics";
import { formatNumber } from "../format";
import type { PlayerState } from "../save";

type CompletionFilter = "all" | "open" | "completed";
type CategoryFilter = "all" | AchievementCategory;

const categoryLabels: Record<AchievementCategory, string> = {
  account: "Account",
  skills: "Skills",
  collection: "Collection",
  adventures: "Adventures",
  mastery: "Mastery",
};

export function AchievementsPage({ player }: { player: PlayerState }) {
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const completedCount = Object.keys(player.completedAchievements).length;

  const visibleAchievements = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return ACHIEVEMENTS.filter((achievement) => {
      const completed = player.completedAchievements[achievement.id] !== undefined;
      if (completionFilter === "open" && completed) return false;
      if (completionFilter === "completed" && !completed) return false;
      if (categoryFilter !== "all" && achievement.category !== categoryFilter) return false;
      if (!normalizedQuery) return true;
      return `${achievement.name} ${achievement.description}`.toLocaleLowerCase().includes(normalizedQuery);
    });
  }, [categoryFilter, completionFilter, player.completedAchievements, query]);

  return (
    <div className="achievements-page">
      <section className="achievement-hero">
        <span className="achievement-hero-icon"><Trophy size={30} /></span>
        <span>
          <small>Account Progress</small>
          <strong>{formatNumber(player.achievementPoints)} AP</strong>
          <p>{completedCount} of {ACHIEVEMENTS.length} Achievements completed</p>
        </span>
        <span className="achievement-completion-ring" aria-label={`${completedCount} of ${ACHIEVEMENTS.length} completed`}>
          {Math.round((completedCount / ACHIEVEMENTS.length) * 100)}%
        </span>
      </section>

      <label className="achievement-search">
        <Search size={15} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Achievements" />
      </label>

      <div className="achievement-filter-row" aria-label="Completion filter">
        {(["all", "open", "completed"] as CompletionFilter[]).map((filter) => (
          <button key={filter} className={completionFilter === filter ? "active" : ""} onClick={() => setCompletionFilter(filter)}>
            {filter === "all" ? "All" : filter === "open" ? "Open" : "Completed"}
          </button>
        ))}
      </div>

      <div className="achievement-category-row" aria-label="Achievement categories">
        <button className={categoryFilter === "all" ? "active" : ""} onClick={() => setCategoryFilter("all")}>All</button>
        {(Object.keys(categoryLabels) as AchievementCategory[]).map((category) => (
          <button key={category} className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)}>
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      <section className="achievement-list" aria-live="polite">
        {visibleAchievements.length === 0 ? (
          <div className="achievement-empty"><Compass size={24} /><strong>No Achievements found</strong><small>Try another category or search.</small></div>
        ) : visibleAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} player={player} />
        ))}
      </section>
    </div>
  );
}

function AchievementCard({ achievement, player }: { achievement: AchievementDefinition; player: PlayerState }) {
  const completedAt = player.completedAchievements[achievement.id];
  const completed = completedAt !== undefined;
  const progress = achievementProgress(achievement, player);
  const percent = Math.min(100, Math.round((progress.current / progress.target) * 100));
  const hidden = achievement.hidden && !completed;

  return (
    <article className={`achievement-card ${completed ? "completed" : ""}`}>
      <span className="achievement-card-icon">{completed ? <Check size={20} /> : hidden ? <Lock size={18} /> : categoryIcon(achievement.category)}</span>
      <div className="achievement-card-copy">
        <header>
          <span>
            <small>{categoryLabels[achievement.category]}{achievement.series ? ` · Stage ${achievement.series.stage}/${achievement.series.totalStages}` : ""}</small>
            <h2>{hidden ? "Hidden Achievement" : achievement.name}</h2>
          </span>
          <strong>+{formatNumber(achievement.points)} AP</strong>
        </header>
        <p>{hidden ? "Complete its hidden condition to reveal this Achievement." : achievement.description}</p>
        {!hidden && (
          <div className="achievement-progress-row">
            <span className="achievement-progress-track"><span style={{ width: `${percent}%` }} /></span>
            <small>{formatNumber(Math.min(progress.current, progress.target))}/{formatNumber(progress.target)}</small>
          </div>
        )}
        {(achievement.rewards?.length ?? 0) > 0 && !hidden && (
          <div className="achievement-rewards">
            <Award size={13} />
            <span>{achievement.rewards?.map(rewardLabel).join(" · ")}</span>
          </div>
        )}
        {completed && <small className="achievement-completed-at">Completed {new Date(completedAt).toLocaleDateString()}</small>}
      </div>
    </article>
  );
}

function rewardLabel(reward: NonNullable<AchievementDefinition["rewards"]>[number]) {
  if (reward.type === "cosmetic") {
    const cosmetic = getCosmetic(reward.cosmeticId);
    return cosmetic ? `${cosmetic.kind === "title" ? "Title" : "Cosmetic"}: ${cosmetic.name}` : "Cosmetic reward";
  }
  return `Collectible: ${getCollectibleById(reward.collectibleId)?.name ?? "Unknown"}`;
}

function categoryIcon(category: AchievementCategory): ReactNode {
  if (category === "account") return <Trophy size={18} />;
  if (category === "collection") return <Sparkles size={18} />;
  if (category === "adventures") return <Compass size={18} />;
  return <Award size={18} />;
}
