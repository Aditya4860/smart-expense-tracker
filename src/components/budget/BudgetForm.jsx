import { useState, useCallback } from 'react';
import { validateBudget, defaultBudgetValues } from '../../utils/budgetValidation';
import CategoryBudgetSelect from './CategoryBudgetSelect';
import Button from '../ui/Button';
import useBudget from '../../hooks/useBudget';

// ── Month/year data ────────────────────────────────────────────────────────

const MONTHS = [
  { value: 1,  label: 'January'   },
  { value: 2,  label: 'February'  },
  { value: 3,  label: 'March'     },
  { value: 4,  label: 'April'     },
  { value: 5,  label: 'May'       },
  { value: 6,  label: 'June'      },
  { value: 7,  label: 'July'      },
  { value: 8,  label: 'August'    },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October'   },
  { value: 11, label: 'November'  },
  { value: 12, label: 'December'  },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);

// ── Sub-components ─────────────────────────────────────────────────────────

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-danger-400">
      {message}
    </p>
  );
}

function Label({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-slate-300"
    >
      {children}
      {required && <span className="ml-0.5 text-danger-400" aria-hidden="true">*</span>}
    </label>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function valuesFromBudget(budget) {
  return {
    category:     budget.category,
    monthlyLimit: String(budget.monthlyLimit),
    month:        budget.month,
    year:         budget.year,
  };
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetForm — controlled form for adding or editing a monthly budget.
 *
 * Props:
 *   initialValues — budget object (edit mode) or undefined (add mode)
 *   onSubmit      — (formValues: object) => void — called only when validation passes
 *   onCancel      — () => void
 *   loading       — boolean — shows spinner and disables submit button
 */
export default function BudgetForm({ initialValues, onSubmit, onCancel, loading = false }) {
  const { budgets } = useBudget();
  const isEdit      = Boolean(initialValues);

  const [values,  setValues]  = useState(() =>
    initialValues ? valuesFromBudget(initialValues) : defaultBudgetValues()
  );
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  // ── Handlers ──────────────────────────────────────────────────────────────

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
    const ALL_FIELDS = { category: true, monthlyLimit: true, month: true, year: true };
    setTouched(ALL_FIELDS);
    const { valid, errors: newErrors } = validateBudget(
      values,
      budgets,
      isEdit ? initialValues.id : null,
    );
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }, [values, budgets, isEdit, initialValues, onSubmit]);

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
      id="budget-form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {/* Category */}
      <div>
        <Label htmlFor="bf-category" required>Category</Label>
        <CategoryBudgetSelect
          id="bf-category"
          value={values.category}
          onChange={handleChange}
          onBlur={handleBlur}
          error={err('category')}
        />
        <FieldError id="bf-category-error" message={err('category')} />
      </div>

      {/* Monthly Limit */}
      <div>
        <Label htmlFor="bf-monthlyLimit" required>Monthly Limit (₹)</Label>
        <input
          id="bf-monthlyLimit"
          name="monthlyLimit"
          type="number"
          min="0.01"
          step="0.01"
          value={values.monthlyLimit}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0.00"
          aria-invalid={!!err('monthlyLimit')}
          aria-describedby={err('monthlyLimit') ? 'bf-monthlyLimit-error' : undefined}
          className={inputClass('monthlyLimit')}
        />
        <FieldError id="bf-monthlyLimit-error" message={err('monthlyLimit')} />
      </div>

      {/* Month + Year */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bf-month" required>Month</Label>
          <select
            id="bf-month"
            name="month"
            value={values.month}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!err('month')}
            aria-describedby={err('month') ? 'bf-month-error' : undefined}
            className={inputClass('month')}
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <FieldError id="bf-month-error" message={err('month')} />
        </div>

        <div>
          <Label htmlFor="bf-year" required>Year</Label>
          <select
            id="bf-year"
            name="year"
            value={values.year}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!err('year')}
            aria-describedby={err('year') ? 'bf-year-error' : undefined}
            className={inputClass('year')}
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <FieldError id="bf-year-error" message={err('year')} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Save Changes' : 'Add Budget'}
        </Button>
      </div>
    </form>
  );
}
