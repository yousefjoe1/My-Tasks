'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserTask } from '@/types';
import { Plus, Check, Save, User as UserIcon, Award, Loader } from 'lucide-react';
import { updateTaskCount } from '../actions/group-tasks.actions';
import { useToast } from '@/components/Toasts/useToast';
import ToastContainer from '@/components/Toasts/ToastContainer';

// toast , sooner

interface MyTasksControlsProps {
    users: User[];
}

export default function MyTasksControls({ users }: MyTasksControlsProps) {
    const { user: currentUser } = useAuth();
    const [localUserTasks, setLocalUserTasks] = useState<UserTask[]>([]);
    // loading state
    const [loading, setLoading] = useState(false);
    const { error, success, toast, toasts, removeToast } = useToast()

    // تحديث الحالة المحلية عند تحميل المستخدم أو الـ users
    useEffect(() => {
        if (currentUser) {
            const myData = users.find(u => u.id === currentUser.id);
            if (myData?.user_tasks) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLocalUserTasks(myData.user_tasks);
            }
        }
    }, [currentUser, users]);

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
            await updateTaskCount(currentUser.id, userTask.task_id, userTask.count || 0);
            toast(`تم حفظ تقدمك في: ${userTask.tasks?.name}`)
        } catch (error) {
            alert("حدث خطأ أثناء الحفظ، حاول مرة أخرى");
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="space-y-6 p-1 bg-brand-bg text-brand-text transition-colors duration-300">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header: ترحيب بالمستخدم */}
            <header className="flex flex-col gap-2 border-b border-brand-border pb-1">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                        <Award size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">مهامي اليومية</h2>
                        <p className="text-brand-text-muted text-sm">أهلاً {currentUser.full_name || 'بأخواتي في الله'}</p>
                    </div>
                </div>

                <h3 className="text-2xl font-black text-center">
                    أذكار بسيطة
                </h3>
            </header>

            {/* Grid لمهام المستخدم فقط */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localUserTasks.map((userTask) => (
                    <div key={userTask.id} className=' bg-brand-secondary border border-brand-border rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border-b-4 border-b-brand-primary'>

                        <button onClick={() => handleIncrement(userTask.task_id)}
                            key={userTask.id}
                            className="group w-full flex flex-col pb-1 pt-2 px-3 overflow-hidden relative"
                        >
                            {/* زخرفة خلفية بسيطة */}
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>

                            {/* اسم المهمة */}
                            <div className="flex justify-between items-start mb-2 z-10">
                                <h3 className="font-bold text-lg text-brand-text leading-tight max-w-[70%]">
                                    {userTask.tasks?.name}
                                </h3>
                                {userTask.is_completed && (
                                    <span className="bg-brand-success/10 text-brand-success p-1 rounded-full">
                                        <Check size={16} strokeWidth={3} />
                                    </span>
                                )}
                            </div>

                            {/* العداد المركزي */}
                            <div className="flex flex-col items-center justify-center relative transition-all active:scale-95 ">
                                <div className="w-36 h-36 rounded-full border-4 border-brand-tertiary flex flex-col items-center justify-center bg-brand-bg shadow-inner">
                                    <span className="text-3xl font-black text-brand-primary font-mono">
                                        {userTask.count || 0}
                                    </span>
                                    <span className="text-[10px] text-brand-text-muted font-bold">تكرار</span>
                                    <span>+</span>
                                </div>
                            </div>

                            {/* أزرار التحكم */}
                        </button>
                        <div className="flex gap-3 justify-center mt-2 z-10">

                            <button
                                onClick={() => handleSave(userTask)}
                                className="w-24 p-2 flex items-center justify-center bg-brand-tertiary hover:bg-brand-border text-brand-text-secondary rounded-2xl transition-all active:scale-95 border border-brand-border"
                                title="حفظ التقدم"
                                disabled={loading}
                            >
                                {loading ? <Loader size={20} className="animate-spin" /> : <> <Save size={20} className='ml-2' /> حفظ</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* حالة عدم وجود مهام */}
            {localUserTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-brand-secondary rounded-3xl border-2 border-dashed border-brand-border">
                    <UserIcon size={48} className="text-brand-text-muted opacity-20 mb-4" />
                    <p className="text-brand-text-secondary font-medium">لا توجد مهام مسندة إليك حالياً</p>
                </div>
            )}
        </div>
    );
}