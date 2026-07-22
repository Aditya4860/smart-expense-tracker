/**
 * goalValidation.js — pure validation logic for savings goals.
 */

import { validateTitle, validateAmount } from './validationUtils';

/**
 * Validates goal form fields.
 * @param {object} values - goal form values
 * @returns {object} - key-value pairs of error messages
 */
export function validateGoalForm(values) {
  const errors = {};

  const titleErr = validateTitle(values.title, 'Title');
  if (titleErr) errors.title = titleErr;

  const targetAmtErr = validateAmount(values.targetAmount);
  if (targetAmtErr) errors.targetAmount = targetAmtErr;

  const contribErr = validateAmount(values.monthlyContribution);
  if (contribErr) errors.monthlyContribution = contribErr;

  if (!values.targetDate) {
    errors.targetDate = 'Target date is required';
  } else {
    // Goals require future dates
    const selected = new Date(values.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(selected.getTime())) {
      errors.targetDate = 'Invalid date format';
    } else if (selected <= today) {
      errors.targetDate = 'Target date must be in the future';
    }
  }

  if (values.currentAmount !== undefined && values.currentAmount !== '') {
    const cur = parseFloat(values.currentAmount);
    const tgt = parseFloat(values.targetAmount);
    
    if (isNaN(cur)) {
      errors.currentAmount = 'Must be a number';
    } else if (cur < 0) {
      errors.currentAmount = 'Cannot be negative';
    } else if (!isNaN(tgt) && cur > tgt) {
      errors.currentAmount = 'Cannot exceed target amount';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
