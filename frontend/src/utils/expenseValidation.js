/**
 * expenseValidation.js — pure validation helpers for expense data.
 *
 * No side effects, no imports, no React.
 * All functions are stateless and testable in isolation.
 */

import { CATEGORY_IDS, PAYMENT_METHOD_IDS } from '../constants/expenseCategories';
import { todayString } from './formatters';
import { validateTitle, validateAmount, validateDate, validateNotes } from './validationUtils';

/**
 * Validate raw expense form values.
 *
 * @param {object} values
 * @param {string} values.title
 * @param {string|number} values.amount
 * @param {string} values.category
 * @param {string} values.date          - 'YYYY-MM-DD'
 * @param {string} values.paymentMethod
 * @param {string} [values.notes]
 *
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateExpense(values) {
  const errors = {};

  // ── Title ────────────────────────────────────────────────────────────────
  const titleErr = validateTitle(values.title);
  if (titleErr) errors.title = titleErr;

  // ── Amount ───────────────────────────────────────────────────────────────
  const amountErr = validateAmount(values.amount, 10_000_000);
  if (amountErr) errors.amount = amountErr;

  // ── Category ─────────────────────────────────────────────────────────────
  if (!values.category) {
    errors.category = 'Category is required.';
  } else if (!CATEGORY_IDS.includes(values.category)) {
    errors.category = 'Please select a valid category.';
  }

  // ── Date ─────────────────────────────────────────────────────────────────
  const dateErr = validateDate(values.date);
  if (dateErr) errors.date = dateErr;

  // ── Payment method ───────────────────────────────────────────────────────
  if (!values.paymentMethod) {
    errors.paymentMethod = 'Payment method is required.';
  } else if (!PAYMENT_METHOD_IDS.includes(values.paymentMethod)) {
    errors.paymentMethod = 'Please select a valid payment method.';
  }

  // ── Notes (optional) ─────────────────────────────────────────────────────
  const notesErr = validateNotes(values.notes);
  if (notesErr) errors.notes = notesErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Returns a clean default form values object with today's date pre-filled.
 *
 * @returns {{ title: string, amount: string, category: string, date: string, paymentMethod: string, notes: string }}
 */
export function defaultExpenseValues() {
  return {
    title:         '',
    amount:        '',
    category:      '',
    date:          todayString(),
    paymentMethod: '',
    notes:         '',
  };
}

/**
 * Returns true if the given string is a valid expense id format.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidExpenseId(id) {
  return typeof id === 'string' && id.startsWith('exp_') && id.length > 10;
}
