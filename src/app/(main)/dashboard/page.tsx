'use client';
import { SubTask, WeeklySnapshot } from '@/types'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyTasksSync } from '@/services/weeklyTasksSyncService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CheckCircle2, Trophy } from 'lucide-react';
import MyImpact from '@/features/dashboard/MyImpact';

const DashBoard = () => {
    const { user, loading: authLoading } = useAuth(); // تأكد إن useAuth بترجع حالة تحميل الـ Auth
    const [loading, setLoading] = useState(true); // ابدأ بـ true عشان الـ Refresh
    const [snapData, setSnapData] = useState<WeeklySnapshot[] | null>(null);

    const getSnapShot = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const snapShot = await WeeklyTasksSync.fetchSnapshot(user.id);
            setSnapData(snapShot || []);
        } catch (error) {
            console.error("Failed to fetch snapshots:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user?.id) {
            getSnapShot();
        } else if (!authLoading && !user) {
            setLoading(false); // لو مفيش يوزر خلاص بطل تحميل
        }
    }, [user?.id, authLoading]);

    // 1. حماية الحسابات: لو لسه بيحمل أو البيانات مش موجودة، استخدم قيم افتراضية
    const totalWeeks = snapData?.length || 0;

    const totalLifetimeCompleted = snapData?.reduce((acc, snap) => {
        // تأكد إن week_data موجودة قبل ما تعمل reduce
        const snapTotal = (snap.week_data || []).reduce((taskAcc, task) => {
            return taskAcc + Object.values(task.days || {}).filter(Boolean).length;
        }, 0);
        return acc + snapTotal;
    }, 0) || 0;

    // 2. حالة التحميل الأساسية (تمنع الـ White Screen)
    if (authLoading || (loading && !snapData)) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='loader' />
            </div>
        );
    }

    // 3. حالة عدم وجود مستخدم
    if (!user) {
        return <div className="py-20 px-7 text-center">يرجى تسجيل الدخول لعرض الإحصائيات</div>;
    }

    return (
        <div className='flex flex-col gap-4 py-20 lg:px-7 px-1 min-h-screen'>
            <MyImpact currentUserId={user.id} />
            {/* باقي الـ JSX بتاعك زي ما هو */}
            {snapData && snapData.length === 0 && (
                <div className="text-center py-10">
                    <h2 className='text-2xl text-brand-text font-bold'>لا يوجد سجل سابق</h2>
                    <p className="text-muted">ابدأ أول أسبوع لك لتظهر الإحصائيات هنا.</p>
                </div>
            )}

            {/* ... الكود الجمالي بتاعك ... */}
            <>
                {
                    loading && <div className='loader' />
                }


                {/* --- Global Stats Hero Card --- */}
                {snapData && snapData.length > 0 && (
                    <div className="relative overflow-hidden rounded-3xl bg-brand-secondary p-8 text-primary border shadow-2xl shadow-brand/20 mb-8">
                        {/* خلفية جمالية خفيفة */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                    <Trophy className="w-10 h-10 text-warning" />
                                    سجل إنجازاتك
                                </h1>
                                <p className="text-primary/80 font-medium">
                                    تتابع رحلتك عبر {totalWeeks} {totalWeeks === 1 ? 'أسبوع محفوظ' : totalWeeks === 2 ? 'أسبوعين محفوظين' : 'أسابيع محفوظة'}
                                </p>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="flex-1 flex items-center justify-between bg-primary/20 border-2 border-primary backdrop-blur-md rounded-2xl p-4 min-w-[140px]">
                                    <p className="text-sm font-bold text-primary/70 mb-1">إجمالي أيام الإنجاز</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{totalLifetimeCompleted}</span>
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                    </div>
                                </div>

                                {/* <div className="flex-1 md:flex-none bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[140px]">
                                    <p className="text-sm uppercase font-bold text-primary/70 mb-1">Consistency Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{Math.min(100, (totalLifetimeCompleted / (totalWeeks || 1) * 2)).toFixed(0)}%</span>
                                        <Flame className="w-4 h-4 text-warning" />
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                )}

                {snapData && snapData.length > 0 &&
                    snapData.slice().reverse().map((snap) => {
                        const snapWeekStart = snap.week_start ? new Date(snap.week_start) : new Date();

                        const totalTasks = snap.week_data.length;
                        const totalCompletedDays = snap.week_data.reduce((sum, task) => {
                            return sum + Object.values(task.days || {}).filter(Boolean).length;
                        }, 0);

                        return (
                            <div key={snap.id} className="mb-12 border-2 p-1 border-primary pt-8 shadow-md rounded-3xl shadow-brand">

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-brand/20"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-black text-brand tracking-wide">إنجازات هذا الأسبوع</span>
                                        <h3 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2">
                                            {format(snapWeekStart, 'd MMMM', { locale: ar })}
                                            <span className="text-brand">—</span>
                                            {snap.week_end ? format(new Date(snap.week_end), 'd MMMM', { locale: ar }) : ''}
                                        </h3>
                                    </div>
                                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-brand/20"></div>
                                </div>

                                <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-secondary/80 p-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-sm font-bold text-muted">عدد المهام</p>
                                        <p className="text-2xl font-black text-primary">{totalTasks}</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-sm font-bold text-muted">تم الإكمال</p>
                                        <p className="text-2xl font-black text-brand">{totalCompletedDays}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 px-2 pb-4">
                                    {snap.week_data.map((task, i) => (
                                        <div key={i} className="flex flex-col gap-2 py-2">
                                            <h4 className="text-lg font-semibold text-secondary">{task.content}</h4>
                                            {task.sub_tasks && task.sub_tasks.length > 0 && (
                                                <div className="space-y-1 ps-3">
                                                    {/* <h3 className="text-sm font-bold text-secondary">
                                                        انجازت اضافية للانجاز الرئيسي
                                                    </h3> */}
                                                    {task.sub_tasks.map((st: SubTask) => (
                                                        <div key={st.id} className="flex items-center justify-between gap-2 text-sm py-1">
                                                            <span className="text-muted">{st.content}</span>
                                                            <span className="text-xs font-bold text-success">
                                                                {Object.keys(st.days_completed || {}).length} أيام
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                }

            </>
        </div>
    );
};



export default DashBoard