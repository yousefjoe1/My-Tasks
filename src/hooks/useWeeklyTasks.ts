'use client';
import { useEffect, useCallback } from "react";
import { WeeklyTask } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { setTasks, setLoading, updateTask, setError, removeTask, setSyncLoading } from "@/store/weeklyTasksSlice";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import AsmahAllah from "@/features/Allah-names/services/allah-names";
import { isSameWeek, startOfWeek } from "date-fns";
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

  const seedEssentialTasks = async () => {
    const defaults = [
      { content: "📖 الورد القرآني (صفحة)", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false } },
      { content: "اذكار الصباح", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false } },
      { content: "اذكار المساء", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false } },
      { content: "شويه رياضه", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false } }
    ];
    dispatch(setLoading(true))
    for (const habit of defaults) {
      const newTask = { id: crypto.randomUUID(), ...habit } as WeeklyTask;
      await WeeklyTasksService.addTask(newTask, user?.id as string, true);
    }
    getTasks();
  };


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

  const Sync = async () => {

    await checkAndSyncReset(user?.id as string)

    getTasks()
    dispatch(setSyncLoading(false))
  }


  const checkAndSyncReset = async (userId: string) => {
    // 1. شيك على اللوكال الأول (عشان السرعة)
    const localLastReset = localStorage.getItem(`last_reset_${userId}`);
    const now = new Date();

    // إذا كان اللوكال بيقول إننا عملنا ريسيت في نفس الأسبوع، اخرج فوراً
    if (localLastReset && isSameWeek(new Date(localLastReset), now, { weekStartsOn: 6 })) {
      return { alreadyDone: true };
    }

    try {
      // 2. إذا اللوكال قديم أو مش موجود، اسأل الداتابيز
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('last_snapshot_week')
        .eq('id', userId)
        .maybeSingle(); // استخدام maybeSingle لتجنب خطأ PGRST116

      if (error) throw error;

      // 3. قارن تاريخ الداتابيز بالتاريخ الحالي
      if (profile?.last_snapshot_week) {
        const dbLastReset = new Date(profile.last_snapshot_week);

        if (isSameWeek(dbLastReset, now, { weekStartsOn: 6 })) {
          // الجهاز التاني عملها خلاص! حدث اللوكال عندك واقفل
          localStorage.setItem(`last_reset_${userId}`, dbLastReset.toISOString());
          return { success: true, syncedFromDB: true };
        }
      }

      // 4. لو وصلنا هنا، يبقى لا اللوكال ولا الداتابيز فيهم ريسيت للأسبوع ده
      // نادى دالة الأرشفة والريسيت اللي عملناها
      const result = await handleWeeklyReset(userId);

      if (result.success) {
        // مهم جداً: حدث تاريخ الأرشفة في الداتابيز عشان الجهاز التاني يشوفه
        await supabase
          .from('profiles')
          .update({ last_snapshot_week: now.toISOString() })
          .eq('id', userId);

        localStorage.setItem(`last_reset_${userId}`, now.toISOString());
      }

      return result;

    } catch (e) {
      console.error("Sync Error:", e);
      return { success: false };
    }
  };

  useEffect(() => {
    Sync()
  }, [user?.id])



  return {
    updateBlock,
    deleteBlock,
    getTasks,
    seedEssentialTasks
  };
}