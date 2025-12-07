'use client';

import { useWeeklyTasks } from '@/hooks/useWeeklyTasks';
import { AddBlock } from '@/components/AddBlock';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import NavBar from '@/common/NavBar/NavBar';

export default function Home() {
  const { blocks, addBlock, updateBlock, deleteBlock } = useWeeklyTasks('1');

  return (
    <div className="min-h-screen bg-secondary py-8 pt-18">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-primary rounded-lg shadow-sm border border-primary p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              My Notion-like App
            </h1>
            <p className="text-secondary">
              A simple weekly habit tracker that resets automatically every week
            </p>
          </div>

          <div className="space-y-4">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            ))}

            <AddBlock onAddBlock={addBlock} />
          </div>
        </div>

        <div className="mt-6 text-center text-muted text-lg">
          <p>📅 Weekly tasks automatically reset every Monday</p>
          <p className="mt-1">💾 Data is saved locally in your browser</p>
        </div>
      </div>
    </div>
  );
}