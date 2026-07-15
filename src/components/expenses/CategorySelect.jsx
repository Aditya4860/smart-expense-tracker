import { memo } from 'react';
import { CATEGORIES } from '../../constants/expenseCategories';

/**
 * CategorySelect — styled category dropdown.
 *
 * Props:
 *   id         — input id (for label association)
 *   value      — selected category id
 *   onChange   — (e) => void
 *   error      — string | undefined — shows error state
 */
const CategorySelect = memo(function CategorySelect({ id = 'category', value, onChange, error }) {
  return (
    <select
      id={id}
      name="category"
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={[
        'input h-10 text-sm',
        error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
      ].join(' ')}
    >
      <option value="">Select a category</option>
      {CATEGORIES.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.label}
        </option>
      ))}
    </select>
  );
});

export default CategorySelect;
