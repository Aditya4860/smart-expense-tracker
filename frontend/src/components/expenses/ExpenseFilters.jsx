import { memo, useCallback, useMemo } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants/expenseCategories';
import useExpenses from '../../hooks/useExpenses';
import DateSelect from '../ui/DateSelect';
import Select from '../ui/Select';

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
          <Select
            id="filter-category"
            name="category"
            value={filters.category || ''}
            onChange={handle('category')}
            options={useMemo(() => [
              { value: '', label: 'All categories' },
              ...CATEGORIES.map(c => ({ value: c.id, label: `${c.icon}  ${c.name}` }))
            ], [])}
            className="h-9"
          />
        </div>

        {/* Payment Method */}
        <div>
          <FilterLabel htmlFor="filter-payment">Payment Method</FilterLabel>
          <Select
            id="filter-payment"
            name="paymentMethod"
            value={filters.paymentMethod || ''}
            onChange={handle('paymentMethod')}
            options={useMemo(() => [
              { value: '', label: 'All methods' },
              ...PAYMENT_METHODS.map(p => ({ value: p.id, label: p.label }))
            ], [])}
            className="h-9"
          />
        </div>

        {/* Date from */}
        <div>
          <FilterLabel htmlFor="filter-date-from">From date</FilterLabel>
          <DateSelect
            id="filter-date-from"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handle('dateFrom')}
            max={filters.dateTo || undefined}
          />
        </div>

        {/* Date to */}
        <div>
          <FilterLabel htmlFor="filter-date-to">To date</FilterLabel>
          <DateSelect
            id="filter-date-to"
            name="dateTo"
            value={filters.dateTo}
            onChange={handle('dateTo')}
            min={filters.dateFrom || undefined}
          />
        </div>
      </div>
    </div>
  );
});

export default ExpenseFilters;
