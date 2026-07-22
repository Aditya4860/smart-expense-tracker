import { memo, useMemo } from 'react';
import useBudget from '../../hooks/useBudget';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

// ── Colour helper ──────────────────────────────────────────────────────────

function utilizationTheme(pct) {
  if (pct > 90) return { bar: 'bg-danger-500',  text: 'text-danger-400'  };
  if (pct > 70) return { bar: 'bg-yellow-500',  text: 'text-yellow-400'  };
  return              { bar: 'bg-success-500',  text: 'text-success-400' };
}

// ── Icons ──────────────────────────────────────────────────────────────────

const WalletIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetOverviewWidget — compact budget overview card for the Dashboard.
 *
 * Displays: Total Budget · Amount Spent · Remaining · Utilization %
 * Reads from BudgetContext via useBudget().
 */
const BudgetOverviewWidget = memo(function BudgetOverviewWidget() {
  const { budgets } = useBudget();

  const stats = useMemo(() => {
    const totalLimit  = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    const totalSpent  = budgets.reduce((s, b) => s + b.spent,        0);
    const totalRemain = totalLimit - totalSpent;
    const utilization = totalLimit > 0
      ? parseFloat(((totalSpent / totalLimit) * 100).toFixed(1))
      : 0;
    return { totalLimit, totalSpent, totalRemain, utilization, count: budgets.length };
  }, [budgets]);

  const theme = utilizationTheme(stats.utilization);

  return (
    <Card padding="md" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Budget Overview
        </p>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
          {WalletIcon}
        </div>
      </div>

      {stats.count === 0 ? (
        <p className="py-3 text-center text-sm text-slate-600">No budgets set yet.</p>
      ) : (
        <>
          {/* Total budget */}
          <div>
            <p className="text-2xl font-bold tabular-nums text-white">
              {formatCurrency(stats.totalLimit)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {stats.count} {stats.count === 1 ? 'budget' : 'budgets'} active
            </p>
          </div>

          {/* Spent / Remaining row */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-700/30 p-3 text-center">
            <div>
              <p className="text-[10px] text-slate-500">Spent</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-danger-400">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Remaining</p>
              <p className={`mt-0.5 text-sm font-semibold tabular-nums ${stats.totalRemain >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {stats.totalRemain >= 0
                  ? formatCurrency(stats.totalRemain)
                  : `−${formatCurrency(Math.abs(stats.totalRemain))}`}
              </p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Utilization</p>
              <p className={`text-xs font-bold tabular-nums ${theme.text}`}>
                {stats.utilization}%
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
                style={{ width: `${stats.utilization}%` }}
                role="progressbar"
                aria-valuenow={stats.utilization}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${stats.utilization}% of budget used`}
              />
            </div>
          </div>
        </>
      )}
    </Card>
  );
});

export default BudgetOverviewWidget;
