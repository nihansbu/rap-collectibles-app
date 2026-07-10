import { mkdir, writeFile } from "node:fs/promises";
import { GAMEPLAY_ACTIVITIES } from "../src/activities";
import { collectibles, CONTENT_MASTERY_TRACKS, SHARED_DROP_POOLS } from "../src/data";
import { BALANCE_RAP_PER_HOUR_SCENARIOS } from "../src/data/balance/economy";
import { masteryThreshold } from "../src/mastery";
import { buildSkillAcquisitionMatrix } from "../src/skillAcquisition";

const lines: string[] = [
  "# Balance Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "> All values are provisional. This report compares configuration; it does not lock balance.",
  "",
  "## Content Mastery",
  "",
];

for (const track of CONTENT_MASTERY_TRACKS) {
  lines.push(`### ${track.name}`, "", `Target: ${track.targetRap.toLocaleString("en-US")} base RAP`, "");
  lines.push("| Level | Base RAP | " + BALANCE_RAP_PER_HOUR_SCENARIOS.map((rate) => `${rate.toLocaleString("en-US")} RAP/h`).join(" | ") + " |", "|---:|---:|" + BALANCE_RAP_PER_HOUR_SCENARIOS.map(() => "---:").join("|") + "|");
  for (let level = 1; level <= 10; level += 1) {
    const threshold = masteryThreshold(track, level);
    lines.push(`| ${level} | ${threshold.toLocaleString("en-US")} | ${BALANCE_RAP_PER_HOUR_SCENARIOS.map((rate) => `${(threshold / rate).toFixed(1)}h`).join(" | ")} |`);
  }
  lines.push("");
}

lines.push("## Adventure XP And Drop Inputs", "", "| Adventure | Base RAP | XP Share | Direct Drops | Shared Pools |", "|---|---:|---:|---:|---:|");
for (const adventure of GAMEPLAY_ACTIVITIES) {
  const share = adventure.xpRewards.reduce((total, reward) => total + reward.share, 0);
  lines.push(`| ${adventure.name} | ${adventure.cost.toLocaleString("en-US")} | ${(share * 100).toFixed(0)}% | ${adventure.drops.length} | ${adventure.sharedDropPoolIds.length} |`);
}

lines.push("", "## Shared Chaser Pools", "");
for (const pool of SHARED_DROP_POOLS) {
  lines.push(`### ${pool.name}`, "");
  for (const entry of pool.entries) lines.push(`- ${entry.collectibleId}: 1 / ${entry.denominator.toLocaleString("en-US")} Roll Units`);
  lines.push("");
}

lines.push("## Drop Probability Milestones", "", "| Source | Drop | Base | 50% chance | 90% chance | 95% chance | Protection starts |", "|---|---|---:|---:|---:|---:|---:|");
for (const adventure of GAMEPLAY_ACTIVITIES) {
  for (const drop of adventure.drops) {
    lines.push(dropMilestoneRow(adventure.name, drop.collectibleId, drop.chance));
  }
}
for (const pool of SHARED_DROP_POOLS) {
  for (const entry of pool.entries) lines.push(dropMilestoneRow(pool.name, entry.collectibleId, entry.denominator));
}

lines.push("", "## Maximum Configured Bonus Inputs", "");
for (const track of CONTENT_MASTERY_TRACKS) {
  const passive = track.passiveBonuses.map((bonus) => `${bonus.type}: ${(bonus.percentPerLevel * 10).toFixed(1)}% at M10`).join(", ") || "milestones only";
  lines.push(`- ${track.name}: ${passive}`);
}
const collectibleBonusCount = collectibles.reduce((total, item) => total + (item.bonuses?.length ?? 0), 0);
lines.push(`- Collectible Account Bonus sources configured: ${collectibleBonusCount}`, "");

const acquisition = buildSkillAcquisitionMatrix();
const levelOneCoverage = acquisition.filter((row) => row.hasLevelOneGameplaySource);
lines.push(
  "## Skill Acquisition",
  "",
  `- Skills with a Level 1 gameplay source: ${levelOneCoverage.length}/${acquisition.length}`,
  `- Direct Training can be retired: ${levelOneCoverage.length === acquisition.length ? "Yes" : "No"}`,
  "",
  "### Missing Level 1 Gameplay Sources",
  "",
  ...acquisition.filter((row) => !row.hasLevelOneGameplaySource).map((row) => `- ${row.skillName}`),
  "",
);

await mkdir("tmp", { recursive: true });
await writeFile("tmp/balance-report.md", `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote tmp/balance-report.md (${lines.length} lines)`);

function dropMilestoneRow(source: string, collectibleId: string, denominator: number) {
  return `| ${source} | ${collectibleId} | 1 / ${denominator.toLocaleString("en-US")} | ${runsForProbability(denominator, 0.5).toLocaleString("en-US")} | ${runsForProbability(denominator, 0.9).toLocaleString("en-US")} | ${runsForProbability(denominator, 0.95).toLocaleString("en-US")} | ${(denominator * 2).toLocaleString("en-US")} |`;
}

function runsForProbability(denominator: number, target: number) {
  let missProbability = 1;
  for (let run = 1; run <= denominator * 10; run += 1) {
    const numerator = run >= denominator * 2 ? 3 : 1;
    missProbability *= 1 - Math.min(1, numerator / denominator);
    if (1 - missProbability >= target) return run;
  }
  return denominator * 10;
}
