/**
 * expenseStorage.js — localStorage persistence layer for expenses.
 * All operations are synchronous and return plain JavaScript objects.
 */

const STORAGE_KEY = 'set_expenses_v1';

/** Load all expenses from localStorage. Returns [] on error/empty. */
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

/** Persist the full expenses array to localStorage. */
export function saveExpenses(expenses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('[expenseStorage] Failed to save:', err);
  }
}

/** Generate a unique ID (timestamp + random suffix). */
export function generateId() {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build a complete expense object from raw form values.
 * @param {object} values - validated form values
 * @param {string} [existingId] - supply when updating an existing expense
 * @param {string} [existingCreatedAt] - preserve original createdAt on update
 */
export function buildExpense(values, existingId, existingCreatedAt) {
  const now = new Date().toISOString();
  return {
    id:            existingId      ?? generateId(),
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
