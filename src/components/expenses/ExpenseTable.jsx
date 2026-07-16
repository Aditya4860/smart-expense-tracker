import { memo } from 'react';
import useExpenses from '../../hooks/useExpenses';
import ExpenseRow from './ExpenseRow';

// ── Sort options ───────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first'   },
  { value: 'oldest',  label: 'Oldest first'   },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest',  label: 'Lowest amount'  },
];

// ── Empty states ───────────────────────────────────────────────────────────

function EmptyNoData() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-700/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8 text-slate-500"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-white">No expenses yet</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Add your first expense using the button above to start tracking your spending.
      </p>
    </div>
  );
}

function EmptyNoMatch() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-700/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8 text-slate-500"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803M10.5 7.5v6m3-3h-6" />
        </svg>
      </div>
      <p className="text-base font-semibold text-white">No matching expenses</p>
      <p className="mt-1 text-sm text-slate-500">
        Try clearing your search or adjusting the filters.
      </p>
    </div>
  );
}

// ── Column headers ─────────────────────────────────────────────────────────

const TH = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 ${className}`}
  >
    {children}
  </th>
);

// ── Main component ─────────────────────────────────────────────────────────

/**
 * ExpenseTable — sortable, responsive expense list with empty states.
 *
 * Reads from ExpenseContext via useExpenses(). No props required.
 */
const ExpenseTable = memo(function ExpenseTable() {
  const { expenses, processedExpenses, sortOrder, setSortOrder } = useExpenses();

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-700/60 bg-surface-800">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-surface-700/60 px-4 py-3">
        <p className="text-sm text-slate-400">
          {expenses.length === 0 ? (
            <span className="text-slate-600">No data</span>
          ) : (
            <>
              <span className="font-semibold text-white">{processedExpenses.length}</span>
              {' of '}
              <span className="font-semibold text-white">{expenses.length}</span>
              {' '}
              {expenses.length === 1 ? 'expense' : 'expenses'}
            </>
          )}
        </p>

        <select
          id="expense-sort"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          aria-label="Sort expenses"
          disabled={expenses.length === 0}
          className="input h-8 min-w-[140px] px-2 py-0 text-xs disabled:opacity-40"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {expenses.length === 0 ? (
        <EmptyNoData />
      ) : processedExpenses.length === 0 ? (
        <EmptyNoMatch />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]" aria-label="Expenses">
            <thead>
              <tr className="border-b border-surface-700/40">
                <TH className="text-left">Expense</TH>
                <TH className="text-right">Amount</TH>
                <TH className="hidden text-left sm:table-cell">Date</TH>
                <TH className="hidden text-left md:table-cell">Payment</TH>
                <TH className="text-right">
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </thead>
            <tbody>
              {processedExpenses.map(expense => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default ExpenseTable;
