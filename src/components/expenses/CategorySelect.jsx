import { memo } from 'react';
import { CATEGORIES } from '../../constants/expenseCategories';

/**
 * CategorySelect — styled category <select> wired to the form.
 *
 * Props:
 *   id       — element id for label association  (default: 'category')
 *   value    — selected category id string
 *   onChange — native change handler (e) => void
 *   onBlur   — native blur handler  (e) => void  (optional)
 *   error    — validation error string, drives red border
 */
const CategorySelect = memo(function CategorySelect({
  id = 'category',
  value,
  onChange,
  onBlur,
  error,
}) {
  return (
    <select
      id={id}
      name="category"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={[
        'input h-10 text-sm',
        error
          ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
          : '',
      ].filter(Boolean).join(' ')}
    >
      <option value="">Select a category</option>
      {CATEGORIES.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.icon}  {cat.name}
        </option>
      ))}
    </select>
  );
});

export default CategorySelect;
