// services/weeklyTasksService.ts
import { WeeklyTask } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { LocalStorageStrategy } from '@/lib/storage/weeklyTasks/LocalStorageStrategy'
import { shouldResetWeek } from '@/lib/utils'

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

    // Fetch tasks from appropriate source
    static async fetchTasks(userId: string | undefined): Promise<WeeklyTask[]> {
        if (userId) {
            const { data, error } = await supabase
                .from('weekly_tasks')
                .select('*')
                .eq('userId', userId)

            if (error) throw error
            return data || []
        } else {
            return LocalStorageStrategy.getWeeklyTasks()
        }
    }

    // Add new task
    static async addTask(task: WeeklyTask, userId: string | undefined): Promise<WeeklyTask> {
        if (userId) {
            const { id, ...insertData } = task

            const { data, error } = await supabase
                .from('weekly_tasks')
                .insert({ ...insertData, userId })
                .select()
                .single()

            if (error) throw error

            // Sync to localStorage as backup
            LocalStorageStrategy.addBlock(data)

            return data
        } else {
            LocalStorageStrategy.addBlock(task)
            return task
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

        // Always sync to localStorage
        LocalStorageStrategy.updateBlock(taskId, updates)
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

        LocalStorageStrategy.deleteBlock(taskId)
    }

    static async saveSnapShot(userId: string | undefined): Promise<void> {
        if (userId) {
            const tasks = await this.fetchTasks(userId)
            const needsReset = tasks?.some(
                (block) => block.updated_at && shouldResetWeek(new Date(block.updated_at))
            )
            if (needsReset) {
                const snapshotData = tasks.map(block => ({
                    id: block.id,
                    content: block.content,
                    days: block.days
                }));

                // Calculate week start and end
                const now = new Date();
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay()); // Sunday
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6); // Saturday
                weekEnd.setHours(23, 59, 59, 999);

                const snapshot = {
                    user_id: userId,
                    archived_at: new Date().toISOString(),
                    week_start: weekStart.toISOString(),
                    week_end: weekEnd.toISOString(),
                    week_data: snapshotData
                };

                await supabase.from('weekly_snapshots').insert(snapshot);
                LocalStorageStrategy.saveWeeklySnapshot(userId);
            }
        } else {
            LocalStorageStrategy.saveWeeklySnapshot(userId);
        }
    }

    static async saveSnapShotNow(userId: string | undefined): Promise<void> {
        if (userId) {
            const tasks = await this.fetchTasks(userId)
            const snapshotData = tasks.map(block => ({
                id: block.id,
                content: block.content,
                days: block.days
            }));

            // Calculate week start and end
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay()); // Sunday
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // Saturday
            weekEnd.setHours(23, 59, 59, 999);

            const snapshot = {
                user_id: userId,
                archived_at: new Date().toISOString(),
                week_start: weekStart.toISOString(),
                week_end: weekEnd.toISOString(),
                week_data: snapshotData
            };

            await supabase.from('weekly_snapshots').insert(snapshot);
            LocalStorageStrategy.saveWeeklySnapshot(userId);
        } else {
            LocalStorageStrategy.saveWeeklySnapshot(userId);
        }




    }

    // static async getSnapShotCloud(userId: string | undefined):Promise<void>{
    //     if(userId){
    //         const { data, error } = await supabase.from('weekly_snapshots')
    //             .select('*')
    //             .eq('userId', userId)
    //         return data
    //     }

    // }
}