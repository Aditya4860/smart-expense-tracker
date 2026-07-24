/**
 * incomeValidation.js — pure validation helpers for income data.
 *
 * No side effects, no imports from React.
 * All functions are stateless and independently testable.
 */

import { INCOME_CATEGORY_IDS } from '../constants/incomeCategories';
import { todayString } from './formatters';
import { validateTitle, validateAmount, validateDate, validateNotes } from './validationUtils';

/**
 * Validate raw income form values.
 *
 * @param {object}        values
 * @param {string}        values.title
 * @param {string|number} values.amount
 * @param {string}        values.category
 * @param {string}        values.date          - 'YYYY-MM-DD'
 * @param {string}        [values.source]      - optional
 * @param {string}        [values.notes]       - optional
 *
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateIncome(values) {
  const errors = {};

  // ── Title ─────────────────────────────────────────────────────────────────
  const titleErr = validateTitle(values.title);
  if (titleErr) errors.title = titleErr;

  // ── Amount ────────────────────────────────────────────────────────────────
  const amountErr = validateAmount(values.amount, 100_000_000);
  if (amountErr) errors.amount = amountErr;

  // ── Category ──────────────────────────────────────────────────────────────
  if (!values.category) {
    errors.category = 'Category is required.';
  } else if (!INCOME_CATEGORY_IDS.includes(values.category)) {
    errors.category = 'Please select a valid category.';
  }

  // ── Date ──────────────────────────────────────────────────────────────────
  const dateErr = validateDate(values.date);
  if (dateErr) errors.date = dateErr;

  // ── Source (optional) — cap length if provided ────────────────────────────
  if (values.source && values.source.trim().length > 100) {
    errors.source = 'Source must be 100 characters or fewer.';
  }

  // ── Notes (optional) — cap length if provided ─────────────────────────────
  const notesErr = validateNotes(values.notes);
  if (notesErr) errors.notes = notesErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Returns a clean default form values object with today's date pre-filled.
 *
 * @returns {{ title: string, amount: string, category: string, date: string, source: string, notes: string }}
 */
export function defaultIncomeValues() {
  return {
    title:    '',
    amount:   '',
    category: '',
    date:     todayString(),
    source:   '',
    notes:    '',
  };
}

/**
 * Returns true when the given string matches the income id format.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidIncomeId(id) {
  return typeof id === 'string' && id.startsWith('inc_') && id.length > 10;
}
