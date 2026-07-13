/**
 * formatters.js — pure display helpers.
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** formatCurrency(n) → "₹1,20,000" */
export function formatCurrency(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return '₹0';
  return INR.format(num);
}

/** formatDate(iso) → "13 Jul 2026" */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
