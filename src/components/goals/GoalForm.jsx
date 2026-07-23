import { useState, useCallback } from 'react';
import { validateGoalForm } from '../../utils/goalValidation';
import { FieldError, FormLabel } from '../ui/FormField';
import Button from '../ui/Button';
import CurrencyInput from '../ui/CurrencyInput';
import DateSelect from '../ui/DateSelect';
import Select from '../ui/Select';
import useFormState from '../../hooks/useFormState';

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function valuesFromGoal(goal) {
  return {
    title: goal.title,
    description: goal.description || '',
    targetAmount: String(goal.targetAmount),
    currentAmount: String(goal.currentAmount),
    monthlyContribution: String(goal.monthlyContribution),
    targetDate: goal.targetDate,
    priority: goal.priority,
  };
}

function defaultValues() {
  return {
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    targetDate: '',
    priority: 'medium',
  };
}

export default function GoalForm({ initialValues, onSubmit, onCancel, loading = false }) {
  const isEdit = Boolean(initialValues);

  const {
    values, errors, setErrors, touched, setTouched,
    handleChange, handleBlur, err, inputClass,
  } = useFormState(
    initialValues ? valuesFromGoal(initialValues) : defaultValues(),
    validateGoalForm
  );

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const ALL_FIELDS = { title: true, targetAmount: true, monthlyContribution: true, targetDate: true, currentAmount: true };
    setTouched(ALL_FIELDS);
    
    const { valid, errors: newErrors } = validateGoalForm(values);
    if (!valid) {
      setErrors(newErrors);
      return;
    }
    onSubmit(values);
  }, [values, onSubmit, setTouched, setErrors]);


  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full" id="goal-form">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Main Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Title */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FormLabel htmlFor="gf-title" required>Goal Name</FormLabel>
            <input
              id="gf-title" name="title" type="text"
              value={values.title} onChange={handleChange} onBlur={handleBlur}
              className={inputClass('title')} placeholder="e.g. New Car"
            />
            <FieldError id="gf-title-error" message={err('title')} />
          </div>

          {/* Target Amount */}
          <div>
            <FormLabel htmlFor="gf-target" required>Target Amount (₹)</FormLabel>
            <CurrencyInput
              id="gf-target" name="targetAmount"
              value={values.targetAmount} onChange={handleChange} onBlur={handleBlur}
              className={inputClass('targetAmount')}
              aria-invalid={!!err('targetAmount')}
              aria-describedby={err('targetAmount') ? 'gf-target-error' : undefined}
            />
            <FieldError id="gf-target-error" message={err('targetAmount')} />
          </div>

          {/* Current Amount */}
          <div>
            <FormLabel htmlFor="gf-current">Current Saved (₹)</FormLabel>
            <CurrencyInput
              id="gf-current" name="currentAmount"
              value={values.currentAmount} onChange={handleChange} onBlur={handleBlur}
              className={inputClass('currentAmount')}
              aria-invalid={!!err('currentAmount')}
              aria-describedby={err('currentAmount') ? 'gf-current-error' : undefined}
            />
            <FieldError id="gf-current-error" message={err('currentAmount')} />
          </div>

          {/* Monthly Contribution */}
          <div>
            <FormLabel htmlFor="gf-monthly" required>Monthly Contribution (₹)</FormLabel>
            <CurrencyInput
              id="gf-monthly" name="monthlyContribution"
              value={values.monthlyContribution} onChange={handleChange} onBlur={handleBlur}
              className={inputClass('monthlyContribution')}
              aria-invalid={!!err('monthlyContribution')}
              aria-describedby={err('monthlyContribution') ? 'gf-monthly-error' : undefined}
            />
            <FieldError id="gf-monthly-error" message={err('monthlyContribution')} />
          </div>

          {/* Target Date */}
          <div>
            <FormLabel htmlFor="gf-date" required>Target Date</FormLabel>
            <DateSelect
              id="gf-date"
              name="targetDate"
              value={values.targetDate}
              onChange={handleChange}
              onBlur={handleBlur}
              min={todayString()}
              error={err('targetDate')}
            />
            <FieldError id="gf-date-error" message={err('targetDate')} />
          </div>

          {/* Priority */}
          <div>
            <FormLabel htmlFor="gf-priority">Priority</FormLabel>
            <Select
              id="gf-priority"
              name="priority"
              value={values.priority}
              onChange={handleChange}
              onBlur={handleBlur}
              error={err('priority')}
              options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
            />
            <FieldError id="gf-priority-error" message={err('priority')} />
          </div>
        </div>

        {/* Description */}
        <div>
          <FormLabel htmlFor="gf-description">Description</FormLabel>
          <input
            id="gf-description" name="description" type="text"
            value={values.description} onChange={handleChange} onBlur={handleBlur}
            className={inputClass('description')} placeholder="Optional details..."
          />
          <FieldError id="gf-desc-error" message={err('description')} />
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-[10px] sm:rounded-b-[10px]">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
