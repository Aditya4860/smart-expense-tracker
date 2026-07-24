/**
 * analyticsService.js — pure analytics calculation functions.
 *
 * All functions accept raw arrays (expenses, income) and return
 * plain JavaScript values — no React, no side effects, no state.
 *
 * Designed to be called from AnalyticsContext via useMemo.
 */

import {
  sumBy,
  maxBy,
  averageBy,
  round2,
  toYearMonth,
  formatMonthLabel,
  groupBy,
  lastNMonths,
} from '../utils/analyticsCalculations';

// ── Core totals ────────────────────────────────────────────────────────────

/**
 * Sum of all income amounts.
 * @param {object[]} income
 * @returns {number}
 */
export function calculateTotalIncome(income) {
  return round2(sumBy(income, 'amount'));
}

/**
 * Sum of all expense amounts.
 * @param {object[]} expenses
 * @returns {number}
 */
export function calculateTotalExpense(expenses) {
  return round2(sumBy(expenses, 'amount'));
}

/**
 * Income minus expenses.
 * Positive = surplus. Negative = deficit.
 * @param {object[]} income
 * @param {object[]} expenses
 * @returns {number}
 */
export function calculateNetBalance(income, expenses) {
  return round2(calculateTotalIncome(income) - calculateTotalExpense(expenses));
}

/**
 * Alias for calculateNetBalance — explicit "savings" terminology.
 * @param {object[]} income
 * @param {object[]} expenses
 * @returns {number}
 */
export function calculateSavings(income, expenses) {
  return calculateNetBalance(income, expenses);
}

/**
 * Savings as a percentage of total income.
 * Returns 0 when income is zero (avoids divide-by-zero).
 * Clamped to [0, 100].
 * @param {object[]} income
 * @param {object[]} expenses
 * @returns {number}  — integer percentage in [0, 100]
 */
export function calculateSavingsRate(income, expenses) {
  const totalIncome = calculateTotalIncome(income);
  if (totalIncome <= 0) return 0;
  const savings = calculateSavings(income, expenses);
  return Math.max(0, Math.min(100, Math.round((savings / totalIncome) * 100)));
}

// ── Extremes ───────────────────────────────────────────────────────────────

/**
 * Amount of the single largest expense.
 * @param {object[]} expenses
 * @returns {number}
 */
export function calculateLargestExpense(expenses) {
  return round2(maxBy(expenses, 'amount'));
}

/**
 * Amount of the single largest income record.
 * @param {object[]} income
 * @returns {number}
 */
export function calculateLargestIncome(income) {
  return round2(maxBy(income, 'amount'));
}

// ── Averages ───────────────────────────────────────────────────────────────

/**
 * Mean expense amount per transaction.
 * @param {object[]} expenses
 * @returns {number}
 */
export function calculateAverageExpense(expenses) {
  return round2(averageBy(expenses, 'amount'));
}

/**
 * Mean income amount per record.
 * @param {object[]} income
 * @returns {number}
 */
export function calculateAverageIncome(income) {
  return round2(averageBy(income, 'amount'));
}

// ── Monthly breakdown ──────────────────────────────────────────────────────

/**
 * Monthly income and expense totals for the last N months.
 *
 * @param {object[]} income
 * @param {object[]} expenses
 * @param {number}   [months=12]
 * @returns {Array<{
 *   month:     string,   — 'YYYY-MM'
 *   label:     string,   — 'Jan 2025'
 *   income:    number,
 *   expense:   number,
 *   balance:   number,
 * }>}
 */
export function calculateMonthlyTotals(income, expenses, months = 12) {
  const monthKeys  = lastNMonths(months);
  const incByMonth = groupBy(income,   r => toYearMonth(r.date));
  const expByMonth = groupBy(expenses, r => toYearMonth(r.date));

  return monthKeys.map(ym => {
    const inc = round2(sumBy(incByMonth[ym] ?? [], 'amount'));
    const exp = round2(sumBy(expByMonth[ym] ?? [], 'amount'));
    return {
      month:   ym,
      label:   formatMonthLabel(ym),
      income:  inc,
      expense: exp,
      balance: round2(inc - exp),
    };
  });
}

// ── Category breakdown ─────────────────────────────────────────────────────

/**
 * Total amount and count grouped by expense category.
 * Sorted by total descending.
 *
 * @param {object[]} expenses
 * @returns {Array<{
 *   category: string,
 *   total:    number,
 *   count:    number,
 *   share:    number,  — percentage of total expenses (0-100)
 * }>}
 */
export function calculateCategoryTotals(expenses) {
  const grandTotal = calculateTotalExpense(expenses);
  const grouped    = groupBy(expenses, e => e.category);

  return Object.entries(grouped)
    .map(([category, items]) => {
      const total = round2(sumBy(items, 'amount'));
      return {
        category,
        total,
        count: items.length,
        share: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

// ── Top categories / sources ───────────────────────────────────────────────

/**
 * Top N expense categories by total amount.
 * @param {object[]} expenses
 * @param {number}   [limit=5]
 * @returns {ReturnType<typeof calculateCategoryTotals>}
 */
export function calculateTopExpenseCategories(expenses, limit = 5) {
  return calculateCategoryTotals(expenses).slice(0, limit);
}

/**
 * Top N income sources by total amount.
 * Records with no source are grouped under the empty-string key ''.
 * Sorted by total descending.
 *
 * @param {object[]} income
 * @param {number}   [limit=5]
 * @returns {Array<{
 *   source: string,
 *   total:  number,
 *   count:  number,
 *   share:  number,  — percentage of total income (0-100)
 * }>}
 */
export function calculateTopIncomeSources(income, limit = 5) {
  const grandTotal = calculateTotalIncome(income);
  const grouped    = groupBy(income, r => r.source?.trim() ?? '');

  return Object.entries(grouped)
    .map(([source, items]) => {
      const total = round2(sumBy(items, 'amount'));
      return {
        source: source || 'Unspecified',
        total,
        count: items.length,
        share: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ── Recent transactions ────────────────────────────────────────────────────

/**
 * Merge income and expenses into a single chronological list.
 * Each item is tagged with a `type` field ('income' | 'expense').
 * Sorted by date descending (newest first). Returns the latest `limit` items.
 *
 * @param {object[]} income
 * @param {object[]} expenses
 * @param {number}   [limit=10]
 * @returns {Array<object & { type: 'income' | 'expense' }>}
 */
export function calculateRecentTransactions(income, expenses, limit = 10) {
  const tagged = [
    ...income.map(r   => ({ ...r, type: r.type || 'income'  })),
    ...expenses.map(e => ({ ...e, type: e.type || 'expense' })),
  ];

  tagged.sort((a, b) => {
    // Primary: date descending
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    // Secondary: createdAt descending (handles same-day entries)
    return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
  });

  return tagged.slice(0, limit);
}

// ── Full analytics snapshot ────────────────────────────────────────────────

/**
 * Compute the full analytics object from raw income and expense arrays.
 * Convenience function — wraps all individual calculations into one call.
 *
 * @param {object[]} income
 * @param {object[]} expenses
 * @returns {object} - complete analytics snapshot
 */
export function computeAnalytics(income, expenses) {
  return {
    // Totals
    totalIncome:          calculateTotalIncome(income),
    totalExpense:         calculateTotalExpense(expenses),
    netBalance:           calculateNetBalance(income, expenses),
    savings:              calculateSavings(income, expenses),
    savingsRate:          calculateSavingsRate(income, expenses),
    // Counts
    incomeCount:          income.length,
    expenseCount:         expenses.length,
    // Extremes
    largestExpense:       calculateLargestExpense(expenses),
    largestIncome:        calculateLargestIncome(income),
    // Averages
    averageExpense:       calculateAverageExpense(expenses),
    averageIncome:        calculateAverageIncome(income),
    // Breakdowns
    monthlyTotals:        calculateMonthlyTotals(income, expenses, 12),
    categoryTotals:       calculateCategoryTotals(expenses),
    topExpenseCategories: calculateTopExpenseCategories(expenses, 5),
    topIncomeSources:     calculateTopIncomeSources(income, 5),
    // Merged list
    recentTransactions:   calculateRecentTransactions(income, expenses, 10),
  };
}
