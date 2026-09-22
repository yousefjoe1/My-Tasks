"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_HEALTH_EXERCISES } from "@/features/health/constants/defaultExercises";
import {
  buildHealthWeekSummary,
  getTodayTotalForExercise,
  listActivityWeekStartKeys,
  parseWeekStartKey,
} from "@/features/health/lib/weekSummary";
import type {
  HealthExercise,
  HealthWeekSummary,
  LogExerciseCompletionResult,
} from "@/features/health/types";
import { addDays, startOfWeek } from "date-fns";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function requireUserId(userId?: string): string | null {
  if (!userId) return null;
  return userId;
}

async function fetchWeekCompletions(userId: string, reference = new Date()) {
  const supabase = createAdminClient();
  const weekStart = startOfWeek(reference, { weekStartsOn: 1 });
  const weekEndExclusive = addDays(weekStart, 7);

  const { data, error } = await supabase
    .from("health_exercise_completions")
    .select("exercise_id, reps, completed_at")
    .eq("user_id", userId)
    .gte("completed_at", weekStart.toISOString())
    .lt("completed_at", weekEndExclusive.toISOString());

  if (error) {
    console.error("fetchWeekCompletions:", error);
    return [];
  }

  return data ?? [];
}

export async function getHealthExercises(
  userId?: string
): Promise<ActionResult<HealthExercise[]>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("health_exercises")
      .select("*")
      .eq("user_id", id)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("getHealthExercises:", error);
      return { success: false, error: "تعذر تحميل التمارين" };
    }

    return { success: true, data: (data ?? []) as HealthExercise[] };
  } catch (e) {
    console.error("getHealthExercises:", e);
    return { success: false, error: "تعذر تحميل التمارين" };
  }
}

export async function seedDefaultHealthExercises(
  userId?: string
): Promise<ActionResult<HealthExercise[]>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  try {
    const supabase = createAdminClient();

    const { count, error: countError } = await supabase
      .from("health_exercises")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id);

    if (countError) {
      console.error("seedDefaultHealthExercises count:", countError);
      return { success: false, error: "تعذر التحقق من التمارين" };
    }

    if (count && count > 0) {
      return getHealthExercises(id);
    }

    const rows = DEFAULT_HEALTH_EXERCISES.map((ex) => ({
      user_id: id,
      slug: ex.slug,
      name: ex.name,
      default_reps: ex.default_reps,
      sort_order: ex.sort_order,
      image_url: null,
    }));

    const { error: insertError } = await supabase.from("health_exercises").insert(rows);

    if (insertError) {
      console.error("seedDefaultHealthExercises insert:", insertError);
      return { success: false, error: "تعذر إنشاء التمارين" };
    }

    return getHealthExercises(id);
  } catch (e) {
    console.error("seedDefaultHealthExercises:", e);
    return { success: false, error: "تعذر إنشاء التمارين" };
  }
}

export async function getHealthWeekSummary(
  userId?: string,
  weekStartKey?: string
): Promise<ActionResult<HealthWeekSummary>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  const exercisesResult = await getHealthExercises(id);
  if (!exercisesResult.success) {
    return { success: false, error: exercisesResult.error };
  }

  const reference = weekStartKey ? parseWeekStartKey(weekStartKey) : new Date();
  const completions = await fetchWeekCompletions(id, reference);
  const summary = buildHealthWeekSummary(exercisesResult.data, completions, reference);

  return { success: true, data: summary };
}

export async function getHealthActivityWeeks(
  userId?: string
): Promise<ActionResult<string[]>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("health_exercise_completions")
      .select("completed_at")
      .eq("user_id", id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("getHealthActivityWeeks:", error);
      return { success: false, error: "تعذر تحميل الأسابيع" };
    }

    const weeks = listActivityWeekStartKeys(data ?? []);
    return { success: true, data: weeks };
  } catch (e) {
    console.error("getHealthActivityWeeks:", e);
    return { success: false, error: "تعذر تحميل الأسابيع" };
  }
}

export async function logExerciseCompletion(
  userId: string | undefined,
  exerciseId: string,
  reps: number
): Promise<ActionResult<LogExerciseCompletionResult>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  if (!exerciseId || reps < 1) {
    return { success: false, error: "عدد التكرارات غير صالح" };
  }

  try {
    const supabase = createAdminClient();

    const { data: exercise, error: exerciseError } = await supabase
      .from("health_exercises")
      .select("id")
      .eq("id", exerciseId)
      .eq("user_id", id)
      .maybeSingle();

    if (exerciseError || !exercise) {
      return { success: false, error: "التمرين غير موجود" };
    }

    const { error: logError } = await supabase.from("health_exercise_completions").insert({
      user_id: id,
      exercise_id: exerciseId,
      reps,
    });

    if (logError) {
      console.error("logExerciseCompletion:", logError);
      return { success: false, error: "تعذر حفظ الإنجاز" };
    }

    const { data: updated, error: updateError } = await supabase
      .from("health_exercises")
      .update({ default_reps: reps })
      .eq("id", exerciseId)
      .eq("user_id", id)
      .select("*")
      .single();

    let exerciseRow = updated as HealthExercise | null;
    if (updateError || !updated) {
      const { data: refreshed } = await supabase
        .from("health_exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();
      exerciseRow = refreshed as HealthExercise | null;
    }

    if (!exerciseRow) {
      return { success: false, error: "تعذر تحميل التمرين" };
    }

    const completions = await fetchWeekCompletions(id, new Date());
    const todayTotal = getTodayTotalForExercise(exerciseId, completions);

    return {
      success: true,
      data: { exercise: exerciseRow, todayTotal },
    };
  } catch (e) {
    console.error("logExerciseCompletion:", e);
    return { success: false, error: "تعذر حفظ الإنجاز" };
  }
}
