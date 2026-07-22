/**
 * incomeValidation.js — pure validation helpers for income data.
 *
 * No side effects, no imports from React.
 * All functions are stateless and independently testable.
 */

import { INCOME_CATEGORY_IDS } from '../constants/incomeCategories';
import { todayString } from './formatters';

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
  const title = (values.title ?? '').trim();
  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  } else if (title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.';
  }

  // ── Amount ────────────────────────────────────────────────────────────────
  const rawAmount = values.amount;
  if (rawAmount === '' || rawAmount === null || rawAmount === undefined) {
    errors.amount = 'Amount is required.';
  } else {
    const amt = parseFloat(rawAmount);
    if (isNaN(amt)) {
      errors.amount = 'Amount must be a valid number.';
    } else if (amt <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    } else if (amt > 100_000_000) {
      errors.amount = 'Amount exceeds the maximum allowed value.';
    }
  }

  // ── Category ──────────────────────────────────────────────────────────────
  if (!values.category) {
    errors.category = 'Category is required.';
  } else if (!INCOME_CATEGORY_IDS.includes(values.category)) {
    errors.category = 'Please select a valid category.';
  }

  // ── Date ──────────────────────────────────────────────────────────────────
  if (!values.date) {
    errors.date = 'Date is required.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    errors.date = 'Date must be in YYYY-MM-DD format.';
  } else if (values.date > todayString()) {
    errors.date = 'Income date cannot be in the future.';
  }

  // ── Source (optional) — cap length if provided ────────────────────────────
  if (values.source && values.source.trim().length > 100) {
    errors.source = 'Source must be 100 characters or fewer.';
  }

  // ── Notes (optional) — cap length if provided ─────────────────────────────
  if (values.notes && values.notes.length > 500) {
    errors.notes = 'Notes must be 500 characters or fewer.';
  }

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
