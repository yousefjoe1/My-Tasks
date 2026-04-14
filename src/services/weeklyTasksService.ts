// services/weeklyTasksService.ts
import { SubTask, WeeklyTask } from '@/types'
import { supabase } from '@/lib/supabase/client'
/**
 * Service layer handles ALL data operations
 * Benefits:
 * - Separates business logic from UI
 * - Easy to test in isolation
 * - Reusable across different components
 * - Single place to modify API calls
 */

export class WeeklyTasksService {

    static async fetchCloudTasks(userId: string | undefined): Promise<WeeklyTask[]> {
        if (userId) {
            const { data, error } = await supabase
                .from('weekly_tasks')
                .select('*')
                .eq('userId', userId)

            if (error) throw error
            return data || []
        } else {
            return []
        }
    }

    // services/weeklyTasksService.ts
    static async getEssentialTasks(userId: string) {
        const { data, error } = await supabase
            .from('weekly_tasks')
            .select('*')
            .eq('userId', userId)
            .eq('is_essential', true); // الفلتر السحري بتاعنا

        if (error) throw error;
        return data;
    }

    // Fetch tasks from appropriate source
    static async fetchTasks(userId: string | undefined): Promise<WeeklyTask[]> {
        if (userId) {
            const { data, error } = await supabase
                .from('weekly_tasks')
                .select(`
                    *,
                    sub_tasks (*) 
                `)
                .eq('userId', userId)

            if (error) throw error
            return data || []
        } else {
            return []
        }
    }

    // Add new task
    static async addTask(task: WeeklyTask, userId: string | undefined, is_essential?: boolean): Promise<WeeklyTask> {
        if (userId) {
            // 1. استخراج الـ sub_tasks من الـ task object قبل الحفظ في الجدول الرئيسي
            // لأن جدول weekly_tasks مفيش فيه عمود اسمه sub_tasks
            const { id, sub_tasks, ...insertData } = task;

            // 2. حفظ المهمة الأساسية
            const { data: mainTask, error: mainError } = await supabase
                .from('weekly_tasks')
                .insert({
                    ...insertData,
                    userId,
                    is_essential: is_essential
                })
                .select()
                .single();

            if (mainError) throw mainError;

            // 3. إذا كان هناك مهام فرعية، قم بحفظها وربطها بالـ task_id
            if (sub_tasks && sub_tasks.length > 0) {
                const subTasksToInsert = sub_tasks.map((st: SubTask) => ({
                    task_id: mainTask.id, // الربط مع المهمة اللي لسه مخلوقة
                    content: st.content,
                    days_completed: st.days_completed || { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
                }));

                const { data: insertedSubTasks, error: subError } = await supabase
                    .from('sub_tasks')
                    .insert(subTasksToInsert)
                    .select();

                if (subError) throw subError;

                // أرجع المهمة الأساسية مضافاً إليها المهام الفرعية اللي اتحفظت
                return { ...mainTask, sub_tasks: insertedSubTasks };
            }

            return mainTask;
        } else {
            return task;
        }
    }

    // Update existing task
    static async updateTask(
        taskId: string,
        updates: Partial<WeeklyTask>,
        userId: string | undefined
    ): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('weekly_tasks')
                .update(updates)
                .eq('id', taskId)
                .eq('userId', userId)

            if (error) throw error
        }

    }
    static async updateSubTask(
        subTaskId: string,
        updates: Partial<SubTask>
    ): Promise<void> {
        const { error } = await supabase
            .from('sub_tasks')
            .update(updates)
            .eq('id', subTaskId);

        if (error) throw error;
    }
    // Delete task
    static async deleteTask(taskId: string, userId: string | undefined): Promise<void> {
        if (userId) {
            const { error } = await supabase
                .from('weekly_tasks')
                .delete()
                .eq('id', taskId)
                .eq('userId', userId)

            if (error) throw error
        }

    }
}