// store/weeklyTasksSlice.ts
import { WeeklyTask, SubTask } from '@/types' // تأكد من استيراد SubTask
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface WeeklyTasksState {
    tasks: WeeklyTask[];
    loading: boolean;
    error: Record<string, string>;
    syncLoading: boolean;
}

const initialState: WeeklyTasksState = {
    tasks: [],
    loading: false,
    error: {},
    syncLoading: false,
}

export const weeklyTasksSlice = createSlice({
    name: 'weeklyTasks',
    initialState,
    reducers: {
        setTasks: (state, action: PayloadAction<WeeklyTask[]>) => {
            state.tasks = action.payload
            state.loading = false
        },
        addTask: (state, action: PayloadAction<WeeklyTask>) => {
            state.tasks.push(action.payload)
            state.loading = false
        },
        updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<WeeklyTask> }>) => {
            const { id, updates } = action.payload
            const index = state.tasks.findIndex(task => task.id === id)
            if (index !== -1) {
                state.tasks[index] = { ...state.tasks[index], ...updates }
            }
            state.loading = false
        },

        // --- الأكشن الجديد للمهام الفرعية ---
        updateSubTaskAction: (state, action: PayloadAction<{ taskId: string, subTaskId: string, updates: Partial<SubTask> }>) => {
            const { taskId, subTaskId, updates } = action.payload;

            // 1. بندور على التاسك الأساسية
            const task = state.tasks.find(t => t.id === taskId);

            if (task && task.sub_tasks) {
                // 2. بندور على الساب تاسك جواها
                const subTaskIndex = task.sub_tasks.findIndex(st => st.id === subTaskId);

                if (subTaskIndex !== -1) {
                    // 3. بنحدث البيانات (زي الـ days_completed)
                    task.sub_tasks[subTaskIndex] = {
                        ...task.sub_tasks[subTaskIndex],
                        ...updates
                    };
                }
            }
            state.loading = false;
        },
        // ----------------------------------

        removeTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload)
            state.loading = false
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<{ id: string; message: string | null }>) => {
            if (action.payload.message === null) {
                delete state.error[action.payload.id];
            } else {
                state.error[action.payload.id] = action.payload.message;
            }
        },
        setSyncLoading: (state, action: PayloadAction<boolean>) => {
            state.syncLoading = action.payload
        }
    }
})

// لا تنسى تصدير الأكشن الجديد
export const {
    setTasks,
    addTask,
    updateTask,
    updateSubTaskAction, // أضفه هنا
    removeTask,
    setLoading,
    setError,
    setSyncLoading
} = weeklyTasksSlice.actions

export default weeklyTasksSlice.reducer