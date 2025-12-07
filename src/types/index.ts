export interface WeeklyBlock {
    id: string;
    content: string;
    pageId: string;
    days?: {
      [key: string]: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Database {
    blocks: WeeklyBlock[];
  }