/**
 * validationUtils.js — shared pure validation functions.
 *
 * Each function returns an error string if invalid, or empty string if valid.
 */

export function validateTitle(title, label = 'Title') {
  const t = title.trim();
  if (!t) return `${label} is required`;
  if (t.length < 2) return `${label} must be at least 2 characters`;
  if (t.length > 100) return `${label} must be less than 100 characters`;
  return '';
}

export function validateAmount(amount, max = 999999999) {
  if (!amount) return 'Amount is required';
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Amount must be a number';
  if (num <= 0) return 'Amount must be greater than 0';
  if (num > max) return `Amount cannot exceed ${max.toLocaleString('en-IN')}`;
  return '';
}

export function validateDate(dateStr) {
  if (!dateStr) return 'Date is required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 'Invalid date format';
  
  // Prevent future dates
  const selected = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time component for accurate day comparison
  
  if (selected > today) {
    return 'Date cannot be in the future';
  }
  return '';
}

export function validateNotes(notes) {
  if (notes && notes.trim().length > 500) {
    return 'Notes must be less than 500 characters';
  }
  return '';
}
