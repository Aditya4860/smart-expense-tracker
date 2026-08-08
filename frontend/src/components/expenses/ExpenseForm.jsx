import { useState, useCallback } from 'react';
import { PAYMENT_METHODS } from '../../constants/expenseCategories';
import { validateExpense, defaultExpenseValues } from '../../utils/expenseValidation';
import { todayString } from '../../utils/formatters';
import { FieldError, FormLabel } from '../ui/FormField';
import CategorySelect from '../ui/CategorySelect';
import Button from '../ui/Button';
import DateSelect from '../ui/DateSelect';
import Select from '../ui/Select';
import useFormState from '../../hooks/useFormState';

function valuesFromExpense(expense) {
  return {
    merchant:      expense.merchant,
    amount:        String(expense.amount),
    category:      expense.category_id || expense.category, // handle both old/new during transition
    date:          expense.date,
    paymentMethod: expense.paymentMethod,
    description:   expense.description ?? '',
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

  const {
    values,
    errors,
    setErrors,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    err,
    inputClass,
  } = useFormState(
    initialValues ? valuesFromExpense(initialValues) : defaultExpenseValues(),
    validateExpense
  );

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const ALL_FIELDS = { merchant: true, amount: true, category: true, date: true, paymentMethod: true, description: true };
    setTouched(ALL_FIELDS);
    const { valid, errors: newErrors } = validateExpense(values);
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }, [values, onSubmit, setTouched, setErrors]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form
      id="expense-form"
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Main Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Merchant */}
          <div className="sm:col-span-1">
            <FormLabel htmlFor="ef-merchant" optional>Merchant</FormLabel>
            <input
              id="ef-merchant"
              name="merchant"
              type="text"
              value={values.merchant}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Grocery store"
              autoComplete="off"
              aria-invalid={!!err('merchant')}
              aria-describedby={err('merchant') ? 'ef-merchant-error' : undefined}
              className={inputClass('merchant')}
            />
            <FieldError id="ef-merchant-error" message={err('merchant')} />
          </div>

          {/* Amount */}
          <div className="sm:col-span-1">
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

          {/* Date */}
          <div>
            <FormLabel htmlFor="ef-date" required>Date</FormLabel>
            <DateSelect
              id="ef-date"
              name="date"
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              max={todayString()}
              error={err('date')}
            />
            <FieldError id="ef-date-error" message={err('date')} />
          </div>

          {/* Category */}
          <div>
            <FormLabel htmlFor="ef-category" required>Category</FormLabel>
            <CategorySelect
              id="ef-category"
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={err('category')}
              type="EXPENSE"
            />
            <FieldError id="ef-category-error" message={err('category')} />
          </div>

          {/* Payment Method */}
          <div className="sm:col-span-2">
            <FormLabel htmlFor="ef-paymentMethod" required>Payment Method</FormLabel>
            <Select
              id="ef-paymentMethod"
              name="paymentMethod"
              value={values.paymentMethod}
              onChange={handleChange}
              onBlur={handleBlur}
              error={err('paymentMethod')}
              options={[
                { value: '', label: 'Select method' },
                ...PAYMENT_METHODS.map(p => ({ value: p.id, label: p.label }))
              ]}
            />
            <FieldError id="ef-paymentMethod-error" message={err('paymentMethod')} />
          </div>
        </div>

      {/* Description */}
      <div>
        <FormLabel htmlFor="ef-description" optional>Notes</FormLabel>
        <textarea
          id="ef-description"
          name="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Any extra details…"
          rows={3}
          maxLength={500}
          className="input resize-none py-2.5 text-sm"
        />
        <div className="mt-1 flex items-start justify-between gap-2">
          <FieldError id="ef-description-error" message={err('description')} />
          <p className="ml-auto text-xs text-slate-600">{values.description.length}/500</p>
        </div>
      </div>

      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-2xl sm:rounded-b-2xl">
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
