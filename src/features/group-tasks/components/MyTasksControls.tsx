// src/features/group-tasks/components/MyTasksControls.tsx
'use client';
import { useState } from 'react';
// import { updateTaskCount } from '@/features/group-tasks/actions/group-tasks.actions';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserTask, WeeklyTask } from '@/types';

export default function MyTasksControls({ allTasks }: { allTasks: WeeklyTask[] }) {
    // منطق العدادات الخاص بيك فقط
    const { user } = useAuth();
    const [tasks, setTasks] = useState(allTasks);

    const handleIncrement = (taskId) => {
        setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, count: t.count + 1 } : t));
    };

    const handleSave = async (task) => {
        // await updateTaskCount(task.user_id, task.task_id, task.count, new Date().toISOString());
        alert("تم الحفظ");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {allTasks.map(task => {
                const myTask = tasks.find(t => t.task_id === task.id);
                return (
                    <div key={task.id} className="border p-4 rounded-xl flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full border-2 border-blue-500 flex items-center justify-center">
                            {myTask?.count || 0}
                        </div>
                        <p className="mt-2">{task.content}</p>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => handleIncrement(task.id)} className="bg-green-600 px-2 rounded">+</button>
                            <button onClick={() => handleSave(myTask)} className="bg-blue-600 px-2 rounded">حفظ</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}