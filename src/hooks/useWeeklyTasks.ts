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

  const Sync = async () => {

    await checkWeeklyResetWithCache(user?.id)

    getTasks()
    dispatch(setSyncLoading(false))
  }


  const checkWeeklyResetWithCache = async (userId: string | undefined) => {
    if (!userId) return;

    const now = new Date();

    // 1. تحديد بداية الأسبوع الحالي (مثلاً لو النهاردة الأحد، هيرجع تاريخ الاثنين اللي فات)
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 6 }).toISOString();

    // 2. شيك على الـ LocalStorage (الخط الدفاعي الأول)
    const localLastReset = localStorage.getItem(`last_reset_${userId}`);
    if (localLastReset === currentWeekStart) {
      // لو التاريخ المتخزن هو نفسه بداية الأسبوع الحالي، يبقى اليوزر عمل ريسيت خلاص
      return;
    }

    try {
      // 3. اسحب بيانات البروفايل
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('last_snapshot_week')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // 4. حالة اليوزر الجديد (أول مرة يفتح التطبيق)
      if (!profile) {
        await supabase
          .from('profiles')
          .insert({ id: userId, last_snapshot_week: currentWeekStart });

        localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
        return;
      }

      const dbLastReset = profile?.last_snapshot_week;

      // 5. المقارنة السحرية: لو التاريخ اللي في الداتابيز مختلف عن بداية الأسبوع الحالي
      // ده معناه إن اليوزر بقاله أسبوع أو أكتر ما فتحش التطبيق، ولازم نصفر العدادات
      if (dbLastReset !== currentWeekStart) {
        console.log("اكتشاف أسبوع جديد.. جاري تصفير المهام...");

        const result = await handleWeeklyReset(userId);

        if (result?.success) {
          // تحديث الداتابيز بالتاريخ الجديد (بداية الأسبوع اللي احنا فيه دلوقتي)
          await supabase
            .from('profiles')
            .update({ last_snapshot_week: currentWeekStart })
            .eq('id', userId);

          localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
        }
      } else {
        // لو الداتابيز متحدثة بس الـ LocalStorage لا (مثلاً مسح الكاش أو فتح من جهاز تاني)
        localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
      }
    } catch (err) {
      console.error("خطأ في المزامنة الأسبوعية:", err);
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