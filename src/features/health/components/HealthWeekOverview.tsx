"use client";

import {
  getCurrentWeekDateKeys,
  parseWeekStartKey,
} from "@/features/health/lib/weekSummary";
import type { HealthWeekSummary } from "@/features/health/types";
import { getCairoDateKey } from "@/features/health/lib/cairoDate";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMemo } from "react";

interface HealthWeekOverviewProps {
  summary: HealthWeekSummary;
  activityWeeks: string[];
  weekLoading?: boolean;
  onSelectWeek: (weekStartKey: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  canGoNext: boolean;
}

export default function HealthWeekOverview({
  summary,
  activityWeeks,
  weekLoading,
  onSelectWeek,
  onPrevWeek,
  onNextWeek,
  canGoNext,
}: HealthWeekOverviewProps) {
  const weekColumns = useMemo(
    () => getCurrentWeekDateKeys(parseWeekStartKey(summary.weekStart)),
    [summary.weekStart]
  );
  const todayDateKey = getCairoDateKey();

  if (summary.exercises.length === 0) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-secondary bg-primary p-4">
      <div className="space-y-3">
        <div className="text-center md:text-right">
          <h2 className="text-lg font-bold text-primary">سجل الأسابيع</h2>
          <p className="text-xs text-muted">
            {summary.weekStart} — {summary.weekEnd} · توقيت القاهرة
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onPrevWeek}
            disabled={weekLoading}
            className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-tertiary disabled:opacity-50"
            aria-label="الأسبوع السابق"
          >
            <ChevronRight size={18} aria-hidden />
            السابق
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            {weekLoading && <Loader2 className="size-4 shrink-0 animate-spin text-muted" />}
            <select
              value={summary.weekStart}
              onChange={(e) => onSelectWeek(e.target.value)}
              disabled={weekLoading}
              className="max-w-full truncate rounded-lg border border-secondary bg-secondary px-3 py-1.5 text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-brand/40"
              aria-label="اختر الأسبوع"
            >
              {activityWeeks.map((weekStart) => (
                <option key={weekStart} value={weekStart}>
                  {weekStart}
                  {weekStart === summary.weekStart && summary.isCurrentWeek ? " (هذا الأسبوع)" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onNextWeek}
            disabled={weekLoading || !canGoNext}
            className="flex items-center gap-1 rounded-lg border border-secondary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-tertiary disabled:opacity-50"
            aria-label="الأسبوع التالي"
          >
            التالي
            <ChevronLeft size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {summary.exercises.map((row) => (
          <div
            key={row.exerciseId}
            className="rounded-xl border border-secondary/80 bg-secondary/30 p-3"
          >
            <p className="mb-2 font-semibold text-primary">{row.name}</p>
            <div className="flex flex-wrap justify-between gap-1">
              {weekColumns.map(({ dayKey, dateKey }) => {
                const count = row.byDay[dayKey] ?? 0;
                const isToday = summary.isCurrentWeek && dateKey === todayDateKey;
                const done = count > 0;

                return (
                  <div key={dayKey} className="flex min-w-[2.25rem] flex-col items-center gap-0.5">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums ${
                        done
                          ? "border-success bg-success text-white"
                          : "border-secondary bg-tertiary/50 text-muted"
                      } ${isToday ? "ring-1 ring-brand" : ""}`}
                      title={done ? `${count} تكرار` : "لم يُسجّل"}
                    >
                      {done ? count : "—"}
                    </div>
                    <span
                      className={`text-[8px] font-bold uppercase ${isToday ? "text-brand" : "text-muted"}`}
                    >
                      {dayKey}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
