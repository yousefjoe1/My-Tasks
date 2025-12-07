import { useState, useEffect, useCallback } from "react";
import { shouldResetWeek } from "@/lib/utils";
import { WeeklyBlock } from "@/types";



import { StorageService } from "@/lib/storage/weeklyTasksStorage";





export function useWeeklyTasks(pageId: string) {
  const [blocks, setBlocks] = useState<WeeklyBlock[]>([]);

  const firstLoad = useCallback(async () => {
    const loadedBlocks = StorageService.getWeeklyTasks(pageId);

    const needsReset = loadedBlocks.some(
      (block) => block.updatedAt && shouldResetWeek(new Date(block.updatedAt))
    );

    if (needsReset) {

      // Update in storage asynchronously
      const updatePromises = loadedBlocks.map((block) => {
          return StorageService.updateBlock(block.id, {
            days: {},
            updatedAt: new Date(),
          });
        return Promise.resolve();
      });

      // Wait for all storage updates to complete
      await Promise.all(updatePromises);
      
      return loadedBlocks;
    } else {
      return loadedBlocks;
    }
  }, [pageId]);

  useEffect(() => {
    let isMounted = true;
    
    const initializeData = () => {
      firstLoad().then((newBlocks) => {
        if (isMounted && newBlocks) {
          setBlocks(newBlocks);
        }
      });
    };
    
    initializeData();
    
    return () => {
      isMounted = false;
    };
  }, [firstLoad]);

  const addBlock = ( content: string = "") => {
    const newBlock: WeeklyBlock = {
      id: Date.now().toString(),
      content,
      pageId,
      days: {}, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    StorageService.addBlock(newBlock);
    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (blockId: string, updates: Partial<WeeklyBlock>) => {
    StorageService.updateBlock(blockId, updates);
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (blockId: string) => {
    StorageService.deleteBlock(blockId);
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  return {
    blocks,
    addBlock,
    updateBlock,
    deleteBlock,
  };
}