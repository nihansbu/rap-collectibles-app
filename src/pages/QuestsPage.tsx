import { Check, ChevronRight, Clock3, Coins, Lock, Pause, Play, Star } from "lucide-react";
import { collectibles, QUEST_CAMPAIGNS, skills, type QuestCampaignDefinition, type QuestDefinition, type QuestRequirement, type QuestReward } from "../data";
import { formatNumber } from "../format";
import {
  campaignHasActiveQuest,
  campaignProgress,
  canStartQuest,
  chapterHasActiveQuest,
  chaptersForCampaign,
  getQuest,
  getQuestCampaign,
  getQuestChapter,
  isCampaignCompleted,
  isChapterCompleted,
  questPoints,
  questProgress,
  questRapPerHour,
  questRequirementMet,
  requiredRapToStartQuest,
  questStatus,
  questsForChapter,
  remainingQuestMs,
  type QuestPlayerState,
  type QuestStatus,
} from "../quests";
import { getSpecialization } from "../specializations";
import { formatDuration } from "../training";
import { levelFromXp } from "../xp";

export function QuestCampaignOverviewPage({
  player,
  onOpenCampaign,
}: {
  player: QuestPlayerState;
  onOpenCampaign: (campaignId: string) => void;
}) {
  return (
    <section className="quest-overview" aria-label="Quest campaigns">
      <div className="quest-summary-line">
        <span><Star size={17} /> <strong>{formatNumber(questPoints(player))}</strong> Quest Points</span>
        <span><Play size={15} /> <strong>{player.activeQuests.length}</strong> Active</span>
      </div>
      <div className="section-heading quest-heading"><h2>Campaigns</h2><span /></div>
      <div className="campaign-grid">
        {QUEST_CAMPAIGNS.map((campaign) => (
          <CampaignTile key={campaign.id} campaign={campaign} player={player} onOpen={() => onOpenCampaign(campaign.id)} />
        ))}
      </div>
    </section>
  );
}

function CampaignTile({ campaign, player, onOpen }: { campaign: QuestCampaignDefinition; player: QuestPlayerState; onOpen: () => void }) {
  const progress = campaignProgress(player, campaign);
  const active = campaignHasActiveQuest(player, campaign.id);
  const completed = isCampaignCompleted(player, campaign.id);
  return (
    <button className={`campaign-tile ${active ? "active" : ""} ${completed ? "completed" : ""}`} onClick={onOpen}>
      <span className="campaign-art"><img src={campaign.icon} alt="" />{completed && <i><Check size={13} /></i>}</span>
      <strong>{campaign.name}</strong>
      <span className="chapter-dots" aria-label={`${progress.completed} of ${progress.total} chapters completed`}>
        {campaign.chapterIds.map((chapterId, index) => <i key={chapterId} className={index < progress.completed ? "filled" : ""} />)}
      </span>
      <small>{progress.completed} / {progress.total}</small>
    </button>
  );
}

export function QuestCampaignPage({ player, campaignId, onOpenChapter, onOpenFinale }: {
  player: QuestPlayerState;
  campaignId: string;
  onOpenChapter: (chapterId: string) => void;
  onOpenFinale: (questId: string) => void;
}) {
  const campaign = getQuestCampaign(campaignId)!;
  const chapters = chaptersForCampaign(campaignId);
  const progress = campaignProgress(player, campaign);
  const finale = getQuest(campaign.finaleQuestId)!;
  const finaleStatus = questStatus(player, finale);
  return (
    <section className="campaign-page" aria-label={`${campaign.name} chapters`}>
      <header className="campaign-page-header">
        <img src={campaign.icon} alt="" />
        <span><small>Campaign</small><h2>{campaign.name}</h2><p>{campaign.introduction}</p></span>
        <b>{progress.completed}/{progress.total}</b>
      </header>
      <div className="section-heading quest-heading"><h2>Chapters</h2><span /></div>
      <div className="chapter-grid">
        {chapters.map((chapter) => {
          const completed = isChapterCompleted(player, chapter.id);
          const active = chapterHasActiveQuest(player, chapter.id);
          const completedQuests = chapter.questIds.filter((questId) => player.completedQuests[questId] !== undefined).length;
          const firstQuest = getQuest(chapter.questIds[0])!;
          const unlocked = completed || active || questStatus(player, firstQuest) !== "locked";
          return (
            <button key={chapter.id} className={`chapter-tile ${completed ? "completed" : active ? "active" : unlocked ? "ready" : "locked"}`} onClick={() => onOpenChapter(chapter.id)}>
              <span className="chapter-art"><img src={chapter.icon} alt="" />{!unlocked && <i><Lock size={12} /></i>}</span>
              <small>Chapter {chapter.number}</small>
              <strong>{chapter.name}</strong>
              <span className="chapter-quest-progress">{completedQuests} / {chapter.questIds.length} Quests</span>
            </button>
          );
        })}
      </div>
      <div className="section-heading quest-heading finale-heading"><h2>Campaign Finale</h2><span /></div>
      <button className={`campaign-finale-tile ${finaleStatus}`} onClick={() => onOpenFinale(finale.id)}>
        <span><img src={finale.icon} alt="" /></span>
        <span><small>Final Quest</small><strong>{finale.name}</strong><em>{statusLabel(finaleStatus)}</em></span>
        <ChevronRight size={18} />
      </button>
    </section>
  );
}

export function QuestChapterPage({ player, chapterId, onOpenQuest }: {
  player: QuestPlayerState;
  chapterId: string;
  onOpenQuest: (questId: string) => void;
}) {
  const chapter = getQuestChapter(chapterId)!;
  const campaign = getQuestCampaign(chapter.campaignId)!;
  const quests = questsForChapter(chapterId);
  const completed = quests.filter((quest) => player.completedQuests[quest.id] !== undefined).length;
  const rows = [...new Set(quests.map((quest) => quest.row))].sort((a, b) => a - b);
  return (
    <section className="quest-chapter-page" aria-label={`${chapter.name} quest tree`}>
      <header className="chapter-tree-header">
        <small>{campaign.name} · Chapter {chapter.number}</small>
        <h2>{chapter.name}</h2>
        <p>{chapter.prologue}</p>
        <div><strong>{completed} / {quests.length} Quests</strong><span><i style={{ width: `${(completed / quests.length) * 100}%` }} /></span></div>
      </header>
      <div className="quest-tree">
        {rows.map((row, rowIndex) => {
          const rowQuests = quests.filter((quest) => quest.row === row);
          return (
            <div className={`quest-tree-stage ${rowQuests.length > 1 ? "branch" : "single"}`} key={row}>
              {rowIndex > 0 && <span className="quest-tree-connector" aria-hidden="true" />}
              <div className="quest-tree-lanes">
                {([0, 1, 2] as const).map((lane) => {
                  const quest = rowQuests.find((entry) => entry.lane === lane);
                  return quest ? <QuestNode key={quest.id} quest={quest} player={player} onOpen={() => onOpenQuest(quest.id)} /> : <span key={lane} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      {isChapterCompleted(player, chapter.id) && <p className="chapter-epilogue"><Check size={16} /> {chapter.epilogue}</p>}
    </section>
  );
}

function QuestNode({ quest, player, onOpen }: { quest: QuestDefinition; player: QuestPlayerState; onOpen: () => void }) {
  const status = questStatus(player, quest);
  const active = player.activeQuests.find((entry) => entry.questId === quest.id);
  const progress = active ? questProgress(active, quest) : status === "completed" ? 1 : 0;
  return (
    <button className={`quest-node ${status}`} onClick={onOpen} aria-label={`${quest.name}. ${statusLabel(status)}.`}>
      <span className="quest-node-ring" style={{ "--quest-progress": `${progress * 100}%` } as React.CSSProperties}>
        <span><img src={quest.icon} alt="" />{status === "locked" && <i><Lock size={12} /></i>}{status === "completed" && <i><Check size={13} /></i>}</span>
      </span>
      <strong>{quest.name}</strong>
      {active && <small>{status === "waiting" ? "Waiting for RAP" : formatDuration(remainingQuestMs(active, quest))}</small>}
    </button>
  );
}

export function QuestDetailPage({ player, questId, onStart }: { player: QuestPlayerState; questId: string; onStart: () => void }) {
  const quest = getQuest(questId)!;
  const campaign = getQuestCampaign(quest.campaignId)!;
  const chapter = quest.chapterId ? getQuestChapter(quest.chapterId) : null;
  const status = questStatus(player, quest);
  const active = player.activeQuests.find((entry) => entry.questId === quest.id);
  const canStart = canStartQuest(player, quest);
  const missingStartRap = Math.max(0, requiredRapToStartQuest(player, quest) - player.rp);
  return (
    <section className={`quest-detail-page ${status}`} aria-label={`${quest.name} quest details`}>
      <header className="quest-detail-hero">
        <span className="quest-detail-art"><img src={quest.icon} alt={quest.name} /></span>
        <span className={`quest-status-pill ${status}`}>{statusLabel(status)}</span>
        <small>{campaign.name}{chapter ? ` · Chapter ${chapter.number}` : " · Campaign Finale"}</small>
        <h2>{quest.name}</h2>
        <p>{status === "completed" ? quest.completionStory : quest.startStory}</p>
      </header>
      <section className="quest-detail-section">
        <h3>Requirements</h3>
        <div className="quest-requirement-grid">
          {quest.requirements.map((requirement, index) => <QuestRequirementTile key={`${requirement.type}-${index}`} requirement={requirement} player={player} />)}
        </div>
      </section>
      <div className="quest-funding-grid">
        <div><Coins size={18} /><strong>{formatNumber(quest.totalRapCost)}</strong><small>RAP total</small></div>
        <div><Clock3 size={18} /><strong>{formatDuration(quest.durationMs)}</strong><small>duration</small></div>
        <div><Pause size={18} /><strong>{formatNumber(questRapPerHour(quest))}</strong><small>RAP/h</small></div>
      </div>
      {active && (
        <div className={`quest-active-progress ${status}`}>
          <span><strong>{Math.round(questProgress(active, quest) * 100)}% funded</strong><small>{formatDuration(remainingQuestMs(active, quest))} remaining</small></span>
          <i><b style={{ width: `${questProgress(active, quest) * 100}%` }} /></i>
          <p>{status === "waiting" ? "Waiting for RAP. Progress resumes automatically when RAP is added." : "Quest funding is active."}</p>
        </div>
      )}
      <p className="quest-funding-note">Progress pauses without RAP and resumes automatically. Paused time is never charged retroactively.</p>
      <section className="quest-detail-section">
        <h3>Rewards</h3>
        <div className="quest-reward-grid">{quest.rewards.map((reward, index) => <QuestRewardTile key={`${reward.type}-${index}`} reward={reward} />)}</div>
      </section>
      {status === "ready" && <p className="quest-commitment-warning">Cannot be cancelled once started.</p>}
      {status === "ready" && <button className="primary-action quest-start-button" disabled={!canStart} onClick={onStart}>{canStart ? "Start Quest" : missingStartRap > 0 ? `Need ${formatNumber(missingStartRap)} RAP` : "Maximum 3 active quests"}</button>}
      {status === "completed" && <div className="quest-complete-banner"><Check size={18} /><strong>Quest Completed</strong></div>}
    </section>
  );
}

function QuestRequirementTile({ requirement, player }: { requirement: QuestRequirement; player: QuestPlayerState }) {
  const met = questRequirementMet(player, requirement);
  return <div className={`quest-requirement-tile ${met ? "met" : "needed"}`}><span>{met ? <Check size={15} /> : <Lock size={14} />}</span><strong>{requirementLabel(requirement, player)}</strong></div>;
}

function requirementLabel(requirement: QuestRequirement, player: QuestPlayerState) {
  switch (requirement.type) {
    case "skill": return `${skills.find((skill) => skill.id === requirement.skillId)?.name ?? requirement.skillId} ${levelFromXp(player.skillXp[requirement.skillId] ?? 0)} / ${requirement.level}`;
    case "specialization": return `${getSpecialization(requirement.specializationId)?.name ?? requirement.specializationId} ${levelFromXp(player.specializationXp[requirement.specializationId] ?? 0)} / ${requirement.level}`;
    case "collectible": return requirement.label;
    case "quest": return getQuest(requirement.questId)?.name ?? requirement.questId;
    case "chapter": return getQuestChapter(requirement.chapterId)?.name ?? requirement.chapterId;
    case "quest-points": return `${questPoints(player)} / ${requirement.points} QP`;
  }
}

function QuestRewardTile({ reward }: { reward: QuestReward }) {
  return <div className="quest-reward-tile"><Star size={16} /><strong>{rewardLabel(reward)}</strong></div>;
}

function rewardLabel(reward: QuestReward) {
  switch (reward.type) {
    case "quest-points": return `${reward.points} QP`;
    case "skill-xp": return `${formatNumber(reward.amount)} ${skills.find((skill) => skill.id === reward.skillId)?.name ?? reward.skillId} XP`;
    case "specialization-xp": return `${formatNumber(reward.amount)} ${getSpecialization(reward.specializationId)?.name ?? "Specialization"} XP`;
    case "rap": return `${formatNumber(reward.amount)} RAP`;
    case "cosmetic": return reward.cosmeticId === "title-oathbound" ? "Oathbound Title" : "Profile Cosmetic";
    case "collectible": return collectibles.find((item) => item.id === reward.collectibleId)?.name ?? "Collectible";
  }
}

function statusLabel(status: QuestStatus) {
  if (status === "waiting") return "Waiting for RAP";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
