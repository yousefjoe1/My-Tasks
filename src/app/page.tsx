'use client';

import { useWeeklyTasks } from '@/hooks/useWeeklyTasks';
import { AddBlock } from '@/components/AddBlock';
import NavBar from '@/common/NavBar/NavBar';
// import { SyncToggle } from '@/components/ToggleUploadToCloud/SyncToggle';
import { WeeklyTable } from '@/components/blocks/WeeklyTable';
import { WeeklyTask } from '@/types';

export default function Home() {
  const { blocks, updateBlock, deleteBlock, addNewTask, loading } = useWeeklyTasks();

  const handleDelete = (id: string) => {
    deleteBlock(id)
  }


  return (
    <div className="min-h-screen bg-secondary py-8 pt-18">
      <NavBar />

      {/* <SyncToggle
      /> */}
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

          <div className="space-y-4">
            <AddBlock addNewTask={addNewTask} loading={loading} />

            {
              blocks.map((block) => (
                <WeeklyTable
                  key={block.id}
                  task={block}
                  onUpdate={(taskid: string, updates: Partial<WeeklyTask>) => updateBlock(taskid, updates)}
                  onDelete={handleDelete} loading={loading}
                />
              ))
            }

          </div>
        </div>

        <div className="mt-6 text-center text-muted text-lg">
          <p>📅 Weekly tasks automatically reset every Monday</p>
          <p className="mt-1">💾 Data is saved locally in your browser and synced to cloud after you login</p>
        </div>
      </div>

    </div>
  );
}