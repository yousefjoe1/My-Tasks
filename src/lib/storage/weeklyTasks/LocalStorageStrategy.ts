// lib/storage/StorageService.ts
import { shouldResetWeek } from "@/lib/utils";
import { WeeklySnapshot, WeeklyTask } from "@/types";

export const STORAGE_KEY = 'my-notion-app-data';
const SNAPSHOT_KEY = 'my-notion-app-snapshots';

export class LocalStorageStrategy {
  private static getData(): WeeklyTask[] {

    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : []
  }

  private static saveData(data: WeeklyTask[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getSnapshotData(): WeeklySnapshot[] | null {
    const data = localStorage.getItem(SNAPSHOT_KEY);
    return data ? JSON.parse(data) : null
  }

  static getWeeklyTasks(): WeeklyTask[] {
    const data = this.getData();
    return data;
  }


  // save all tasks
  static saveAllData(data: WeeklyTask[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }


  static addBlock(block: WeeklyTask): void {
    const data = this.getData();
    data.push(block);
    this.saveData(data);
  }

  static updateBlock(blockId: string, updates: Partial<WeeklyTask>): void {
    const data = this.getData();
    const blockIndex = data.findIndex(b => b.id === blockId);

    if (blockIndex !== -1) {
      data[blockIndex] = {
        ...data[blockIndex],
        ...updates,
      };
      this.saveData(data);
    }
  }

  // saveWeeklySnapshot
  static saveWeeklySnapshot(userId: string | undefined): void {
    if (typeof window === 'undefined') return;
    const tasks = this.getData()
    const needsReset = tasks?.some(
      (block) => block.updated_at && shouldResetWeek(new Date(block.updated_at))
    )
    if (needsReset) {
      const snapshotData = tasks.map(block => ({
        id: block.id,
        content: block.content,
        days: block.days
      }));

      // Calculate week start and end
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Sunday
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Saturday
      weekEnd.setHours(23, 59, 59, 999);

      const snapshot = {
        user_id: userId,
        archived_at: new Date().toISOString(),
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        week_data: snapshotData
      };

      const existingSnapshots = this.getSnapshotData() || [];
      existingSnapshots.push(snapshot);
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(existingSnapshots));
    }
  }

  static clearTasks(): void {
    const data = this.getData();
    this.saveData(data);
  }

  static deleteBlock(blockId: string): void {
    const data = this.getData();
    const newData = data.filter(b => b.id != blockId);
    this.saveData(newData);
  }

  static saveSyncState() {
    const currentSyncedValue = localStorage.getItem('synced');
    if (currentSyncedValue == null) {
      localStorage.setItem('synced', 'yes');
      return 'no'
    }

    if (currentSyncedValue === 'no') {
      localStorage.setItem('synced', 'yes')
    }

    return currentSyncedValue

  }

  static resetSync() {
    localStorage.setItem('synced', 'no');
  }


}