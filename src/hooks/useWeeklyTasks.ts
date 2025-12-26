'use client';
import { useState, useEffect, useCallback } from "react";
import { shouldResetWeek } from "@/lib/utils";
import { SupabaseTaskUpdate, WeeklyBlock } from "@/types";
import { LocalStorageStrategy } from '@/lib/storage/weeklyTasks/LocalStorageStrategy';
import { supabase, fromSupabaseBlock, toSupabaseBlock } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWeeklyTasks(pageId: string) {
  const [blocks, setBlocks] = useState<WeeklyBlock[]>([]);
  const { user, } = useAuth();
  const [loading, setLoading] = useState(true);

  /**
   * MIGRATION LOGIC
   * Moves data from LocalStorage to Supabase when a user logs in.
   */
  const migrateLocalData = useCallback(async (userId: string) => {
    const localBlocks = LocalStorageStrategy.getWeeklyTasks(pageId);
    if (localBlocks.length === 0) return;

    // Check if cloud already has data to avoid duplicates (optional)
    const { count } = await supabase
      .from('weekly_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('pageId', pageId)
      .eq('userId', userId);

    if (count === 0) {
      const supabaseData = localBlocks.map(block => {
        const sb = toSupabaseBlock(block);
        // Remove the local ID to let Supabase generate a fresh UUID if necessary
        // or keep it if your ID is a valid UUID string
        const { id, ...dataWithoutId } = sb;
        return { ...dataWithoutId, userId: id };
      });

      const { error } = await supabase.from('weekly_tasks').insert(supabaseData);

      if (!error) {
        // Clear local data after successful migration to prevent confusion
        // You might want to show a "Data synced!" toast here
        LocalStorageStrategy.clearTasks(pageId);
      }
    }
  }, [pageId]);

  const firstLoad = useCallback(async () => {
    setLoading(true);
    let loadedBlocks: WeeklyBlock[] = [];

    if (user) {
      // Ensure local data is migrated if this is the first time seeing this user
      await migrateLocalData(user.id);

      // --- SUPABASE STRATEGY ---
      const { data, error } = await supabase
        .from('weekly_tasks')
        .select('*')
        .eq('pageId', pageId)
        .eq('userId', user.id);

      if (!error && data) {
        loadedBlocks = data.map(fromSupabaseBlock);
      }
    } else {
      // --- LOCAL STRATEGY ---
      loadedBlocks = LocalStorageStrategy.getWeeklyTasks(pageId);
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
        pageId: pageId,
        user_id: user?.id || null,
        archived_at: new Date().toISOString(),
        week_data: snapshotData
      };

      // Archive logic
      if (user) {
        await supabase.from('weekly_snapshots').insert(snapshot);
      } else {
        // await LocalStorageStrategy.saveWeeklySnapshot(pageId, snapshot);
      }

      // Reset logic
      if (user) {
        await supabase
          .from('weekly_tasks')
          .update({ days: {}, updated_at: new Date().toISOString() })
          .eq('pageId', pageId)
          .eq('userId', user.id);

        const { data } = await supabase
          .from('weekly_tasks')
          .select('*')
          .eq('pageId', pageId);

        loadedBlocks = (data || []).map(fromSupabaseBlock);
      } else {
        const updatePromises = loadedBlocks.map((block) =>
          LocalStorageStrategy.updateBlock(block.id, { days: {}, updated_at: new Date().toISOString() })
        );
        await Promise.all(updatePromises);
        loadedBlocks = LocalStorageStrategy.getWeeklyTasks(pageId);
      }
    }

    setBlocks(loadedBlocks);
    setLoading(false);
  }, [pageId, user, migrateLocalData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    firstLoad();
  }, [firstLoad]);

  const addBlock = async (content: string = "") => {
    const newBlock: WeeklyBlock = {
      id: user ? "" : Date.now().toString(),
      content,
      pageId,
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

      if (data && !error) setBlocks((prev) => [...prev, fromSupabaseBlock(data)]);
    } else {
      await LocalStorageStrategy.addBlock(newBlock);
      setBlocks((prev) => [...prev, newBlock]);
    }
    setLoading(false);

  };

  const updateBlock = async (blockId: string, updates: Partial<WeeklyBlock>) => {
    const now = new Date();

    if (user) {
      const sbUpdates: SupabaseTaskUpdate = { updated_at: now.toISOString() };
      if (updates.days) sbUpdates.days = updates.days;
      if (updates.content) sbUpdates.content = updates.content;

      await supabase
        .from('weekly_tasks')
        .update(sbUpdates)
        .eq('id', blockId);
    } else {
      await LocalStorageStrategy.updateBlock(blockId, { ...updates, updated_at: now.toISOString() });
    }

    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? { ...block, ...updates, updatedAt: now } : block))
    );
  };

  const deleteBlock = async (blockId: string) => {
    if (user) {
      await supabase.from('weekly_tasks').delete().eq('id', blockId);
    } else {
      await LocalStorageStrategy.deleteBlock(blockId);
    }
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  return {
    blocks,
    addBlock,
    updateBlock,
    deleteBlock,
    loading
  };
}