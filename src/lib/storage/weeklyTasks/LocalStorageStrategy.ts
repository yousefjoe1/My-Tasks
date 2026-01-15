// lib/storage/StorageService.ts
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

  static getSnapshotData(): WeeklySnapshot[] {
    const data = localStorage.getItem(SNAPSHOT_KEY);
    return data ? JSON.parse(data) : {} as WeeklySnapshot[]
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
    const snapshotData = tasks.map(block => ({
      id: block.id,
      content: block.content,
      days: block.days
    }));

    const snapshot = {
      userId: userId,
      archived_at: new Date().toISOString(),
      week_data: snapshotData
    }

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
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
}