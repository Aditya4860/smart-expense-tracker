import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useRecurring from '../../hooks/useRecurring';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import Card from '../ui/Card';

const RecurringSummaryWidget = memo(function RecurringSummaryWidget({ onAddNew }) {
  const { recurringTransactions, counts, loading } = useRecurring();

  // Find next upcoming recurring transaction
  const nextUpcoming = useMemo(() => {
    const active = recurringTransactions.filter(
      (r) => r.status === 'ACTIVE' && r.nextDate
    );
    if (active.length === 0) return null;
    return [...active].sort(
      (a, b) => new Date(a.nextDate) - new Date(b.nextDate)
    )[0];
  }, [recurringTransactions]);

  return (
    <Card padding="md" className="flex flex-col gap-3 h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 text-xs">
              🔄
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Recurring Schedules
            </h3>
          </div>
          <Link
            to="/expenses?tab=recurring"
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            Manage →
          </Link>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl bg-danger-500/10 border border-danger-500/20 p-2.5">
            <p className="text-[10px] uppercase font-semibold text-danger-400">
              Monthly Rec. Spend
            </p>
            <p className="text-sm font-bold tabular-nums font-mono text-danger-300 mt-0.5">
              {formatCurrency(counts.total_monthly_recurring_expense)}
            </p>
            <p className="text-[10px] text-surface-500 mt-0.5">
              {counts.active_expenses} active plans
            </p>
          </div>

          <div className="rounded-xl bg-success-500/10 border border-success-500/20 p-2.5">
            <p className="text-[10px] uppercase font-semibold text-success-400">
              Monthly Rec. Income
            </p>
            <p className="text-sm font-bold tabular-nums font-mono text-success-300 mt-0.5">
              {formatCurrency(counts.total_monthly_recurring_income)}
            </p>
            <p className="text-[10px] text-surface-500 mt-0.5">
              {counts.active_income} active plans
            </p>
          </div>
        </div>

        {/* Next Scheduled Execution */}
        {nextUpcoming ? (
          <div className="rounded-xl bg-surface-700/30 border border-surface-700/50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                Next Up
              </span>
              <span className="text-[10px] text-surface-400">
                {formatLocalDate(nextUpcoming.nextDate)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                {nextUpcoming.title}
              </p>
              <span
                className={`text-xs font-bold tabular-nums font-mono ${
                  nextUpcoming.type === 'EXPENSE' ? 'text-danger-400' : 'text-success-400'
                }`}
              >
                {nextUpcoming.type === 'EXPENSE' ? '-' : '+'}
                {formatCurrency(nextUpcoming.amount)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center">
            <p className="text-xs text-surface-400">No upcoming recurring execution scheduled.</p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-surface-700/40 flex items-center justify-between text-[11px] text-surface-400">
        <span>{counts.total_active} active schedules</span>
        <button
          type="button"
          onClick={onAddNew}
          className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
        >
          + Add Schedule
        </button>
      </div>
    </Card>
  );
});

export default RecurringSummaryWidget;
