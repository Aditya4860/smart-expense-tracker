/**
 * incomeStorage.js — localStorage persistence layer for income records.
 *
 * All functions are pure and synchronous.
 * No React imports — usable outside the component tree.
 */

const STORAGE_KEY = 'sxp_income_v1';

// ── Core persistence ───────────────────────────────────────────────────────

/**
 * Load all income records from localStorage.
 * Returns an empty array on error or when storage is empty.
 * @returns {object[]}
 */
export function loadIncome() {
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
 * Persist the full income array to localStorage.
 * Silently swallows quota errors (storage may be full).
 * @param {object[]} income
 */
export function saveIncome(income) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(income));
  } catch (err) {
    console.error('[incomeStorage] saveIncome failed:', err);
  }
}

/**
 * Remove all income records from localStorage.
 */
export function clearIncome() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Factory helpers ────────────────────────────────────────────────────────

/**
 * Generate a collision-resistant unique id.
 * @returns {string}
 */
export function generateIncomeId() {
  return `inc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Build a complete, normalised income object from raw form values.
 *
 * @param {object}  values              - raw form values
 * @param {string}  [existingId]        - supply when updating to preserve the id
 * @param {string}  [existingCreatedAt] - supply when updating to preserve createdAt
 * @returns {object} - a fully-formed income record
 */
export function buildIncome(values, existingId, existingCreatedAt) {
  const now = new Date().toISOString();
  return {
    id:        existingId        ?? generateIncomeId(),
    title:     values.title.trim(),
    amount:    parseFloat(parseFloat(values.amount).toFixed(2)),
    category:  values.category,
    date:      values.date,
    source:    values.source?.trim() ?? '',
    notes:     values.notes?.trim()  ?? '',
    createdAt: existingCreatedAt ?? now,
    updatedAt: now,
  };
}
