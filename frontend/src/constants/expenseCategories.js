/**
 * expenseCategories.js — canonical category and payment method definitions.
 *
 * Pure JavaScript — no JSX, no React imports.
 * Icons are emoji strings, rendering correctly as JSX children.
 * Color classes are Tailwind utility strings for use in UI components.
 */

/**
 * @typedef {Object} ExpenseCategory
 * @property {string} id        - Unique identifier used in expense records
 * @property {string} name      - Human-readable display name
 * @property {string} icon      - Emoji icon (valid JSX text node)
 * @property {string} color     - Tailwind text-color class
 * @property {string} bg        - Tailwind background class (semi-transparent)
 */

export const CATEGORIES = [
  { id: 'food',          name: 'Food & Dining',     icon: '🍽️',  color: 'text-orange-400', bg: 'bg-orange-500/15' },
  { id: 'transport',     name: 'Transport',          icon: '🚗',  color: 'text-blue-400',   bg: 'bg-blue-500/15'   },
  { id: 'shopping',      name: 'Shopping',           icon: '🛍️',  color: 'text-pink-400',   bg: 'bg-pink-500/15'   },
  { id: 'bills',         name: 'Bills & Utilities',  icon: '⚡',  color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  { id: 'entertainment', name: 'Entertainment',      icon: '🎬',  color: 'text-purple-400', bg: 'bg-purple-500/15' },
  { id: 'healthcare',    name: 'Healthcare',         icon: '🏥',  color: 'text-red-400',    bg: 'bg-red-500/15'    },
  { id: 'education',     name: 'Education',          icon: '📚',  color: 'text-cyan-400',   bg: 'bg-cyan-500/15'   },
  { id: 'travel',        name: 'Travel',             icon: '✈️',  color: 'text-teal-400',   bg: 'bg-teal-500/15'   },
  { id: 'investment',    name: 'Investment',         icon: '📈',  color: 'text-green-400',  bg: 'bg-green-500/15'  },
  { id: 'other',         name: 'Other',              icon: '📦',  color: 'text-slate-400',  bg: 'bg-slate-500/15'  },
];

/**
 * O(1) lookup map keyed by category id.
 * @type {Record<string, ExpenseCategory>}
 */
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/** Sorted array of category ids — useful for validation. */
export const CATEGORY_IDS = CATEGORIES.map(c => c.id);

// ── Payment methods ────────────────────────────────────────────────────────

/**
 * @typedef {Object} PaymentMethod
 * @property {string} id    - Unique identifier used in expense records
 * @property {string} label - Human-readable display name
 */

export const PAYMENT_METHODS = [
  { id: 'cash',         label: 'Cash'        },
  { id: 'debit_card',   label: 'Debit Card'  },
  { id: 'credit_card',  label: 'Credit Card' },
  { id: 'upi',          label: 'UPI'         },
  { id: 'net_banking',  label: 'Net Banking' },
  { id: 'wallet',       label: 'Wallet'      },
];

/**
 * O(1) lookup map keyed by payment method id.
 * @type {Record<string, PaymentMethod>}
 */
export const PAYMENT_METHOD_MAP = Object.fromEntries(PAYMENT_METHODS.map(p => [p.id, p]));

/** Array of valid payment method ids — useful for validation. */
export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map(p => p.id);
