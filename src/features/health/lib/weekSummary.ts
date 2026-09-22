import { addDays, parseISO, startOfWeek } from "date-fns";
import { getWeekDays } from "@/lib/utils";
import { getCairoDateKey, getCairoDateKeyFromIso } from "@/features/health/lib/cairoDate";
import type { HealthExercise } from "@/features/health/types";
import type { ExerciseWeekStats, HealthWeekSummary } from "@/features/health/types";

type CompletionRow = {
  exercise_id: string;
  reps: number;
  completed_at: string;
};

export function parseWeekStartKey(weekStartKey: string): Date {
  return parseISO(`${weekStartKey}T12:00:00`);
}

export function getCurrentWeekStartKey(reference = new Date()): string {
  return getCairoDateKey(startOfWeek(reference, { weekStartsOn: 1 }));
}

export function listActivityWeekStartKeys(
  completions: { completed_at: string }[],
  reference = new Date()
): string[] {
  const keys = new Set<string>();
  keys.add(getCurrentWeekStartKey(reference));

  for (const row of completions) {
    const completed = new Date(row.completed_at);
    keys.add(getCurrentWeekStartKey(completed));
  }

  return Array.from(keys).sort().reverse();
}

export function getCurrentWeekDateKeys(reference = new Date()): { dayKey: string; dateKey: string }[] {
  const weekStart = startOfWeek(reference, { weekStartsOn: 1 });
  const labels = getWeekDays();

  return labels.map((dayKey, index) => {
    const date = addDays(weekStart, index);
    return { dayKey, dateKey: getCairoDateKey(date) };
  });
}

export function buildHealthWeekSummary(
  exercises: HealthExercise[],
  completions: CompletionRow[],
  reference = new Date()
): HealthWeekSummary {
  const weekColumns = getCurrentWeekDateKeys(reference);
  const todayKey = getCairoDateKey(reference);
  const dateKeyToDay = Object.fromEntries(weekColumns.map((c) => [c.dateKey, c.dayKey]));

  const exerciseStats: ExerciseWeekStats[] = exercises.map((ex) => {
    const byDay: Record<string, number> = Object.fromEntries(
      weekColumns.map((c) => [c.dayKey, 0])
    );
    let todayTotal = 0;

    for (const row of completions) {
      if (row.exercise_id !== ex.id) continue;
      const dateKey = getCairoDateKeyFromIso(row.completed_at);
      if (dateKey === todayKey) {
        todayTotal += row.reps;
      }
      const dayLabel = dateKeyToDay[dateKey];
      if (dayLabel) {
        byDay[dayLabel] += row.reps;
      }
    }

    const weekTotal = Object.values(byDay).reduce((sum, n) => sum + n, 0);

    return {
      exerciseId: ex.id,
      name: ex.name,
      slug: ex.slug,
      todayTotal,
      weekTotal,
      byDay,
    };
  });

  return {
    weekStart: weekColumns[0]?.dateKey ?? getCairoDateKey(reference),
    weekEnd: weekColumns[6]?.dateKey ?? getCairoDateKey(reference),
    todayDateKey: todayKey,
    isCurrentWeek: getCurrentWeekStartKey(reference) === getCurrentWeekStartKey(new Date()),
    exercises: exerciseStats,
  };
}

export function getTodayTotalForExercise(
  exerciseId: string,
  completions: CompletionRow[],
  reference = new Date()
): number {
  const todayKey = getCairoDateKey(reference);
  return completions
    .filter((c) => c.exercise_id === exerciseId && getCairoDateKeyFromIso(c.completed_at) === todayKey)
    .reduce((sum, c) => sum + c.reps, 0);
}
