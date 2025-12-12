// lib/storage/StorageService.ts
import { Database, WeeklyBlock } from "@/types";

const STORAGE_KEY = 'my-notion-app-data';

export class StorageService {
  private static getData(): Database {
    if (typeof window === 'undefined') {
      return {
        blocks: [
          {
            id: '1',
            content: 'Workout',
            pageId: '1',
            days: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      blocks: [
        {
          id: '1',
          content: 'Workout',
          pageId: '1',
          days: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
  }

  private static saveData(data: Database): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getWeeklyTasks(pageId: string): WeeklyBlock[] {
    const data = this.getData();
    return data.blocks.filter(block => block.pageId === pageId);
  }

  static addBlock(block: WeeklyBlock): void {
    const data = this.getData();
    data.blocks.push(block);
    this.saveData(data);
  }

  static updateBlock(blockId: string, updates: Partial<WeeklyBlock>): void {
    const data = this.getData();
    const blockIndex = data.blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex !== -1) {
      data.blocks[blockIndex] = { 
        ...data.blocks[blockIndex], 
        ...updates, 
        updatedAt: new Date() 
      };
      this.saveData(data);
    }
  }

  static deleteBlock(blockId: string): void {
    const data = this.getData();
    data.blocks = data.blocks.filter(b => b.id !== blockId);
    this.saveData(data);
  }
}