export interface WeeklyTask {
  id: string;
  content: string;
  days?: {
    [key: string]: boolean;
  };
  created_at?: string;
  updated_at?: string;
}


export interface WeeklySnapshot {
  user_id: string | null;
  archived_at: string; // ISO Date string
  week_data: {
    id: string;
    content: string;
    days?: Record<string, boolean>;
  }[];
}

export interface User {
  id: string;
  email?: string;
}


export interface SupabaseTaskUpdate {
  content?: string;
  days?: Record<string, boolean>;
  updated_at: string; // ISO string
  userId?: string;
}