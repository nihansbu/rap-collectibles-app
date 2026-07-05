import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  Gem,
  Lock,
  Plus,
  Search,
  Shield,
  Sparkles,
  Swords,
  Upload,
  Users,
  X,
} from "lucide-react";
import { categories, collectibles, type CategoryId, type Collectible, type Requirement, skills, type SkillId } from "./data";
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
type Page = { type: "home" } | { type: "category"; id: CategoryId };
type DetailView = { type: "collectible"; item: Collectible } | { type: "skill"; skillId: SkillId };

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
  return (
    player.rp >= item.cost &&
    requirementsMet(item, player)
  );
}

function requirementsMet(item: Collectible, player: PlayerState) {
  return item.requirements.every((requirement) => getRequirementState(requirement, player).met);
}

function collectibleActionLabel(item: Collectible, player: PlayerState) {
  if (player.owned.includes(item.id)) return "Unlocked";
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

function categoryForSkill(skillId: SkillId): CategoryId {
  void skillId;
  return "skills";
}

function isTextControl(target: EventTarget | null) {
  return target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement;
}

export function App() {
  const [player, setPlayer] = useState<PlayerState>(() => loadPlayerState());
  const [page, setPage] = useState<Page>({ type: "home" });
  const [filter, setFilter] = useState<Filter>("all");
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("default");
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const [confirmItem, setConfirmItem] = useState<Collectible | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const title = page.type === "home" ? "Collectibles" : categories.find((category) => category.id === page.id)?.name ?? "";
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
  }, [player]);

  useEffect(() => {
    setTypeFilter("all");
  }, [pageKey]);

  useEffect(() => {
    if (player.activeTrainings.length === 0) return;

    const intervalId = window.setInterval(() => {
      setPlayer((current) => processActiveTrainings(current));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [player.activeTrainings.length]);

  function grantRp() {
    setPlayer((current) => ({ ...current, rp: current.rp + 10_000 }));
  }

  function trainSkill(skillId: SkillId, hours: number) {
    setPlayer((current) => {
      if (current.rp <= 0) return current;
      return startSkillTraining(current, skillId, hours);
    });
  }

  function buyItem(item: Collectible) {
    setPlayer((current) => {
      if (current.owned.includes(item.id) || !canUnlock(item, current)) return current;
      return {
        ...current,
        rp: current.rp - item.cost,
        owned: [...current.owned, item.id],
      };
    });
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
    setPage({ type: "home" });
    setDetailView(null);
    setImportOpen(false);
    setImportText("");
    setSaveMessage("Save imported.");
  }

  const categoryProgress = useMemo(() => {
    return categories.map((category) => {
      if (category.id === "skills") {
        const totalLevel = skills.reduce((total, skill) => total + levelFromXp(player.skillXp[skill.id]), 0);
        return { ...category, unlocked: totalLevel, total: skills.length * MAX_LEVEL };
      }

      const items = collectibles.filter((item) => item.category === category.id);
      const unlocked = items.filter((item) => player.owned.includes(item.id)).length;
      return { ...category, unlocked, total: items.length };
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
        canGoBack={page.type !== "home" || detailView !== null}
        onBack={() => {
          if (detailView) {
            setDetailView(null);
            return;
          }
          setPage({ type: "home" });
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
        ) : page.type === "home" ? (
          <HomePage
            progress={categoryProgress}
            saveMessage={saveMessage}
            onExportSave={exportSave}
            onImportSave={() => {
              setImportOpen(true);
              setSaveMessage("");
            }}
            onOpen={(id) => setPage({ type: "category", id })}
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

function HomePage({
  progress,
  saveMessage,
  onExportSave,
  onImportSave,
  onOpen,
}: {
  progress: Array<{ id: CategoryId; name: string; totalLabel: string; unlocked: number; total: number }>;
  saveMessage: string;
  onExportSave: () => void;
  onImportSave: () => void;
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
              {category.unlocked}/{category.total}
            </span>
            <ChevronRight className="tile-chevron" size={18} />
          </button>
        ))}
      </section>
      <section className="save-tools" aria-label="Save tools">
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
      const locked = !owned && !requirementsMet(item, player);
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
      className={`icon-tile ${status}`}
      onClick={() => onOpenDetails(item)}
    >
      <TileVisual icon={item.icon} category={item.category} locked={status === "locked"} owned={owned} />
      <h2>{item.name}</h2>
      <span>{item.type}</span>
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
}: {
  icon?: string;
  category: CategoryId;
  locked?: boolean;
  owned?: boolean;
}) {
  return (
    <div className={`tile-art ${locked ? "locked" : ""} ${owned ? "owned" : ""}`}>
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
  const purchaseNote = owned
    ? "Already added to your Codex."
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
        <span className={`status-pill ${status}`}>{statusLabel[status]}</span>
        <span>{formatNumber(item.cost)} RAP</span>
      </div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <div className="sheet-meta">
        <span className={rarityClass[item.rarity]}>{item.rarity}</span>
        <span>{item.type}</span>
      </div>
      <RequirementList item={item} player={player} />
      <div className="purchase-panel">
        <div>
          <strong>Unlock</strong>
          <span>{purchaseNote}</span>
        </div>
        <button className="primary-action detail-action" disabled={!unlockable} onClick={onBuy}>
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

function RequirementList({ item, player }: { item: Collectible; player: PlayerState }) {
  return (
    <div className="requirement-list">
      <h3>Requirements</h3>
      {item.requirements.length === 0 ? (
        <div className="requirement-row met">
          <Check size={15} />
          <span>No requirements</span>
        </div>
      ) : (
        item.requirements.map((requirement) => {
          const state = getRequirementState(requirement, player);
          return (
            <div key={state.label} className={`requirement-row ${state.met ? "met" : ""}`}>
              {state.met ? <Check size={15} /> : <Lock size={15} />}
              <span>{state.label}</span>
              <small>{state.current}</small>
            </div>
          );
        })
      )}
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
