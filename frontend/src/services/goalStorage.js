/**
 * goalStorage.js — localStorage persistence layer for savings goals.
 *
 * All functions are pure and synchronous.
 */

import { makeStorageHelpers } from '../utils/storageUtils';

const STORAGE_KEY = 'sxp_goals_v1';

export const {
  load: loadGoals,
  save: saveGoals,
  clear: clearGoals,
} = makeStorageHelpers(STORAGE_KEY, 'goalStorage');

/**
 * Generate a collision-resistant unique id.
 * @returns {string}
 */
export function generateGoalId() {
  return `gol_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Build a complete, normalised goal object from raw form values.
 *
 * @param {object}  values              - raw form values
 * @param {string}  [existingId]        - supply when updating to preserve the id
 * @param {string}  [existingCreatedAt] - supply when updating to preserve createdAt
 * @returns {object} - a fully-formed goal record
 */
export function buildGoal(values, existingId, existingCreatedAt) {
  const now = new Date().toISOString();
  return {
    id:                  existingId ?? generateGoalId(),
    title:               values.title.trim(),
    description:         values.description ? values.description.trim() : '',
    targetAmount:        parseFloat(Number(values.targetAmount || 0).toFixed(2)),
    monthlyContribution: parseFloat(Number(values.monthlyContribution || 0).toFixed(2)),
    targetDate:          values.targetDate,
    priority:            values.priority ?? 'medium',
    status:              values.status ?? 'active',
    createdAt:           existingCreatedAt ?? now,
    updatedAt:           now,
  };
}
