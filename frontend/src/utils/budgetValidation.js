/**
 * budgetValidation.js — pure validation helpers for budget data.
 *
 * No side effects, no React imports.
 * All functions are stateless and independently testable.
 */

import { BUDGET_CATEGORY_IDS } from '../constants/budgetCategories';
import { validateAmount } from './validationUtils';

// ── Constants ──────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR     = CURRENT_YEAR - 5;
const MAX_YEAR     = CURRENT_YEAR + 5;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns the current month (1–12) and year as numbers.
 * @returns {{ month: number, year: number }}
 */
function currentMonthYear() {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

// ── Core validation ────────────────────────────────────────────────────────

/**
 * Validate raw budget form values.
 *
 * @param {object}        values
 * @param {string}        values.category
 * @param {string|number} values.monthlyLimit
 * @param {string|number} values.month          - 1–12
 * @param {string|number} values.year           - full 4-digit year
 * @param {object[]}      [existingBudgets=[]]  - supply to enforce uniqueness
 * @param {string}        [editingId]           - id of budget being edited (excluded from uniqueness check)
 *
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateBudget(values, existingBudgets = [], editingId = null) {
  const errors = {};

  // ── Category ─────────────────────────────────────────────────────────────
  if (!values.category) {
    errors.category = 'Category is required.';
  } else if (!BUDGET_CATEGORY_IDS.includes(values.category)) {
    errors.category = 'Please select a valid category.';
  }

  // ── Monthly limit ─────────────────────────────────────────────────────────
  const limitErr = validateAmount(values.monthlyLimit, 100_000_000);
  if (limitErr) {
    // Override message to refer to "Monthly limit" instead of "Amount" if validateAmount returns generic text
    errors.monthlyLimit = limitErr.replace('Amount', 'Monthly limit');
  }

  // ── Month ─────────────────────────────────────────────────────────────────
  const rawMonth = values.month;
  if (rawMonth === '' || rawMonth === null || rawMonth === undefined) {
    errors.month = 'Month is required.';
  } else {
    const month = Number(rawMonth);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.month = 'Month must be a number between 1 and 12.';
    }
  }

  // ── Year ──────────────────────────────────────────────────────────────────
  const rawYear = values.year;
  if (rawYear === '' || rawYear === null || rawYear === undefined) {
    errors.year = 'Year is required.';
  } else {
    const year = Number(rawYear);
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      errors.year = `Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`;
    }
  }

  // ── Uniqueness — same category + month + year ─────────────────────────────
  if (!errors.category && !errors.month && !errors.year) {
    const month = Number(values.month);
    const year  = Number(values.year);
    const isDuplicate = existingBudgets.some(
      b =>
        b.category === values.category &&
        b.month    === month            &&
        b.year     === year             &&
        b.id       !== editingId,
    );
    if (isDuplicate) {
      errors.category = `A budget for this category already exists for ${month}/${year}.`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Returns a clean default form values object for a new budget.
 * Pre-fills with the current month and year.
 *
 * @returns {{ category: string, monthlyLimit: string, month: number, year: number }}
 */
export function defaultBudgetValues() {
  const { month, year } = currentMonthYear();
  return {
    category:     '',
    monthlyLimit: '',
    month,
    year,
  };
}

/**
 * Returns true when the given string matches the budget id format.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidBudgetId(id) {
  return typeof id === 'string' && id.startsWith('bud_') && id.length > 10;
}
