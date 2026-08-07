import { memo } from 'react';
import { useCategory } from '../../context/CategoryContext';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';

const STATUS_CONFIG = {
  ACTIVE: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  PAUSED: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Paused',
  },
  CANCELLED: {
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-500',
    label: 'Cancelled',
  },
  COMPLETED: {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-500',
    label: 'Completed',
  },
};

const FREQ_LABELS = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

const RecurringCard = memo(function RecurringCard({
  item,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onSkip,
}) {
  const { getCategoryMeta } = useCategory();
  const cat = getCategoryMeta(item.categoryId, item.type);
  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.ACTIVE;
  const isExpense = item.type === 'EXPENSE';

  // Days until next occurrence
  const getNextDueInfo = () => {
    if (!item.nextDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const next = new Date(item.nextDate);
    next.setHours(0, 0, 0, 0);
    const diffDays = Math.round((next - now) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Due Today', color: 'text-amber-400' };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'text-blue-400' };
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: 'text-rose-400' };
    return { label: `In ${diffDays} days`, color: 'text-surface-400' };
  };

  const dueInfo = getNextDueInfo();

  return (
    <div className="group relative rounded-2xl border border-surface-700 bg-surface-800/90 p-4 transition-all duration-300 hover:border-surface-600 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between gap-4">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          {/* Category & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
                isExpense ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              {cat.icon || (isExpense ? '💸' : '💰')}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate" title={item.title}>
                {item.title}
              </h3>
              <p className="text-xs text-surface-400 truncate">
                {cat.name} {item.merchant ? `• ${item.merchant}` : ''}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${statusCfg.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* Amount & Recurrence Details */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span
              className={`text-xl font-bold tabular-nums font-mono ${
                isExpense ? 'text-danger-400' : 'text-success-400'
              }`}
            >
              {isExpense ? '-' : '+'}
              {formatCurrency(item.amount)}
            </span>
            <span className="text-xs text-surface-500 ml-1">
              / {FREQ_LABELS[item.frequency] || item.frequency}
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center rounded-md bg-surface-700/60 px-2 py-0.5 text-[10px] font-medium text-surface-300">
              {item.type}
            </span>
          </div>
        </div>

        {/* Next Occurrence & Schedule Meta */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-surface-900/60 p-2.5 text-[11px] border border-surface-700/40">
          <div>
            <p className="text-surface-500">Next Occurrence</p>
            <p className="font-medium text-surface-200">
              {item.nextDate ? formatLocalDate(item.nextDate) : 'N/A'}
            </p>
            {dueInfo && <p className={`text-[10px] font-semibold ${dueInfo.color}`}>{dueInfo.label}</p>}
          </div>

          <div>
            <p className="text-surface-500">Auto Process</p>
            <p className="font-medium text-surface-200">
              {item.autoProcess ? '✅ Automatic' : '⏸ Manual'}
            </p>
            <p className="text-[10px] text-surface-500">
              {item.isNeverEnding ? 'Never ends' : item.endDate ? `Ends ${formatLocalDate(item.endDate)}` : ''}
            </p>
          </div>
        </div>

        {item.description && (
          <p className="mt-2.5 text-xs text-surface-400 line-clamp-2 italic">
            "{item.description}"
          </p>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between border-t border-surface-700/60 pt-3 text-xs">
        <div className="flex items-center gap-1">
          {item.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => onPause(item.id)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Pause recurrence"
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onResume(item.id)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Resume recurrence"
            >
              ▶ Resume
            </button>
          )}

          {item.status === 'ACTIVE' && (
            <button
              type="button"
              onClick={() => onSkip(item.id)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-surface-400 hover:bg-surface-700 hover:text-white transition-colors"
              title="Skip next scheduled occurrence"
            >
              ⏭ Skip next
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-700 hover:text-white transition-colors"
            title="Edit schedule"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-surface-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Delete schedule"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default RecurringCard;
