// lib/storage/StorageService.ts
import { WeeklyBlock } from "@/types";
import { LocalStorageStrategy } from "./weeklyTasks/LocalStorageStrategy";

export enum StorageMode {
  LOCAL_ONLY = 'local_only',
  CLOUD_SYNC = 'cloud_sync',
}

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }
};

export class StorageService {
  private static mode: StorageMode = StorageMode.LOCAL_ONLY;
  private static localStrategy = new LocalStorageStrategy();

  static setMode(mode: StorageMode) {
    this.mode = mode;
    safeLocalStorage.setItem('storage_mode', mode);
  }

  static getMode(): StorageMode {
    const saved = safeLocalStorage.getItem('storage_mode') as StorageMode;
    return saved || StorageMode.LOCAL_ONLY;
  }

  // Get tasks (local only - sync from cloud happens manually)
  static getWeeklyTasks(pageId: string): WeeklyBlock[] {
    // Convert async to sync for now (to not break your existing code)
    const data = this.localStrategy.getData();
    return 
  }

  // Add block with optional sync
  static async addBlock(block: WeeklyBlock): Promise<void> {
    // Save locally
    await this.localStrategy.addBlock(block);
    
    // Also save to cloud if in sync mode
    if (this.mode === StorageMode.CLOUD_SYNC) {
      await this.syncAddBlock(block);
    }
  }

  // Update block with optional sync
  static async updateBlock(blockId: string, updates: Partial<WeeklyBlock>): Promise<void> {
    // Update locally
    await this.localStrategy.updateBlock(blockId, updates);
    
    // Also update in cloud if in sync mode
    if (this.mode === StorageMode.CLOUD_SYNC) {
      await this.syncUpdateBlock(blockId, updates);
    }
  }

  // Delete block with optional sync
  static async deleteBlock(blockId: string): Promise<void> {
    // Delete locally
    await this.localStrategy.deleteBlock(blockId);
    
    // Also delete from cloud if in sync mode
    if (this.mode === StorageMode.CLOUD_SYNC) {
      await this.syncDeleteBlock(blockId);
    }
  }

  // SYNC METHODS - to be implemented
  private static async syncAddBlock(block: WeeklyBlock): Promise<void> {
    console.log('Syncing to cloud: add block', block.id);
    // TODO: Implement Supabase sync
  }

  private static async syncUpdateBlock(blockId: string, updates: Partial<WeeklyBlock>): Promise<void> {
    console.log('Syncing to cloud: update block', blockId);
    // TODO: Implement Supabase sync
  }

  private static async syncDeleteBlock(blockId: string): Promise<void> {
    console.log('Syncing to cloud: delete block', blockId);
    // TODO: Implement Supabase sync
  }

  // Manual sync: upload all local data to cloud
  static async syncToCloud(): Promise<void> {
    console.log('Syncing all data to cloud...');
    // TODO: Implement Supabase sync
  }

  // Manual sync: download all cloud data to local
  static async syncFromCloud(): Promise<void> {
    console.log('Syncing all data from cloud...');
    // TODO: Implement Supabase sync
  }
}

// Don't auto-initialize on import - do it when needed
// StorageService.setMode(StorageService.getMode());