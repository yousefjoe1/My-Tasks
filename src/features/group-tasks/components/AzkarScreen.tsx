'use client';

import ToastContainer from '@/components/Toasts/ToastContainer';
import { Loader2 } from 'lucide-react';
import { useAzkarPage } from '../hooks/useAzkarPage';
import AzkarCard from './AzkarCard';
import AzkarTotalsRow from './AzkarTotalsRow';
import UsersOverview from './UsersOverview';

export default function AzkarScreen() {
  const {
    user,
    cards,
    displayName,
    azkarLoadError,
    azkarLoading,
    overviewUsers,
    overviewError,
    overviewLoading,
    nowMs,
    myTotals,
    handlePlus,
    handleTimerToggle,
    handleSave,
    toasts,
    removeToast,
  } = useAzkarPage();

  return (
    <div className="space-y-6 bg-brand-bg p-4 pb-10 text-brand-text transition-colors duration-300 md:p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="border-b border-brand-border pb-4">
        <h1 className="text-2xl font-black text-center">أذكار</h1>
      </header>

      {user && (
        <section aria-label="إجمالياتي">
          <AzkarTotalsRow
            displayName={displayName}
            totalCount={myTotals.totalCount}
            totalDurationSeconds={myTotals.totalDuration}
          />
        </section>
      )}

      {azkarLoadError && (
        <p className="rounded-xl border border-brand-error/30 bg-brand-error/10 px-4 py-3 text-center text-sm font-bold text-brand-error">
          {azkarLoadError}
        </p>
      )}

      <div className="space-y-4">
        {user && azkarLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" aria-label="جاري التحميل" />
          </div>
        )}
        {cards.map((card) => (
          <AzkarCard
            key={card.name}
            card={card}
            nowMs={nowMs}
            onPlus={() => handlePlus(card.name)}
            onTimerToggle={() => handleTimerToggle(card.name)}
            onSave={() => handleSave(card.name)}
          />
        ))}
      </div>

      {user && (
        <UsersOverview
          users={overviewUsers}
          error={overviewError}
          loading={overviewLoading}
        />
      )}
    </div>
  );
}
