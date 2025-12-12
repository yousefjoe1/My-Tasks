import { WeeklyBlock } from ".";

// lib/storage/IStorage.ts

export interface IStorage {
  // Core methods (all strategies must implement)
  getWeeklyTasks(pageId: string): Promise<WeeklyBlock[]>;
  addBlock(block: WeeklyBlock): Promise<void>;
  updateBlock(blockId: string, updates: Partial<WeeklyBlock>): Promise<void>;
  deleteBlock(blockId: string): Promise<void>;
  
  // Optional methods (specific to certain strategies)
  exportData?(): Promise<string>;           // For JSON strategy
  importData?(json: string): Promise<void>; // For JSON strategy
  syncData?(): Promise<void>;               // For Supabase strategy
}
 export enum StorageType {
  LOCAL_STORAGE = 'local_storage',
  JSON_FILE = 'json_file',
  SUPABASE = 'supabase',
}