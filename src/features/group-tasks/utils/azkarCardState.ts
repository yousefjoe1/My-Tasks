import { AZKAR_NAMES } from '../constants/azkarCatalog';
import type { AzkarCardState, AzkarTaskRow, AzkarUserTaskRow } from '../types/azkar';

export function createInitialCards(): AzkarCardState[] {
  return AZKAR_NAMES.map((name) => ({
    name,
    taskId: null,
    savedCount: 0,
    pendingDelta: 0,
    savedDurationSeconds: 0,
    pendingDurationSeconds: 0,
    timerStartedAt: null,
    saving: false,
  }));
}

export function resetCardsToEmpty(): AzkarCardState[] {
  return createInitialCards();
}

export function getLiveSeconds(card: AzkarCardState, nowMs: number): number {
  if (card.timerStartedAt == null) return 0;
  return Math.floor((nowMs - card.timerStartedAt) / 1000);
}

export function getDisplayedCount(card: AzkarCardState): number {
  return card.savedCount + card.pendingDelta;
}

export function getDisplayedDurationSeconds(card: AzkarCardState, nowMs: number): number {
  return (
    card.savedDurationSeconds +
    card.pendingDurationSeconds +
    getLiveSeconds(card, nowMs)
  );
}

export function mergeLoadedIntoCards(
  previous: AzkarCardState[],
  tasks: AzkarTaskRow[],
  userTasks: AzkarUserTaskRow[],
): AzkarCardState[] {
  const prevByName = new Map(previous.map((c) => [c.name, c]));

  return AZKAR_NAMES.map((name) => {
    const prev = prevByName.get(name) ?? {
      name,
      taskId: null,
      savedCount: 0,
      pendingDelta: 0,
      savedDurationSeconds: 0,
      pendingDurationSeconds: 0,
      timerStartedAt: null,
      saving: false,
    };
    const task = tasks.find((t) => t.name === name);
    const userTask = task ? userTasks.find((ut) => ut.task_id === task.id) : undefined;

    return {
      ...prev,
      name,
      taskId: task?.id ?? null,
      savedCount: userTask?.count ?? 0,
      savedDurationSeconds: userTask?.duration_seconds ?? 0,
    };
  });
}

export function sumOverviewUserCount(
  userTasks: { count: number | null }[] | undefined,
): number {
  return (userTasks ?? []).reduce((sum, ut) => sum + (ut.count ?? 0), 0);
}

export function sumOverviewUserDuration(
  userTasks: { duration_seconds: number | null }[] | undefined,
): number {
  return (userTasks ?? []).reduce((sum, ut) => sum + (ut.duration_seconds ?? 0), 0);
}
