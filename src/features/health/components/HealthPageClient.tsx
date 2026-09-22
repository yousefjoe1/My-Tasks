"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  getHealthActivityWeeks,
  getHealthExercises,
  getHealthWeekSummary,
  seedDefaultHealthExercises,
} from "@/features/health/actions/health.actions";
import ExerciseCard from "@/features/health/components/ExerciseCard";
import HealthWeekOverview from "@/features/health/components/HealthWeekOverview";
import { getCurrentWeekStartKey } from "@/features/health/lib/weekSummary";
import type { HealthExercise, HealthWeekSummary } from "@/features/health/types";
import { addWeeks, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function HealthPageClient() {
  const { user, loading: authLoading } = useAuth();
  const [exercises, setExercises] = useState<HealthExercise[]>([]);
  const [weekSummary, setWeekSummary] = useState<HealthWeekSummary | null>(null);
  const [todayWeekSummary, setTodayWeekSummary] = useState<HealthWeekSummary | null>(null);
  const [activityWeeks, setActivityWeeks] = useState<string[]>([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
    getCurrentWeekStartKey()
  );
  const [loading, setLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekStart = useMemo(() => getCurrentWeekStartKey(), []);

  const loadActivityWeeks = useCallback(async (userId: string) => {
    const result = await getHealthActivityWeeks(userId);
    if (result.success) {
      setActivityWeeks(result.data);
    }
  }, []);

  const loadWeekSummary = useCallback(async (userId: string, weekStartKey: string) => {
    setWeekLoading(true);
    const weekResult = await getHealthWeekSummary(userId, weekStartKey);
    setWeekLoading(false);

    if (weekResult.success) {
      setWeekSummary(weekResult.data);
      setSelectedWeekStart(weekResult.data.weekStart);
    }
  }, []);

  const loadTodayWeekSummary = useCallback(async (userId: string) => {
    const weekKey = getCurrentWeekStartKey();
    const result = await getHealthWeekSummary(userId, weekKey);
    if (result.success) {
      setTodayWeekSummary(result.data);
    }
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const loadExercises = useCallback(async () => {
    if (!user?.id) {
      setExercises([]);
      setWeekSummary(null);
      setActivityWeeks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await getHealthExercises(user.id);
    setLoading(false);

    if (result.success) {
      setExercises(result.data);
      const weekKey = getCurrentWeekStartKey();
      setSelectedWeekStart(weekKey);
      await Promise.all([
        loadWeekSummary(user.id, weekKey),
        loadTodayWeekSummary(user.id),
        loadActivityWeeks(user.id),
      ]);
    } else {
      setError(result.error);
      setExercises([]);
      setWeekSummary(null);
      setActivityWeeks([]);
    }
  }, [user?.id, loadWeekSummary, loadTodayWeekSummary, loadActivityWeeks]);

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExercises();
  }, [authLoading, loadExercises]);

  const handleSeed = async () => {
    if (!user?.id) return;

    setSeeding(true);
    setError(null);
    const result = await seedDefaultHealthExercises(user.id);
    setSeeding(false);

    if (result.success) {
      setExercises(result.data);
      const weekKey = getCurrentWeekStartKey();
      setSelectedWeekStart(weekKey);
      await Promise.all([
        loadWeekSummary(user.id, weekKey),
        loadTodayWeekSummary(user.id),
        loadActivityWeeks(user.id),
      ]);
    } else {
      setError(result.error);
    }
  };

  const getTodayTotal = (exerciseId: string) =>
    todayWeekSummary?.exercises.find((e) => e.exerciseId === exerciseId)?.todayTotal ?? 0;

  const handleCompleted = async (payload: {
    exercise: HealthExercise;
    todayTotal: number;
  }) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === payload.exercise.id ? payload.exercise : ex))
    );
    if (!user?.id) return;
    await Promise.all([
      loadWeekSummary(user.id, selectedWeekStart),
      loadTodayWeekSummary(user.id),
      loadActivityWeeks(user.id),
    ]);
  };

  const shiftWeek = (direction: -1 | 1) => {
    const ref = parseISO(`${selectedWeekStart}T12:00:00`);
    const next = addWeeks(ref, direction);
    const nextKey = getCurrentWeekStartKey(next);
    setSelectedWeekStart(nextKey);
    if (user?.id) {
      loadWeekSummary(user.id, nextKey);
    }
  };

  const canGoNext = selectedWeekStart < currentWeekStart;

  const handleSelectWeek = (weekStartKey: string) => {
    setSelectedWeekStart(weekStartKey);
    if (user?.id) {
      loadWeekSummary(user.id, weekStartKey);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <p className="text-sm font-medium">جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-secondary bg-primary p-8 text-center">
        <p className="text-muted text-lg">سجّل الدخول لاستخدام صحتك والتمارين اليومية.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="text-center md:text-right">
        <h1 className="text-2xl font-black text-primary lg:text-4xl">صحتك</h1>
        <p className="mt-2 text-sm text-muted">
          تمارين بسيطة يومياً — راجع أي أسبوع سابق من سجل الأسابيع.
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-brand-error/30 bg-brand-error/10 px-4 py-2 text-sm text-brand-error">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
          <Loader2 className="size-8 animate-spin" aria-hidden />
          <p className="text-sm font-medium">جاري تحميل التمارين...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-secondary py-16 px-4">
          <span className="text-5xl" aria-hidden>
            💪
          </span>
          <p className="max-w-sm text-center text-muted">
            لم تنشئ تمارينك اليومية بعد. اضغط الزر لإضافة ضغط، سكوات، وبطن (10 تكرارات لكل تمرين).
          </p>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {seeding ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                جاري الإنشاء...
              </>
            ) : (
              "إنشاء تمارين يوميه بسيطه"
            )}
          </button>
        </div>
      ) : (
        <>
          {weekSummary && (
            <HealthWeekOverview
              summary={weekSummary}
              activityWeeks={
                activityWeeks.includes(selectedWeekStart)
                  ? activityWeeks
                  : [selectedWeekStart, ...activityWeeks].sort().reverse()
              }
              weekLoading={weekLoading}
              onSelectWeek={handleSelectWeek}
              onPrevWeek={() => shiftWeek(-1)}
              onNextWeek={() => shiftWeek(1)}
              canGoNext={canGoNext}
            />
          )}
          <ul className="space-y-3">
            {exercises.map((exercise) => (
              <li key={exercise.id}>
                <ExerciseCard
                  exercise={exercise}
                  userId={user.id}
                  todayTotal={getTodayTotal(exercise.id)}
                  onCompleted={handleCompleted}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
