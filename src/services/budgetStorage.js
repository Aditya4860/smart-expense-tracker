/**
 * budgetStorage.js — localStorage persistence layer for budgets.
 *
 * All functions are pure and synchronous.
 * No React imports — usable outside the component tree.
 */

const STORAGE_KEY = 'sxp_budgets_v1';

// ── Core persistence ───────────────────────────────────────────────────────

/**
 * Load all budgets from localStorage.
 * Returns an empty array on error or when storage is empty.
 * @returns {object[]}
 */
export function loadBudgets() {
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
 * Persist the full budgets array to localStorage.
 * Silently swallows quota errors (storage may be full).
 * @param {object[]} budgets
 */
export function saveBudgets(budgets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('[budgetStorage] saveBudgets failed:', err);
  }
}

/**
 * Remove all budgets from localStorage.
 */
export function clearBudgets() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Factory helpers ────────────────────────────────────────────────────────

/**
 * Generate a collision-resistant unique id.
 * @returns {string}
 */
export function generateBudgetId() {
  return `bud_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Build a complete, normalised budget object from raw form values.
 *
 * @param {object}  values              - raw form values
 * @param {string}  [existingId]        - supply when updating to preserve the id
 * @param {string}  [existingCreatedAt] - supply when updating to preserve createdAt
 * @returns {object} - a fully-formed budget record
 */
export function buildBudget(values, existingId, existingCreatedAt) {
  const now  = new Date().toISOString();
  const limit = parseFloat(parseFloat(values.monthlyLimit).toFixed(2));
  const spent = parseFloat(parseFloat(values.spent ?? 0).toFixed(2));
  return {
    id:           existingId        ?? generateBudgetId(),
    category:     values.category,
    monthlyLimit: limit,
    spent,
    remaining:    parseFloat((limit - spent).toFixed(2)),
    month:        Number(values.month),
    year:         Number(values.year),
    createdAt:    existingCreatedAt ?? now,
    updatedAt:    now,
  };
}
