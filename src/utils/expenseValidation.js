/**
 * expenseValidation.js — pure validation helpers for the Expense form.
 * Returns { valid: boolean, errors: Record<string, string> }.
 */

const today = () => new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

/**
 * Validate a raw form values object.
 * @param {object} values - { title, amount, category, date, paymentMethod, notes }
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateExpense(values) {
  const errors = {};

  // Title
  if (!values.title || !values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  } else if (values.title.trim().length > 100) {
    errors.title = 'Title must be 100 characters or fewer.';
  }

  // Amount
  const amt = parseFloat(values.amount);
  if (!values.amount && values.amount !== 0) {
    errors.amount = 'Amount is required.';
  } else if (isNaN(amt)) {
    errors.amount = 'Amount must be a valid number.';
  } else if (amt <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  } else if (amt > 10_000_000) {
    errors.amount = 'Amount is unrealistically large.';
  }

  // Category
  if (!values.category) {
    errors.category = 'Please select a category.';
  }

  // Date
  if (!values.date) {
    errors.date = 'Date is required.';
  } else if (values.date > today()) {
    errors.date = 'Expense date cannot be in the future.';
  }

  // Payment Method
  if (!values.paymentMethod) {
    errors.paymentMethod = 'Please select a payment method.';
  }

  // Notes — optional, but cap length
  if (values.notes && values.notes.length > 500) {
    errors.notes = 'Notes must be 500 characters or fewer.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Returns the default empty form values.
 */
export function defaultExpenseValues() {
  return {
    title:         '',
    amount:        '',
    category:      '',
    date:          today(),
    paymentMethod: '',
    notes:         '',
  };
}
