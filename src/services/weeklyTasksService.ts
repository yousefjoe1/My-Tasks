// services/weeklyTasksService.ts
import { WeeklyTask } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { LocalStorageStrategy } from '@/lib/storage/weeklyTasks/LocalStorageStrategy'

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

    // Sync local tasks to cloud
    static async syncLocalToCloud(userId: string): Promise<void> {
        const localTasks = LocalStorageStrategy.getWeeklyTasks()

        const { data: cloudTasks } = await supabase
            .from('weekly_tasks')
            .select('*')
            .eq('userId', userId)

        const existingIds = new Set(cloudTasks?.map(t => t.id) || [])
        const newTasks = localTasks
            .filter(task => !existingIds.has(task.id))
            .map(task => ({ ...task, userId }))

        if (newTasks.length > 0) {
            const { error } = await supabase
                .from('weekly_tasks')
                .insert(newTasks)

            if (error) throw error
        }
    }
}