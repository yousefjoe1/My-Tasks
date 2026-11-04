import { supabase } from '@/lib/supabase/client';
import { AZKAR_NAMES } from '../constants/azkarCatalog';
import type {
  AzkarTaskRow,
  AzkarUserTaskRow,
  UsersOverviewRpcUser,
} from '../types/azkar';

export async function fetchAzkarTasks(): Promise<AzkarTaskRow[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, name, has_count')
    .in('name', [...AZKAR_NAMES]);

  if (error) throw error;
  return (data ?? []) as AzkarTaskRow[];
}

export async function fetchUserAzkarTasks(userId: string): Promise<AzkarUserTaskRow[]> {
  const { data, error } = await supabase
    .from('user_tasks')
    .select('id, user_id, task_id, count, duration_seconds, is_completed')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as AzkarUserTaskRow[];
}

export async function resolveSignedInDisplayName(userId: string): Promise<string> {
  const [usersRes, profilesRes, sessionRes] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', userId).maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    supabase.auth.getSession(),
  ]);

  const fromUsers = usersRes.data?.full_name;
  if (typeof fromUsers === 'string' && fromUsers.trim()) {
    return fromUsers.trim();
  }

  const fromProfiles = profilesRes.data?.full_name;
  if (typeof fromProfiles === 'string' && fromProfiles.trim()) {
    return fromProfiles.trim();
  }

  const metaName = sessionRes.data.session?.user.user_metadata?.full_name;
  if (typeof metaName === 'string' && metaName.trim()) {
    return metaName.trim();
  }

  return '';
}

export async function fetchUsersOverview(): Promise<UsersOverviewRpcUser[]> {
  const { data, error } = await supabase.rpc('get_users_overview');
  if (error) throw error;
  if (!data) return [];
  return data as UsersOverviewRpcUser[];
}

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
