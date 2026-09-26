"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  deleteSleepLog,
  getSleepLog,
  getSleepMonth,
  saveSleepLog,
} from "@/features/sleep/actions/sleep.actions";
import {
  addDaysToDateKey,
  buildSleepTimestamps,
  formatArabicDate,
  formatArabicMonth,
  formatCairoTime,
  formatDuration,
  getCairoDateKey,
  monthKeyFromDate,
} from "@/features/sleep/lib/sleepTime";
import type { SleepLog } from "@/features/sleep/types";
import { ChevronLeft, ChevronRight, Loader2, Moon, Sun, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const fieldClass =
  "w-full rounded-xl border border-secondary bg-primary px-3 py-3 text-lg text-primary outline-none focus:border-brand";

export default function SleepPageClient() {
  const { user, loading: authLoading } = useAuth();
  const today = useMemo(() => getCairoDateKey(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [bedTime, setBedTime] = useState("");
  const [wakeClock, setWakeClock] = useState("");
  const [log, setLog] = useState<SleepLog | null>(null);
  const [monthLogs, setMonthLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const monthKey = monthKeyFromDate(selectedDate);
  const preview = useMemo(() => {
    if (!bedTime || !wakeClock) return null;
    return buildSleepTimestamps(selectedDate, bedTime, wakeClock);
  }, [bedTime, wakeClock, selectedDate]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setLoading(false);
      setLog(null);
      setMonthLogs([]);
      return;
    }

    let cancelled = false;
    const userId = user.id;

    async function load() {
      setLoading(true);
      setError(null);
      setSaved(false);
      setConfirmDelete(false);

      const [dayResult, monthResult] = await Promise.all([
        getSleepLog(userId, selectedDate),
        getSleepMonth(userId, monthKey),
      ]);

      if (cancelled) return;

      if (dayResult.success) {
        setLog(dayResult.data);
        setBedTime(dayResult.data ? formatCairoTime(dayResult.data.bedtime) : "");
        setWakeClock(dayResult.data ? formatCairoTime(dayResult.data.wake_time) : "");
      } else {
        setError(dayResult.error);
        setLog(null);
        setBedTime("");
        setWakeClock("");
      }

      if (monthResult.success) {
        setMonthLogs(monthResult.data);
      } else {
        setError(monthResult.error);
        setMonthLogs([]);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, selectedDate, monthKey]);

  const shiftDay = (days: -1 | 1) => {
    const next = addDaysToDateKey(selectedDate, days);
    if (next > today) return;
    setSelectedDate(next);
  };

  const handleSave = async () => {
    if (!user?.id || !preview?.ok) return;

    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await saveSleepLog(user.id, selectedDate, bedTime, wakeClock);
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setLog(result.data);
    setMonthLogs((current) => {
      const without = current.filter((item) => item.sleep_date !== result.data.sleep_date);
      return [result.data, ...without].sort((a, b) => b.sleep_date.localeCompare(a.sleep_date));
    });
    setSaved(true);
  };

  const handleDelete = async () => {
    if (!user?.id || !log) return;

    setDeleting(true);
    setError(null);
    const result = await deleteSleepLog(user.id, selectedDate);
    setDeleting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setLog(null);
    setBedTime("");
    setWakeClock("");
    setMonthLogs((current) => current.filter((item) => item.sleep_date !== selectedDate));
    setConfirmDelete(false);
    setSaved(false);
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
        <p className="text-muted text-lg">سجّل الدخول لتسجيل نومك.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="text-center md:text-right">
        <h1 className="text-2xl font-black text-primary lg:text-4xl">نومك</h1>
        <p className="mt-2 text-sm text-muted">
          كل يوم له وقت نوم ووقت استيقاظ. اليوم هنا هو يوم الصحوة.
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-brand-error/30 bg-brand-error/10 px-4 py-2 text-sm text-brand-error">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-secondary bg-primary p-4 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            className="rounded-xl border border-secondary p-2 text-primary transition-colors hover:bg-secondary"
            aria-label="اليوم السابق"
          >
            <ChevronRight className="size-5" />
          </button>

          <label className="flex flex-col items-center gap-1">
            <span className="text-sm font-bold text-primary">{formatArabicDate(selectedDate)}</span>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(event) => {
                const next = event.target.value;
                if (next && next <= today) setSelectedDate(next);
              }}
              className="bg-transparent text-center text-sm text-muted outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => shiftDay(1)}
            disabled={selectedDate >= today}
            className="rounded-xl border border-secondary p-2 text-primary transition-colors hover:bg-secondary disabled:opacity-40"
            aria-label="اليوم التالي"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            <span className="text-sm">جاري تحميل اليوم...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Moon className="size-4 text-brand" aria-hidden />
                  بدأت أنام
                </span>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(event) => {
                    setBedTime(event.target.value);
                    setSaved(false);
                  }}
                  className={fieldClass}
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Sun className="size-4 text-brand" aria-hidden />
                  صحيت
                </span>
                <input
                  type="time"
                  value={wakeClock}
                  onChange={(event) => {
                    setWakeClock(event.target.value);
                    setSaved(false);
                  }}
                  className={fieldClass}
                  required
                />
              </label>
            </div>

            <div className="rounded-xl bg-secondary px-4 py-3 text-center">
              {preview == null && <p className="text-sm text-muted">اختر وقت النوم ووقت الاستيقاظ</p>}
              {preview && !preview.ok && <p className="text-sm text-brand-error">{preview.error}</p>}
              {preview?.ok && (
                <>
                  <p className="text-2xl font-black text-primary">{formatDuration(preview.durationMinutes)}</p>
                  {preview.bedDate !== selectedDate && (
                    <p className="mt-1 text-xs text-muted">
                      بدأت النوم في {formatArabicDate(preview.bedDate)}
                    </p>
                  )}
                </>
              )}
            </div>

            {saved && <p className="text-center text-sm font-medium text-brand-success">تم حفظ نوم هذا اليوم</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={saving || !preview?.ok}
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                {log ? "تحديث" : "حفظ"}
              </button>

              {log && !confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-brand-error/30 px-4 py-3 text-sm font-bold text-brand-error transition-colors hover:bg-brand-error/10"
                >
                  <Trash2 className="size-4" aria-hidden />
                  حذف
                </button>
              )}
            </div>

            {log && confirmDelete && (
              <div className="flex flex-col gap-2 rounded-xl border border-brand-error/30 bg-brand-error/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-brand-error">حذف نوم هذا اليوم؟</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="rounded-lg bg-brand-error px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {deleting ? "جاري الحذف..." : "نعم، احذف"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg bg-tertiary px-3 py-2 text-xs font-medium text-primary"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black text-primary">{formatArabicMonth(monthKey)}</h2>
        {monthLogs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-secondary px-4 py-8 text-center text-sm text-muted">
            لا يوجد نوم مسجّل في هذا الشهر.
          </p>
        ) : (
          <ul className="space-y-2">
            {monthLogs.map((item) => {
              const selected = item.sleep_date === selectedDate;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(item.sleep_date)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right transition-colors ${
                      selected
                        ? "border-brand bg-brand/10"
                        : "border-secondary bg-primary hover:bg-secondary"
                    }`}
                  >
                    <span className="text-sm font-bold text-primary">{formatArabicDate(item.sleep_date)}</span>
                    <span className="text-xs text-muted">
                      {formatCairoTime(item.bedtime)} – {formatCairoTime(item.wake_time)}
                    </span>
                    <span className="text-sm font-black text-brand">{formatDuration(item.duration_minutes)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
