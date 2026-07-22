/**
 * sortOptions.js — shared sort order options for table toolbars.
 *
 * Used by ExpenseTable and IncomeTable (and any future data table).
 */
export const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest first'   },
  { value: 'oldest',  label: 'Oldest first'   },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest',  label: 'Lowest amount'  },
];
