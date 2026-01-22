'use client';

import { useWeeklyTasks } from '@/hooks/useWeeklyTasks';
import { AddBlock } from '@/components/AddBlock';

import WeeklyTable from '@/components/blocks/WeeklyTable';
import { WeeklyTask } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useCallback } from 'react';
import ErrorBoundary from '@/common/ErrorBoundry';

export default function Home() {
  const { updateBlock, deleteBlock } = useWeeklyTasks();
  const { tasks, loading, syncLoading } = useSelector((state: RootState) => state.weeklyTasks);


  const handleDelete = useCallback(
    (id: string) => {
      deleteBlock(id)
    }
    , [deleteBlock])


  return (
    <section className="min-h-screen bg-secondary py-8 pt-18">

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-primary rounded-lg shadow-sm border border-primary p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Weekly Tasks
            </h1>
            <p className="text-secondary">
              A simple weekly habit tracker that resets automatically every week
            </p>
          </div>

          <div className="space-y-4 relative">
            {
              syncLoading && <div className='z-10 rounded-xl absolute inset-0 h-full w-full flex flex-col items-center justify-start bg-brand-text-secondary/50'>
                <div className="loader"></div>
                <h2 className='bg-brand-secondary p-3 lg:text-3xl rounded-2xl'>
                  Kindly wait until Syncing Finish
                </h2>
              </div>
            }
            <AddBlock />
            {
              tasks?.map((block) => (
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

        <div className="mt-6 text-center text-muted text-lg">
          <p>📅 Weekly tasks automatically reset every Monday</p>
          <p className="mt-1">💾 Data is saved locally in your browser and synced to cloud after you login</p>
        </div>


        {/* My information developed by*/}
        <section className='mt-6 text-center text-muted text-lg'>
          <h4>Developed By: <b>Youssef Mahmoud</b> </h4>
          <h4>Email: yousefmahmoud150@gmail.com </h4>
          <h4>Whats App: 01554464169 </h4>
        </section>
      </div>

    </section>
  );
}