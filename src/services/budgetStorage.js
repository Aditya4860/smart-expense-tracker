/**
 * budgetStorage.js — localStorage persistence layer for budgets.
 *
 * All functions are pure and synchronous.
 * No React imports — usable outside the component tree.
 */

import { makeStorageHelpers } from '../utils/storageUtils';

const STORAGE_KEY = 'sxp_budgets_v1';

export const { 
  load: loadBudgets, 
  save: saveBudgets, 
  clear: clearBudgets 
} = makeStorageHelpers(STORAGE_KEY, 'budgetStorage');

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
  return {
    id:           existingId        ?? generateBudgetId(),
    category:     values.category,
    monthlyLimit: limit,
    month:        Number(values.month),
    year:         Number(values.year),
    createdAt:    existingCreatedAt ?? now,
    updatedAt:    now,
  };
}
