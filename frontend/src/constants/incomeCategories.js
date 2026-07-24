/**
 * incomeCategories.js — canonical income category definitions.
 *
 * Pure JavaScript — no JSX, no React imports.
 * Icons are emoji strings, which render correctly as JSX children.
 * Color classes are Tailwind utility strings for UI components.
 */

/**
 * @typedef {Object} IncomeCategory
 * @property {string} id    - Unique identifier used in income records
 * @property {string} name  - Human-readable display name
 * @property {string} icon  - Emoji icon (valid JSX text node)
 * @property {string} color - Tailwind text-color class
 * @property {string} bg    - Tailwind background class (semi-transparent)
 */

export const INCOME_CATEGORIES = [
  { id: 'salary',         name: 'Salary',         icon: '💼',  color: 'text-green-400',  bg: 'bg-green-500/15'  },
  { id: 'freelancing',    name: 'Freelancing',    icon: '💻',  color: 'text-blue-400',   bg: 'bg-blue-500/15'   },
  { id: 'business',       name: 'Business',       icon: '🏢',  color: 'text-purple-400', bg: 'bg-purple-500/15' },
  { id: 'interest',       name: 'Interest',       icon: '🏦',  color: 'text-cyan-400',   bg: 'bg-cyan-500/15'   },
  { id: 'dividends',      name: 'Dividends',      icon: '📊',  color: 'text-indigo-400', bg: 'bg-indigo-500/15' },
  { id: 'investment',     name: 'Investment',     icon: '📈',  color: 'text-teal-400',   bg: 'bg-teal-500/15'   },
  { id: 'bonus',          name: 'Bonus',          icon: '🎯',  color: 'text-orange-400', bg: 'bg-orange-500/15' },
  { id: 'gift',           name: 'Gift',           icon: '🎁',  color: 'text-pink-400',   bg: 'bg-pink-500/15'   },
  { id: 'refund',         name: 'Refund',         icon: '🔄',  color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  { id: 'rental_income',  name: 'Rental Income',  icon: '🏠',  color: 'text-amber-400',  bg: 'bg-amber-500/15'  },
  { id: 'other',          name: 'Other',          icon: '📦',  color: 'text-slate-400',  bg: 'bg-slate-500/15'  },
];

/**
 * O(1) lookup map keyed by category id.
 * @type {Record<string, IncomeCategory>}
 */
export const INCOME_CATEGORY_MAP = Object.fromEntries(
  INCOME_CATEGORIES.map(c => [c.id, c])
);

/** Array of valid category ids — used for validation. */
export const INCOME_CATEGORY_IDS = INCOME_CATEGORIES.map(c => c.id);
