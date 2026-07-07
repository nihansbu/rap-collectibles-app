import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Dice5,
  Download,
  Gem,
  Lock,
  Plus,
  Search,
  Swords,
  Upload,
  X,
} from "lucide-react";
import {
  activityDropChance,
  activityDropItem,
  activityRequirementsMet,
  activitySkillAdvantage,
  canStartActivity,
  effectiveActivityRun,
  formatDropChance,
  GAMEPLAY_ACTIVITIES,
  getActivity,
  isActivityRunning,
  processActiveActivityRuns,
  startActivityRun,
  type ActivityRunResult,
  type GameplayActivity,
  type GameplayActivityId,
} from "./activities";
import { collectAccountBonuses, formatBonusLabel, skillXpBonusPercent } from "./bonuses";
import {
  canUnlock,
  collectibleActionLabel,
  collectibleSortIndex,
  collectibleStatus,
  collectibleStatusRank,
  categoryForSkill,
  getCollectibleById,
  getCollectiblesByCategory,
  getRequirementState,
  highestRequirement,
  isActivityDrop,
  rarityClass,
  requirementsMet,
  skillName,
  skillNameFontSize,
  sourceActivityFor,
  statusLabel,
} from "./catalog";
import { categories, type CategoryId, type Collectible, type Requirement, skills, type SkillId } from "./data";
import { ACTIVITY_OPTIONS, activityRap, type ActivityLogEntry, type ActivityOption } from "./economy";
import { completionPercent, formatNumber, formatSavedTime } from "./format";
import { HandbookPage } from "./pages/HandbookPage";
import { MainMenuPage } from "./pages/MainMenuPage";
import { TopBar } from "./ui/TopBar";
import { ActivityResultPanel, ConfirmDialog, ImportDialog, UnlockNotice } from "./ui/dialogs";
import { ActivityIcon, AppIcon, GameplayActivityIcon, TileVisual } from "./ui/icons";
import { exportPlayerState, importPlayerState, loadPlayerState, savePlayerState, type PlayerState } from "./save";
import {
  formatDuration,
  isSkillTraining,
  MAX_ACTIVE_TRAININGS,
  processActiveTrainings,
  remainingTrainingMs,
  startSkillTraining,
  TRAINING_DURATIONS,
  TRAINING_RAP_PER_HOUR,
  trainingXpPerHour,
} from "./training";
import { MAX_LEVEL, levelFromXp, xpIntoLevel } from "./xp";

type Filter = "all" | "owned" | "unlockable" | "locked";
type SkillFilter = "all" | "trained" | "trainable" | "maxed";
type SortMode = "default" | "cost-asc" | "cost-desc" | "requirements-asc" | "requirements-desc";
type Page =
  | { type: "main" }
  | { type: "collectibles" }
  | { type: "adventure" }
  | { type: "handbook" }
  | { type: "activities" }
  | { type: "category"; id: CategoryId };
type DetailView =
  | { type: "collectible"; item: Collectible }
  | { type: "skill"; skillId: SkillId }
  | { type: "activity"; activityId: GameplayActivityId };
type CategoryProgress = {
  id: CategoryId;
  name: string;
  totalLabel: string;
  unlocked: number;
  total: number;
  percent: number;
};

function isTextControl(target: EventTarget | null) {
  return target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement;
}

export function App() {
  const [player, setPlayer] = useState<PlayerState>(() => loadPlayerState());
  const [page, setPage] = useState<Page>({ type: "main" });
  const [filter, setFilter] = useState<Filter>("all");
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("default");
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const [confirmItem, setConfirmItem] = useState<Collectible | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [unlockNotice, setUnlockNotice] = useState<Collectible | null>(null);
  const [activityResultNotice, setActivityResultNotice] = useState<ActivityRunResult | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<Collectible[]>([]);
  const [handledActivityResultId, setHandledActivityResultId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const title = page.type === "main"
    ? "Menu"
    : page.type === "collectibles"
      ? "Collectibles"
      : page.type === "adventure"
        ? "Adventure"
        : page.type === "handbook"
          ? "Handbook"
          : page.type === "activities"
            ? "Activities"
            : categories.find((category) => category.id === page.id)?.name ?? "";
  const pageKey = page.type === "category" ? page.id : page.type;

  useEffect(() => {
    const preventNativeSelection = (event: Event) => {
      if (isTextControl(event.target)) return;
      event.preventDefault();
    };
    const clearSelection = () => {
      if (isTextControl(document.activeElement)) return;
      window.getSelection()?.removeAllRanges();
    };

    document.addEventListener("selectstart", preventNativeSelection);
    document.addEventListener("contextmenu", preventNativeSelection);
    document.addEventListener("dragstart", preventNativeSelection);
    document.addEventListener("selectionchange", clearSelection);

    return () => {
      document.removeEventListener("selectstart", preventNativeSelection);
      document.removeEventListener("contextmenu", preventNativeSelection);
      document.removeEventListener("dragstart", preventNativeSelection);
      document.removeEventListener("selectionchange", clearSelection);
    };
  }, []);

  useEffect(() => {
    savePlayerState(player);
    setLastSavedAt(new Date());
  }, [player]);

  useEffect(() => {
    setTypeFilter("all");
  }, [pageKey]);

  useEffect(() => {
    if (player.activeTrainings.length === 0 && player.activeActivityRuns.length === 0) return;

    const intervalId = window.setInterval(() => {
      setPlayer((current) => processActiveActivityRuns(processActiveTrainings(current)));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [player.activeActivityRuns.length, player.activeTrainings.length]);

  useEffect(() => {
    const latest = player.activityResults[0];
    if (!latest || latest.id === handledActivityResultId) return;

    setHandledActivityResultId(latest.id);
    const droppedItem = latest.droppedCollectibleId ? getCollectibleById(latest.droppedCollectibleId) : null;

    setActivityResultNotice(latest);
    if (droppedItem) {
      setRecentUnlocks((current) => [droppedItem, ...current.filter((candidate) => candidate.id !== droppedItem.id)].slice(0, 3));
    }
  }, [handledActivityResultId, player.activityResults]);

  useEffect(() => {
    if (!unlockNotice) return;

    const timeoutId = window.setTimeout(() => {
      setUnlockNotice(null);
    }, 3_200);

    return () => window.clearTimeout(timeoutId);
  }, [unlockNotice]);

  function grantRp() {
    setPlayer((current) => ({ ...current, rp: current.rp + 10_000, lifetimeRap: current.lifetimeRap + 10_000 }));
  }

  function logActivity(activity: ActivityOption) {
    const hours = 1;
    const rap = activityRap(activity, hours);
    const loggedAt = Date.now();
    const entry: ActivityLogEntry = {
      id: `${activity.id}-${loggedAt}`,
      activityId: activity.id,
      name: activity.name,
      hours,
      rap,
      loggedAt,
    };

    setPlayer((current) => ({
      ...current,
      rp: current.rp + rap,
      lifetimeRap: current.lifetimeRap + rap,
      activityLog: [entry, ...current.activityLog].slice(0, 8),
    }));
  }

  function trainSkill(skillId: SkillId, hours: number) {
    setPlayer((current) => {
      if (current.rp <= 0) return current;
      return startSkillTraining(current, skillId, hours);
    });
  }

  function runGameplayActivity(activityId: GameplayActivityId) {
    setPlayer((current) => startActivityRun(current, activityId));
  }

  function buyItem(item: Collectible) {
    if (player.owned.includes(item.id) || !canUnlock(item, player)) {
      setConfirmItem(null);
      return;
    }

    setPlayer((current) => {
      if (current.owned.includes(item.id) || !canUnlock(item, current)) return current;
      return {
        ...current,
        rp: current.rp - item.cost,
        owned: [...current.owned, item.id],
      };
    });
    setUnlockNotice(item);
    setRecentUnlocks((current) => [item, ...current.filter((candidate) => candidate.id !== item.id)].slice(0, 3));
    setConfirmItem(null);
    setDetailView(null);
  }

  async function exportSave() {
    const current = processActiveTrainings(player);
    setPlayer(current);

    const rawSave = exportPlayerState(current);
    const blob = new Blob([rawSave], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rap-collectibles-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    try {
      await navigator.clipboard?.writeText(rawSave);
      setSaveMessage("Save exported and copied.");
    } catch {
      setSaveMessage("Save exported.");
    }
  }

  function importSave() {
    const imported = importPlayerState(importText);
    if (!imported) {
      setSaveMessage("Import failed. Paste a valid RAP save file.");
      return;
    }

    setPlayer(imported);
    setPage({ type: "main" });
    setDetailView(null);
    setImportOpen(false);
    setImportText("");
    setSaveMessage("Save imported.");
  }

  const categoryProgress = useMemo(() => {
    return categories.map((category) => {
      if (category.id === "skills") {
        const totalLevel = skills.reduce((total, skill) => total + levelFromXp(player.skillXp[skill.id]), 0);
        const total = skills.length * MAX_LEVEL;
        return { ...category, unlocked: totalLevel, total, percent: completionPercent(totalLevel, total) };
      }

      const items = getCollectiblesByCategory(category.id);
      const unlocked = items.filter((item) => player.owned.includes(item.id)).length;
      return { ...category, unlocked, total: items.length, percent: completionPercent(unlocked, items.length) };
    });
  }, [player]);

  return (
    <div
      className="app-shell"
      onContextMenu={(event) => {
        if (!isTextControl(event.target)) event.preventDefault();
      }}
      onSelect={(event) => {
        if (!isTextControl(event.target)) event.preventDefault();
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      <TopBar
        title={title}
        rp={player.rp}
        canGoBack={page.type !== "main" || detailView !== null}
        onBack={() => {
          if (detailView) {
            setDetailView(null);
            return;
          }
          if (page.type === "category") {
            setPage({ type: "collectibles" });
            return;
          }
          if (page.type === "activities") {
            setPage({ type: "adventure" });
            return;
          }
          setPage({ type: "main" });
        }}
        onGrantRp={grantRp}
      />

      <main className="content">
        {detailView?.type === "collectible" ? (
          <CollectibleDetailView
            item={detailView.item}
            player={player}
            onClose={() => setDetailView(null)}
            onBuy={() => setConfirmItem(detailView.item)}
          />
        ) : detailView?.type === "skill" ? (
          <SkillDetailView
            skillId={detailView.skillId}
            player={player}
            onClose={() => setDetailView(null)}
            onTrain={(hours) => trainSkill(detailView.skillId, hours)}
          />
        ) : detailView?.type === "activity" ? (
          <ActivityDetailView
            activityId={detailView.activityId}
            player={player}
            onClose={() => setDetailView(null)}
            onRun={() => runGameplayActivity(detailView.activityId)}
          />
        ) : page.type === "main" ? (
          <MainMenuPage
            activities={ACTIVITY_OPTIONS}
            activityLog={player.activityLog}
            lifetimeRap={player.lifetimeRap}
            lastSavedAt={lastSavedAt}
            saveMessage={saveMessage}
            onLogActivity={logActivity}
            onExportSave={exportSave}
            onImportSave={() => {
              setImportOpen(true);
              setSaveMessage("");
            }}
            onOpenCollectibles={() => setPage({ type: "collectibles" })}
            onOpenAdventure={() => setPage({ type: "adventure" })}
            onOpenHandbook={() => setPage({ type: "handbook" })}
          />
        ) : page.type === "collectibles" ? (
          <CollectiblesOverviewPage
            progress={categoryProgress}
            recentUnlocks={recentUnlocks}
            onOpen={(id) => setPage({ type: "category", id })}
          />
        ) : page.type === "adventure" ? (
          <AdventurePage
            player={player}
            onOpenActivities={() => setPage({ type: "activities" })}
          />
        ) : page.type === "handbook" ? (
          <HandbookPage />
        ) : page.type === "activities" ? (
          <ActivitiesPage
            player={player}
            onOpenActivity={(activityId) => setDetailView({ type: "activity", activityId })}
          />
        ) : page.id === "skills" ? (
          <SkillsPage player={player} skillFilter={skillFilter} onFilter={setSkillFilter} onOpenSkill={(skillId) => setDetailView({ type: "skill", skillId })} />
        ) : (
          <CollectionPage
            category={page.id}
            player={player}
            filter={filter}
            typeFilter={typeFilter}
            sort={sort}
            onFilter={setFilter}
            onTypeFilter={setTypeFilter}
            onSort={setSort}
            onOpenDetails={(item) => setDetailView({ type: "collectible", item })}
          />
        )}
      </main>

      {confirmItem && (
        <ConfirmDialog item={confirmItem} onCancel={() => setConfirmItem(null)} onConfirm={() => buyItem(confirmItem)} />
      )}
      {importOpen && (
        <ImportDialog
          value={importText}
          onChange={setImportText}
          onCancel={() => setImportOpen(false)}
          onImport={importSave}
        />
      )}
      {unlockNotice && <UnlockNotice item={unlockNotice} onClose={() => setUnlockNotice(null)} />}
      {activityResultNotice && <ActivityResultPanel result={activityResultNotice} onClose={() => setActivityResultNotice(null)} />}
    </div>
  );
}

function CollectiblesOverviewPage({
  progress,
  recentUnlocks,
  onOpen,
}: {
  progress: CategoryProgress[];
  recentUnlocks: Collectible[];
  onOpen: (id: CategoryId) => void;
}) {
  return (
    <>
      <section className="tile-grid">
        {progress.map((category) => (
          <button key={category.id} className="category-tile" onClick={() => onOpen(category.id)}>
            <span className="tile-icon">
              <AppIcon category={category.id} />
            </span>
            <span className="tile-text">
              <strong>{category.name}</strong>
              <small>{category.totalLabel}</small>
            </span>
            <span className="tile-progress">
              <strong>{category.unlocked}/{category.total}</strong>
              <small>{category.percent}%</small>
            </span>
            <ChevronRight className="tile-chevron" size={18} />
            <span className="category-progress-track" aria-hidden="true">
              <span style={{ width: `${category.percent}%` }} />
            </span>
          </button>
        ))}
      </section>
      {recentUnlocks.length > 0 && (
        <section className="recent-unlocks" aria-label="Recent unlocks">
          <h2>Recent Unlocks</h2>
          <div>
            {recentUnlocks.map((item) => (
              <article key={item.id} className="recent-unlock">
                <TileVisual icon={item.icon} category={item.category} owned sourceType={item.source?.type} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{categories.find((category) => category.id === item.category)?.name ?? item.type}</small>
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function AdventurePage({
  player,
  onOpenActivities,
}: {
  player: PlayerState;
  onOpenActivities: () => void;
}) {
  const totalRuns = Object.values(player.activityRunCounts).reduce((total, runs) => total + runs, 0);
  const activeRuns = player.activeActivityRuns.length;

  return (
    <section className="tile-grid">
      <button className="category-tile adventure-entry" onClick={onOpenActivities}>
        <span className="tile-icon">
          <Compass size={23} strokeWidth={1.8} />
        </span>
        <span className="tile-text">
          <strong>Activities</strong>
          <small>Repeatable adventures with XP and rare drops</small>
        </span>
        <span className="tile-progress">
          <strong>{formatNumber(totalRuns)}</strong>
          <small>{activeRuns > 0 ? `${activeRuns} active` : "runs"}</small>
        </span>
        <ChevronRight className="tile-chevron" size={18} />
      </button>
    </section>
  );
}

function ActivitiesPage({
  player,
  onOpenActivity,
}: {
  player: PlayerState;
  onOpenActivity: (activityId: GameplayActivityId) => void;
}) {
  return (
    <section className="activity-card-list">
      {GAMEPLAY_ACTIVITIES.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} player={player} onOpenActivity={onOpenActivity} />
      ))}
    </section>
  );
}

function ActivityCard({
  activity,
  player,
  onOpenActivity,
}: {
  activity: GameplayActivity;
  player: PlayerState;
  onOpenActivity: (activityId: GameplayActivityId) => void;
}) {
  const running = isActivityRunning(player, activity.id);
  const requirementsReady = activityRequirementsMet(activity, player);
  const runCount = player.activityRunCounts[activity.id] ?? 0;
  const effective = effectiveActivityRun(activity, player);
  const bestDrop = activity.drops.length > 0
    ? activity.drops.reduce((best, drop) => (drop.chance > best.chance ? drop : best), activity.drops[0])
    : null;

  return (
    <article
      className={`activity-card ${running ? "running" : ""} ${requirementsReady ? "ready" : "locked"}`}
      onClick={() => onOpenActivity(activity.id)}
    >
      <span className="activity-card-icon">
        <GameplayActivityIcon activity={activity} />
      </span>
      <span className="activity-card-copy">
        <strong>{activity.name}</strong>
        <small>{activity.type}</small>
      </span>
      <span className="activity-card-stats">
        <strong>{formatNumber(effective.cost)} RAP</strong>
        <small>{runCount} Runs</small>
      </span>
      {bestDrop && (
        <span className="source-strip activity-source-strip">
          Rare drop {formatDropChance(bestDrop, runCount)}
        </span>
      )}
    </article>
  );
}

function FilterBar({
  filter,
  typeFilter,
  types,
  sort,
  onFilter,
  onTypeFilter,
  onSort,
}: {
  filter: Filter;
  typeFilter: string;
  types: string[];
  sort: SortMode;
  onFilter: (filter: Filter) => void;
  onTypeFilter: (type: string) => void;
  onSort: (sort: SortMode) => void;
}) {
  return (
    <div className="filter-panel">
      <div className="segmented">
        {(["all", "owned", "unlockable", "locked"] as Filter[]).map((option) => (
          <button key={option} className={filter === option ? "active" : ""} onClick={() => onFilter(option)}>
            {option[0].toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      {types.length > 1 && (
        <div className="type-filter" aria-label="Type filter">
          <button className={typeFilter === "all" ? "active" : ""} onClick={() => onTypeFilter("all")}>
            All Types
          </button>
          {types.map((type) => (
            <button key={type} className={typeFilter === type ? "active" : ""} onClick={() => onTypeFilter(type)}>
              {type}
            </button>
          ))}
        </div>
      )}
      <label className="select-row">
        <Search size={16} />
        <select value={sort} onChange={(event) => onSort(event.target.value as SortMode)}>
          <option value="default">Default order</option>
          <option value="cost-asc">Lowest cost</option>
          <option value="cost-desc">Highest cost</option>
          <option value="requirements-asc">Lowest requirements</option>
          <option value="requirements-desc">Highest requirements</option>
        </select>
      </label>
    </div>
  );
}

function CollectionPage({
  category,
  player,
  filter,
  typeFilter,
  sort,
  onFilter,
  onTypeFilter,
  onSort,
  onOpenDetails,
}: {
  category: Exclude<CategoryId, "skills">;
  player: PlayerState;
  filter: Filter;
  typeFilter: string;
  sort: SortMode;
  onFilter: (filter: Filter) => void;
  onTypeFilter: (type: string) => void;
  onSort: (sort: SortMode) => void;
  onOpenDetails: (item: Collectible) => void;
}) {
  const categoryItems = useMemo(() => getCollectiblesByCategory(category), [category]);
  const types = useMemo(() => [...new Set(categoryItems.map((item) => item.type))].sort(), [categoryItems]);

  const items = useMemo(() => {
    let next = categoryItems;

    next = next.filter((item) => {
      const owned = player.owned.includes(item.id);
      const unlockable = canUnlock(item, player) && !owned;
      const locked = !owned && (isActivityDrop(item) || !requirementsMet(item, player));
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (filter === "owned") return owned;
      if (filter === "unlockable") return unlockable;
      if (filter === "locked") return locked;
      return true;
    });

    return [...next].sort((a, b) => {
      const statusDifference = collectibleStatusRank(a, player) - collectibleStatusRank(b, player);
      if (statusDifference !== 0) return statusDifference;
      if (sort === "cost-asc") return a.cost - b.cost;
      if (sort === "cost-desc") return b.cost - a.cost;
      if (sort === "requirements-asc") return highestRequirement(a) - highestRequirement(b);
      if (sort === "requirements-desc") return highestRequirement(b) - highestRequirement(a);
      return collectibleSortIndex(a) - collectibleSortIndex(b);
    });
  }, [categoryItems, filter, player, sort, typeFilter]);

  return (
    <>
      <FilterBar
        filter={filter}
        typeFilter={typeFilter}
        types={types}
        sort={sort}
        onFilter={onFilter}
        onTypeFilter={onTypeFilter}
        onSort={onSort}
      />
      <section className="card-grid">
        {items.map((item) => (
          <CollectibleCard key={item.id} item={item} player={player} onOpenDetails={onOpenDetails} />
        ))}
      </section>
    </>
  );
}

function CollectibleCard({
  item,
  player,
  onOpenDetails,
}: {
  item: Collectible;
  player: PlayerState;
  onOpenDetails: (item: Collectible) => void;
}) {
  const owned = player.owned.includes(item.id);
  const status = collectibleStatus(item, player);

  return (
    <article
      className={`icon-tile ${status} ${isActivityDrop(item) ? "activity-source" : ""}`}
      onClick={() => onOpenDetails(item)}
    >
      <TileVisual icon={item.icon} category={item.category} locked={status === "locked"} owned={owned} sourceType={item.source?.type} />
      <h2>{item.name}</h2>
      <span>{item.type}</span>
      {item.source?.type === "activity" && <small className="source-strip">Activity Drop</small>}
    </article>
  );
}

function SkillsPage({
  player,
  skillFilter,
  onFilter,
  onOpenSkill,
}: {
  player: PlayerState;
  skillFilter: SkillFilter;
  onFilter: (filter: SkillFilter) => void;
  onOpenSkill: (skillId: SkillId) => void;
}) {
  const visibleSkills = skills.filter((skill) => {
    const level = levelFromXp(player.skillXp[skill.id]);
    if (skillFilter === "trained") return level > 1;
    if (skillFilter === "trainable") return player.rp > 0 && level < MAX_LEVEL;
    if (skillFilter === "maxed") return level >= MAX_LEVEL;
    return true;
  });

  return (
    <>
      <div className="filter-panel">
        <div className="segmented skill-tabs">
          {(["all", "trained", "trainable", "maxed"] as SkillFilter[]).map((option) => (
            <button key={option} className={skillFilter === option ? "active" : ""} onClick={() => onFilter(option)}>
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <section className="skill-list">
        {visibleSkills.map((skill) => {
          const xp = player.skillXp[skill.id];
          const levelInfo = xpIntoLevel(xp);
          const training = isSkillTraining(player, skill.id);
          return (
            <article className={`icon-tile skill-tile ${training ? "training" : ""}`} key={skill.id} onClick={() => onOpenSkill(skill.id)}>
              <TileVisual icon={skill.icon} category={categoryForSkill(skill.id)} />
              <h2 style={{ fontSize: skillNameFontSize(skill.name) }}>{skill.name}</h2>
              <span>Lv. {levelInfo.level}</span>
            </article>
          );
        })}
      </section>
    </>
  );
}

function CollectibleDetailView({
  item,
  player,
  onClose,
  onBuy,
}: {
  item: Collectible;
  player: PlayerState;
  onClose: () => void;
  onBuy: () => void;
}) {
  const owned = player.owned.includes(item.id);
  const unlockable = canUnlock(item, player) && !owned;
  const status = collectibleStatus(item, player);
  const sourceActivity = sourceActivityFor(item);
  const purchaseNote = owned
    ? "Already added to your Codex."
    : sourceActivity
      ? `This collectible drops from ${sourceActivity.name}.`
    : status === "locked"
      ? "Meet the requirements before unlocking."
      : player.rp < item.cost
        ? "Requirements met. Earn more RAP to unlock."
        : "Ready to unlock.";

  return (
    <section className={`detail-view collectible-detail ${status}`} aria-label={`${item.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon">
        {item.icon ? <img src={item.icon} alt="" draggable="false" /> : owned ? <Check size={32} /> : status === "ready" ? <Gem size={32} /> : <Lock size={32} />}
      </div>
      <div className="detail-status-row">
        <span className={`status-pill ${sourceActivity && owned ? "activity" : status}`}>{sourceActivity && owned ? "Activity Drop" : statusLabel[status]}</span>
        <span>{sourceActivity ? sourceActivity.name : `${formatNumber(item.cost)} RAP`}</span>
      </div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <div className="sheet-meta">
        <span className={rarityClass[item.rarity]}>{item.rarity}</span>
        <span>{item.type}</span>
        {sourceActivity && <span className="source-meta">Source: {sourceActivity.name}</span>}
      </div>
      <RequirementList item={item} player={player} />
      {item.bonuses && item.bonuses.length > 0 && <CollectibleBonusList item={item} />}
      <div className="purchase-panel">
        <div>
          <strong>{sourceActivity ? "Source" : "Unlock"}</strong>
          <span>{purchaseNote}</span>
        </div>
        <button className="primary-action detail-action" disabled={!unlockable || !!sourceActivity} onClick={onBuy}>
          {collectibleActionLabel(item, player)}
        </button>
      </div>
    </section>
  );
}

function CollectibleBonusList({ item }: { item: Collectible }) {
  if (!item.bonuses || item.bonuses.length === 0) return null;

  return (
    <div className="activity-bonus-panel">
      <h3>Account Bonuses</h3>
      {item.bonuses.map((bonus, index) => (
        <div key={`${item.id}-${bonus.type}-${index}`} className="bonus-row">
          <span>Permanent</span>
          <strong>{formatBonusLabel(bonus)}</strong>
        </div>
      ))}
    </div>
  );
}

function SkillDetailView({
  skillId,
  player,
  onClose,
  onTrain,
}: {
  skillId: SkillId;
  player: PlayerState;
  onClose: () => void;
  onTrain: (hours: number) => void;
}) {
  const skill = skills.find((candidate) => candidate.id === skillId)!;
  const xp = player.skillXp[skillId];
  const levelInfo = xpIntoLevel(xp);
  const nextLevel = Math.min(levelInfo.level + 1, MAX_LEVEL);
  const activeTraining = player.activeTrainings.find((training) => training.skillId === skillId);
  const isMaxed = levelInfo.level >= MAX_LEVEL;
  const canStartNewTraining = activeTraining || player.activeTrainings.length < MAX_ACTIVE_TRAININGS;
  const disabledReason = isMaxed
    ? "Maximum level reached"
    : player.rp <= 0
      ? "No RAP available"
      : !canStartNewTraining
        ? "Maximum 3 active skills"
        : null;

  return (
    <section className={`detail-view ${activeTraining ? "training" : ""}`} aria-label={`${skill.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon">
        {skill.icon ? <img src={skill.icon} alt="" draggable="false" /> : <Swords size={32} />}
      </div>
      <h2>{skill.name}</h2>
      <p>
        Train this skill with RAP to unlock collectibles that require {skill.name} levels.
      </p>
      <div className="sheet-meta">
        <span>{skill.source}</span>
        <span>Level {levelInfo.level}</span>
        <span>{formatNumber(trainingXpPerHour(levelInfo.level))} XP/h</span>
        <span>{formatNumber(TRAINING_RAP_PER_HOUR)} RAP/h</span>
      </div>
      {activeTraining && (
        <div className="active-training-panel" aria-label={`${skill.name} training status`}>
          <strong>Training active</strong>
          <span>{formatDuration(remainingTrainingMs(activeTraining))} remaining</span>
        </div>
      )}
      <div className="skill-detail-track">
        <div className="xp-track" aria-label={`${skill.name} XP progress`}>
          <span style={{ width: `${Math.max(3, levelInfo.progress * 100)}%` }} />
        </div>
        <div className="skill-detail-stats">
          <span>{formatNumber(xp)} XP</span>
          <span>
            {levelInfo.level >= MAX_LEVEL
              ? "Maximum level"
              : `${formatNumber(levelInfo.next - xp)} XP to Level ${nextLevel}`}
          </span>
        </div>
      </div>
      <div className="training-actions">
        {TRAINING_DURATIONS.map((duration) => (
          <button
            key={duration.hours}
            className="primary-action"
            disabled={disabledReason !== null}
            onClick={() => onTrain(duration.hours)}
          >
            {duration.label}
          </button>
        ))}
      </div>
      {disabledReason && <p className="action-note">{disabledReason}</p>}
    </section>
  );
}

function ActivityDetailView({
  activityId,
  player,
  onClose,
  onRun,
}: {
  activityId: GameplayActivityId;
  player: PlayerState;
  onClose: () => void;
  onRun: () => void;
}) {
  const activity = getActivity(activityId)!;
  const activeRun = player.activeActivityRuns.find((run) => run.activityId === activityId);
  const requirementsReady = activityRequirementsMet(activity, player);
  const runCount = player.activityRunCounts[activityId] ?? 0;
  const effective = effectiveActivityRun(activity, player);
  const advantage = activitySkillAdvantage(activity, player);
  const activeBonuses = collectAccountBonuses(player.owned).filter((bonus) => {
    if (bonus.type === "all-skill-xp" || bonus.type === "additional-roll-chance") return true;
    return activity.xpRewards.some((reward) => reward.skillId === bonus.skillId);
  });
  const canRun = canStartActivity(activity, player);
  const now = Date.now();
  const runProgress = activeRun
    ? Math.min(100, Math.max(3, ((now - activeRun.startedAt) / (activeRun.endsAt - activeRun.startedAt)) * 100))
    : 0;
  const disabledReason = activeRun
    ? "Activity already running"
    : !requirementsReady
      ? "Requirements not met"
      : player.rp < effective.cost
        ? "Not enough RAP"
        : null;

  return (
    <section className={`detail-view activity-detail ${activeRun ? "training" : ""}`} aria-label={`${activity.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon activity-sheet-icon">
        <GameplayActivityIcon activity={activity} />
      </div>
      <div className="detail-status-row">
        <span className={`status-pill ${requirementsReady ? "ready" : "locked"}`}>{requirementsReady ? "Ready" : "Locked"}</span>
        <span>{formatNumber(effective.cost)} RAP</span>
        <span>{formatDuration(effective.runtimeMs)}</span>
      </div>
      <h2>{activity.name}</h2>
      <p>{activity.description}</p>
      <div className="sheet-meta">
        <span>{activity.type}</span>
        <span>{formatNumber(runCount)} Runs</span>
        <span>75% XP efficiency</span>
      </div>
      <div className="activity-bonus-panel">
        <h3>Bonuses</h3>
        <div className="bonus-row">
          <span>Skill Advantage</span>
          <strong>
            +{advantage.xpBonusPercent.toFixed(1)}% XP, -{advantage.costReductionPercent.toFixed(1)}% RAP, -{advantage.runtimeReductionPercent.toFixed(1)}% runtime
          </strong>
        </div>
        {activeBonuses.length === 0 ? (
          <div className="bonus-row muted">
            <span>Account Bonuses</span>
            <strong>None active</strong>
          </div>
        ) : (
          activeBonuses.map((bonus) => (
            <div key={`${bonus.collectibleId}-${bonus.type}`} className="bonus-row">
              <span>{bonus.collectibleName}</span>
              <strong>{formatBonusLabel(bonus)}</strong>
            </div>
          ))
        )}
      </div>
      {activeRun && (
        <div className="active-training-panel" aria-label={`${activity.name} run status`}>
          <strong>Activity running</strong>
          <span>{formatDuration(Math.max(0, activeRun.endsAt - now))} remaining</span>
        </div>
      )}
      {activeRun && (
        <div className="skill-detail-track">
          <div className="xp-track activity-run-track" aria-label={`${activity.name} run progress`}>
            <span style={{ width: `${runProgress}%` }} />
          </div>
        </div>
      )}
      <ActivityRequirementList requirements={activity.requirements} player={player} />
      <div className="reward-list">
        <h3>XP Rewards</h3>
        {activity.xpRewards.map((reward) => (
          <div key={reward.skillId} className="reward-row">
            <span>{skillName(reward.skillId)}</span>
            <strong>{Math.round(reward.share * 100)}%{skillXpBonusPercent(player.owned, reward.skillId) > 0 ? ` +${skillXpBonusPercent(player.owned, reward.skillId)}%` : ""}</strong>
          </div>
        ))}
      </div>
      <ActivityDropTable activity={activity} player={player} runCount={runCount} />
      <div className="purchase-panel">
        <div>
          <strong>Run Activity</strong>
          <span>Spend RAP now. XP and drops are awarded when the run finishes.</span>
        </div>
        <button className="primary-action detail-action" disabled={!canRun} onClick={onRun}>
          Start Run
        </button>
      </div>
      {disabledReason && <p className="action-note">{disabledReason}</p>}
    </section>
  );
}

function ActivityRequirementList({ requirements, player }: { requirements: Requirement[]; player: PlayerState }) {
  return (
    <div className="requirement-list">
      <h3>Requirements</h3>
      {requirements.length === 0 ? (
        <div className="requirement-row met">
          <span className="requirement-icon">
            <Check size={14} />
          </span>
          <span className="requirement-copy">
            <strong>No requirements</strong>
            <small>Ready by default</small>
          </span>
          <span className="requirement-state">Met</span>
        </div>
      ) : (
        requirements.map((requirement) => {
          const state = getRequirementState(requirement, player);
          const key = requirement.type === "skill" ? `${requirement.skillId}-${requirement.level}` : requirement.collectibleId;
          const skill = requirement.type === "skill" ? skills.find((candidate) => candidate.id === requirement.skillId) : null;
          const currentLevel = requirement.type === "skill" ? levelFromXp(player.skillXp[requirement.skillId]) : 0;
          const label = requirement.type === "skill" ? skillName(requirement.skillId) : requirement.label;
          const detail = requirement.type === "skill" ? `Level ${currentLevel} / ${requirement.level}` : state.current;

          return (
            <div key={key} className={`requirement-row ${state.met ? "met" : ""}`}>
              <span className="requirement-icon">
                {skill?.icon ? <img src={skill.icon} alt="" draggable="false" /> : <Swords size={15} />}
                <span className="requirement-badge" aria-hidden="true">
                  {state.met ? <Check size={9} /> : <Lock size={9} />}
                </span>
              </span>
              <span className="requirement-copy">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span className="requirement-state">{state.met ? "Met" : "Needed"}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

function ActivityDropTable({
  activity,
  player,
  runCount,
}: {
  activity: GameplayActivity;
  player: PlayerState;
  runCount: number;
}) {
  return (
    <div className="drop-table">
      <h3>Drop Table</h3>
      {activity.drops.length === 0 ? (
        <p>No collectible drops yet.</p>
      ) : (
        activity.drops.map((drop) => {
          const item = activityDropItem(drop);
          const chance = activityDropChance(drop, runCount);
          const owned = item ? player.owned.includes(item.id) : false;
          const categoryName = item ? categories.find((category) => category.id === item.category)?.name ?? item.category : "Collectible";

          return (
            <div key={drop.collectibleId} className={`drop-row ${owned ? "owned" : ""}`}>
              <span className="drop-item-icon">
                {item ? <TileVisual icon={item.icon} category={item.category} owned={owned} sourceType={item.source?.type} /> : <Dice5 size={20} />}
              </span>
              <span className="drop-copy">
                <strong>{item?.name ?? drop.collectibleId}</strong>
                <small>{item ? `${item.rarity} ${categoryName}` : "Collectible Drop"}</small>
                <small>Base 1 / {drop.chance} - Current {formatDropChance(drop, runCount)}</small>
              </span>
              <span className="drop-state">{owned ? "Owned" : chance.isProtected ? "Protected" : "Unowned"}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

function RequirementList({ item, player }: { item: Collectible; player: PlayerState }) {
  return (
    <div className="requirement-list">
      <h3>Requirements</h3>
      {item.requirements.length === 0 ? (
        <div className="requirement-row met">
          <span className="requirement-icon">
            <Check size={14} />
          </span>
          <span className="requirement-copy">
            <strong>No requirements</strong>
            <small>Ready by default</small>
          </span>
          <span className="requirement-state">Met</span>
        </div>
      ) : (
        item.requirements.map((requirement) => {
          const state = getRequirementState(requirement, player);
          const key = requirement.type === "skill" ? `${requirement.skillId}-${requirement.level}` : requirement.collectibleId;
          const skill = requirement.type === "skill" ? skills.find((candidate) => candidate.id === requirement.skillId) : null;
          const requiredCollectible = requirement.type === "collectible" ? getCollectibleById(requirement.collectibleId) : null;
          const currentLevel = requirement.type === "skill" ? levelFromXp(player.skillXp[requirement.skillId]) : 0;
          const label = requirement.type === "skill" ? skillName(requirement.skillId) : requirement.label;
          const detail = requirement.type === "skill"
            ? `Level ${currentLevel} / ${requirement.level}`
            : state.current;

          return (
            <div key={key} className={`requirement-row ${state.met ? "met" : ""}`}>
              <span className="requirement-icon">
                {skill?.icon ? (
                  <img src={skill.icon} alt="" draggable="false" />
                ) : requiredCollectible?.icon ? (
                  <img src={requiredCollectible.icon} alt="" draggable="false" />
                ) : requirement.type === "skill" ? (
                  <Swords size={15} />
                ) : (
                  <AppIcon category={requiredCollectible?.category ?? item.category} />
                )}
                <span className="requirement-badge" aria-hidden="true">
                  {state.met ? <Check size={9} /> : <Lock size={9} />}
                </span>
              </span>
              <span className="requirement-copy">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span className="requirement-state">{state.met ? "Met" : "Needed"}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
