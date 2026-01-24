// store/weeklyTasksSlice.ts
import { WeeklyTask } from '@/types'
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
        // Synchronous actions
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
        removeTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload)
            state.loading = false
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<{ id: string; message: string | null }>) => {
            if (action.payload.message === null) {
                delete state.error[action.payload.id]; // Clear error
            } else {
                state.error[action.payload.id] = action.payload.message;
            }
        },
        setSyncLoading: (state, action: PayloadAction<boolean>) => {
            state.syncLoading = action.payload
        }
    }
})

export const { setTasks, addTask, updateTask, removeTask, setLoading, setError, setSyncLoading } = weeklyTasksSlice.actions

export default weeklyTasksSlice.reducer