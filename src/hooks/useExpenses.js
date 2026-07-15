import { useExpenseContext } from '../context/ExpenseContext';

/**
 * useExpenses — convenience hook for consuming ExpenseContext.
 *
 * Returns the full context value. Throws if called outside <ExpenseProvider>.
 */
export default function useExpenses() {
  return useExpenseContext();
}
