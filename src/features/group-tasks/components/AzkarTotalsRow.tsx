import { User as UserIcon } from 'lucide-react';
import { formatDuration } from '../utils/formatDuration';

interface AzkarTotalsRowProps {
  displayName: string;
  totalCount: number;
  totalDurationSeconds: number;
}

export default function AzkarTotalsRow({
  displayName,
  totalCount,
  totalDurationSeconds,
}: AzkarTotalsRowProps) {
  const nameLabel = displayName.trim() ? displayName : 'مستخدم';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-border bg-brand-secondary p-4 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary/20 bg-brand-tertiary text-brand-primary">
          <UserIcon size={22} />
        </div>
        <span className="truncate font-bold text-brand-text">{nameLabel}</span>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-brand-text-muted text-xs font-bold">إجمالي العدد</span>
          <span className="font-mono text-lg font-black text-brand-primary">{totalCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-brand-text-muted text-xs font-bold">إجمالي الوقت</span>
          <span className="font-mono text-lg font-black text-brand-primary">
            {formatDuration(totalDurationSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
