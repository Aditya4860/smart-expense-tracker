import { memo } from 'react';
import useExpenses from '../../hooks/useExpenses';
import ExpenseRow from './ExpenseRow';
import EmptyState from '../ui/EmptyState';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest',  label: 'Lowest amount' },
];

/**
 * ExpenseTable — full expense list with sort controls and empty state.
 */
const ExpenseTable = memo(function ExpenseTable() {
  const { processedExpenses, sortOrder, setSortOrder, expenses } = useExpenses();

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7" aria-hidden="true">
            <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
          </svg>
        }
        title="No expenses yet"
        description="Add your first expense to start tracking your spending."
      />
    );
  }

  if (processedExpenses.length === 0) {
    return (
      <EmptyState
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
        }
        title="No matching expenses"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-surface-700/60 bg-surface-800 overflow-hidden">
      {/* Table header + sort control */}
      <div className="flex items-center justify-between border-b border-surface-700/60 px-4 py-3">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">{processedExpenses.length}</span>{' '}
          {processedExpenses.length === 1 ? 'expense' : 'expenses'}
        </p>
        <select
          id="expense-sort"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          aria-label="Sort expenses"
          className="input h-8 text-xs px-2 py-0 min-w-[140px]"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Responsive scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-surface-700/40">
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Expense
              </th>
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                Amount
              </th>
              <th scope="col" className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">
                Date
              </th>
              <th scope="col" className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500 md:table-cell">
                Payment
              </th>
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {processedExpenses.map(expense => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ExpenseTable;
