'use client';
import { WeeklySnapshot } from '@/types'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyTasksSync } from '@/services/weeklyTasksSyncService';
import { getWeekDays } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, Flame, Target, Trophy } from 'lucide-react';

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
        <div className='flex flex-col gap-4 py-20 px-7 min-h-screen'>
            {/* باقي الـ JSX بتاعك زي ما هو */}
            {snapData && snapData.length === 0 && (
                <div className="text-center py-10">
                    <h2 className='text-2xl text-brand-text font-bold'>No History Found</h2>
                    <p className="text-muted">ابدأ أول أسبوع ليك عشان تظهر الإحصائيات هنا!</p>
                </div>
            )}

            {/* ... الكود الجمالي بتاعك ... */}
            <>
                {
                    loading && <div className='loader' />
                }

                {
                    snapData && snapData.length === 0 && (
                        <div>
                            <h2 className='text-2xl text-brand-text'>No History</h2>
                        </div>
                    )
                }

                {/* --- Global Stats Hero Card --- */}
                {snapData && snapData.length > 0 && (
                    <div className="relative overflow-hidden rounded-3xl bg-brand-secondary p-8 text-white shadow-2xl shadow-brand/20 mb-8">
                        {/* خلفية جمالية خفيفة */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                    <Trophy className="w-10 h-10 text-warning" />
                                    Your Legend
                                </h1>
                                <p className="text-white/80 font-medium">Tracking your journey through {totalWeeks} archived weeks</p>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="flex-1 md:flex-none bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[140px]">
                                    <p className="text-sm uppercase font-bold text-white/70 mb-1">Total Habits Done</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{totalLifetimeCompleted}</span>
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                    </div>
                                </div>

                                <div className="flex-1 md:flex-none bg-white/20 backdrop-blur-md rounded-2xl p-4 min-w-[140px]">
                                    <p className="text-sm uppercase font-bold text-white/70 mb-1">Consistency Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{Math.min(100, (totalLifetimeCompleted / (totalWeeks || 1) * 2)).toFixed(0)}%</span>
                                        <Flame className="w-4 h-4 text-warning" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {snapData && snapData.length > 0 &&
                    snapData.slice().reverse().map((snap) => {
                        const weekDays = getWeekDays();
                        const snapWeekStart = snap.week_start ? new Date(snap.week_start) : new Date();
                        // const snapWeekDates = getWeekDates(snapWeekStart);

                        const totalTasks = snap.week_data.length;
                        let totalCompletedDays = 0;

                        const tasksStats = snap.week_data.map(task => {
                            const completedCount = Object.values(task.days || {}).filter(Boolean).length;
                            totalCompletedDays += completedCount;
                            return {
                                content: task.content,
                                completedCount,
                                percent: (completedCount / 7) * 100
                            };
                        });

                        const totalPossiblePoints = totalTasks * 7;
                        const totalProgressPercent = totalPossiblePoints > 0
                            ? Math.round((totalCompletedDays / totalPossiblePoints) * 100)
                            : 0;

                        return (
                            <div key={snap.id} className="mb-12 border-t-2 border-brand pt-8 shadow-md rounded-2xl shadow-brand">

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-brand/20"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-black text-brand uppercase tracking-[0.2em]">Weekly Snapshot</span>
                                        <h3 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2">
                                            {format(snapWeekStart, 'MMMM dd')}
                                            <span className="text-brand">—</span>
                                            {snap.week_end ? format(new Date(snap.week_end), 'MMMM dd') : ''}
                                        </h3>
                                    </div>
                                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-brand/20"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="glass-card p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-muted uppercase tracking-wider">Overall Progress</p>
                                            <h4 className="text-2xl font-black text-brand">{totalProgressPercent}%</h4>
                                            <p className="text-xs text-secondary italic">Total efficiency this week</p>
                                        </div>
                                        <div className="w-14 h-14 rounded-full border-4 border-brand/20 border-t-brand flex items-center justify-center font-bold text-xs">
                                            {totalCompletedDays}/{totalPossiblePoints}
                                        </div>
                                    </div>

                                    <div className="glass-card p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-md font-bold text-muted uppercase tracking-wider">Active Tasks</p>
                                            <h4 className="text-2xl font-black text-primary">{totalTasks}</h4>
                                            <p className="text-xs text-secondary italic">Habits tracked</p>
                                        </div>
                                        <div className="text-3xl"><Target /></div>
                                    </div>
                                </div>

                                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                    {tasksStats.map((ts, idx) => (
                                        <div key={idx} className="min-w-[140px] p-3 rounded-xl bg-tertiary border border-secondary">
                                            <p className="text-lg font-bold text-brand mb-1 truncate" title={ts.content}>
                                                {ts.content}
                                            </p>
                                            <div className="flex items-end gap-1">
                                                <span className="text-lg font-black text-primary">{ts.completedCount}</span>
                                                <span className="text-lg text-muted mb-1">/ 7 days</span>
                                            </div>
                                            <div className="w-full h-1 bg-primary rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-success transition-all duration-500"
                                                    style={{ width: `${ts.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 overflow-hidden rounded-xl border border-secondary bg-secondary shadow-sm">
                                    <div className="px-4 py-3 border-b border-primary bg-tertiary/50 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-md font-bold text-muted">DETAILED LOG</span>
                                        <div className="px-3 py-1 rounded-full bg-brand/10 text-brand text-lg font-bold">
                                            {format(snapWeekStart, 'MMM dd')} - {snap.week_end ? format(new Date(snap.week_end), 'MMM dd') : ''}
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {snap.week_data.map((task, i) => {
                                            const daysArray = weekDays.map(day => {
                                                const dayKey = day as keyof typeof task.days;
                                                return task?.days?.[dayKey] ?? false;
                                            });
                                            return (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-primary bg-primary gap-4">
                                                    <h4 className="text-lg font-semibold text-secondary min-w-[120px]">{task.content}</h4>
                                                    <div className="flex justify-between gap-2">
                                                        {daysArray.map((completed, index) => (
                                                            <div key={index} className="flex flex-col items-center gap-1">
                                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${completed ? 'bg-success text-white' : 'bg-tertiary text-muted opacity-20'}`}>
                                                                    {completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                                                </div>
                                                                <span className="text-[8px] font-bold text-muted uppercase">{weekDays[index][0]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
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