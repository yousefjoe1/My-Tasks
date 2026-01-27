// lib/storage/StorageService.ts
import { shouldResetWeek } from "@/lib/utils";
import { WeeklySnapshot, WeeklyTask } from "@/types";
import { endOfWeek, startOfWeek } from "date-fns";

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

    // 1. جلب المهام الحالية
    const tasks = this.getData();
    if (!tasks || tasks.length === 0) return;

    // 2. التحقق هل نحتاج Reset؟
    const needsReset = tasks?.some((block) => {
      const dateToCompare = block.updated_at;
      return dateToCompare && shouldResetWeek(dateToCompare);
    });

    if (needsReset) {

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });


      // 3. تجهيز السناب شوت
      const snapshot = {
        user_id: userId,
        archived_at: now.toISOString(),
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        week_data: tasks.map(block => ({
          id: block.id,
          content: block.content,
          days: block.days
        }))
      };

      // 4. حفظ السناب شوت في الـ Local Storage
      const existingSnapshots = this.getSnapshotData() || [];
      existingSnapshots.push(snapshot);
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(existingSnapshots));

      // ---------------------------------------------------------
      // 5. الخطوة الأهم لمنع التكرار: تحديث المهام الأصلية
      // ---------------------------------------------------------
      const resetTasks = tasks.map(block => ({
        ...block,
        days: {}, // تصفير الأيام
        updated_at: now.toISOString() // تحديث التاريخ لليوم (عشان ميعملش Reset تاني)
      }));

      // حفظ المهام "الجديدة" مكان القديمة
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetTasks));

      console.log("✅ LocalStorage Snapshot saved and tasks reset for the new week.");
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