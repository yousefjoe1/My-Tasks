import { ListChecks, Loader2 } from 'lucide-react';
import type { UsersOverviewRpcUser } from '../types/azkar';
import {
  sumOverviewUserCount,
  sumOverviewUserDuration,
} from '../utils/azkarCardState';
import AzkarTotalsRow from './AzkarTotalsRow';

interface UsersOverviewProps {
  users: UsersOverviewRpcUser[];
  error: string | null;
  loading: boolean;
}

export default function UsersOverview({ users, error, loading }: UsersOverviewProps) {
  return (
    <section className="space-y-4 pt-4">
      <header className="flex items-center gap-3 border-b border-brand-border pb-5">
        <div className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary">
          <ListChecks size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إحصائيات المستخدمين</h2>
          <p className="text-brand-text-muted text-sm">عرض تفصيلي لمهام كل مستخدم المنجزة</p>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-brand-error/30 bg-brand-error/10 px-4 py-3 text-center text-sm font-bold text-brand-error">
          {error}
        </p>
      )}

      {loading && !error && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-center text-sm text-brand-text-muted py-6">لا يوجد مستخدمون بعد</p>
          ) : (
            users.map((u) => {
              const name = u.full_name?.trim() ? u.full_name : 'مستخدم مجهول';
              return (
                <AzkarTotalsRow
                  key={u.id}
                  displayName={name}
                  totalCount={sumOverviewUserCount(u.user_tasks)}
                  totalDurationSeconds={sumOverviewUserDuration(u.user_tasks)}
                />
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
