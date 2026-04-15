'use client';
import React, { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { WeeklyTasksService } from '@/services/weeklyTasksService';
import { updateTask } from '@/store/weeklyTasksSlice'; // Import updateTask action
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface AddSubTaskProps {
    taskId: string;
    onSubTaskAdded?: () => void; // Optional callback
}

const AddSubTask: React.FC<AddSubTaskProps> = ({ taskId, onSubTaskAdded }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newSubTaskContent, setNewSubTaskContent] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const task = useSelector((state: RootState) =>
        state.weeklyTasks.tasks.find(t => t.id === taskId)
    );
    const handleAddClick = () => {
        setIsAdding(true);
        setNewSubTaskContent('');
        // Focus input immediately
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setNewSubTaskContent('');
    };

    const handleSubmit = async () => {
        const content = newSubTaskContent.trim();
        if (!content) return;

        setLoading(true);
        try {
            // 1. Create subtask via API
            const newSubTask = await WeeklyTasksService.createSubTask(taskId, {
                content,
                days_completed: {}
            });

            // 2. Optimistically update Redux store
            dispatch(updateTask({
                id: taskId,
                updates: {
                    sub_tasks: [
                        ...(task?.sub_tasks || []),
                        newSubTask
                    ]
                }
            }));

            // 3. Reset form
            setIsAdding(false);
            setNewSubTaskContent('');

            // 4. Callback if provided
            onSubTaskAdded?.();

        } catch (error) {
            console.error('Failed to create subtask:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <>
            {isAdding ? (
                // Expanded Form State
                <div className="flex items-center gap-2 p-2 bg-tertiary/50 rounded-2xl border border-primary animate-in slide-in-from-top-2 duration-200">
                    <input
                        ref={inputRef}
                        value={newSubTaskContent}
                        onChange={(e) => setNewSubTaskContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleSubmit}
                        placeholder="أضف مهمة فرعية جديدة..."
                        className="flex-1 px-3 py-2 text-sm bg-primary text-primary border border-primary 
                                   rounded-xl outline-none focus:ring-2 focus:ring-primary-2/50 
                                   focus:border-primary-2 transition-all"
                        disabled={loading}
                        autoComplete="off"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!newSubTaskContent.trim() || loading}
                        className="p-2 rounded-xl bg-success/15 text-success hover:bg-success 
                                   text-white border active:scale-95 transition-all font-medium 
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-white rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                    </button>

                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="p-2 rounded-xl text-red-400 border border-red-400 hover:bg-secondary/50 
                                   hover:text-primary active:scale-95 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                // Collapsed Add Button
                <button
                    onClick={handleAddClick}
                    disabled={loading}
                    className="group flex items-center gap-2 w-full p-3 bg-tertiary/30 
                               hover:bg-primary-2/20 border-2 border-dashed border-primary-2/40 
                               rounded-2xl transition-all duration-200 hover:scale-[1.02] 
                               active:scale-100 font-medium text-primary-2 hover:text-primary"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">أضف مهمة فرعية جديدة</span>
                </button>
            )}
        </>
    );
};

export default AddSubTask;