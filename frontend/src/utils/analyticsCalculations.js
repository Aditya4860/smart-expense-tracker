/**
 * analyticsCalculations.js — pure math and grouping utilities.
 *
 * No React, no side effects, no imports.
 * All functions are stateless and independently testable.
 */

// ── Numeric helpers ────────────────────────────────────────────────────────

/**
 * Sum a numeric field across an array of objects.
 * @param {object[]} arr
 * @param {string}   key
 * @returns {number}
 */
export function sumBy(arr, key) {
  return arr.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
}

/**
 * Find the maximum value of a numeric field.
 * Returns 0 for an empty array.
 * @param {object[]} arr
 * @param {string}   key
 * @returns {number}
 */
export function maxBy(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((max, item) => Math.max(max, Number(item[key]) || 0), 0);
}

/**
 * Compute the arithmetic mean of a numeric field.
 * Returns 0 for an empty array (no division by zero).
 * @param {object[]} arr
 * @param {string}   key
 * @returns {number}
 */
export function averageBy(arr, key) {
  if (!arr.length) return 0;
  return sumBy(arr, key) / arr.length;
}

/**
 * Round a number to 2 decimal places.
 * @param {number} n
 * @returns {number}
 */
export function round2(n) {
  return Math.round(n * 100) / 100;
}

// ── Date helpers ───────────────────────────────────────────────────────────

/**
 * Extract the 'YYYY-MM' portion from a 'YYYY-MM-DD' date string.
 * @param {string} dateStr
 * @returns {string}
 */
export function toYearMonth(dateStr) {
  return typeof dateStr === 'string' ? dateStr.slice(0, 7) : '';
}

/**
 * Format a 'YYYY-MM' key into a human-readable label ('Jan 2025').
 * @param {string} ym  — 'YYYY-MM'
 * @returns {string}
 */
export function formatMonthLabel(ym) {
  if (!ym || ym.length < 7) return ym;
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// ── Grouping helpers ───────────────────────────────────────────────────────

/**
 * Group an array of objects by the result of a key function.
 * Returns a plain object: { [key]: item[] }.
 * @param {object[]}         arr
 * @param {(item: object) => string} keyFn
 * @returns {Record<string, object[]>}
 */
export function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

/**
 * Return the last N calendar months in ascending order as 'YYYY-MM' strings.
 * Useful for building complete monthly timelines with zero-filling.
 * @param {number} n
 * @returns {string[]}
 */
export function lastNMonths(n) {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
  }
  return result;
}
