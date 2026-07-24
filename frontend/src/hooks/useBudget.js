import { useBudgetContext } from '../context/BudgetContext';

/**
 * useBudget — public hook for consuming BudgetContext.
 *
 * Returns the full context value. Call only inside components
 * that are descendants of <BudgetProvider>.
 *
 * @returns {{
 *   budgets:                  object[],
 *   addBudget:                (values: object) => object,
 *   updateBudget:             (id: string, values: object) => object | undefined,
 *   deleteBudget:             (id: string) => void,
 *   getBudget:                (id: string) => object | null,
 *   clearBudgets:             () => void,
 *   calculateRemainingBudget: (id: string) => number,
 *   calculateSpentBudget:     (id: string) => number,
 *   calculateBudgetProgress:  (id: string) => number,
 * }}
 */
export default function useBudget() {
  return useBudgetContext();
}
