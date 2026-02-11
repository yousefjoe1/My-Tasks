'use client';
import { useEffect, useCallback } from "react";
import { WeeklyTask } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { setTasks, setLoading, updateTask, setError, removeTask, setSyncLoading } from "@/store/weeklyTasksSlice";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import { WeeklyTasksSync } from "@/services/weeklyTasksSyncService";
import { LocalStorageStrategy } from "@/lib/storage/weeklyTasks/LocalStorageStrategy";
import AsmahAllah from "@/features/Allah-names/services/allah-names";
import { endOfWeek, startOfWeek, isSameWeek } from "date-fns";
import { handleWeeklyReset } from "@/services/snapShotService";
import { supabase } from "@/lib/supabase/client";



export function useWeeklyTasks({
  error,
  success,
  toast,
}: {
  error: (m: string) => void;
  success: (m: string) => void;
  toast: (m: string, d: string) => void;
}) {

  const dispatch = useDispatch()

  const { user } = useAuth();




  const getTasks = useCallback(async () => {
    dispatch(setLoading(true))
    const tasks = await WeeklyTasksService.fetchTasks(user?.id)
    dispatch(setTasks(tasks))
  }, [user, dispatch])


  const updateBlock = async (taskId: string, updates: Partial<WeeklyTask>) => {
    // Clear any previous error for this specific task before starting
    dispatch(setError({ id: taskId, message: null }));
    dispatch(setLoading(true))
    success('Task updated successfully')
    try {
      await WeeklyTasksService.updateTask(taskId, updates, user?.id);
      dispatch(updateTask({ id: taskId, updates }))
      const item = await AsmahAllah.getCurrentThikr();
      AsmahAllah.updateThikrIndex();
      toast(item.name, item.details);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      dispatch(setError({ id: taskId, message }));
    }
  };

  const deleteBlock = async (taskId: string) => {
    dispatch(setLoading(true))
    try {
      await WeeklyTasksService.deleteTask(taskId, user?.id)
      dispatch(removeTask(taskId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      dispatch(setError({ id: taskId, message }))
    }
  }

  const SyncFromLocalToCloud = async () => {
    if (user?.id) {
      const isSynced = LocalStorageStrategy.saveSyncState()
      if (isSynced !== 'yes') {
        dispatch(setSyncLoading(true))
        await WeeklyTasksSync.addTheNewTasks(user?.id)
        await WeeklyTasksSync.updateExistingTasks(user?.id)
        await WeeklyTasksSync.deleteMissingTasks(user?.id)
      }
    }

    await checkWeeklyResetWithCache(user?.id)

    getTasks()
    dispatch(setSyncLoading(false))
  }


  const checkWeeklyResetWithCache = async (userId: string | undefined) => {

    if (userId) {


      const now = new Date();
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

      const localLastReset = localStorage.getItem(`last_reset_${userId}`);

      if (localLastReset === currentWeekStart) {
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('last_snapshot_week')
        .eq('id', userId)
        .single();

      const dbLastReset = profile?.last_snapshot_week;

      if (dbLastReset !== currentWeekStart) {
        localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
        const result = await handleWeeklyReset(userId);

        if (result?.success) {
          await supabase
            .from('profiles')
            .update({ last_snapshot_week: currentWeekStart })
            .eq('id', userId);

        } else {
          error(`هناك خطأ ما في تجديد ايام المهمات`)
        }
      } else {
        localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
        console.log("DB was already updated. Synced LocalStorage.");
      }
    }

  };

  useEffect(() => {
    SyncFromLocalToCloud()
  }, [user?.id])



  return {
    updateBlock,
    deleteBlock,
    getTasks
  };
}