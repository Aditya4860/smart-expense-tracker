import { useState, useCallback } from 'react';
import { validateIncome, defaultIncomeValues } from '../../utils/incomeValidation';
import { todayString } from '../../utils/formatters';
import { FieldError, FormLabel } from '../ui/FormField';
import CategorySelect from './CategorySelect';
import Button from '../ui/Button';
import useFormState from '../../hooks/useFormState';

function valuesFromIncome(record) {
  return {
    title:    record.title,
    amount:   String(record.amount),
    category: record.category,
    date:     record.date,
    source:   record.source ?? '',
    notes:    record.notes  ?? '',
  };
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * IncomeForm — controlled form for adding or editing an income record.
 *
 * Props:
 *   initialValues — income object (edit mode) or undefined (add mode)
 *   onSubmit      — (formValues: object) => void  — called only when valid
 *   onCancel      — () => void
 *   loading       — boolean — disables submit and shows spinner
 */
export default function IncomeForm({ initialValues, onSubmit, onCancel, loading = false }) {
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
    initialValues ? valuesFromIncome(initialValues) : defaultIncomeValues(),
    validateIncome
  );

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const ALL = { title: true, amount: true, category: true, date: true, source: true, notes: true };
    setTouched(ALL);
    const { valid, errors: newErrors } = validateIncome(values);
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }, [values, onSubmit, setTouched, setErrors]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form
      id="income-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Title */}
      <div>
        <FormLabel htmlFor="if-title" required>Title</FormLabel>
        <input
          id="if-title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Monthly salary"
          autoComplete="off"
          aria-invalid={!!err('title')}
          aria-describedby={err('title') ? 'if-title-error' : undefined}
          className={inputClass('title')}
        />
        <FieldError id="if-title-error" message={err('title')} />
      </div>

      {/* Amount + Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="if-amount" required>Amount (₹)</FormLabel>
          <input
            id="if-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0.00"
            aria-invalid={!!err('amount')}
            aria-describedby={err('amount') ? 'if-amount-error' : undefined}
            className={inputClass('amount')}
          />
          <FieldError id="if-amount-error" message={err('amount')} />
        </div>

        <div>
          <FormLabel htmlFor="if-date" required>Date</FormLabel>
          <input
            id="if-date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            onBlur={handleBlur}
            max={todayString()}
            aria-invalid={!!err('date')}
            aria-describedby={err('date') ? 'if-date-error' : undefined}
            className={inputClass('date')}
          />
          <FieldError id="if-date-error" message={err('date')} />
        </div>
      </div>

      {/* Category */}
      <div>
        <FormLabel htmlFor="if-category" required>Category</FormLabel>
        <CategorySelect
          id="if-category"
          value={values.category}
          onChange={handleChange}
          onBlur={handleBlur}
          error={err('category')}
        />
        <FieldError id="if-category-error" message={err('category')} />
      </div>

      {/* Source */}
      <div>
        <FormLabel htmlFor="if-source" optional>Source</FormLabel>
        <input
          id="if-source"
          name="source"
          type="text"
          value={values.source}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Acme Corp, Client name…"
          autoComplete="off"
          aria-invalid={!!err('source')}
          aria-describedby={err('source') ? 'if-source-error' : undefined}
          className={inputClass('source')}
        />
        <FieldError id="if-source-error" message={err('source')} />
      </div>

      {/* Notes */}
      <div>
        <FormLabel htmlFor="if-notes" optional>Notes</FormLabel>
        <textarea
          id="if-notes"
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
          <FieldError id="if-notes-error" message={err('notes')} />
          <p className="ml-auto text-xs text-slate-600">{values.notes.length}/500</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Income'}
        </Button>
      </div>
    </form>
  );
}
