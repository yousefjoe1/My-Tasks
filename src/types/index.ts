// 1. تعريف المهمة الفرعية
export interface SubTask {
  id?: string;
  task_id?: string;
  content: string;
  days_completed: Record<string, boolean>;
  created_at?: string;
}

// 2. تعريف المهمة الرئيسية (تأكد أن هذه الواجهة تشمل الـ sub_tasks)
export interface WeeklyTask {
  id: string;
  content: string;
  days?: Record<string, boolean>;
  created_at?: string;
  updated_at?: string;
  is_essential?: boolean;
  description?: string;
  sub_tasks?: SubTask[]; // تأكد أن هذا موجود هنا
}

// 3. تعريف الـ Snapshot (التعديل المهم هنا)
export interface WeeklySnapshot {
  id?: string;
  user_id: string | undefined;
  archived_at: string;
  created_at?: string;
  week_start?: string;
  week_end?: string;
  // التعديل: بدلاً من تعريف object داخلي، استخدم الواجهة WeeklyTask[] مباشرة
  week_data: WeeklyTask[];
}

// 3.1 تعريف إنجاز المستخدم
export interface UserTask {
  id?: string;
  user_id?: string;
  task_id: string;
  day?: string;
  count?: number | undefined;
}

// 4. تعريفات أخرى
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  user_tasks?: UserTask[];
}

export interface SupabaseTaskUpdate {
  content?: string;
  days?: Record<string, boolean>;
  updated_at: string;
  userId?: string;
}