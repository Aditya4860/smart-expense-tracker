import { memo, useMemo } from 'react';
import { BUDGET_CATEGORY_MAP } from '../../constants/budgetCategories';
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters';
import useBudget from '../../hooks/useBudget';
import Card from '../ui/Card';

// ── Colour helpers ─────────────────────────────────────────────────────────

function barColour(pct) {
  if (pct > 90) return 'bg-danger-500';
  if (pct > 70) return 'bg-yellow-500';
  return 'bg-success-500';
}

function pctColour(pct) {
  if (pct > 90) return 'text-danger-400';
  if (pct > 70) return 'text-yellow-400';
  return 'text-success-400';
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetProgressWidget — per-category progress list for the Dashboard.
 *
 * Shows up to 5 budgets, sorted by utilization descending (most critical first).
 * Reads from BudgetContext via useBudget() — no duplicate calculations.
 */
const BudgetProgressWidget = memo(function BudgetProgressWidget() {
  const { budgets, calculateBudgetProgress } = useBudget();

  const items = useMemo(() => {
    return budgets
      .map(b => ({
        id:      b.id,
        cat:     BUDGET_CATEGORY_MAP[b.category] ?? { name: b.category, icon: '📦', bg: 'bg-slate-500/15', color: 'text-slate-400' },
        limit:   b.monthlyLimit,
        spent:   b.spent,
        remain:  b.remaining,
        period:  `${MONTH_NAMES[b.month]} ${b.year}`,
        pct:     calculateBudgetProgress(b.id),
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [budgets, calculateBudgetProgress]);

  return (
    <Card padding="md" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Budget Progress
        </p>
        {budgets.length > 5 && (
          <span className="text-[10px] text-slate-600">
            Top 5 of {budgets.length}
          </span>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-600">No budgets configured yet.</p>
      ) : (
        <ul className="space-y-3" role="list">
          {items.map(item => (
            <li key={item.id}>
              {/* Category row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm ${item.cat.bg} ${item.cat.color}`}
                    aria-hidden="true"
                  >
                    {item.cat.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-300">{item.cat.name}</p>
                    <p className="text-[10px] text-slate-600">{item.period}</p>
                  </div>
                </div>
                <span className={`flex-shrink-0 text-xs font-bold tabular-nums ${pctColour(item.pct)}`}>
                  {item.pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-700">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColour(item.pct)}`}
                  style={{ width: `${item.pct}%` }}
                  role="progressbar"
                  aria-valuenow={item.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.cat.name}: ${item.pct}% of budget used`}
                />
              </div>

              {/* Amounts */}
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[10px] text-danger-400 tabular-nums">
                  {formatCurrency(item.spent)} spent
                </span>
                <span className={`text-[10px] tabular-nums ${item.remain >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                  {item.remain >= 0
                    ? `${formatCurrency(item.remain)} left`
                    : `${formatCurrency(Math.abs(item.remain))} over`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
});

export default BudgetProgressWidget;
