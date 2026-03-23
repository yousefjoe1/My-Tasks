// services/weeklyTasksService.ts
import { WeeklyTask } from '@/types'
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
            return []
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

            return data
        } else {
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