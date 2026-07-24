/**
 * incomeStorage.js — localStorage persistence layer for income records.
 *
 * All functions are pure and synchronous.
 * No React imports — usable outside the component tree.
 */

import { makeStorageHelpers } from '../utils/storageUtils';

const STORAGE_KEY = 'sxp_income_v1';

export const { 
  load: loadIncome, 
  save: saveIncome, 
  clear: clearIncome 
} = makeStorageHelpers(STORAGE_KEY, 'incomeStorage');

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
