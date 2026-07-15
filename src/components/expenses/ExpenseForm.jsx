import { useState, useCallback } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants/expenseCategories';
import { validateExpense, defaultExpenseValues } from '../../utils/expenseValidation';
import CategorySelect from './CategorySelect';
import Button from '../ui/Button';

/**
 * ExpenseForm — controlled form for adding or editing an expense.
 *
 * Props:
 *   initialValues — expense object to pre-fill (for edit mode), or undefined (add mode)
 *   onSubmit      — (values) => void  called with valid form values
 *   onCancel      — () => void
 *   loading       — boolean  shows spinner on the submit button
 */
export default function ExpenseForm({ initialValues, onSubmit, onCancel, loading = false }) {
  const [values, setValues] = useState(() =>
    initialValues
      ? {
          title:         initialValues.title,
          amount:        String(initialValues.amount),
          category:      initialValues.category,
          date:          initialValues.date,
          paymentMethod: initialValues.paymentMethod,
          notes:         initialValues.notes ?? '',
        }
      : defaultExpenseValues()
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEdit = Boolean(initialValues);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error for the changed field
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleBlur = useCallback((e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Mark all fields touched so errors show
    setTouched({ title: true, amount: true, category: true, date: true, paymentMethod: true, notes: true });
    const { valid, errors: newErrors } = validateExpense(values);
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }, [values, onSubmit]);

  function field(name, label, { type = 'text', placeholder = '', required = true } = {}) {
    const hasError = touched[name] && errors[name];
    return (
      <div>
        <label htmlFor={`expense-${name}`} className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}{required && <span className="ml-0.5 text-danger-400">*</span>}
        </label>
        <input
          id={`expense-${name}`}
          name={name}
          type={type}
          value={values[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={!!hasError}
          aria-describedby={hasError ? `expense-${name}-error` : undefined}
          max={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
          className={[
            'input h-10 text-sm',
            hasError ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
          ].join(' ')}
        />
        {hasError && (
          <p id={`expense-${name}-error`} role="alert" className="mt-1 text-xs text-danger-400">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  function selectError(name) {
    return touched[name] ? errors[name] : undefined;
  }

  return (
    <form id="expense-form" onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Row: Title */}
      {field('title', 'Title', { placeholder: 'e.g. Grocery shopping' })}

      {/* Row: Amount + Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('amount', 'Amount (₹)', { type: 'number', placeholder: '0.00' })}
        {field('date', 'Date', { type: 'date' })}
      </div>

      {/* Row: Category */}
      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-300">
          Category<span className="ml-0.5 text-danger-400">*</span>
        </label>
        <CategorySelect
          id="category"
          value={values.category}
          onChange={handleChange}
          error={selectError('category')}
        />
        {selectError('category') && (
          <p id="category-error" role="alert" className="mt-1 text-xs text-danger-400">
            {errors.category}
          </p>
        )}
      </div>

      {/* Row: Payment Method */}
      <div>
        <label htmlFor="expense-paymentMethod" className="mb-1.5 block text-sm font-medium text-slate-300">
          Payment Method<span className="ml-0.5 text-danger-400">*</span>
        </label>
        <select
          id="expense-paymentMethod"
          name="paymentMethod"
          value={values.paymentMethod}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!selectError('paymentMethod')}
          className={[
            'input h-10 text-sm',
            selectError('paymentMethod')
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : '',
          ].join(' ')}
        >
          <option value="">Select payment method</option>
          {PAYMENT_METHODS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        {selectError('paymentMethod') && (
          <p id="expense-paymentMethod-error" role="alert" className="mt-1 text-xs text-danger-400">
            {errors.paymentMethod}
          </p>
        )}
      </div>

      {/* Row: Notes */}
      <div>
        <label htmlFor="expense-notes" className="mb-1.5 block text-sm font-medium text-slate-300">
          Notes <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="expense-notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Any additional details…"
          rows={3}
          maxLength={500}
          className="input resize-none py-2.5 text-sm"
        />
        <p className="mt-1 text-right text-xs text-slate-600">
          {values.notes.length}/500
        </p>
        {touched.notes && errors.notes && (
          <p role="alert" className="mt-1 text-xs text-danger-400">{errors.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-700/60">
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
