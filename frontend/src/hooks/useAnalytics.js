import { useAnalyticsContext } from '../context/AnalyticsContext';

/**
 * useAnalytics — public hook for consuming AnalyticsContext.
 *
 * Returns the full context value. Call only inside components
 * that are descendants of <AnalyticsProvider>.
 *
 * @returns {{
 *   analytics: {
 *     totalIncome:          number,
 *     totalExpense:         number,
 *     netBalance:           number,
 *     savings:              number,
 *     savingsRate:          number,
 *     incomeCount:          number,
 *     expenseCount:         number,
 *     largestExpense:       number,
 *     largestIncome:        number,
 *     averageExpense:       number,
 *     averageIncome:        number,
 *     monthlyTotals:        Array<{ month: string, label: string, income: number, expense: number, balance: number }>,
 *     categoryTotals:       Array<{ category: string, total: number, count: number, share: number }>,
 *     topExpenseCategories: Array<{ category: string, total: number, count: number, share: number }>,
 *     topIncomeSources:     Array<{ source: string, total: number, count: number, share: number }>,
 *     recentTransactions:   Array<object & { type: 'income' | 'expense' }>,
 *   },
 *   refreshAnalytics: () => void,
 *   loading:          boolean,
 * }}
 */
export default function useAnalytics() {
  return useAnalyticsContext();
}
