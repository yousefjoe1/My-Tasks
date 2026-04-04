import { supabase } from '@/lib/supabase/client';

// services/weeklyService.ts
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

export const handleWeeklyReset = async (userId: string | undefined): Promise<{ success: boolean; }> => {
    if (!userId) return { success: false };

    try {
        const now = new Date();
        // بداية الأسبوع الحالي اللي احنا فيه دلوقتي
        const currentWeekStart = startOfWeek(now, { weekStartsOn: 6 });

        // نهاية الأسبوع اللي فات هي بالضبط قبل بداية الأسبوع الحالي بـ ملي ثانية
        const lastWeekEnd = new Date(currentWeekStart.getTime() - 1);
        const lastWeekStart = startOfWeek(lastWeekEnd, { weekStartsOn: 6 });

        const resetDays = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };

        // 1. جلب المهام الحالية
        const { data: tasks, error: fetchError } = await supabase
            .from('weekly_tasks')
            .select('*')
            .eq('userId', userId); // تأكد من اسم العمود userId أو user_id

        if (fetchError) throw fetchError;

        // لو مفيش مهام، مفيش داعي للأرشفة، بس نرجع success
        if (!tasks || tasks.length === 0) return { success: true };

        // 2. تجهيز السناب شوت
        const snapshot = {
            user_id: userId,
            week_start: lastWeekStart.toISOString(),
            week_end: lastWeekEnd.toISOString(),
            week_data: tasks.map(t => ({
                id: t.id,
                content: t.content,
                days: t.days
            })),
            archived_at: now.toISOString()
        };

        // 3. تنفيذ العمليات في الداتابيز
        // أرشفة الأسبوع القديم
        const { error: snapshotError } = await supabase.from('weekly_snapshots').insert(snapshot);
        if (snapshotError) throw snapshotError;

        // تصفير الأيام للأسبوع الجديد
        const { error: updateError } = await supabase
            .from('weekly_tasks')
            .update({ days: resetDays })
            .eq('userId', userId);

        if (updateError) throw updateError;

        return { success: true };
    } catch (error) {
        console.error("Error in weekly reset:", error);
        return { success: false };
    }
};