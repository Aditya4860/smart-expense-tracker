/**
 * expenseStorage.js — localStorage persistence layer for expenses.
 *
 * All functions are pure and synchronous.
 * No React imports — usable outside the component tree.
 */

const STORAGE_KEY = 'sxp_expenses_v1';

// ── Core CRUD ──────────────────────────────────────────────────────────────

/**
 * Load all expenses from localStorage.
 * Returns an empty array on error or when storage is empty.
 * @returns {import('./expenseStorage').Expense[]}
 */
export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist the full expenses array to localStorage.
 * Silently swallows quota errors (storage may be full).
 * @param {object[]} expenses
 */
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('[expenseStorage] saveExpenses failed:', err);
  }
}

/**
 * Remove all expenses from localStorage.
 */
export function clearExpenses() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Factory helpers ────────────────────────────────────────────────────────

/**
 * Generate a collision-resistant unique id.
 * @returns {string}
 */
export function generateId() {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Build a complete, normalised expense object from raw form values.
 *
 * @param {object}  values              - raw form values
 * @param {string}  [existingId]        - supply when updating to preserve the id
 * @param {string}  [existingCreatedAt] - supply when updating to preserve createdAt
 * @returns {object} - a fully-formed expense record
 */
export function buildExpense(values, existingId, existingCreatedAt) {
  const now = new Date().toISOString();
  return {
    id:            existingId        ?? generateId(),
    title:         values.title.trim(),
    amount:        parseFloat(parseFloat(values.amount).toFixed(2)),
    category:      values.category,
    date:          values.date,
    paymentMethod: values.paymentMethod,
    notes:         values.notes?.trim() ?? '',
    createdAt:     existingCreatedAt ?? now,
    updatedAt:     now,
  };
}
