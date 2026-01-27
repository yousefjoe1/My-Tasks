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
    await WeeklyTasksService.saveSnapShot(user?.id)

    getTasks()
    dispatch(setSyncLoading(false))
  }


  useEffect(() => {
    SyncFromLocalToCloud()
  }, [user?.id])



  return {
    updateBlock,
    deleteBlock,
    getTasks
  };
}