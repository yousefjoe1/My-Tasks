'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toasts/useToast';
import type { AzkarCardState } from '../types/azkar';
import {
  createInitialCards,
  getDisplayedCount,
  getDisplayedDurationSeconds,
  getLiveSeconds,
  mergeLoadedIntoCards,
  resetCardsToEmpty,
} from '../utils/azkarCardState';
import {
  fetchAzkarTasks,
  fetchUserAzkarTasks,
  fetchUsersOverview,
  resolveSignedInDisplayName,
  todayDateString,
} from '../services/azkarData';
import type { UsersOverviewRpcUser } from '../types/azkar';

const LOGIN_MSG = 'يرجى تسجيل الدخول اولا';
const LOAD_FAIL_MSG = 'تعذّر تحميل الأذكار';
const SAVE_OK_MSG = 'تم الحفظ';
const SAVE_FAIL_MSG = 'تعذّر الحفظ';
const NO_TASK_MSG = 'هذا الذكر غير موجود بعد في قاعدة البيانات';
const OVERVIEW_FAIL_MSG = 'تعذّر تحميل إحصائيات المستخدمين';

export function useAzkarPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast, toasts, removeToast } = useToast();

  const [cards, setCards] = useState<AzkarCardState[]>(() => createInitialCards());
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const [displayName, setDisplayName] = useState('');
  const [azkarLoadError, setAzkarLoadError] = useState<string | null>(null);
  const [azkarLoading, setAzkarLoading] = useState(false);

  const [overviewUsers, setOverviewUsers] = useState<UsersOverviewRpcUser[]>([]);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [nowMs, setNowMs] = useState(() => Date.now());

  const timerRunning = cards.some((c) => c.timerStartedAt != null);
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const requireSignedIn = useCallback(() => {
    if (user?.id) return true;
    toast(LOGIN_MSG);
    return false;
  }, [user?.id, toast]);

  useEffect(() => {
    if (!user?.id) {
      setDisplayName('');
      setAzkarLoadError(null);
      setCards(createInitialCards());
      return;
    }

    let cancelled = false;

    const load = async () => {
      setAzkarLoading(true);
      setAzkarLoadError(null);
      try {
        const [tasks, userTasks, name] = await Promise.all([
          fetchAzkarTasks(),
          fetchUserAzkarTasks(user.id),
          resolveSignedInDisplayName(user.id),
        ]);
        if (cancelled) return;
        setDisplayName(name);
        setCards((prev) => mergeLoadedIntoCards(prev, tasks, userTasks));
      } catch {
        if (cancelled) return;
        setCards(resetCardsToEmpty());
        setDisplayName('');
        setAzkarLoadError(LOAD_FAIL_MSG);
      } finally {
        if (!cancelled) setAzkarLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setOverviewUsers([]);
      setOverviewError(null);
      return;
    }

    let cancelled = false;

    const loadOverview = async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const data = await fetchUsersOverview();
        if (cancelled) return;
        setOverviewUsers(data);
      } catch {
        if (cancelled) return;
        setOverviewUsers([]);
        setOverviewError(OVERVIEW_FAIL_MSG);
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    };

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handlePlus = useCallback(
    (name: AzkarCardState['name']) => {
      if (!requireSignedIn()) return;
      setCards((prev) =>
        prev.map((c) => {
          if (c.name !== name || c.saving) return c;
          return { ...c, pendingDelta: c.pendingDelta + 1 };
        }),
      );
    },
    [requireSignedIn],
  );

  const handleTimerToggle = useCallback(
    (name: AzkarCardState['name']) => {
      if (!requireSignedIn()) return;
      setCards((prev) =>
        prev.map((c) => {
          if (c.name !== name || c.saving) return c;
          if (c.timerStartedAt != null) {
            const live = getLiveSeconds(c, Date.now());
            return {
              ...c,
              timerStartedAt: null,
              pendingDurationSeconds: c.pendingDurationSeconds + live,
            };
          }
          return { ...c, timerStartedAt: Date.now() };
        }),
      );
      setNowMs(Date.now());
    },
    [requireSignedIn],
  );

  const handleSave = useCallback(
    async (name: AzkarCardState['name']) => {
      const userId = user?.id;
      if (!requireSignedIn() || !userId) return;

      const card = cardsRef.current.find((c) => c.name === name);
      if (!card || card.saving) return;

      let pendingDurationSeconds = card.pendingDurationSeconds;
      let timerStartedAt = card.timerStartedAt;
      if (timerStartedAt != null) {
        pendingDurationSeconds += getLiveSeconds(card, Date.now());
        timerStartedAt = null;
      }

      const deltaToSave = card.pendingDelta;
      const pendingDurAtSave = pendingDurationSeconds;
      const savedCount = card.savedCount;
      const savedDurationSeconds = card.savedDurationSeconds;

      if (!card.taskId) {
        toast(NO_TASK_MSG);
        return;
      }

      if (deltaToSave <= 0 && pendingDurAtSave <= 0) {
        return;
      }

      const taskId = card.taskId;
      const nextCount = savedCount + deltaToSave;
      const nextDuration = savedDurationSeconds + pendingDurAtSave;

      setCards((prev) =>
        prev.map((c) =>
          c.name === name
            ? { ...c, pendingDurationSeconds, timerStartedAt, saving: true }
            : c,
        ),
      );

      const row: {
        user_id: string;
        task_id: string;
        created_at: string;
        count?: number;
        is_completed?: boolean;
        duration_seconds?: number;
      } = {
        user_id: userId,
        task_id: taskId,
        created_at: todayDateString(),
      };

      if (deltaToSave > 0) {
        row.count = nextCount;
        row.is_completed = nextCount > 0;
      }
      if (pendingDurAtSave > 0) {
        row.duration_seconds = nextDuration;
      }

      try {
        const { error } = await supabase.from('user_tasks').upsert(row, {
          onConflict: 'user_id,task_id',
        });
        if (error) throw error;

        setCards((prev) =>
          prev.map((c) => {
            if (c.name !== name) return c;
            return {
              ...c,
              saving: false,
              savedCount: nextCount,
              pendingDelta: c.pendingDelta - deltaToSave,
              savedDurationSeconds: nextDuration,
              pendingDurationSeconds: c.pendingDurationSeconds - pendingDurAtSave,
            };
          }),
        );
        toast(SAVE_OK_MSG);
      } catch {
        setCards((prev) =>
          prev.map((c) => (c.name === name ? { ...c, saving: false } : c)),
        );
        toast(SAVE_FAIL_MSG);
      }
    },
    [requireSignedIn, user?.id, toast],
  );

  const myTotals = useMemo(() => {
    const totalCount = cards.reduce((sum, c) => sum + getDisplayedCount(c), 0);
    const totalDuration = cards.reduce(
      (sum, c) => sum + getDisplayedDurationSeconds(c, nowMs),
      0,
    );
    return { totalCount, totalDuration };
  }, [cards, nowMs]);

  return {
    user,
    authLoading,
    cards,
    displayName,
    azkarLoadError,
    azkarLoading,
    overviewUsers,
    overviewError,
    overviewLoading,
    nowMs,
    myTotals,
    handlePlus,
    handleTimerToggle,
    handleSave,
    toasts,
    removeToast,
  };
}
