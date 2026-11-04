import type { AzkarName } from '../constants/azkarCatalog';

export interface AzkarCardState {
  name: AzkarName;
  taskId: string | null;
  savedCount: number;
  pendingDelta: number;
  savedDurationSeconds: number;
  pendingDurationSeconds: number;
  /** Unix ms when timer running; null when stopped */
  timerStartedAt: number | null;
  saving: boolean;
}

export interface AzkarTaskRow {
  id: string;
  name: string;
  has_count: boolean;
}

export interface AzkarUserTaskRow {
  id: string;
  user_id: string;
  task_id: string;
  count: number | null;
  duration_seconds: number | null;
  is_completed: boolean | null;
}

export interface UsersOverviewRpcUser {
  id: string;
  full_name: string | null;
  user_tasks: {
    id: string;
    count: number | null;
    duration_seconds: number | null;
    is_completed: boolean | null;
    task_id: string;
    tasks: { id: string; name: string; has_count: boolean } | null;
  }[];
}
