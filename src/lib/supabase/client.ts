// lib/supabase/client.ts
// First, install supabase: npm install @supabase/supabase-js

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { WeeklyTask } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

let client: SupabaseClient | undefined;

function getSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase is not configured. This call still uses Supabase; move it to the Node API.',
    );
  }
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

// Leftover data calls still import this module. Creating the client here used to
// throw "supabaseUrl is required" on every page, even for auth that already uses Node.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabaseClient(), prop, receiver);
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value;
  },
});

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