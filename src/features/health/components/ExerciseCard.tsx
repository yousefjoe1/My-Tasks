"use client";

import { logExerciseCompletion } from "@/features/health/actions/health.actions";
import { fireCompletionCelebration } from "@/features/health/components/fireCompletionCelebration";
import type { HealthExercise } from "@/features/health/types";
import { Dumbbell, Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface ExerciseCardProps {
  exercise: HealthExercise;
  userId: string;
  todayTotal: number;
  onCompleted: (payload: { exercise: HealthExercise; todayTotal: number }) => void;
}

export default function ExerciseCard({
  exercise,
  userId,
  todayTotal,
  onCompleted,
}: ExerciseCardProps) {
  const [reps, setReps] = useState(exercise.default_reps);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReps(exercise.default_reps);
  }, [exercise.default_reps, exercise.id]);

  const decrement = () => setReps((n) => Math.max(1, n - 1));
  const increment = () => setReps((n) => n + 1);

  const handleDone = async () => {
    setSubmitting(true);
    const result = await logExerciseCompletion(userId, exercise.id, reps);
    setSubmitting(false);

    if (!result.success) {
      alert(result.error);
      return;
    }

    onCompleted(result.data);
    setReps(result.data.exercise.default_reps);
    await fireCompletionCelebration();
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-secondary bg-primary p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tertiary text-brand">
          {exercise.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.image_url}
              alt=""
              className="size-12 rounded-xl object-cover"
            />
          ) : (
            <Dumbbell size={22} strokeWidth={2} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-primary">{exercise.name}</h3>
          <p className="text-sm text-muted">اختر عدد التكرارات ثم اضغط تم</p>
          <p className="mt-1 text-xs font-semibold text-brand">
            محفوظ اليوم: {todayTotal} تكرار
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-secondary bg-tertiary/40 p-1">
          <button
            type="button"
            onClick={decrement}
            disabled={submitting || reps <= 1}
            aria-label="تقليل التكرارات"
            className="flex size-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary disabled:opacity-40"
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>
          <span className="min-w-[2.5rem] text-center text-lg font-black tabular-nums text-primary">
            {reps}
          </span>
          <button
            type="button"
            onClick={increment}
            disabled={submitting}
            aria-label="زيادة التكرارات"
            className="flex size-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary disabled:opacity-40"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleDone}
          disabled={submitting}
          className="pushable group !w-auto shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="shadow-btn" />
          <span
            className="edge-btn"
            style={{
              background:
                "linear-gradient(to left, #064e3b 0%, #059669 8%, #059669 92%, #064e3b 100%)",
            }}
          />
          <span className="front-btn text-sm" style={{ background: "#10b981" }}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin text-white" aria-hidden />
            ) : (
              <span>تم ✓</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
