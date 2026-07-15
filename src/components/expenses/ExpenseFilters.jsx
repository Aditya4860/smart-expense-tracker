import { memo } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants/expenseCategories';
import useExpenses from '../../hooks/useExpenses';

/**
 * ExpenseFilters — dropdowns for category, payment method, and date range.
 * Reads/writes the `filters` slice from ExpenseContext.
 */
const ExpenseFilters = memo(function ExpenseFilters({ onClose }) {
  const { filters, setFilters, resetFilters } = useExpenses();

  const hasActive =
    filters.category || filters.paymentMethod || filters.dateFrom || filters.dateTo;

  function handle(field) {
    return (e) => setFilters({ [field]: e.target.value });
  }

  return (
    <div className="rounded-2xl border border-surface-700/60 bg-surface-800 p-4 shadow-card-dark">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</h3>
        {hasActive && (
          <button
            type="button"
            onClick={() => { resetFilters(); onClose?.(); }}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-slate-400">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={handle('category')}
            className="input h-9 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="filter-payment" className="mb-1 block text-xs font-medium text-slate-400">
            Payment Method
          </label>
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
          <label htmlFor="filter-date-from" className="mb-1 block text-xs font-medium text-slate-400">
            From date
          </label>
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
          <label htmlFor="filter-date-to" className="mb-1 block text-xs font-medium text-slate-400">
            To date
          </label>
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
