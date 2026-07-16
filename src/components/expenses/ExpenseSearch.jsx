import { memo, useCallback } from 'react';
import useExpenses from '../../hooks/useExpenses';

/**
 * ExpenseSearch — live title / category search wired to ExpenseContext.
 * Renders a single full-width search input with a clear button.
 */
const ExpenseSearch = memo(function ExpenseSearch() {
  const { searchQuery, setSearchQuery } = useExpenses();

  const handleChange = useCallback(
    (e) => setSearchQuery(e.target.value),
    [setSearchQuery]
  );

  const handleClear = useCallback(
    () => setSearchQuery(''),
    [setSearchQuery]
  );

  return (
    <div className="relative flex-1">
      {/* Search icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
          clipRule="evenodd"
        />
      </svg>

      <input
        id="expense-search"
        type="search"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Search by title or category…"
        aria-label="Search expenses"
        autoComplete="off"
        className="input h-10 w-full pl-9 pr-9 text-sm"
      />

      {/* Clear button — visible only when there is a query */}
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={[
            'absolute right-3 top-1/2 -translate-y-1/2',
            'flex h-5 w-5 items-center justify-center rounded-full',
            'text-slate-500 transition-colors hover:bg-white/10 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          ].join(' ')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
});

export default ExpenseSearch;
