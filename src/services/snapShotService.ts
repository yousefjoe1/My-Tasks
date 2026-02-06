import { supabase } from '@/lib/supabase/client';
import { WeeklyTasksService } from './weeklyTasksService';

/* 

- check if today is saturday
- submit the current tasks to the snapshot table
- reset the marked days
- start new week


*/

// const saveSnapShot = async (userId: string | undefined): Promise<void> => {
//     const tasks = await WeeklyTasksService.fetchTasks(userId);

// }

// services/weeklyService.ts
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

export const handleWeeklyReset = async (userId: string | undefined) => {
    if (userId) {
        try {
            // 1. تحديد نطاق الأسبوع الماضي (الذي نريد أخذ لقطة له)
            const lastWeekDate = subWeeks(new Date(), 1);
            const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });

            // 2. جلب التاسكات الحالية للمستخدم
            const { data: tasks, error: fetchError } = await supabase
                .from('weekly_tasks') // تأكد من اسم جدولك
                .select('*')
                .eq('userId', userId);

            if (fetchError || !tasks) throw fetchError;

            // 3. تجهيز الـ Snapshot
            const snapshot = {
                user_id: userId,
                week_start: weekStart.toISOString(),
                week_end: weekEnd.toISOString(),
                week_data: tasks.map(t => ({
                    id: t.id,
                    content: t.content,
                    days: t.days // الحالة الحالية (صح/خطأ) لكل يوم
                })),
                archived_at: new Date().toISOString()
            };

            // 4. تنفيذ العمليتين (حفظ السناب شوت وتصفير الأيام)
            // نستخدم الأيام الافتراضية كـ Object فارغ أو كل الأيام false
            const resetDays = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };

            const { error: snapshotError } = await supabase.from('weekly_snapshots').insert(snapshot);
            if (snapshotError) throw snapshotError;

            const { error: updateError } = await supabase
                .from('weekly_tasks ')
                .update({ days: resetDays })
                .eq('userId', userId);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error("Error in weekly reset:", error);
            return { success: false, error };
        }

    }
};