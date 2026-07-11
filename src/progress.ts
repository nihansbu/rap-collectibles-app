import { processActiveActivityRuns } from "./activities";
import { processActiveQuests } from "./quests";
import { processActiveTrainings } from "./training";

export function processPlayerProgress<T extends Parameters<typeof processActiveQuests>[0] & Parameters<typeof processActiveTrainings>[0] & Parameters<typeof processActiveActivityRuns>[0]>(player: T, now = Date.now()): T {
  return processActiveQuests(processActiveActivityRuns(processActiveTrainings(player, now), now), now);
}
