import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Check,
  ChevronRight,
  Compass,
  Dice5,
  Download,
  Dumbbell,
  Footprints,
  Gem,
  Headphones,
  Lock,
  Music,
  Plus,
  Search,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  activityDropChance,
  activityDropItem,
  activityRequirementsMet,
  canStartActivity,
  formatDropChance,
  GAMEPLAY_ACTIVITIES,
  getActivity,
  isActivityRunning,
  processActiveActivityRuns,
  startActivityRun,
  type GameplayActivity,
  type GameplayActivityId,
} from "./activities";
import { categories, collectibles, type CategoryId, type Collectible, type Requirement, skills, type SkillId } from "./data";
import { ACTIVITY_OPTIONS, activityRap, type ActivityLogEntry, type ActivityOption } from "./economy";
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
type CollectibleStatus = "owned" | "ready" | "locked";
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

const rarityClass: Record<Collectible["rarity"], string> = {
  Common: "rarity-common",
  Uncommon: "rarity-uncommon",
  Rare: "rarity-rare",
  Epic: "rarity-epic",
  Legendary: "rarity-legendary",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.floor(value));
}

function completionPercent(unlocked: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((unlocked / total) * 100));
}

function formatSavedTime(date: Date | null) {
  if (!date) return "Not saved yet";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function skillName(skillId: SkillId) {
  return skills.find((skill) => skill.id === skillId)?.name ?? skillId;
}

function highestRequirement(item: Collectible) {
  return item.requirements.reduce((highest, requirement) => {
    if (requirement.type !== "skill") return highest;
    return Math.max(highest, requirement.level);
  }, 0);
}

function getRequirementState(requirement: Requirement, player: PlayerState) {
  if (requirement.type === "collectible") {
    return {
      label: requirement.label,
      met: player.owned.includes(requirement.collectibleId),
      current: player.owned.includes(requirement.collectibleId) ? "Owned" : "Missing",
    };
  }

  const currentLevel = levelFromXp(player.skillXp[requirement.skillId]);
  return {
    label: `${skillName(requirement.skillId)} ${requirement.level}`,
    met: currentLevel >= requirement.level,
    current: `Level ${currentLevel}`,
  };
}

function canUnlock(item: Collectible, player: PlayerState) {
  if (isActivityDrop(item)) return false;
  return (
    player.rp >= item.cost &&
    requirementsMet(item, player)
  );
}

function requirementsMet(item: Collectible, player: PlayerState) {
  return item.requirements.every((requirement) => getRequirementState(requirement, player).met);
}

function isActivityDrop(item: Collectible) {
  return item.source?.type === "activity";
}

function collectibleActionLabel(item: Collectible, player: PlayerState) {
  if (player.owned.includes(item.id)) return "Unlocked";
  if (isActivityDrop(item)) return "Activity Drop";
  if (!requirementsMet(item, player)) return "Requirements not met";
  if (player.rp < item.cost) return "Not enough RAP";
  return "Buy";
}

const statusLabel: Record<CollectibleStatus, string> = {
  owned: "Owned",
  ready: "Ready",
  locked: "Locked",
};

function collectibleStatus(item: Collectible, player: PlayerState): CollectibleStatus {
  if (player.owned.includes(item.id)) return "owned";
  if (isActivityDrop(item)) return "locked";
  if (requirementsMet(item, player)) return "ready";
  return "locked";
}

function collectibleStatusRank(item: Collectible, player: PlayerState) {
  const status = collectibleStatus(item, player);
  if (status === "owned") return 0;
  if (status === "ready") return 1;
  return 2;
}

function skillNameFontSize(name: string) {
  if (name.length >= 12) return "7.2px";
  if (name.length >= 11) return "7.7px";
  if (name.length >= 10) return "8.4px";
  return "10px";
}

function AppIcon({ category }: { category: CategoryId }) {
  const common = { size: 22, strokeWidth: 1.8 };
  if (category === "characters") return <Shield {...common} />;
  if (category === "classes") return <BookOpen {...common} />;
  if (category === "races") return <Users {...common} />;
  if (category === "skills") return <Swords {...common} />;
  if (category === "pets") return <Sparkles {...common} />;
  return <Gem {...common} />;
}

function ActivityIcon({ activityId }: { activityId: ActivityOption["id"] }) {
  const common = { size: 18, strokeWidth: 1.9 };
  if (activityId === "walking") return <Footprints {...common} />;
  if (activityId === "reading") return <BookOpen {...common} />;
  if (activityId === "podcast") return <Headphones {...common} />;
  if (activityId === "gym") return <Dumbbell {...common} />;
  if (activityId === "work") return <Briefcase {...common} />;
  return <Music {...common} />;
}

function GameplayActivityIcon({ activity }: { activity: GameplayActivity }) {
  const common = { size: 28, strokeWidth: 1.75 };
  if (activity.type === "Fishing") return <Anchor {...common} />;
  if (activity.type === "Ritual") return <Sparkles {...common} />;
  if (activity.type === "Crafting") return <Gem {...common} />;
  if (activity.type === "Gathering") return <Compass {...common} />;
  return <Dice5 {...common} />;
}

function categoryForSkill(skillId: SkillId): CategoryId {
  void skillId;
  return "skills";
}

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
    const droppedItem = latest.droppedCollectibleId
      ? collectibles.find((item) => item.id === latest.droppedCollectibleId)
      : null;

    if (droppedItem) {
      setUnlockNotice(droppedItem);
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

      const items = collectibles.filter((item) => item.category === category.id);
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
    </div>
  );
}

function TopBar({
  title,
  rp,
  canGoBack,
  onBack,
  onGrantRp,
}: {
  title: string;
  rp: number;
  canGoBack: boolean;
  onBack: () => void;
  onGrantRp: () => void;
}) {
  return (
    <header className="topbar">
      <div className="title-cluster">
        {canGoBack && (
          <button className="icon-button ghost" onClick={onBack} aria-label="Back">
            <ArrowLeft size={19} />
          </button>
        )}
        <h1>{title}</h1>
      </div>
      <div className="wallet">
        <span>{formatNumber(rp)} RAP</span>
        <button className="icon-button add" onClick={onGrantRp} aria-label="Add 10,000 RAP">
          <Plus size={18} />
        </button>
      </div>
    </header>
  );
}

function MainMenuPage({
  activities,
  activityLog,
  lifetimeRap,
  lastSavedAt,
  saveMessage,
  onLogActivity,
  onExportSave,
  onImportSave,
  onOpenCollectibles,
  onOpenAdventure,
  onOpenHandbook,
}: {
  activities: ActivityOption[];
  activityLog: ActivityLogEntry[];
  lifetimeRap: number;
  lastSavedAt: Date | null;
  saveMessage: string;
  onLogActivity: (activity: ActivityOption) => void;
  onExportSave: () => void;
  onImportSave: () => void;
  onOpenCollectibles: () => void;
  onOpenAdventure: () => void;
  onOpenHandbook: () => void;
}) {
  return (
    <>
      <section className="tile-grid main-menu-grid">
        <button className="category-tile main-menu-tile" onClick={onOpenCollectibles}>
          <span className="tile-icon">
            <Gem size={23} strokeWidth={1.8} />
          </span>
          <span className="tile-text">
            <strong>Collectibles</strong>
            <small>Codex, skills, pets, mounts, classes, races</small>
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
        <button className="category-tile main-menu-tile adventure-entry" onClick={onOpenAdventure}>
          <span className="tile-icon">
            <Compass size={23} strokeWidth={1.8} />
          </span>
          <span className="tile-text">
            <strong>Adventure</strong>
            <small>Activities and future gameplay systems</small>
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
        <button className="category-tile main-menu-tile handbook-entry" onClick={onOpenHandbook}>
          <span className="tile-icon">
            <BookOpen size={23} strokeWidth={1.8} />
          </span>
          <span className="tile-text">
            <strong>Handbook</strong>
            <small>Rules, progression, drops, and Codex states</small>
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
      </section>
      <section className="activity-panel" aria-label="Activity log">
        <div className="section-heading">
          <h2>Log Activity</h2>
          <span>1 hour</span>
        </div>
        <div className="activity-grid">
          {activities.map((activity) => (
            <button key={activity.id} className="activity-action" onClick={() => onLogActivity(activity)}>
              <span>
                <ActivityIcon activityId={activity.id} />
              </span>
              <strong>{activity.name}</strong>
              <small>+{formatNumber(activity.rapPerHour)} RAP</small>
            </button>
          ))}
        </div>
        {activityLog.length > 0 && (
          <div className="activity-history" aria-label="Recent activity history">
            {activityLog.slice(0, 3).map((entry) => (
              <span key={entry.id}>
                <strong>{entry.name}</strong>
                <small>+{formatNumber(entry.rap)} RAP</small>
              </span>
            ))}
          </div>
        )}
      </section>
      <section className="save-tools" aria-label="Save tools">
        <div className="save-status">
          <strong>Save Status</strong>
          <span>Autosaved {formatSavedTime(lastSavedAt)}</span>
          <small>{formatNumber(lifetimeRap)} lifetime RAP earned</small>
        </div>
        <button className="tool-action" onClick={onExportSave}>
          <Download size={16} />
          <span>Export Save</span>
        </button>
        <button className="tool-action" onClick={onImportSave}>
          <Upload size={16} />
          <span>Import Save</span>
        </button>
        {saveMessage && <p>{saveMessage}</p>}
      </section>
    </>
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
      {player.activityResults.length > 0 && (
        <section className="recent-unlocks activity-results" aria-label="Recent activity results">
          <h2>Recent Activity Results</h2>
          <div>
            {player.activityResults.slice(0, 3).map((result) => {
              const item = result.droppedCollectibleId ? collectibles.find((candidate) => candidate.id === result.droppedCollectibleId) : null;
              return (
                <article key={result.id} className="recent-unlock">
                  <span className="mini-result-icon">
                    {item ? <TileVisual icon={item.icon} category={item.category} owned sourceType={item.source?.type} /> : <Trophy size={20} />}
                  </span>
                  <span>
                    <strong>{result.activityName}</strong>
                    <small>{item ? `${item.name} dropped` : `${result.xp.map((entry) => `${skillName(entry.skillId)} +${formatNumber(entry.amount)}`).join(", ")}`}</small>
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

function HandbookPage() {
  return (
    <section className="handbook-page" aria-label="Handbook">
      <article className="handbook-section">
        <h2>Basics</h2>
        <p>
          Earn RAP, train Skills, unlock Collectibles, and run Activities to fill your Codex over time.
        </p>
      </article>
      <article className="handbook-section">
        <h2>RAP</h2>
        <p>
          RAP means Real Life Activity Points. RAP is spent on Skill training, direct Collectible unlocks, and repeatable Activities.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Skills</h2>
        <p>
          Skills use RuneScape-style XP and can reach Level 120. Skill levels unlock Collectibles and Activities.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Activities</h2>
        <p>
          Activities cost RAP, run for a set duration, then award XP and roll their Drop Table. Activity XP is less efficient than direct Skill training because Activities can also drop exclusive Collectibles.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Drops</h2>
        <p>
          Every unowned drop in an Activity table is rolled when the Activity finishes. A run can award at most one Collectible. If multiple drops succeed, the rarest successful drop is awarded.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Bad Luck Protection</h2>
        <p>
          When completed runs reach twice a drop's base denominator, that drop's chance is tripled. Example: a 1 / 500 drop becomes 3 / 500 at 1,000 runs.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Codex States</h2>
        <ul>
          <li>Green means owned.</li>
          <li>Yellow means requirements are met, but RAP may still be needed.</li>
          <li>Red means locked or not yet obtained.</li>
          <li>Indigo marks Activity-drop Collectibles.</li>
        </ul>
      </article>
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
        <strong>{formatNumber(activity.cost)} RAP</strong>
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
  const categoryItems = useMemo(() => collectibles.filter((item) => item.category === category), [category]);
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
      return collectibles.indexOf(a) - collectibles.indexOf(b);
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

function TileVisual({
  icon,
  category,
  locked = false,
  owned = false,
  sourceType,
}: {
  icon?: string;
  category: CategoryId;
  locked?: boolean;
  owned?: boolean;
  sourceType?: Collectible["source"] extends infer Source ? Source extends { type: infer Type } ? Type : never : never;
}) {
  return (
    <div className={`tile-art ${locked ? "locked" : ""} ${owned ? "owned" : ""} ${sourceType === "activity" ? "activity-source" : ""}`}>
      {icon ? <img src={icon} alt="" draggable="false" /> : <AppIcon category={category} />}
      {locked && (
        <span className="tile-lock" aria-hidden="true">
          <Lock size={12} />
        </span>
      )}
      {owned && (
        <span className="tile-owned" aria-hidden="true">
          <Check size={12} />
        </span>
      )}
    </div>
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
  const sourceActivity = item.source?.type === "activity" ? getActivity(item.source.activityId) : null;
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
  const canRun = canStartActivity(activity, player);
  const now = Date.now();
  const runProgress = activeRun
    ? Math.min(100, Math.max(3, ((now - activeRun.startedAt) / (activeRun.endsAt - activeRun.startedAt)) * 100))
    : 0;
  const disabledReason = activeRun
    ? "Activity already running"
    : !requirementsReady
      ? "Requirements not met"
      : player.rp < activity.cost
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
        <span>{formatNumber(activity.cost)} RAP</span>
        <span>{formatDuration(activity.runtimeMs)}</span>
      </div>
      <h2>{activity.name}</h2>
      <p>{activity.description}</p>
      <div className="sheet-meta">
        <span>{activity.type}</span>
        <span>{formatNumber(runCount)} Runs</span>
        <span>75% XP efficiency</span>
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
            <strong>{Math.round(reward.share * 100)}%</strong>
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

          return (
            <div key={drop.collectibleId} className={`drop-row ${owned ? "owned" : ""}`}>
              <span className="drop-item-icon">
                {item ? <TileVisual icon={item.icon} category={item.category} owned={owned} sourceType={item.source?.type} /> : <Dice5 size={20} />}
              </span>
              <span className="drop-copy">
                <strong>{item?.name ?? drop.collectibleId}</strong>
                <small>
                  Base 1 / {drop.chance} - Current {formatDropChance(drop, runCount)}
                </small>
                <small>
                  Base 1 / {drop.chance} · Current {formatDropChance(drop, runCount)}
                </small>
                <small>
                  Bad Luck Protection at {formatNumber(chance.badLuckActiveAt)} runs{chance.isProtected ? " · active" : ""}
                </small>
              </span>
              <span className="drop-state">{owned ? "Owned" : chance.isProtected ? "Protected" : item?.rarity ?? "Drop"}</span>
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
          const requiredCollectible = requirement.type === "collectible" ? collectibles.find((candidate) => candidate.id === requirement.collectibleId) : null;
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

function UnlockNotice({ item, onClose }: { item: Collectible; onClose: () => void }) {
  const categoryName = categories.find((category) => category.id === item.category)?.name ?? "Collectibles";

  return (
    <div className="sheet-backdrop unlock-backdrop" role="presentation" onClick={onClose}>
      <section className="unlock-notice" role="dialog" aria-modal="true" aria-label={`${item.name} unlocked`} onClick={(event) => event.stopPropagation()}>
        <div className="unlock-burst">
          <TileVisual icon={item.icon} category={item.category} owned />
        </div>
        <span className="unlock-kicker">Unlocked</span>
        <h2>{item.name}</h2>
        <p>Added to your {categoryName} Codex.</p>
        <button className="primary-action" onClick={onClose}>
          Continue
        </button>
      </section>
    </div>
  );
}

function ConfirmDialog({ item, onCancel, onConfirm }: { item: Collectible; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onCancel}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-label="Confirm purchase" onClick={(event) => event.stopPropagation()}>
        <h2>Buy {item.name}?</h2>
        <p>This will spend {formatNumber(item.cost)} RAP and unlock it in your Codex.</p>
        <div className="dialog-actions">
          <button className="secondary-action" onClick={onCancel}>
            No
          </button>
          <button className="primary-action" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </section>
    </div>
  );
}

function ImportDialog({
  value,
  onChange,
  onCancel,
  onImport,
}: {
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onImport: () => void;
}) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onCancel}>
      <section className="confirm-dialog import-dialog" role="dialog" aria-modal="true" aria-label="Import save" onClick={(event) => event.stopPropagation()}>
        <h2>Import Save</h2>
        <p>Paste a RAP save JSON file. Importing replaces the current local progress.</p>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste save JSON"
          aria-label="Save JSON"
        />
        <div className="dialog-actions">
          <button className="secondary-action" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-action" disabled={value.trim().length === 0} onClick={onImport}>
            Import
          </button>
        </div>
      </section>
    </div>
  );
}
