import { useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';

/**
 * useExpenses — consume ExpenseContext.
 *
 * Must be used inside <ExpenseProvider>.
 *
 * Returns:
 *   expenses      — filtered + sorted Expense[]
 *   allExpenses   — raw Expense[] (no filters applied)
 *   stats         — { total, thisMonth, count, byCategory[] }
 *   filters       — current filter state
 *   loading       — true while data is being loaded
 *   addExpense(payload)       → Expense
 *   updateExpense(id, patch)  → Expense | undefined
 *   deleteExpense(id)         → void
 *   setFilters(partial)       → void
 *   resetFilters()            → void
 */
export default function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) {
    throw new Error('useExpenses must be used inside <ExpenseProvider>.');
  }
  return ctx;
}
