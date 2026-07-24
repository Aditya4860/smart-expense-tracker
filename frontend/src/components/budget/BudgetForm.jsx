import { useState, useCallback } from 'react';
import { validateBudget, defaultBudgetValues } from '../../utils/budgetValidation';
import { FieldError, FormLabel } from '../ui/FormField';
import CategoryBudgetSelect from './CategoryBudgetSelect';
import Button from '../ui/Button';
import Select from '../ui/Select';
import useBudget from '../../hooks/useBudget';
import useFormState from '../../hooks/useFormState';

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
    initialValues ? valuesFromBudget(initialValues) : defaultBudgetValues(),
    (v) => validateBudget(v, budgets, isEdit ? initialValues.id : null)
  );

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
  }, [values, budgets, isEdit, initialValues, onSubmit, setTouched, setErrors]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form
      id="budget-form"
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Main Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category */}
          <div>
            <FormLabel htmlFor="bf-category" required>Category</FormLabel>
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
            <FormLabel htmlFor="bf-monthlyLimit" required>Monthly Limit (₹)</FormLabel>
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

          {/* Month */}
          <div>
            <FormLabel htmlFor="bf-month" required>Month</FormLabel>
            <Select
              id="bf-month"
              name="month"
              value={values.month}
              onChange={handleChange}
              onBlur={handleBlur}
              error={err('month')}
              options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
            />
            <FieldError id="bf-month-error" message={err('month')} />
          </div>

          {/* Year */}
          <div>
            <FormLabel htmlFor="bf-year" required>Year</FormLabel>
            <Select
              id="bf-year"
              name="year"
              value={values.year}
              onChange={handleChange}
              onBlur={handleBlur}
              error={err('year')}
              options={YEARS.map(y => ({ value: y, label: String(y) }))}
            />
            <FieldError id="bf-year-error" message={err('year')} />
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-[10px] sm:rounded-b-[10px]">
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
