import { memo } from 'react';
import useIncome from '../../hooks/useIncome';
import IncomeRow from './IncomeRow';

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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-white">No income recorded yet</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Add your first income entry using the button above to start tracking.
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
      <p className="text-base font-semibold text-white">No matching records</p>
      <p className="mt-1 text-sm text-slate-500">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

// ── Column header helper ───────────────────────────────────────────────────

function TH({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * IncomeTable — sortable, responsive income list with empty states.
 *
 * Reads from IncomeContext via useIncome(). No props required.
 */
const IncomeTable = memo(function IncomeTable() {
  const { income, processedIncome, sortOrder, setSortOrder } = useIncome();

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-700/60 bg-surface-800">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-surface-700/60 px-4 py-3">
        <p className="text-sm text-slate-400">
          {income.length === 0 ? (
            <span className="text-slate-600">No data</span>
          ) : (
            <>
              <span className="font-semibold text-white">{processedIncome.length}</span>
              {' of '}
              <span className="font-semibold text-white">{income.length}</span>
              {' '}
              {income.length === 1 ? 'record' : 'records'}
            </>
          )}
        </p>

        <select
          id="income-sort"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          aria-label="Sort income records"
          disabled={income.length === 0}
          className="input h-8 min-w-[140px] px-2 py-0 text-xs disabled:opacity-40"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {income.length === 0 ? (
        <EmptyNoData />
      ) : processedIncome.length === 0 ? (
        <EmptyNoMatch />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]" aria-label="Income records">
            <thead>
              <tr className="border-b border-surface-700/40">
                <TH className="text-left">Income</TH>
                <TH className="text-right">Amount</TH>
                <TH className="hidden text-left sm:table-cell">Date</TH>
                <TH className="hidden text-left md:table-cell">Source</TH>
                <TH className="text-right">
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </thead>
            <tbody>
              {processedIncome.map(record => (
                <IncomeRow key={record.id} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default IncomeTable;
