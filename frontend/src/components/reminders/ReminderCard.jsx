import { memo } from 'react';

const TYPE_CONFIG = {
  BILL: {
    label: 'Bill',
    icon: '📄',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderGlow: 'hover:border-amber-500/40',
  },
  SUBSCRIPTION: {
    label: 'Subscription',
    icon: '🔁',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderGlow: 'hover:border-purple-500/40',
  },
  EMI: {
    label: 'EMI',
    icon: '💳',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderGlow: 'hover:border-blue-500/40',
  },
  SAVINGS: {
    label: 'Savings',
    icon: '💰',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/40',
  },
  BUDGET: {
    label: 'Budget',
    icon: '📊',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    borderGlow: 'hover:border-cyan-500/40',
  },
  GOAL: {
    label: 'Goal',
    icon: '🎯',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderGlow: 'hover:border-rose-500/40',
  },
  CUSTOM: {
    label: 'Custom',
    icon: '⏰',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    borderGlow: 'hover:border-slate-500/40',
  },
};

const FREQ_LABELS = {
  ONCE: 'One-time',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const STATUS_BADGES = {
  PENDING: { label: 'Pending', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  SNOOZED: { label: 'Snoozed', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  DISMISSED: { label: 'Dismissed', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
};

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

const ReminderCard = memo(function ReminderCard({
  reminder,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onViewHistory,
}) {
  const typeInfo = TYPE_CONFIG[reminder.type] || TYPE_CONFIG.CUSTOM;
  const statusInfo = STATUS_BADGES[reminder.status] || STATUS_BADGES.PENDING;
  const isCompleted = reminder.status === 'COMPLETED';

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${typeInfo.borderGlow} ${
        isCompleted ? 'opacity-70 bg-slate-50 dark:bg-slate-900/50' : ''
      }`}
    >
      {/* Top row: Type Badge + Status + History */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeInfo.badgeClass}`}
            >
              <span>{typeInfo.icon}</span>
              <span>{typeInfo.label}</span>
            </span>

            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {FREQ_LABELS[reminder.frequency] || reminder.frequency}
            </span>

            {reminder.isOverdue && !isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                <span>⚠️</span> Overdue
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusInfo.cls}`}
            >
              {statusInfo.label}
            </span>
            <button
              onClick={() => onViewHistory(reminder)}
              title="View History"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3
          className={`text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1 ${
            isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''
          }`}
        >
          {reminder.title}
        </h3>

        {reminder.description && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {reminder.description}
          </p>
        )}

        {/* Amount & Due Info */}
        <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              {reminder.status === 'SNOOZED' ? 'Snoozed Until' : 'Due Date'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={`text-xs font-semibold ${reminder.isOverdue && !isCompleted ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                {formatDate(reminder.status === 'SNOOZED' && reminder.snoozeUntil ? reminder.snoozeUntil : reminder.dueDate)}
                {reminder.dueTime ? ` at ${reminder.dueTime}` : ''}
              </span>
            </div>
          </div>

          {reminder.amount !== null && (
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Amount
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(reminder.amount)}
              </span>
            </div>
          )}
        </div>

        {/* Category badge if available */}
        {reminder.categoryName && reminder.categoryName !== 'General' && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              {reminder.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
        <div className="flex items-center gap-1.5">
          {!isCompleted && (
            <>
              <button
                onClick={() => onComplete(reminder.id)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors"
                title="Mark Completed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Done
              </button>

              <button
                onClick={() => onSnooze(reminder)}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 transition-colors"
                title="Snooze Reminder"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Snooze
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(reminder)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Edit Reminder"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(reminder.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
            title="Delete Reminder"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default ReminderCard;
