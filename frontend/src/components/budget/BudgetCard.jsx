import { memo, useMemo } from 'react';
import { BUDGET_CATEGORY_MAP } from '../../constants/budgetCategories';
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters';
import useBudget from '../../hooks/useBudget';
import BudgetProgressBar from './BudgetProgressBar';
import Card from '../ui/Card';

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetCard — a rich card view of a single budget record.
 *
 * Props:
 *   budget    — the full budget object from BudgetContext
 *   onEdit    — () => void
 *   onDelete  — () => void
 */
const BudgetCard = memo(function BudgetCard({ budget, onEdit, onDelete }) {
  const { calculateBudgetProgress } = useBudget();
  const cat = BUDGET_CATEGORY_MAP[budget.category] ?? BUDGET_CATEGORY_MAP.other;
  const pct = useMemo(
    () => calculateBudgetProgress(budget.id),
    [budget.id, calculateBudgetProgress],
  );

  return (
    <Card padding="md" className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${cat.bg} ${cat.color}`}
            aria-hidden="true"
          >
            {cat.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{cat.name}</p>
            <p className="text-xs text-slate-500">
              {MONTH_NAMES[budget.month]} {budget.year}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${cat.name} budget`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-500/10 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
              <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9a.75.75 0 0 1 1.5 0v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${cat.name} budget`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-500/10 hover:text-danger-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-700/30 p-3 text-center">
        <div>
          <p className="text-xs text-slate-500">Limit</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
            {formatCurrency(budget.monthlyLimit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Spent</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-danger-400">
            {formatCurrency(budget.spent)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Left</p>
          <p className={`mt-0.5 text-sm font-bold tabular-nums ${budget.remaining >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {budget.remaining >= 0
              ? formatCurrency(budget.remaining)
              : `−${formatCurrency(Math.abs(budget.remaining))}`}
          </p>
        </div>
      </div>

      {/* Progress */}
      <BudgetProgressBar
        spent={budget.spent}
        monthlyLimit={budget.monthlyLimit}
        pct={pct}
      />
    </Card>
  );
});

export default BudgetCard;
