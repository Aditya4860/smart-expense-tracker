/**
 * formatters.js — pure display helpers.
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const INR_COMPACT = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 0,
  notation:              'compact',
});


/** formatCurrency(n) → "₹1,20,000" */
export function formatCurrency(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '₹0';
  return INR.format(num);
}

/** formatCompactCurrency(n) → "₹1.2K" — for chart axis ticks */
export function formatCompactCurrency(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '₹0';
  return INR_COMPACT.format(num);
}


/** formatDate(iso) → "13 Jul 2026" */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * formatLocalDate(dateStr) → "02 Jul 2026"
 * Timezone-safe: parses 'YYYY-MM-DD' as local midnight to avoid UTC off-by-one.
 */
export function formatLocalDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** formatRelativeDate(iso) → "Today", "Yesterday", "3 days ago", or "13 Jul" */
export function formatRelativeDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  const now    = new Date();
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - target) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return `${diffDays} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** toISODate(date) → "YYYY-MM-DD" for <input type="date"> */
export function toISODate(date = new Date()) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

/**
 * todayString() → "YYYY-MM-DD" using local time.
 * Used by form date inputs and validation.
 */
export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * MONTH_NAMES — 1-indexed short month labels.
 * Index 0 is an empty string so MONTH_NAMES[1] === 'Jan', MONTH_NAMES[12] === 'Dec'.
 */
export const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
