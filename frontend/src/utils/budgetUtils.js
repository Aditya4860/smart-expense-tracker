/**
 * budgetUtils.js — shared pure calculations for budgets.
 */

/**
 * Computes high-level aggregate stats from a list of budget objects.
 *
 * @param {object[]} budgets 
 * @returns {{
 *   totalLimit: number,
 *   totalRemain: number,
 *   utilization: number,
 *   hasBudgets: boolean,
 *   count: number,
 *   totalSpent: number,
 *   topBudget: object | null
 * }}
 */
export function computeBudgetStats(budgets) {
  const count = budgets.length;
  const hasBudgets = count > 0;
  
  const totalLimit = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemain = totalLimit - totalSpent;
  
  const utilization = totalLimit > 0
    ? parseFloat(((totalSpent / totalLimit) * 100).toFixed(1))
    : 0;
    
  const topBudget = hasBudgets
    ? budgets.reduce((prev, cur) => cur.monthlyLimit > prev.monthlyLimit ? cur : prev)
    : null;
    
  return {
    count,
    hasBudgets,
    totalLimit,
    totalSpent,
    totalRemain,
    utilization,
    topBudget
  };
}
