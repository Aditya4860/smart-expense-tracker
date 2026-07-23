import { memo } from 'react';
import useBudget from '../../hooks/useBudget';
import BudgetRow from './BudgetRow';

// ── Column header helper ───────────────────────────────────────────────────

const TH = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 ${className}`}
  >
    {children}
  </th>
);

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
      <p className="text-base font-semibold text-white">No budgets yet</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Add your first budget using the button above to start planning your spending.
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetTable — responsive budget list in table form.
 *
 * Reads from BudgetContext via useBudget(). No props required.
 */
const BudgetTable = memo(function BudgetTable() {
  const { budgets } = useBudget();

  return (
    <div className="overflow-hidden card">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-surface-700/60 px-4 py-3">
        <p className="text-sm text-slate-400">
          {budgets.length === 0 ? (
            <span className="text-slate-600">No data</span>
          ) : (
            <>
              <span className="font-semibold text-white">{budgets.length}</span>
              {' '}
              {budgets.length === 1 ? 'budget' : 'budgets'}
            </>
          )}
        </p>
      </div>

      {/* Content */}
      {budgets.length === 0 ? (
        <EmptyNoData />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]" aria-label="Budgets">
            <thead>
              <tr className="border-b border-surface-700/40">
                <TH className="text-left">Category</TH>
                <TH className="text-right">Monthly Limit</TH>
                <TH className="hidden text-right sm:table-cell">Spent</TH>
                <TH className="hidden text-right md:table-cell">Remaining</TH>
                <TH className="hidden text-left lg:table-cell">Progress</TH>
                <TH className="hidden text-left sm:table-cell">Period</TH>
                <TH className="text-right">
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </thead>
            <tbody>
              {budgets.map(budget => (
                <BudgetRow key={budget.id} budget={budget} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default BudgetTable;
