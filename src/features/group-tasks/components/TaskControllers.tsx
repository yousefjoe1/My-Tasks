'use client';
import { Loader, Plus, Save } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { updateTaskCount } from '../actions/group-tasks.actions'
import { UserTask } from '@/types'
import { useAuth } from '@/contexts/AuthContext';

const TaskControllers = ({ userTask }: { userTask: UserTask }) => {

    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useAuth();
    const [localUserTasks, setLocalUserTasks] = useState<UserTask[]>([]);

    useEffect(() => {
        if (userTask) {
            setLocalUserTasks([userTask]);
        }
    }, [userTask]);

    const handleIncrement = (taskId: string) => {
        setLocalUserTasks(prev =>
            prev.map(ut =>
                ut.task_id === taskId ? { ...ut, count: (ut.count || 0) + 1 } : ut
            )
        );
    };

    const handleSave = async (userTask: UserTask) => {
        setLoading(true);
        // التأكد من وجود مستخدم مسجل
        if (!currentUser?.id || !userTask.task_id) {
            alert("خطأ: تعذر تحديد المستخدم أو المهمة");
            return;
        }

        try {
            // نمرر id المستخدم الحالي مع id المهمة والعدد الجديد
            await updateTaskCount(currentUser.id, userTask.task_id, userTask.count || 0);

            console.log("Task updated successfully:", userTask);
            alert(`تم حفظ تقدمك في: ${userTask.tasks?.name}`);

            // اختيار اختياري: لو عايز الصفحة تتحدث وتجيب البيانات الجديدة من السيرفر
            // router.refresh(); 
        } catch (error) {
            alert("حدث خطأ أثناء الحفظ، حاول مرة أخرى");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            {/* العداد المركزي */}
            <div className="text-center mb-4">
                <div className="relative flex items-center justify-center">
                    <div className="w-18 h-18 flex items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-primary/50 text-white font-black text-4xl shadow-xl  border-brand-primary/20">
                        {userTask.count}
                    </div>
                </div>
                <p className="text-xs text-brand-text-muted mt-2">عدد مرات التنفيذ</p>
            </div>
            {/* أزرار التحكم */}
            <div className="flex gap-3 mt-6 z-10">
                {/* <button
                    onClick={() => handleIncrement(userTask.task_id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
                >
                    <Plus size={20} />
                    <span>زيادة</span>
                </button> */}

                <button
                    onClick={() => handleSave(userTask)}
                    className="w-14 flex items-center justify-center bg-brand-tertiary hover:bg-brand-border text-brand-text-secondary rounded-2xl transition-all active:scale-95 border border-brand-border"
                    title="حفظ التقدم"
                    disabled={loading}
                >
                    {loading ? <Loader size={20} className="animate-spin" /> : 'حفظ'}
                </button>
            </div>

            {/* مؤشر الحالة */}
            <div className="mt-4 flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full bg-brand-tertiary overflow-hidden`}>
                    <div
                        className="h-full bg-brand-success transition-all duration-500"
                        style={{ width: (userTask.count || 0) >= 10 ? '100%' : `${(userTask.count || 0) * 10}%` }}
                    ></div>
                </div>
                {/* <span className="text-[10px] font-bold text-brand-text-muted">
                                {userTask.count > 0 ? 'قيد التنفيذ' : 'لم تبدأ بعد'}
                            </span> */}
            </div>
        </div>
    )
}

export default TaskControllers