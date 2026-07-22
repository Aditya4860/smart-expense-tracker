import { memo } from 'react';
import useAnalytics from '../../hooks/useAnalytics';
import { CATEGORY_MAP } from '../../constants/expenseCategories';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';


// ── Bar item ───────────────────────────────────────────────────────────────

function CategoryBar({ item, maxTotal }) {
  const cat      = CATEGORY_MAP[item.category] ?? { name: item.category, icon: '📦', color: 'text-slate-400', bg: 'bg-slate-500/15' };
  const pct      = maxTotal > 0 ? Math.round((item.total / maxTotal) * 100) : 0;

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm ${cat.bg} ${cat.color}`}>
            {cat.icon}
          </span>
          <span className="truncate text-sm text-slate-300">{cat.name}</span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-xs text-slate-500">{item.share}%</span>
          <span className="text-sm font-semibold tabular-nums text-danger-400">
            {formatCurrency(item.total)}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-700" aria-hidden="true">
        <div
          className="h-full rounded-full bg-danger-500/60 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-[10px] text-slate-600">{item.count} {item.count === 1 ? 'transaction' : 'transactions'}</p>
    </li>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * CategoryBreakdown — horizontal bar chart of top expense categories.
 */
const CategoryBreakdown = memo(function CategoryBreakdown() {
  const { analytics } = useAnalytics();
  const { topExpenseCategories } = analytics;

  const maxTotal = topExpenseCategories[0]?.total ?? 0;

  return (
    <Card padding="lg">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Top Expense Categories
      </h2>

      {topExpenseCategories.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-600">No expense data available.</p>
      ) : (
        <ul role="list" className="space-y-4">
          {topExpenseCategories.map(item => (
            <CategoryBar
              key={item.category}
              item={item}
              maxTotal={maxTotal}
            />
          ))}
        </ul>
      )}
    </Card>
  );
});

export default CategoryBreakdown;
