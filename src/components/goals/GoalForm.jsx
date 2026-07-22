import { useState, useCallback } from 'react';
import { validateGoalForm } from '../../utils/goalValidation';
import { FieldError, FormLabel } from '../ui/FormField';
import Button from '../ui/Button';
import useFormState from '../../hooks/useFormState';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

  const handleDateChange = useCallback((date) => {
    const dateString = date ? date.toLocaleDateString('en-CA') : '';
    handleChange({ target: { name: 'targetDate', value: dateString } });
  }, [handleChange]);

  const handleDateBlur = useCallback(() => {
    handleBlur({ target: { name: 'targetDate' } });
  }, [handleBlur]);

  const selectedDate = values.targetDate ? new Date(values.targetDate + 'T00:00:00') : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <FormLabel htmlFor="gf-title" required>Goal Name</FormLabel>
        <input
          id="gf-title" name="title" type="text"
          value={values.title} onChange={handleChange} onBlur={handleBlur}
          className={inputClass('title')} placeholder="e.g. New Car"
        />
        <FieldError id="gf-title-error" message={err('title')} />
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

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Target Amount */}
        <div>
          <FormLabel htmlFor="gf-target" required>Target Amount (₹)</FormLabel>
          <input
            id="gf-target" name="targetAmount" type="number" min="0" step="0.01"
            value={values.targetAmount} onChange={handleChange} onBlur={handleBlur}
            className={inputClass('targetAmount')} placeholder="0.00"
          />
          <FieldError id="gf-target-error" message={err('targetAmount')} />
        </div>

        {/* Current Amount */}
        <div>
          <FormLabel htmlFor="gf-current">Current Saved (₹)</FormLabel>
          <input
            id="gf-current" name="currentAmount" type="number" min="0" step="0.01"
            value={values.currentAmount} onChange={handleChange} onBlur={handleBlur}
            className={inputClass('currentAmount')} placeholder="0.00"
          />
          <FieldError id="gf-current-error" message={err('currentAmount')} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Monthly Contribution */}
        <div>
          <FormLabel htmlFor="gf-monthly" required>Monthly Contribution (₹)</FormLabel>
          <input
            id="gf-monthly" name="monthlyContribution" type="number" min="0" step="0.01"
            value={values.monthlyContribution} onChange={handleChange} onBlur={handleBlur}
            className={inputClass('monthlyContribution')} placeholder="0.00"
          />
          <FieldError id="gf-monthly-error" message={err('monthlyContribution')} />
        </div>

        {/* Target Date */}
        <div>
          <FormLabel htmlFor="gf-date" required>Target Date</FormLabel>
          <div className="relative">
            <DatePicker
              id="gf-date"
              name="targetDate"
              selected={selectedDate}
              onChange={handleDateChange}
              onBlur={handleDateBlur}
              className={inputClass('targetDate', 'input h-10 w-full pl-10 text-sm')}
              placeholderText="Select a target date"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-400" aria-hidden="true">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <FieldError id="gf-date-error" message={err('targetDate')} />
        </div>
      </div>

      {/* Priority */}
      <div>
        <FormLabel htmlFor="gf-priority">Priority</FormLabel>
        <select
          id="gf-priority" name="priority"
          value={values.priority} onChange={handleChange} onBlur={handleBlur}
          className={inputClass('priority')}
        >
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <FieldError id="gf-priority-error" message={err('priority')} />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
