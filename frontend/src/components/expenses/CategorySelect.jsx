import { memo, useMemo } from 'react';
import { CATEGORIES } from '../../constants/expenseCategories';
import Select from '../ui/Select';

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
  const options = useMemo(() => [
    { value: '', label: 'Select a category' },
    ...CATEGORIES.map(cat => ({
      value: cat.id,
      label: `${cat.icon}  ${cat.name}`
    }))
  ], []);

  return (
    <Select
      id={id}
      name="category"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      options={options}
    />
  );
});

export default CategorySelect;
