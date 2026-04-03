'use client';
import { useEffect, useCallback } from "react";
import { WeeklyTask } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { setTasks, setLoading, updateTask, setError, removeTask, setSyncLoading } from "@/store/weeklyTasksSlice";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import AsmahAllah from "@/features/Allah-names/services/allah-names";
import { startOfWeek } from "date-fns";
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

  const SyncFromLocalToCloud = async () => {

    await checkWeeklyResetWithCache(user?.id)

    getTasks()
    dispatch(setSyncLoading(false))
  }


  const checkWeeklyResetWithCache = async (userId: string | undefined) => {

    if (userId) {

      const now = new Date();

      // 1. التأكد إن النهاردة السبت (6 هو رقم يوم السبت في JavaScript)
      // لو مش السبت، اخرج فوراً وما تعملش أي حاجة
      if (now.getDay() !== 6) {
        return;
      }

      // 2. تحديد "معرف الأسبوع" (بداية الأسبوع الحالي)
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

      // 3. شيك على الـ LocalStorage الأول (عشان السرعة)
      const localLastReset = localStorage.getItem(`last_reset_${userId}`);
      if (localLastReset === currentWeekStart) {
        console.log("الريسيت تم بالفعل على هذا الجهاز لهذا الأسبوع.");
        return;
      }

      try {
        // 4. لو مش موجود في LocalStorage، شيك على الداتابيز (الحقيقة النهائية)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('last_snapshot_week')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const dbLastReset = profile?.last_snapshot_week;

        // 5. لو الداتابيز بتقول إن الريسيت لسه ما حصلش للأسبوع ده
        if (dbLastReset !== currentWeekStart) {
          console.log("بدء عملية الريسيت للأسبوع الجديد...");

          const result = await handleWeeklyReset(userId);

          if (result?.success) {
            // تحديث الداتابيز أولاً
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ last_snapshot_week: currentWeekStart })
              .eq('id', userId);

            if (updateError) throw updateError;

            // ثم تحديث LocalStorage
            localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
            console.log("تم الريسيت وتحديث البيانات بنجاح.");
          }
        } else {
          // 6. لو الداتابيز قالت إنه حصل (بس الجهاز ده مكنش يعرف)
          // نحدث الـ LocalStorage عشان المرة الجاية ما يسألش الداتابيز
          localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
          console.log("الداتابيز محدثة بالفعل، تم مزامنة الجهاز الحالي.");
        }
      } catch (err) {
        console.error("خطأ في عملية التحقق من الريسيت:", err);
      }
    }

  };

  useEffect(() => {
    SyncFromLocalToCloud()
  }, [user?.id])



  return {
    updateBlock,
    deleteBlock,
    getTasks,
    seedEssentialTasks
  };
}