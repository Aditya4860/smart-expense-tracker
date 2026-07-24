import { useIncomeContext } from '../context/IncomeContext';

/**
 * useIncome — public hook for consuming IncomeContext.
 *
 * Returns the full context value. Call only inside components
 * that are descendants of <IncomeProvider>.
 *
 * @returns {{
 *   income:          object[],
 *   processedIncome: object[],
 *   summary:         { total: number, count: number, largest: number, average: number },
 *   searchQuery:     string,
 *   filters:         { category: string, source: string, dateFrom: string, dateTo: string },
 *   sortOrder:       string,
 *   addIncome:       (values: object) => object,
 *   updateIncome:    (id: string, values: object) => object | undefined,
 *   deleteIncome:    (id: string) => void,
 *   getIncome:       (id: string) => object | null,
 *   clearIncome:     () => void,
 *   setSearchQuery:  (query: string) => void,
 *   setFilters:      (partial: object) => void,
 *   resetFilters:    () => void,
 *   setSortOrder:    (order: string) => void,
 * }}
 */
export default function useIncome() {
  return useIncomeContext();
}
