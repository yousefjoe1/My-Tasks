import { supabase } from '@/lib/supabase/client';

// services/weeklyService.ts
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

export const handleWeeklyReset = async (userId: string | undefined): Promise<{ success: boolean; }> => {
    if (!userId) return { success: false };

    const lastWeekDate = subWeeks(new Date(), 1);
    const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
    const resetDays = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };

    try {
        // Optional: quick check if reset is still needed
        const { data: currentTasks } = await supabase
            .from('weekly_tasks')
            .select('id')
            .eq('userId', userId)
            .limit(1);

        if (!currentTasks || currentTasks.length === 0) {
            return { success: true };
        }

        const { data: tasks, error: fetchError } = await supabase
            .from('weekly_tasks')
            .select('*')
            .eq('userId', userId);

        if (fetchError || !tasks) throw fetchError;

        const snapshot = {
            user_id: userId,
            week_start: weekStart.toISOString(),
            week_end: weekEnd.toISOString(),
            week_data: tasks.map(t => ({
                id: t.id,
                content: t.content,
                days: t.days
            })),
            archived_at: new Date().toISOString()
        };

        const { error: snapshotError } = await supabase.from('weekly_snapshots').insert(snapshot);
        if (snapshotError) throw snapshotError;

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