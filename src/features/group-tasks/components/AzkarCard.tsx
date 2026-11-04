'use client';

import { Loader2, Play, Plus, Save, Square } from 'lucide-react';
import type { AzkarCardState } from '../types/azkar';
import {
  getDisplayedCount,
  getDisplayedDurationSeconds,
  getLiveSeconds,
} from '../utils/azkarCardState';
import { formatDuration } from '../utils/formatDuration';

interface AzkarCardProps {
  card: AzkarCardState;
  nowMs: number;
  onPlus: () => void;
  onTimerToggle: () => void;
  onSave: () => void;
}

export default function AzkarCard({
  card,
  nowMs,
  onPlus,
  onTimerToggle,
  onSave,
}: AzkarCardProps) {
  const disabled = card.saving;
  const timerRunning = card.timerStartedAt != null;
  const displayedCount = getDisplayedCount(card);
  const displayedDuration = getDisplayedDurationSeconds(card, nowMs);

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-brand-secondary shadow-sm">
      <div className="flex min-h-[140px]">
        <div className="flex w-1/2 gap-2 border-l border-brand-border p-3">
          <button
            type="button"
            disabled={disabled}
            onClick={onPlus}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-brand-border bg-brand-bg transition-colors hover:bg-brand-tertiary disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            aria-label="زيادة العدد"
          >
            <Plus className="h-8 w-8 text-brand-primary" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onTimerToggle}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
              timerRunning
                ? 'border-brand-primary bg-brand-primary/10'
                : 'border-brand-border bg-brand-bg hover:bg-brand-tertiary'
            }`}
            aria-label={timerRunning ? 'إيقاف المؤقت' : 'تشغيل المؤقت'}
          >
            {timerRunning ? (
              <Square className="h-7 w-7 text-brand-primary" fill="currentColor" />
            ) : (
              <Play className="h-8 w-8 text-brand-primary" fill="currentColor" />
            )}
            {timerRunning && (
              <span className="font-mono text-xs font-bold text-brand-primary">
                {formatDuration(getLiveSeconds(card, nowMs))}
              </span>
            )}
          </button>
        </div>

        <div className="flex w-1/2 flex-col justify-between p-3">
          <h3 className="text-center text-base font-bold leading-snug text-brand-text">{card.name}</h3>
          <div className="flex flex-col items-center gap-1 py-2">
            <span className="font-mono text-3xl font-black text-brand-primary">{displayedCount}</span>
            <span className="font-mono text-sm font-bold text-brand-text-secondary">
              {formatDuration(displayedDuration)}
            </span>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={onSave}
            className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-tertiary py-2.5 text-sm font-bold text-brand-text transition-colors hover:bg-brand-border disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            {card.saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
