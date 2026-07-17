import { useState, useCallback } from 'react';
import { validateIncome, defaultIncomeValues } from '../../utils/incomeValidation';
import CategorySelect from './CategorySelect';
import Button from '../ui/Button';

// ── Helpers ────────────────────────────────────────────────────────────────

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

// ── Sub-components ─────────────────────────────────────────────────────────

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-danger-400">
      {message}
    </p>
  );
}

function Label({ htmlFor, children, required, optional }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-slate-300"
    >
      {children}
      {required && (
        <span className="ml-0.5 text-danger-400" aria-hidden="true">*</span>
      )}
      {optional && (
        <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span>
      )}
    </label>
  );
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

  const [values,  setValues]  = useState(() =>
    initialValues ? valuesFromIncome(initialValues) : defaultIncomeValues()
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
    const ALL = { title: true, amount: true, category: true, date: true, source: true, notes: true };
    setTouched(ALL);
    const { valid, errors: newErrors } = validateIncome(values);
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
      id="income-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Title */}
      <div>
        <Label htmlFor="if-title" required>Title</Label>
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
          <Label htmlFor="if-amount" required>Amount (₹)</Label>
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
          <Label htmlFor="if-date" required>Date</Label>
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
        <Label htmlFor="if-category" required>Category</Label>
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
        <Label htmlFor="if-source" optional>Source</Label>
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
        <Label htmlFor="if-notes" optional>Notes</Label>
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
