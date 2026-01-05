'use client';
import { useState, useEffect, useCallback } from "react";
import { shouldResetWeek } from "@/lib/utils";
import { WeeklyTask } from "@/types";
import { LocalStorageStrategy } from '@/lib/storage/weeklyTasks/LocalStorageStrategy';
import { supabase, fromSupabaseBlock, toSupabaseBlock } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


export function useWeeklyTasks() {

  const [blocks, setBlocks] = useState<WeeklyTask[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // async function checkActualConnectivity() {
  //   try {
  //     // Request a tiny file or a favicon from a reliable server
  //     const response = await fetch('https://www.google.com/favicon.ico', {
  //       mode: 'no-cors',
  //       cache: 'no-store'
  //     });
  //     return true; // We got a response!
  //   } catch (error) {
  //     return false; // Request failed, likely offline
  //   }
  // }



  const getCloudTasks = useCallback(async () => {
    // const isOnline = await checkActualConnectivity()
    if (user?.id) {
      const { data: cloudTasks } = await supabase
        .from('weekly_tasks')
        .select('*')
        .eq('userId', user.id);
      if (cloudTasks != null) {
        setBlocks(cloudTasks)
      }
    }
    // if (isOnline) {
    // } else {
    // }
    const tasks = LocalStorageStrategy.getWeeklyTasks()
    setBlocks(tasks)
  }, [user])


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

        }
      })
      getCloudTasks()
      setLoading(false)
    }
  }, [user, getCloudTasks])



  const insertFromLocalToDataBase = useCallback(async (cloudTasks: WeeklyTask[] | null) => {

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
          .insert(newTasksToMigrate)
          .eq('userId', user.id);

        if (!insertError) {
          // console.log(`${newTasksToMigrate.length} tasks migrated successfully.`);
          // Optional: Clear local storage or mark as synced
          // LocalStorageStrategy.addBlock(newTasksToMigrate);
        } else {
          console.error("Migration insert error:", insertError);
        }
      } else {
        // console.log("No new tasks to migrate.");
      }

    }

    // i need to see if there is no id in local storage in the db also
    // if the same ids in local and db then will update the days
    // if (cloudTasks != null) {
    //   updateExistTaskt(localBlocks, cloudTasks)
    // }

  }, [user])


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
        } else {
          console.error('Error deleting missing tasks:', error);
        }

      });

    }
  }, [user])

  const firstLoad = useCallback(async () => {
    setLoading(true);
    let loadedBlocks: WeeklyTask[] = [];

    // const isOnline = await checkActualConnectivity()
    // console.log("🚀 ~ useWeeklyTasks ~ isOnline:", isOnline)


    if (user) {

      // --- SUPABASE STRATEGY ---
      const { data: cloudTasks, error } = await supabase
        .from('weekly_tasks')
        .select('*')
        .eq('userId', user.id);
      const localTasks = LocalStorageStrategy.getWeeklyTasks()

      if (cloudTasks != null) {
        // senarios
        //1. if the local and db is the same --> insert from local to database, and update the matching tasks from local to database


        // if what in local is less what in data base --> then delete what in data base
        if (localTasks.length < cloudTasks?.length) {
          await handleDeleteMissingTasks(localTasks, cloudTasks)
        }

        if (cloudTasks.length == localTasks.length) {
          await updateExistTaskt(localTasks, cloudTasks)

          //  insert the missing from db, check what not in the db from local and isert it
          await insertFromLocalToDataBase(localTasks)

        }


        // if local has data but database not have data
        if (localTasks.length > cloudTasks.length) {
          await insertFromLocalToDataBase(cloudTasks)
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
            .update({ days: {} })
            .eq('userId', user.id);

          const { data } = await supabase
            .from('weekly_tasks')
            .select('*')

          loadedBlocks = (data || []).map(fromSupabaseBlock);
        } else {
          const updatePromises = loadedBlocks.map((block) =>
            LocalStorageStrategy.updateBlock(block.id, { days: {} })
          );
          await Promise.all(updatePromises);
          loadedBlocks = LocalStorageStrategy.getWeeklyTasks();
        }
      }


      const { data: cloudTasksData } = await supabase
        .from('weekly_tasks')
        .select('*')
        .eq('userId', user.id);
      if (cloudTasksData != null) {
        setBlocks(cloudTasksData)
      }
    } else {

      loadedBlocks = LocalStorageStrategy.getWeeklyTasks();
      setBlocks(loadedBlocks);
    }



    setLoading(false);
  }, [user, insertFromLocalToDataBase, handleDeleteMissingTasks, updateExistTaskt]);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    firstLoad();
  }, [firstLoad]);



  const addNewTask = async (content: string = "") => {
    // const isOnline = await checkActualConnectivity()

    const newBlock: WeeklyTask = {
      id: crypto.randomUUID(),
      content,
      days: {},
    };
    // if (isOnline) {
    if (user) {
      setLoading(true);
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
    }
    setBlocks((prev) => [...prev, newBlock]);
    setLoading(false);

  };



  const updateBlock = async (blockId: string, updates: Partial<WeeklyTask>) => {
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
      updateLocalStorage(blockId, updates);
    } else {
      updateLocalStorage(blockId, updates);
    }

    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates } : block))
    );
    setLoading(false)
  };

  const updateLocalStorage = (blockId: string, updates: Partial<WeeklyTask>) => {
    LocalStorageStrategy.updateBlock(blockId, { ...updates });
    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates } : block))
    );
  }

  const deleteBlock = async (taskId: string) => {
    setLoading(true)
    if (user) {
      await supabase.from('weekly_tasks').delete().eq('id', taskId);
    }
    LocalStorageStrategy.deleteBlock(taskId);
    setBlocks((prev) => prev.filter((block) => block.id !== taskId));
    setLoading(false)
  };

  return {
    blocks,
    addNewTask,
    updateBlock,
    deleteBlock,
    loading
  };
}