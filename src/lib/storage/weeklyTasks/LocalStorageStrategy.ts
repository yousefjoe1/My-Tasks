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
    // if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getWeeklyTasks(): WeeklyTask[] {
    const data = this.getData();
    return data;
  }


  // save all tasks
  static saveAllData(data: WeeklyTask[]): void {
    // if (typeof window === 'undefined') return;
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
        updated_at: new Date().toISOString()
      };
      this.saveData(data);
    }
  }

  // saveWeeklySnapshot
  static saveWeeklySnapshot(snapshot: WeeklySnapshot): void {
    // if (typeof window === 'undefined') return;
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  }

  static clearTasks(): void {
    const data = this.getData();
    this.saveData(data);
  }

  static deleteBlock(blockId: string): void {
    const data = this.getData();
    const newData = data.filter(b => b.id !== blockId);
    this.saveData(newData);
  }
}