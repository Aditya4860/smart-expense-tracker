import { useState, useCallback } from 'react';
import { PAYMENT_METHODS } from '../../constants/expenseCategories';
import { validateExpense, defaultExpenseValues } from '../../utils/expenseValidation';
import { todayString } from '../../utils/formatters';
import { FieldError, FormLabel } from '../ui/FormField';
import CategorySelect from './CategorySelect';
import Button from '../ui/Button';

function valuesFromExpense(expense) {
  return {
    title:         expense.title,
    amount:        String(expense.amount),
    category:      expense.category,
    date:          expense.date,
    paymentMethod: expense.paymentMethod,
    notes:         expense.notes ?? '',
  };
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * ExpenseForm — controlled form for adding or editing an expense.
 *
 * Props:
 *   initialValues — expense object (edit mode) or undefined (add mode)
 *   onSubmit      — (formValues: object) => void  — called only when validation passes
 *   onCancel      — () => void
 *   loading       — boolean — shows spinner and disables submit button
 */
export default function ExpenseForm({ initialValues, onSubmit, onCancel, loading = false }) {
  const isEdit = Boolean(initialValues);

  const [values,  setValues]  = useState(() =>
    initialValues ? valuesFromExpense(initialValues) : defaultExpenseValues()
  );
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => prev[name] ? { ...prev, [name]: '' } : prev);
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const ALL_FIELDS = { title: true, amount: true, category: true, date: true, paymentMethod: true, notes: true };
    setTouched(ALL_FIELDS);
    const { valid, errors: newErrors } = validateExpense(values);
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }, [values, onSubmit]);

  // ── Field helpers ─────────────────────────────────────────────────────────

  function err(name) {
    return touched[name] ? errors[name] : '';
  }

  function inputClass(name) {
    return [
      'input h-10 text-sm',
      err(name) ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
    ].filter(Boolean).join(' ');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form
      id="expense-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Title */}
      <div>
        <FormLabel htmlFor="ef-title" required>Title</FormLabel>
        <input
          id="ef-title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Grocery shopping"
          autoComplete="off"
          aria-invalid={!!err('title')}
          aria-describedby={err('title') ? 'ef-title-error' : undefined}
          className={inputClass('title')}
        />
        <FieldError id="ef-title-error" message={err('title')} />
      </div>

      {/* Amount + Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="ef-amount" required>Amount (₹)</FormLabel>
          <input
            id="ef-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0.00"
            aria-invalid={!!err('amount')}
            aria-describedby={err('amount') ? 'ef-amount-error' : undefined}
            className={inputClass('amount')}
          />
          <FieldError id="ef-amount-error" message={err('amount')} />
        </div>

        <div>
          <FormLabel htmlFor="ef-date" required>Date</FormLabel>
          <input
            id="ef-date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            onBlur={handleBlur}
            max={todayString()}
            aria-invalid={!!err('date')}
            aria-describedby={err('date') ? 'ef-date-error' : undefined}
            className={inputClass('date')}
          />
          <FieldError id="ef-date-error" message={err('date')} />
        </div>
      </div>

      {/* Category */}
      <div>
        <FormLabel htmlFor="ef-category" required>Category</FormLabel>
        <CategorySelect
          id="ef-category"
          value={values.category}
          onChange={handleChange}
          onBlur={handleBlur}
          error={err('category')}
        />
        <FieldError id="ef-category-error" message={err('category')} />
      </div>

      {/* Payment Method */}
      <div>
        <FormLabel htmlFor="ef-paymentMethod" required>Payment Method</FormLabel>
        <select
          id="ef-paymentMethod"
          name="paymentMethod"
          value={values.paymentMethod}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!err('paymentMethod')}
          aria-describedby={err('paymentMethod') ? 'ef-paymentMethod-error' : undefined}
          className={[
            'input h-10 text-sm',
            err('paymentMethod')
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : '',
          ].filter(Boolean).join(' ')}
        >
          <option value="">Select payment method</option>
          {PAYMENT_METHODS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <FieldError id="ef-paymentMethod-error" message={err('paymentMethod')} />
      </div>

      {/* Notes */}
      <div>
        <FormLabel htmlFor="ef-notes" optional>Notes</FormLabel>
        <textarea
          id="ef-notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Any extra details…"
          rows={3}
          maxLength={500}
          className="input resize-none py-2.5 text-sm"
        />
        <div className="mt-1 flex items-start justify-between gap-2">
          <FieldError id="ef-notes-error" message={err('notes')} />
          <p className="ml-auto text-xs text-slate-600">{values.notes.length}/500</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
