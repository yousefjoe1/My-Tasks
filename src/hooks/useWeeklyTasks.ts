'use client';
import { useEffect, useCallback } from "react";
import { WeeklyTask } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { setTasks, setLoading, updateTask, setError, removeTask, setSyncLoading } from "@/store/weeklyTasksSlice";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import AsmahAllah from "@/features/Allah-names/services/allah-names";
import { getDay, startOfWeek } from "date-fns";
import { handleWeeklyReset } from "@/services/snapShotService";
import { supabase } from "@/lib/supabase/client";



export function useWeeklyTasks({
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
      {
        content: "📖 الورد القرآني", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false },
        is_essential: true,
        sub_tasks: [
          {
            content: "صفحه من البقره",
            days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
          }
        ]
      },
      {
        content: "اذكار الصباح", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false },
        is_essential: true,

        sub_tasks: [
          {
            content: "بسم الله الذي لا يضر مع اسمه شيء في الارض ولا في السماء وهو السميع العليم  3 مرات",
            days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
          },
          {
            content: "المعوذات 3 مرات",
            days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
          },
        ]
      },
      {
        content: "اذكار المساء", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false },
        is_essential: true,
        sub_tasks: [
          {
            content: "بسم الله الذي لا يضر مع اسمه شيء في الارض ولا في السماء وهو السميع العليم  3 مرات",
            days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
          },
          {
            content: "المعوذات 3 مرات",
            days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
          },
        ]
      },
      {
        content: "شويه رياضه", description: "", days: { Sat: false, Sun: false, Mon: false, Tue: false, Wed: false, Thu: false, Fri: false },
        is_essential: true,

        sub_tasks: [
          {
            content: "شويه إطاله",
            days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
          },
        ]
      }
    ];
    dispatch(setLoading(true))
    for (const habit of defaults) {
      const newTask = { id: crypto.randomUUID(), ...habit } as WeeklyTask;
      await WeeklyTasksService.addTask(newTask, user?.id as string, true);
    }
    getTasks();
  };


  const getTasks = useCallback(async () => {
    dispatch(setSyncLoading(true))
    const tasks = await WeeklyTasksService.fetchTasks(user?.id)
    dispatch(setTasks(tasks))
    dispatch(setSyncLoading(false))
  }, [user, dispatch])

  const handleZikr = async (userId: string) => {
    try {
      // استدعاء الـ RPC بدلاً من fetch و update
      const { error } = await supabase.rpc('increment_zikr', {
        target_user_id: userId
      });

      if (error) throw error;

      console.log("تم تحديث العداد بنجاح!");
    } catch (err) {
      console.error("حدث خطأ:", err);
    }
  };


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
    handleZikr(user?.id as string);
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

  const checkWeeklyResetWithCache = async (userId: string | undefined) => {
    if (!userId) return;

    const now = new Date();

    // 1. التأكد أولاً إن النهاردة الأحد (يوم الأحد في date-fns قيمته 0)
    if (getDay(now) !== 0) {
      console.log("⏳ Today is not Sunday. Skipping weekly reset check.");
      return;
    }

    // حساب بداية الأسبوع الحالي (بداية يوم الأحد الحالي) لتكون هي الـ Identifier بتاعنا
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 }).toISOString(); // weekStartsOn: 0 يخلي الأسبوع يبدأ من الأحد

    // 2. فحص الـ LocalStorage أولاً (لمنع الـ Request تماماً لو الجهاز ده عمل الـ Reset أو عرف إنه اتعمل)
    const localLastReset = localStorage.getItem(`last_reset_${userId}`);
    if (localLastReset === currentWeekStart) {
      console.log("✅ Weekly reset already verified for this Sunday (Cache hit)");
      return;
    }

    try {
      // 3. طالما مش في الكاش، نروح نتأكد من الـ DB عشان لو معمول من جهاز تاني لنفس الحساب
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('last_snapshot_week')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error fetching profile:", fetchError);
        return;
      }

      const lastResetWeek = profile?.last_snapshot_week;

      // لو الـ DB متحدثة بالتاريخ بتاع الأحد ده، يبقى الـ snapshot اتعملت خلاص من جهاز تاني
      if (lastResetWeek === currentWeekStart) {
        console.log("✅ Weekly reset already done this week (DB verified)");
        localStorage.setItem(`last_reset_${userId}`, currentWeekStart); // احفظها في الكاش عشان ميعملش ريكويست تاني
        return;
      }

      console.log(`📅 Snapshot needed. Last snapshot week: ${lastResetWeek}, Target Sunday: ${currentWeekStart}`);

      // 4. حجز عملية الـ Reset بشكل Atomic (لحماية التزامن)
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ last_snapshot_week: currentWeekStart })
        .eq('id', userId)
        .select('id')
        .maybeSingle();

      if (updateError || !updated) {
        console.log("⚠️ Another device claimed or update failed");
        // لو فشل التحديث غالباً جهاز تاني لقطها في نفس الفيمتو ثانية، هنحدث الكاش للأمان
        localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
        return;
      }

      // 5. تنفيذ الـ Snapshot الفعلي لأن الجهاز ده هو اللي كسب الـ السباق
      console.log("🔄 Running weekly snapshot...");
      const result = await handleWeeklyReset(userId);

      if (result?.success) {
        localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
        console.log("✅ Weekly snapshot completed and cached successfully");
      } else {
        console.error("❌ Weekly snapshot failed after claiming it");
        // اختياري: لو عايز ترجع الـ DB لقيمتها القديمة لو الفانكشن فشلت تماماً
        // await supabase.from('profiles').update({ last_snapshot_week: lastResetWeek }).eq('id', userId);
      }

    } catch (err) {
      console.error("❌ Critical error in weekly check:", err);
    }
  };

  const Sync = async () => {
    dispatch(setSyncLoading(true))
    await checkWeeklyResetWithCache(user?.id)

    await getTasks()
    dispatch(setSyncLoading(false))
  }

  // const checkWeeklyResetWithCache = async (userId: string | undefined) => {
  //   if (!userId) return;

  //   const now = new Date();
  //   const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

  //   // Fast local cache check (first line of defense)
  //   const localLastReset = localStorage.getItem(`last_reset_${userId}`);
  //   if (localLastReset === currentWeekStart) {
  //     return;
  //   }

  //   try {
  //     // === ATOMIC WEEKLY RESET CHECK + CLAIM ===
  //     // Only ONE device will successfully update the last_snapshot_week
  //     const { data, error: updateError } = await supabase
  //       .from('profiles')
  //       .update({ last_snapshot_week: currentWeekStart })
  //       .eq('id', userId)
  //       .not('last_snapshot_week', 'eq', currentWeekStart)   // ← This prevents duplicate resets
  //       .select('id')
  //       .maybeSingle();

  //     if (updateError) {
  //       console.error("Error claiming weekly reset:", updateError);
  //       // Still update local cache to avoid retrying too aggressively
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       return;
  //     }

  //     // If no row was updated → another device already performed the reset
  //     if (!data) {
  //       console.log("Another device already handled the weekly reset");
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       return;
  //     }

  //     // === THIS DEVICE WON THE RACE → Perform the actual reset ===
  //     console.log("اكتشاف أسبوع جديد.. جاري تصفير المهام (هذا الجهاز فاز)...");

  //     const result = await handleWeeklyReset(userId);

  //     if (result?.success) {
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       console.log("Weekly reset completed successfully");
  //     } else {
  //       console.error("Weekly reset failed after claiming it");
  //       // Optional: You can revert the profile update here if you want (rare case)
  //     }

  //   } catch (err) {
  //     console.error("خطأ في المزامنة الأسبوعية:", err);
  //     // Fallback: update localStorage anyway so we don't spam the DB
  //     localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //   }
  // };
  // const checkWeeklyResetWithCache = async (userId: string | undefined) => {
  //   if (!userId) return;

  //   const now = new Date();
  //   const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

  //   // Fast local cache check
  //   const localLastReset = localStorage.getItem(`last_reset_${userId}`);
  //   if (localLastReset === currentWeekStart) {
  //     console.log("✅ Weekly reset already done this week (cache)");
  //     return;
  //   }

  //   try {
  //     // FIXED: Fetch current user's last_snapshot_week to compare
  //     const { data: profile, error: fetchError } = await supabase
  //       .from('profiles')
  //       .select('last_snapshot_week')
  //       .eq('id', userId)
  //       .maybeSingle()

  //     if (fetchError) {
  //       console.error("❌ Error fetching profile:", fetchError);
  //       return;
  //     }

  //     const lastResetWeek = profile?.last_snapshot_week;

  //     // If already reset this week, skip
  //     if (lastResetWeek === currentWeekStart) {
  //       console.log("✅ Weekly reset already done this week (DB)");
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       return;
  //     }

  //     console.log(`📅 Reset needed. Last reset: ${lastResetWeek}, Current week: ${currentWeekStart}`);

  //     // === ATOMIC UPDATE: This device claims the reset ===
  //     const { data: updated, error: updateError } = await supabase
  //       .from('profiles')
  //       .update({
  //         last_snapshot_week: currentWeekStart
  //       })
  //       .eq('id', userId)
  //       .select('id')
  //       .maybeSingle();

  //     if (updateError) {
  //       console.error("❌ Error claiming reset:", updateError);
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       return;
  //     }

  //     if (!updated) {
  //       console.log("⚠️ Update failed");
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       return;
  //     }

  //     console.log("✅ This device claimed the reset!");

  //     // === THIS DEVICE WON → Perform the actual reset ===
  //     console.log("🔄 Starting weekly reset...");
  //     const result = await handleWeeklyReset(userId);

  //     if (result?.success) {
  //       localStorage.setItem(`last_reset_${userId}`, currentWeekStart);
  //       console.log("✅ Weekly reset completed successfully");
  //     } else {
  //       console.error("❌ Weekly reset failed after claiming it");
  //       // IMPORTANT: Consider reverting the profile update if reset failed
  //       // await supabase.from('profiles').update({ last_snapshot_week: lastResetWeek }).eq('id', userId);
  //     }

  //   } catch (err) {
  //     console.error("❌ Critical error in weekly check:", err);
  //     localStorage.setItem(`last_reset_${userId}`, new Date().toISOString());
  //   }
  // };






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