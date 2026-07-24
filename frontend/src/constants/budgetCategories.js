/**
 * budgetCategories.js — canonical category definitions for budgets.
 *
 * Re-uses expenseCategories as the single source of truth.
 * No React imports — usable outside the component tree.
 */

export {
  CATEGORIES        as BUDGET_CATEGORIES,
  CATEGORY_MAP      as BUDGET_CATEGORY_MAP,
  CATEGORY_IDS      as BUDGET_CATEGORY_IDS,
} from './expenseCategories';
