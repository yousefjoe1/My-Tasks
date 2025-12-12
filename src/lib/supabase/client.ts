// lib/supabase/client.ts
// First, install supabase: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';
import { WeeklyBlock } from '@/types';

// Get these from your Supabase project settings
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase table structure helper
export interface SupabaseBlock {
  id: string;
  content: string;
  page_id: string;
  days: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// Convert WeeklyBlock to Supabase format
export function toSupabaseBlock(block: WeeklyBlock): SupabaseBlock {
  return {
    id: block.id,
    content: block.content,
    page_id: block.pageId,
    days: block.days || {},
    created_at: block.createdAt.toISOString(),
    updated_at: block.updatedAt.toISOString(),
  };
}

// Convert Supabase format to WeeklyBlock
export function fromSupabaseBlock(sbBlock: SupabaseBlock): WeeklyBlock {
  return {
    id: sbBlock.id,
    content: sbBlock.content,
    pageId: sbBlock.page_id,
    days: sbBlock.days || {},
    createdAt: new Date(sbBlock.created_at),
    updatedAt: new Date(sbBlock.updated_at),
  };
}