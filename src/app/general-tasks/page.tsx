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


export default function PowerfulDay() {
    const { error, success, toast, toasts, removeToast } = useToast();
    const { updateBlock, deleteBlock } = useWeeklyTasks({ error, success, toast });

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
                            <AddBlock success={success} toast={toast} error={error} />
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

                    </div>
                </div>
            </div>
        </section>
    );
}