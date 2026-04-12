'use client';

import { useWeeklyTasks } from '@/hooks/useWeeklyTasks';
import { AddBlock } from '@/components/AddBlock';
import WeeklyTable from '@/components/blocks/WeeklyTable';
import { WeeklyTask } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useCallback, useMemo } from 'react';
import ErrorBoundary from '@/common/ErrorBoundry';
import ToastContainer from '@/components/Toasts/ToastContainer';
import { useToast } from '@/components/Toasts/useToast';
import { Loader2 } from 'lucide-react';

export default function PowerfulDay() {
    const { error, success, toast, toasts, removeToast } = useToast();
    const { updateBlock, deleteBlock, seedEssentialTasks } = useWeeklyTasks({ error, success, toast });

    const { tasks, syncLoading, loading } = useSelector((state: RootState) => state.weeklyTasks);

    // فلترة المهام الأساسية (is_essential)
    const essentialTasks = useMemo(() =>
        tasks?.filter((t: WeeklyTask) => t.is_essential !== true) || [],
        [tasks]);

    const handleDelete = useCallback((id: string) => {
        deleteBlock(id);
    }, [deleteBlock]);

    return (
        <section className="min-h-screen bg-secondary py-8 pt-12">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="max-w-[90%] mx-auto">
                <div className="glass-card p-2 border-primary">

                    {/* <div className="mb-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-secondary pb-6">
                        <div className="text-center md:text-left">
                            <h1 className="lg:text-4xl text-2xl font-black text-primary tracking-tight mb-2">
                                ⚡ Powerful Day
                            </h1>
                            <p className="text-secondary font-medium">
                                المهام الاساسية لبناء نسختك الأفضل
                            </p>
                        </div>

                        {essentialTasks.length === 0 && !loading && (
                            <button
                                disabled={loading}
                                onClick={seedEssentialTasks}
                                className="bg-brand text-white lg:px-6 px-3 text-sm py-2 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-brand/20"
                            >
                                اضافة المهام الاساسية + {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            </button>
                        )}
                    </div> */}

                    <div className="space-y-6 relative">
                        {syncLoading && (
                            <div className='z-20 rounded-2xl absolute inset-0 h-full w-full flex flex-col items-center justify-center bg-primary/40 backdrop-blur-md'>
                                <div className="loader"></div>
                                <h2 className='text-primary font-bold mt-4 px-4 py-2 bg-tertiary rounded-full shadow-sm'>
                                    جاري مزامنة بياناتك القوية...
                                </h2>
                            </div>
                        )}

                        <div className="mb-8">
                            <AddBlock success={success} toast={toast} error={error} isEssentialPage={true} />
                        </div>

                        {essentialTasks.map((block) => (
                            <ErrorBoundary
                                key={block.id}
                                fallback={<p className="p-4 bg-error/10 text-error rounded-xl">عذراً، حدث خطأ في تحميل هذه المهمة.</p>}
                            >
                                <WeeklyTable
                                    task={block}
                                    onUpdate={(taskid: string, updates: Partial<WeeklyTask>) => updateBlock(taskid, updates)}
                                    onDelete={handleDelete}
                                    loading={loading}
                                />
                            </ErrorBoundary>
                        ))}

                        {essentialTasks.length === 0 && !loading && (
                            <div className="text-center py-24 border-2 border-dashed rounded-3xl border-secondary">
                                <div className="text-6xl mb-4">🎯</div>
                                <p className="text-muted text-lg font-medium">
                                    لم تضف أي مهام أساسية بعد. <br />
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}