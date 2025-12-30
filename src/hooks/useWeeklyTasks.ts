'use client';
import { useState, useEffect, useCallback } from "react";
import { shouldResetWeek } from "@/lib/utils";
import { SupabaseTaskUpdate, WeeklyTask } from "@/types";
import { LocalStorageStrategy } from '@/lib/storage/weeklyTasks/LocalStorageStrategy';
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

  const updateExistTaskt = useCallback(async () => {
    // const localBlocks = LocalStorageStrategy.getWeeklyTasks();
    // if (user?.id) {
    //   const { data, error } = await supabase
    //     .from('weekly_tasks')
    //     .select('*')
    //     .eq('userId', user.id);
    //   console.log("🚀 ~ useWeeklyTasks ~ data:", data)

    //   if (!error && data) {
    //     const updatedBlocks = data.map(fromSupabaseBlock);
    //     setBlocks(updatedBlocks);
    //   }
    // }
  }, [user]);


  const migrateLocalData = useCallback(async (userId: string) => {
    const localBlocks = LocalStorageStrategy.getWeeklyTasks();
    console.log("🚀 ~ useWeeklyTasks ~ localBlocks:", localBlocks)
    if (localBlocks.length === 0) return;
    // 1. Fetch existing IDs from Supabase for this user
    const { data: cloudTasks, error: fetchError } = await supabase
      .from('weekly_tasks')
      .select('id') // We only need the IDs to check for duplicates
      .eq('userId', userId);
    console.log("🚀 ~ useWeeklyTasks ~ cloudTasks:", cloudTasks)

    if (fetchError) {
      console.error("Migration fetch error:", fetchError);
      return;
    }

    // 2. Create a Set of IDs that already exist in the cloud
    const existingCloudIds = new Set(cloudTasks?.map(task => task.id));

    // // 3. Filter local tasks: Only keep those whose IDs ARE NOT in the cloud yet
    // const newTasksToMigrate = localBlocks
    //   .filter(task => !existingCloudIds.has(task.id)) // <--- The Duplicate Check
    //   .map(t => ({
    //     ...t,
    //     userId: userId // Ensure the correct userId is attached
    //   }));
    // console.log("🚀 ~ useWeeklyTasks ~ newTasksToMigrate:", newTasksToMigrate)

    // // 4. If there's actually something new, insert it
    // if (newTasksToMigrate.length > 0) {
    //   const { error: insertError } = await supabase
    //     .from('weekly_tasks')
    //     .insert(newTasksToMigrate);

    //   if (!insertError) {
    //     console.log(`${newTasksToMigrate.length} tasks migrated successfully.`);
    //     // Optional: Clear local storage or mark as synced
    //     // LocalStorageStrategy.addBlock(newTasksToMigrate);
    //   } else {
    //     console.error("Migration insert error:", insertError);
    //   }
    // } else {
    //   console.log("No new tasks to migrate.");
    // }

    const existTasks = localBlocks
      .map(block => toSupabaseBlock(block))
      .filter(sbBlock => existingCloudIds.has(sbBlock.id))
      .map(sbBlock => ({
        ...sbBlock,
        userId: userId
      }));
    console.log("🚀 ~ useWeeklyTasks ~ existTasks:", existTasks)

    // update the tasks exist in db
    updateExistTaskt()



  }, [updateExistTaskt]);




  const firstLoad = useCallback(async () => {
    setLoading(true);
    let loadedBlocks: WeeklyTask[] = [];

    if (user) {
      // Ensure local data is migrated if this is the first time seeing this user
      await migrateLocalData(user.id);

      // --- SUPABASE STRATEGY ---
      const { data, error } = await supabase
        .from('weekly_tasks')
        .select('*')
        .eq('userId', user.id);
      console.log("🚀 ~ useWeeklyTasks ~ data:", data)

      if (!error && data) {
        loadedBlocks = data.map(fromSupabaseBlock);
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
  }, [user, migrateLocalData]);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    firstLoad();
  }, [firstLoad]);



  const addNewTask = async (content: string = "") => {
    const newBlock: WeeklyTask = {
      id: user ? "" : crypto.randomUUID(),
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
      console.log("🚀 ~ addNewTask ~ data:", data)

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
      const sbUpdates: SupabaseTaskUpdate = { updated_at: now };
      if (updates.days) sbUpdates.days = updates.days;
      if (updates.content) sbUpdates.content = updates.content;

      // add user id
      const res = await supabase
        .from('weekly_tasks')
        .update(sbUpdates)
        .eq('id', blockId)
        .eq('userId', user.id);
      console.log("🚀 ~ updateBlock ~ res:", res)
      updateLocalStorage(blockId, updates, now);
    } else {
      updateLocalStorage(blockId, updates, now);
    }

    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates, updatedAt: now } : block))
    );
    setLoading(false)
  };

  const updateLocalStorage = (blockId: string, updates: Partial<WeeklyTask>, now: string) => {
    LocalStorageStrategy.updateBlock(blockId, { ...updates, updated_at: now });
    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates, updatedAt: now } : block))
    );
  }

  const deleteBlock = async (blockId: string) => {
    if (user) {
      await supabase.from('weekly_tasks').delete().eq('id', blockId);
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