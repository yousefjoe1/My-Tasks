'use client';
import { useState, useEffect, useCallback } from "react";
import { shouldResetWeek } from "@/lib/utils";
import { WeeklyTask } from "@/types";
import { LocalStorageStrategy, STORAGE_KEY } from '@/lib/storage/weeklyTasks/LocalStorageStrategy';
import { supabase, fromSupabaseBlock, toSupabaseBlock } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


export function useWeeklyTasks() {

  const [blocks, setBlocks] = useState<WeeklyTask[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  /**
   * MIGRATION LOGIC
   * Moves data from LocalStorage to Supabase when a user logs in.
   */

  const updateExistTaskt = useCallback(async (localData: WeeklyTask[], dbSupabaseData: WeeklyTask[]) => {

    if (user?.id) {

      localData.map(async (localTask) => {
        const dbData = dbSupabaseData.find(dbTask => dbTask.id === localTask.id)

        if (dbData) {

          const newUpdateToDbTask = { ...dbData, days: localTask.days }
          setLoading(true)
          const res = await supabase
            .from('weekly_tasks')
            .update(newUpdateToDbTask)
            .eq('id', dbData.id)
            .eq('userId', user.id);
          const { data: cloudTasks } = await supabase
            .from('weekly_tasks')
            .select('*')
            .eq('userId', user.id);
          if (cloudTasks != null) {
            setBlocks(cloudTasks)
          }
          setLoading(false)

        }
      })
    }
  }, [user])



  const insertLocalDataToDB = async () => {
    if (localStorage.getItem(STORAGE_KEY)) {
      const dataLocal = LocalStorageStrategy.getWeeklyTasks()
      const { error: insertError } = await supabase
        .from('weekly_tasks')
        .insert(dataLocal);

      if (!insertError) {
        setBlocks(dataLocal);
        // Optional: Clear local storage or mark as synced
        LocalStorageStrategy.saveAllData([]);
      } else {
        console.error("Migration insert error:", insertError);
      }
    }
  }


  const handleMigration = useCallback(async (cloudTasks: WeeklyTask[] | null) => {

    const localBlocks = LocalStorageStrategy.getWeeklyTasks();
    // we will insert the new data with the current local data days

    // 1. Fetch existing IDs from Supabase for this user
    if (user?.id) {
      //  2. Create a Set of IDs that already exist in the cloud
      const existingCloudIds = new Set(cloudTasks?.map(task => task.id));

      // 3. Filter local tasks: Only keep those whose IDs ARE NOT in the cloud yet
      const newTasksToMigrate = localBlocks
        .filter(task => !existingCloudIds.has(task.id)) // <--- The Duplicate Check
        .map(t => ({
          ...t,
          userId: user.id // Ensure the correct userId is attached
        }));

      // 4. If there's actually something new, insert it
      if (newTasksToMigrate.length > 0) {
        const { error: insertError } = await supabase
          .from('weekly_tasks')
          .insert(newTasksToMigrate);

        if (!insertError) {
          console.log(`${newTasksToMigrate.length} tasks migrated successfully.`);
          // Optional: Clear local storage or mark as synced
          // LocalStorageStrategy.addBlock(newTasksToMigrate);
        } else {
          console.error("Migration insert error:", insertError);
        }
      } else {
        console.log("No new tasks to migrate.");
      }

    }

    // i need to see if there is no id in local storage in the db also
    // if the same ids in local and db then will update the days
    if (cloudTasks != null) {
      updateExistTaskt(localBlocks, cloudTasks)
    }

  }, [user, updateExistTaskt])


  const handleDeleteMissingTasks = useCallback(async (localTasks: WeeklyTask[], cloudTasks: WeeklyTask[]) => {
    if (user?.id) {

      const localIds = new Set(localTasks.map(task => task.id));
      const cloudIds = new Set(cloudTasks.map(task => task.id));

      const missingIds = [...cloudIds].filter(id => !localIds.has(id));

      missingIds.forEach(async (missingId) => {
        const { error } = await supabase
          .from('weekly_tasks')
          .delete()
          .eq('id', missingId)
          .eq('userId', user.id);
        if (!error) {
          console.log('Missing tasks deleted successfully.');
        } else {
          console.error('Error deleting missing tasks:', error);
        }

      });

    }
  }, [user])

  const firstLoad = useCallback(async () => {
    setLoading(true);
    let loadedBlocks: WeeklyTask[] = [];

    if (user) {
      // Ensure local data is migrated if this is the first time seeing this user
      // await migrateLocalData(user.id);

      // --- SUPABASE STRATEGY ---
      const { data: cloudTasks, error } = await supabase
        .from('weekly_tasks')
        .select('*')
        .eq('userId', user.id);
      const localTasks = LocalStorageStrategy.getWeeklyTasks()
      if (cloudTasks != null) {
        if (localTasks.length < cloudTasks?.length) {
          await handleDeleteMissingTasks(localTasks, cloudTasks)
        }
      }



      // if the local and db the same then will do one of 2
      // 1 update

      // 2 insert

      // if the db is empty then take the cloudTasks from local to db
      if (cloudTasks?.length == 0) {
        insertLocalDataToDB()
        setLoading(false)
        return
      } else {
        handleMigration(cloudTasks)
      }



      if (!error && cloudTasks) {
        loadedBlocks = cloudTasks.map(fromSupabaseBlock);
      }
    } else {
      // --- LOCAL STRATEGY ---
      loadedBlocks = LocalStorageStrategy.getWeeklyTasks();
    }

    const needsReset = loadedBlocks.some(
      (block) => block.updated_at && shouldResetWeek(new Date(block.updated_at))
    );

    if (needsReset) {
      const snapshotData = loadedBlocks.map(block => ({
        id: block.id,
        content: block.content,
        days: block.days
      }));

      const snapshot = {
        user_id: user?.id || null,
        archived_at: new Date().toISOString(),
        week_data: snapshotData
      };

      // Archive logic
      if (user) {
        await supabase.from('weekly_snapshots').insert(snapshot);
      } else {
        LocalStorageStrategy.saveWeeklySnapshot(snapshot);
      }

      // Reset logic
      if (user) {
        await supabase
          .from('weekly_tasks')
          .update({ days: {}, updated_at: new Date().toISOString() })
          .eq('userId', user.id);

        const { data } = await supabase
          .from('weekly_tasks')
          .select('*')

        loadedBlocks = (data || []).map(fromSupabaseBlock);
      } else {
        const updatePromises = loadedBlocks.map((block) =>
          LocalStorageStrategy.updateBlock(block.id, { days: {}, updated_at: new Date().toISOString() })
        );
        await Promise.all(updatePromises);
        loadedBlocks = LocalStorageStrategy.getWeeklyTasks();
      }
    }

    setBlocks(loadedBlocks);
    setLoading(false);
    // }, [user, migrateLocalData]);
  }, [user, handleMigration, handleDeleteMissingTasks]);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    firstLoad();
  }, [firstLoad]);



  const addNewTask = async (content: string = "") => {
    const newBlock: WeeklyTask = {
      id: crypto.randomUUID(),
      content,
      days: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLoading(true);
    if (user) {
      const sbData = toSupabaseBlock(newBlock);
      const { id, ...insertData } = sbData;

      const { data, error } = await supabase
        .from('weekly_tasks')
        .insert({ ...insertData, userId: user.id })
        .select()
        .single();

      if (data && !error) {
        setBlocks((prev) => [...prev, fromSupabaseBlock(data)])
        LocalStorageStrategy.addBlock(newBlock);
      };
    } else {
      LocalStorageStrategy.addBlock(newBlock);
      setBlocks((prev) => [...prev, newBlock]);
    }
    setLoading(false);

  };



  const updateBlock = async (blockId: string, updates: Partial<WeeklyTask>) => {
    const now = new Date().toISOString();
    setLoading(true)
    if (user) {
      if (updates.days) updates.days = updates.days;
      if (updates.content) updates.content = updates.content;

      // add user id
      const res = await supabase
        .from('weekly_tasks')
        .update(updates)
        .eq('id', blockId)
        .eq('userId', user.id);
      updateLocalStorage(blockId, updates, now);
    } else {
      updateLocalStorage(blockId, updates, now);
    }

    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates, updated_at: now } : block))
    );
    setLoading(false)
  };

  const updateLocalStorage = (blockId: string, updates: Partial<WeeklyTask>, now: string) => {
    LocalStorageStrategy.updateBlock(blockId, { ...updates, updated_at: now });
    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates, updated_at: now } : block))
    );
  }

  const deleteBlock = async (blockId: string) => {
    if (user) {
      await supabase.from('weekly_tasks').delete().eq('id', blockId);
      // delete from local storage
      LocalStorageStrategy.deleteBlock(blockId);
    } else {
      LocalStorageStrategy.deleteBlock(blockId);
    }
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  return {
    blocks,
    addNewTask,
    updateBlock,
    deleteBlock,
    loading
  };
}