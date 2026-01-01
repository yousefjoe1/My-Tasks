// lib/supabase/client.ts
// First, install supabase: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';
import { WeeklyTask } from '@/types';

// Get these from your Supabase project settings
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase table structure helper
export interface SupabaseBlock {
  id: string;
  content: string;
  days: Record<string, boolean>;
}

// Convert WeeklyBlock to Supabase format
export function toSupabaseBlock(block: WeeklyTask): SupabaseBlock {
  return {
    id: block.id,
    content: block.content,
    days: block.days || {},
  };
}

// Convert Supabase format to WeeklyBlock
export function fromSupabaseBlock(sbBlock: SupabaseBlock): WeeklyTask {
  return {
    id: sbBlock.id,
    content: sbBlock.content,
    days: sbBlock.days || {},

  };
}