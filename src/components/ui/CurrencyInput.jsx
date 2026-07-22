import { useState, useCallback, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function CurrencyInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '0.00',
  className = '',
  required,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  // Sync with external value changes when not focused
  useEffect(() => {
    if (!focused) {
      setLocalValue(value || '');
    }
  }, [value, focused]);

  const handleFocus = useCallback((e) => {
    setFocused(true);
    setLocalValue(value || ''); // ensure we show raw value on focus
  }, [value]);

  const handleBlur = useCallback((e) => {
    setFocused(false);
    if (onBlur) {
      // Pass the raw value back, not the formatted one
      const mockEvent = { target: { name, value: localValue } };
      onBlur(mockEvent);
    }
  }, [name, localValue, onBlur]);

  const handleChange = useCallback((e) => {
    let val = e.target.value;
    
    // Allow pasting and typing by stripping invalid characters
    val = val.replace(/[^0-9.]/g, '');
    
    // Ensure only one dot exists
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    
    setLocalValue(val);
    
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
  }, [name, onChange]);

  // When not focused and there is a value, format it
  const displayValue = focused 
    ? localValue 
    : (localValue ? formatCurrency(localValue) : '');

  return (
    <input
      id={id}
      name={name}
      type={focused ? 'number' : 'text'}
      inputMode="decimal"
      min="0"
      step="0.01"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      className={`${className} text-right pr-4`}
      {...props}
    />
  );
}
