import { supabase } from '@/lib/supabase/client';

// services/weeklyService.ts
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

// export const handleWeeklyReset = async (userId: string | undefined): Promise<{ success: boolean; }> => {
//     if (!userId) return { success: false };

//     const lastWeekDate = subWeeks(new Date(), 1);
//     const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
//     const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
//     const resetDays = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };

//     try {
//         // Optional: quick check if reset is still needed
//         const { data: currentTasks } = await supabase
//             .from('weekly_tasks')
//             .select('id')
//             .eq('userId', userId)
//             .limit(1);

//         if (!currentTasks || currentTasks.length === 0) {
//             return { success: true };
//         }

//         const { data: tasks, error: fetchError } = await supabase
//             .from('weekly_tasks')
//             .select('*')
//             .eq('userId', userId);

//         if (fetchError || !tasks) throw fetchError;

//         const snapshot = {
//             user_id: userId,
//             week_start: weekStart.toISOString(),
//             week_end: weekEnd.toISOString(),
//             week_data: tasks.map(t => ({
//                 id: t.id,
//                 content: t.content,
//                 days: t.days
//             })),
//             archived_at: new Date().toISOString()
//         };

//         const { error: snapshotError } = await supabase.from('weekly_snapshots').insert(snapshot);
//         if (snapshotError) throw snapshotError;

//         const { error: updateError } = await supabase
//             .from('weekly_tasks')
//             .update({ days: resetDays })
//             .eq('userId', userId);

//         if (updateError) throw updateError;

//         return { success: true };
//     } catch (error) {
//         console.error("Error in weekly reset:", error);
//         return { success: false };
//     }
// };


// export const handleWeeklyReset = async (userId: string | undefined): Promise<{ success: boolean; }> => {
//     if (!userId) return { success: false };

//     const lastWeekDate = subWeeks(new Date(), 1);
//     const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
//     const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
//     const resetDays = { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false };

//     try {
//         // 1. جلب المهام الرئيسية
//         const { data: tasks, error: taskError } = await supabase
//             .from('weekly_tasks')
//             .select('*')
//             .eq('userId', userId);

//         if (taskError || !tasks) throw taskError;

//         // 2. جلب المهام الفرعية (Sub Tasks)
//         const { data: subTasks, error: subTaskError } = await supabase
//             .from('sub_tasks')
//             .select('*')
//             .eq('userId', userId); // تأكد إن الـ userId موجود في جدول sub_tasks

//         if (subTaskError) throw subTaskError;

//         // 3. بناء الـ Snapshot مع دمج الـ Sub Tasks داخل الـ Parent Task
//         const week_data = tasks.map(t => ({
//             id: t.id,
//             content: t.content,
//             days: t.days,
//             // دمج المهام الفرعية التابعة للمهمة الحالية
//             sub_tasks: subTasks?.filter(st => st.task_id === t.id) || []
//         }));

//         const snapshot = {
//             user_id: userId,
//             week_start: weekStart.toISOString(),
//             week_end: weekEnd.toISOString(),
//             week_data: week_data,
//             archived_at: new Date().toISOString()
//         };

//         const { error: snapshotError } = await supabase.from('weekly_snapshots').insert(snapshot);
//         if (snapshotError) throw snapshotError;

//         // 4. Reset المهام الرئيسية
//         const { error: updateTasksError } = await supabase
//             .from('weekly_tasks')
//             .update({ days: resetDays })
//             .eq('userId', userId);
//         if (updateTasksError) throw updateTasksError;

//         // 5. Reset المهام الفرعية
//         const { error: updateSubTasksError } = await supabase
//             .from('sub_tasks')
//             .update({ days_completed: {} }) // تصفير أيام الإنجاز
//             .eq('userId', userId);
//         if (updateSubTasksError) throw updateSubTasksError;

//         return { success: true };
//     } catch (error) {
//         console.error("Error in weekly reset:", error);
//         return { success: false };
//     }
// };

export const handleWeeklyReset = async (userId: string | undefined): Promise<{ success: boolean }> => {
    if (!userId) return { success: false };

    try {
        const lastWeekDate = subWeeks(new Date(), 1);
        const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
        const resetDays = {
            Mon: false, Tue: false, Wed: false, Thu: false,
            Fri: false, Sat: false, Sun: false
        };

        console.log(`📊 Creating snapshot for week: ${weekStart.toISOString()}`);

        // 1. Fetch main tasks
        const { data: tasks, error: taskError } = await supabase
            .from('weekly_tasks')
            .select('*')
            .eq('userId', userId);

        if (taskError) {
            console.error("❌ Error fetching tasks:", taskError);
            throw taskError;
        }

        if (!tasks || tasks.length === 0) {
            console.log("⚠️ No tasks found to snapshot");
            return { success: true }; // Not an error if no tasks
        }

        // 2. Fetch sub-tasks with proper filtering
        const taskIds = tasks.map(t => t.id);
        const { data: subTasks, error: subTaskError } = await supabase
            .from('sub_tasks')
            .select('*')
            .in('task_id', taskIds);  // FIXED: Filter by task_id properly

        if (subTaskError) {
            console.error("❌ Error fetching sub-tasks:", subTaskError);
            throw subTaskError;
        }

        // 3. Build snapshot with sub-tasks nested
        const week_data = tasks.map(task => ({
            id: task.id,
            content: task.content,
            description: task.description || null,
            days: task.days || {},
            sub_tasks: subTasks?.filter(st => st.task_id === task.id) || []
        }));

        const snapshot = {
            user_id: userId,
            week_start: weekStart.toISOString(),
            week_end: weekEnd.toISOString(),
            week_data: week_data,
            archived_at: new Date().toISOString()
        };

        // 4. Insert snapshot
        const { error: snapshotError } = await supabase
            .from('weekly_snapshots')
            .insert(snapshot);

        if (snapshotError) {
            console.error("❌ Error creating snapshot:", snapshotError);
            throw snapshotError;
        }

        console.log(`✅ Snapshot created with ${tasks.length} tasks and ${subTasks?.length || 0} sub-tasks`);

        // 5. Reset main tasks
        const { error: updateTasksError } = await supabase
            .from('weekly_tasks')
            .update({ days: resetDays })
            .eq('userId', userId);

        if (updateTasksError) {
            console.error("❌ Error resetting tasks:", updateTasksError);
            throw updateTasksError;
        }

        console.log(`✅ Reset ${tasks.length} main tasks`);

        // 6. Reset sub-tasks
        const { error: updateSubTasksError } = await supabase
            .from('sub_tasks')
            .update({ days_completed: {} })
            .in('task_id', taskIds);

        if (updateSubTasksError) {
            console.error("❌ Error resetting sub-tasks:", updateSubTasksError);
            throw updateSubTasksError;
        }

        console.log(`✅ Reset ${subTasks?.length || 0} sub-tasks`);

        return { success: true };

    } catch (error) {
        console.error("❌ Critical error in weekly reset:", error);
        return { success: false };
    }
};
