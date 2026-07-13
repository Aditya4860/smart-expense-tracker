import { useState, useRef, useEffect } from 'react';
import CATEGORIES from '../../constants/categories';
import useExpenses from '../../hooks/useExpenses';

/**
 * ExpenseFilters — search + category + date + sort filter bar.
 *
 * Reads current filter state from ExpenseContext and dispatches updates
 * via setFilters(). No props required.
 */
export default function ExpenseFilters() {
  const { filters, setFilters, resetFilters, allExpenses } = useExpenses();
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  // Close the category dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  function toggleCategory(id) {
    const next = filters.categories.includes(id)
      ? filters.categories.filter(c => c !== id)
      : [...filters.categories, id];
    setFilters({ categories: next });
  }

  function handleSort(field) {
    if (filters.sortBy === field) {
      setFilters({ sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc' });
    } else {
      setFilters({ sortBy: field, sortDir: 'desc' });
    }
  }

  const SortIcon = ({ field }) => {
    if (filters.sortBy !== field) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-40">
          <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .55.24l3.25 3.5a.75.75 0 1 1-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 0 1-1.1-1.02l3.25-3.5A.75.75 0 0 1 10 3Zm-3.76 9.24a.75.75 0 0 1 1.06.02L10 15.148l2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      );
    }
    return filters.sortDir === 'desc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-primary-400">
        <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .55.24l3.25 3.5a.75.75 0 1 1-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 0 1-1.1-1.02l3.25-3.5A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-primary-400">
        <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.55-.24l-3.25-3.5a.75.75 0 1 1 1.1-1.02L10 15.148l2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Category dropdown + Sort buttons */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            id="expense-search"
            type="search"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            className="input pl-9 h-9 text-sm"
          />
        </div>

        {/* Category dropdown */}
        <div className="relative" ref={catRef}>
          <button
            id="expense-filter-category"
            type="button"
            onClick={() => setCatOpen(o => !o)}
            className={[
              'btn-secondary h-9 gap-1.5 text-sm',
              filters.categories.length > 0 ? 'border-primary-500/60 text-primary-400' : '',
            ].join(' ')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
            Category
            {filters.categories.length > 0 && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-2xs font-bold text-white">
                {filters.categories.length}
              </span>
            )}
          </button>

          {catOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-surface-700 bg-surface-800 p-2 shadow-card-dark animate-scale-in">
              <p className="mb-1.5 px-2 text-2xs font-semibold uppercase tracking-wider text-slate-500">
                Filter by category
              </p>
              <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-0.5">
                {CATEGORIES.map(cat => {
                  const checked = filters.categories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      htmlFor={`filter-cat-${cat.id}`}
                      className={[
                        'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
                        checked
                          ? 'bg-primary-600/15 text-primary-300'
                          : 'text-slate-300 hover:bg-white/5',
                      ].join(' ')}
                    >
                      <input
                        id={`filter-cat-${cat.id}`}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat.id)}
                        className="sr-only"
                      />
                      <span
                        className={[
                          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                          checked
                            ? 'border-primary-500 bg-primary-600'
                            : 'border-surface-600',
                        ].join(' ')}
                        aria-hidden="true"
                      >
                        {checked && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span aria-hidden="true">{cat.icon}</span>
                      {cat.label}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date range */}
        <input
          id="expense-filter-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters({ dateFrom: e.target.value })}
          title="From date"
          className="input h-9 w-auto text-sm px-3"
        />
        <span className="text-slate-600 text-sm">→</span>
        <input
          id="expense-filter-date-to"
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters({ dateTo: e.target.value })}
          title="To date"
          className="input h-9 w-auto text-sm px-3"
        />

        {/* Sort */}
        <button
          id="expense-sort-date"
          type="button"
          onClick={() => handleSort('date')}
          className={[
            'btn-secondary h-9 gap-1 text-sm',
            filters.sortBy === 'date' ? 'border-primary-500/50 text-primary-400' : '',
          ].join(' ')}
          title="Sort by date"
        >
          <SortIcon field="date" />
          Date
        </button>

        <button
          id="expense-sort-amount"
          type="button"
          onClick={() => handleSort('amount')}
          className={[
            'btn-secondary h-9 gap-1 text-sm',
            filters.sortBy === 'amount' ? 'border-primary-500/50 text-primary-400' : '',
          ].join(' ')}
          title="Sort by amount"
        >
          <SortIcon field="amount" />
          Amount
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            id="expense-filter-reset"
            type="button"
            onClick={resetFilters}
            className="btn-ghost h-9 text-sm text-danger-400 hover:text-danger-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Active category chips */}
      {filters.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Active category filters">
          {filters.categories.map(id => {
            const cat = CATEGORIES.find(c => c.id === id);
            if (!cat) return null;
            return (
              <span
                key={id}
                role="listitem"
                className="badge badge-primary gap-1 pl-1.5"
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
                <button
                  type="button"
                  aria-label={`Remove ${cat.label} filter`}
                  onClick={() => toggleCategory(id)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-primary-500/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5">
                    <path d="M3.22 3.22a.75.75 0 0 1 1.06 0L6 4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L7.06 6l1.72 1.72a.75.75 0 1 1-1.06 1.06L6 7.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L4.94 6 3.22 4.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Result count */}
      {allExpenses.length > 0 && (
        <p className="text-xs text-slate-500">
          {hasActiveFilters
            ? `Showing filtered results`
            : `${allExpenses.length} expense${allExpenses.length !== 1 ? 's' : ''} total`}
        </p>
      )}
    </div>
  );
}
