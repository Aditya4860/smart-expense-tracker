import { memo, useCallback } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants/expenseCategories';
import useExpenses from '../../hooks/useExpenses';

// ── Label helper ───────────────────────────────────────────────────────────

function FilterLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-medium text-slate-400"
    >
      {children}
    </label>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * ExpenseFilters — filter panel for Category, Payment Method, and Date Range.
 *
 * Reads and writes the `filters` slice of ExpenseContext.
 * Calling `resetFilters()` also clears the search query and sort order (handled in context).
 *
 * Props:
 *   onClose — optional () => void — called alongside resetFilters on "Clear all"
 */
const ExpenseFilters = memo(function ExpenseFilters({ onClose }) {
  const { filters, setFilters, resetFilters } = useExpenses();

  const hasActive =
    filters.category || filters.paymentMethod || filters.dateFrom || filters.dateTo;

  const handle = useCallback(
    (field) => (e) => setFilters({ [field]: e.target.value }),
    [setFilters]
  );

  function handleClearAll() {
    resetFilters();
    onClose?.();
  }

  return (
    <div
      className="rounded-2xl border border-surface-700/60 bg-surface-800 p-4 shadow-card-dark"
      aria-label="Expense filters"
    >
      {/* Panel header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Filters
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-primary-400 transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter controls grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Category */}
        <div>
          <FilterLabel htmlFor="filter-category">Category</FilterLabel>
          <select
            id="filter-category"
            value={filters.category}
            onChange={handle('category')}
            className="input h-9 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.icon}  {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <FilterLabel htmlFor="filter-payment">Payment Method</FilterLabel>
          <select
            id="filter-payment"
            value={filters.paymentMethod}
            onChange={handle('paymentMethod')}
            className="input h-9 text-sm"
          >
            <option value="">All methods</option>
            {PAYMENT_METHODS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <FilterLabel htmlFor="filter-date-from">From date</FilterLabel>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={handle('dateFrom')}
            max={filters.dateTo || undefined}
            className="input h-9 text-sm"
          />
        </div>

        {/* Date to */}
        <div>
          <FilterLabel htmlFor="filter-date-to">To date</FilterLabel>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={handle('dateTo')}
            min={filters.dateFrom || undefined}
            className="input h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
});

export default ExpenseFilters;
