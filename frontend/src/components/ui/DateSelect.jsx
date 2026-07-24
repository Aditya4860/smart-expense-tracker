import { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * DateSelect — custom themed date picker wrapping react-datepicker.
 * 
 * Props:
 *   id       - input ID
 *   value    - current date string in YYYY-MM-DD
 *   onChange - function to call on change. Simulates a native event.
 *   min      - optional min date string
 *   max      - optional max date string
 *   error    - boolean or error string to show error styling
 */
const DateSelect = forwardRef(function DateSelect(
  { id, value, onChange, min, max, error, name, onBlur },
  ref
) {
  // Parse YYYY-MM-DD string to Date object
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const minDate = min ? new Date(`${min}T00:00:00`) : undefined;
  const maxDate = max ? new Date(`${max}T00:00:00`) : undefined;

  const handleChange = (date) => {
    if (!onChange) return;
    // Format Date object back to YYYY-MM-DD
    const dateString = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : '';
      
    // Simulate native event structure for useFormState
    onChange({
      target: {
        name: name || id,
        value: dateString,
      },
    });
  };

  return (
    <DatePicker
      id={id}
      selected={selectedDate}
      onChange={handleChange}
      onBlur={onBlur}
      minDate={minDate}
      maxDate={maxDate}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      dateFormat="yyyy-MM-dd"
      placeholderText="Select date..."
      className={[
        'input h-10 w-full',
        error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''
      ].filter(Boolean).join(' ')}
      customInput={<input ref={ref} />}
    />
  );
});

export default DateSelect;
