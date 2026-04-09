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
import OnboardingWrapper from '@/common/OnboardingWrapper';

export default function Home() {
  const { error, success, toast, toasts, removeToast } = useToast()
  const { updateBlock, deleteBlock } = useWeeklyTasks({
    error,
    success,
    toast,
  });
  const { tasks, loading, syncLoading } = useSelector((state: RootState) => state.weeklyTasks);


  const handleDelete = useCallback(
    (id: string) => {
      deleteBlock(id)
    }
    , [deleteBlock])
  const normalTasks = useMemo(() =>
    tasks?.filter((t: WeeklyTask) => t.is_essential == true) || [],
    [tasks]);

  return (
    <section className="min-h-screen bg-secondary py-8 pt-5">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[95%] mx-auto">
        <div className="bg-primary rounded-2xl shadow-sm p-6">
          <div className="mb-8 flex justify-between items-center">

            <div>
              <h1 className="lg:text-3xl text-xl font-bold text-primary mb-2">
                Weekly Tasks
              </h1>
            </div>
            <OnboardingWrapper />
          </div>



          <div className="space-y-4 relative">
            <AddBlock success={success} toast={toast} error={error} />
            {
              syncLoading &&
              <div className="flex justify-center items-center">
                <div className="loader-v3" />
              </div>
            }

            {
              normalTasks?.map((block) => (
                <ErrorBoundary
                  key={block.id}
                  fallback={<p className="p-2 bg-gray-100 text-red-500">Failed to load this task.</p>}
                >

                  <WeeklyTable
                    key={block.id}
                    task={block}
                    onUpdate={(taskid: string, updates: Partial<WeeklyTask>) => updateBlock(taskid, updates)}
                    onDelete={handleDelete} loading={loading}
                  />
                </ErrorBoundary>
              ))
            }

          </div>
        </div>


      </div>

    </section>
  );
}