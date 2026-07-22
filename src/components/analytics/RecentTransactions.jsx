import { memo } from 'react';
import useAnalytics from '../../hooks/useAnalytics';
import { CATEGORY_MAP } from '../../constants/expenseCategories';
import { INCOME_CATEGORY_MAP } from '../../constants/incomeCategories';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import Card from '../ui/Card';

// ── Transaction row ────────────────────────────────────────────────────────

function TransactionRow({ txn }) {
  const isIncome  = txn.type === 'income';
  const catMeta   = isIncome
    ? (INCOME_CATEGORY_MAP[txn.category] ?? { icon: '📦', name: txn.category, bg: 'bg-slate-500/15', color: 'text-slate-400' })
    : (CATEGORY_MAP[txn.category]        ?? { icon: '📦', name: txn.category, bg: 'bg-slate-500/15', color: 'text-slate-400' });

  return (
    <li className="flex items-center gap-4 py-3 border-b border-surface-700/40 last:border-0">
      {/* Category icon badge */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${catMeta.bg} ${catMeta.color}`}
        aria-hidden="true"
      >
        {catMeta.icon}
      </div>

      {/* Title + category */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{txn.title}</p>
        <p className="truncate text-xs text-slate-500">{catMeta.name}</p>
      </div>

      {/* Type badge — hidden on smallest screens */}
      <span
        className={[
          'hidden flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex',
          isIncome
            ? 'bg-success-500/15 text-success-400'
            : 'bg-danger-500/15 text-danger-400',
        ].join(' ')}
      >
        {isIncome ? 'Income' : 'Expense'}
      </span>

      {/* Date — hidden on xs */}
      <p className="hidden flex-shrink-0 text-xs text-slate-500 sm:block w-24 text-right">
        {formatLocalDate(txn.date)}
      </p>

      {/* Amount */}
      <p className={[
        'flex-shrink-0 text-sm font-semibold tabular-nums',
        isIncome ? 'text-success-400' : 'text-danger-400',
      ].join(' ')}>
        {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
      </p>
    </li>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * RecentTransactions — merged list of the latest 10 income + expense records.
 * Sorted newest-first, tagged with type: 'income' | 'expense'.
 */
const RecentTransactions = memo(function RecentTransactions() {
  const { analytics } = useAnalytics();
  const { recentTransactions } = analytics;

  return (
    <Card padding="lg">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Recent Transactions
        </h2>
        <span className="text-xs text-slate-600">Latest {recentTransactions.length}</span>
      </div>

      {recentTransactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-600">
          No transactions recorded yet.
        </p>
      ) : (
        <ul role="list" aria-label="Recent transactions">
          {recentTransactions.map(txn => (
            <TransactionRow key={`${txn.type}-${txn.id}`} txn={txn} />
          ))}
        </ul>
      )}
    </Card>
  );
});

export default RecentTransactions;
