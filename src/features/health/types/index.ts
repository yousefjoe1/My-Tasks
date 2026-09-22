export interface HealthExercise {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  default_reps: number;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HealthExerciseCompletion {
  id: string;
  user_id: string;
  exercise_id: string;
  reps: number;
  completed_at: string;
}

export interface ExerciseWeekStats {
  exerciseId: string;
  name: string;
  slug: string;
  todayTotal: number;
  weekTotal: number;
  byDay: Record<string, number>;
}

export interface HealthWeekSummary {
  weekStart: string;
  weekEnd: string;
  todayDateKey: string;
  isCurrentWeek: boolean;
  exercises: ExerciseWeekStats[];
}

export interface LogExerciseCompletionResult {
  exercise: HealthExercise;
  todayTotal: number;
}
