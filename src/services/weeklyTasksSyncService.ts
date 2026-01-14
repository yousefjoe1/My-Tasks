import { LocalStorageStrategy } from "@/lib/storage/weeklyTasks/LocalStorageStrategy";
import { WeeklyTasksService } from "./weeklyTasksService";



export class WeeklyTasksSync {
    // Change this in your WeeklyTasksSync class:
    static async addTheNewTasks(userId: string | undefined) {
        const localTasks = LocalStorageStrategy.getWeeklyTasks();
        const cloudTasks = await WeeklyTasksService.fetchTasks(userId);
        const cloudTasksIds = cloudTasks.map(el => el.id);
        const newTasks = localTasks.filter(el => !cloudTasksIds.includes(el.id));

        // Use for...of to properly await each step
        for (const task of newTasks) {
            const { ...rest } = task;
            await WeeklyTasksService.addTask(rest, userId);
            LocalStorageStrategy.deleteBlock(task?.id);
        }
    }


    static async updateExistingTasks(userId: string | undefined) {
        const localTasks = LocalStorageStrategy.getWeeklyTasks()
        const cloudTasks = await WeeklyTasksService.fetchTasks(userId)
        for (const task of localTasks) {
            const dbData = cloudTasks.find(dbTask => dbTask.id === task.id)

            if (dbData) {
                const newUpdateToDbTask = { ...dbData, days: task.days }
                await WeeklyTasksService.updateTask(dbData.id, newUpdateToDbTask, userId)
            }

        }
    }

    static async deleteMissingTasks(userId: string | undefined) {

        const localTasks = LocalStorageStrategy.getWeeklyTasks()
        const cloudTasks = await WeeklyTasksService.fetchCloudTasks(userId)
        const localTasksIds = localTasks.map(el => el.id)
        const missingTasks = cloudTasks.filter(el => !localTasksIds.includes(el.id))


        for (const task of missingTasks) {
            await WeeklyTasksService.deleteTask(task.id, userId)
        }

    }
}