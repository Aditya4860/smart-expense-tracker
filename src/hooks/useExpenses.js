import { useExpenseContext } from '../context/ExpenseContext';

/**
 * useExpenses — public hook for consuming ExpenseContext.
 *
 * Returns the full context value. Call only inside components
 * that are descendants of <ExpenseProvider>.
 *
 * @returns {{
 *   expenses:          object[],
 *   processedExpenses: object[],
 *   summary:           { total: number, count: number, largest: number, average: number },
 *   searchQuery:       string,
 *   filters:           { category: string, paymentMethod: string, dateFrom: string, dateTo: string },
 *   sortOrder:         string,
 *   addExpense:        (values: object) => object,
 *   updateExpense:     (id: string, values: object) => object | undefined,
 *   deleteExpense:     (id: string) => void,
 *   getExpense:        (id: string) => object | null,
 *   clearExpenses:     () => void,
 *   setSearchQuery:    (query: string) => void,
 *   setFilters:        (partial: object) => void,
 *   resetFilters:      () => void,
 *   setSortOrder:      (order: string) => void,
 * }}
 */
export default function useExpenses() {
  return useExpenseContext();
}
