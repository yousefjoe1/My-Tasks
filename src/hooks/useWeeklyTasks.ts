'use client';
import { useEffect, useCallback } from "react";
import { WeeklyTask } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { setTasks, setLoading, updateTask, setError, removeTask, setSyncLoading } from "@/store/weeklyTasksSlice";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import { WeeklyTasksSync } from "@/services/weeklyTasksSyncService";


export function useWeeklyTasks() {

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
    try {
      await WeeklyTasksService.updateTask(taskId, updates, user?.id);
      dispatch(updateTask({ id: taskId, updates }));
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
    dispatch(setSyncLoading(true))
    if (user?.id) {
      await WeeklyTasksSync.addTheNewTasks(user?.id)
      await WeeklyTasksSync.updateExistingTasks(user?.id)
      await WeeklyTasksSync.deleteMissingTasks(user?.id)
    }
    getTasks()
    dispatch(setSyncLoading(false))
  }



  useEffect(() => {
    SyncFromLocalToCloud()
  }, [user?.id])


  return {
    updateBlock,
    deleteBlock,
  };
}