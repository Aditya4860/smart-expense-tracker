/**
 * categories.js — static expense category definitions.
 *
 * Each category has:
 *   id      — stable string key used for storage & filtering
 *   label   — display name
 *   icon    — emoji rendered in pills and table rows
 *   color   — Tailwind utility suffix mapped to the design-system palette
 *             consumed as: `bg-${color}/20` and `text-${color}`
 */
const CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',    icon: '🍽️',  color: 'warning-400' },
  { id: 'transport',     label: 'Transport',         icon: '🚗',  color: 'primary-400' },
  { id: 'housing',       label: 'Housing & Rent',    icon: '🏠',  color: 'accent-400'  },
  { id: 'utilities',     label: 'Utilities',         icon: '💡',  color: 'warning-500' },
  { id: 'shopping',      label: 'Shopping',          icon: '🛍️',  color: 'danger-400'  },
  { id: 'health',        label: 'Health & Medical',  icon: '🏥',  color: 'success-400' },
  { id: 'entertainment', label: 'Entertainment',     icon: '🎬',  color: 'accent-400'  },
  { id: 'education',     label: 'Education',         icon: '📚',  color: 'primary-400' },
  { id: 'travel',        label: 'Travel',            icon: '✈️',  color: 'primary-300' },
  { id: 'personal',      label: 'Personal Care',     icon: '💆',  color: 'success-400' },
  { id: 'subscriptions', label: 'Subscriptions',     icon: '📱',  color: 'accent-400'  },
  { id: 'other',         label: 'Other',             icon: '📦',  color: 'slate-400'   },
];

export default CATEGORIES;

/**
 * Returns a single category object by id, or the "other" fallback.
 */
export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
