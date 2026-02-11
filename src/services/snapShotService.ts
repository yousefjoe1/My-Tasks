import { supabase } from '@/lib/supabase/client';
import { WeeklyTasksService } from './weeklyTasksService';

// services/weeklyService.ts
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { SNAPSHOT_KEY, STORAGE_KEY } from '@/lib/storage/weeklyTasks/LocalStorageStrategy';

export const handleWeeklyReset = async (userId: string | undefined): Promise<{ success: boolean; }> => {
    const lastWeekDate = subWeeks(new Date(), 1);
    const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
    const resetDays = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };
    if (userId) {
        try {

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
                .from('weekly_tasks ')
                .update({ days: resetDays })
                .eq('userId', userId);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error("Error in weekly reset:", error);
            return { success: false };
        }



    } else {
        try {
            const tasks = await WeeklyTasksService.fetchTasks(undefined)

            if (!tasks || tasks.length === 0) return { success: true };

            const snapshot = {
                user_id: 'guest',
                week_start: weekStart.toISOString(),
                week_end: weekEnd.toISOString(),
                week_data: tasks.map(t => ({ id: t.id, content: t.content, days: t.days })),
                archived_at: new Date().toISOString()
            };

            const existingSnapshots = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]');
            existingSnapshots.push(snapshot);
            localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(existingSnapshots));
            const updatedTasks = tasks.map(task => ({
                ...task,
                days: resetDays
            }));

            // حفظ المهام بعد التصفير في الـ Local Storage بنفس المفتاح اللي الـ Service بتستخدمه
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));

            return { success: true };
        } catch (error) {
            console.error("Error in weekly reset (Local):", error);
            return { success: false };
        }

    }
};