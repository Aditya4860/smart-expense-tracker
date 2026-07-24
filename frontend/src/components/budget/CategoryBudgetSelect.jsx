import { memo, useMemo } from 'react';
import { BUDGET_CATEGORIES } from '../../constants/budgetCategories';
import Select from '../ui/Select';

/**
 * CategoryBudgetSelect — styled category <select> for budget forms.
 *
 * Props:
 *   id       — element id for label association  (default: 'budget-category')
 *   value    — selected category id string
 *   onChange — native change handler (e) => void
 *   onBlur   — native blur handler  (e) => void  (optional)
 *   error    — validation error string, drives red border
 */
const CategoryBudgetSelect = memo(function CategoryBudgetSelect({
  id       = 'budget-category',
  value,
  onChange,
  onBlur,
  error,
}) {
  const options = useMemo(() => [
    { value: '', label: 'Select a category' },
    ...BUDGET_CATEGORIES.map(cat => ({
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

export default CategoryBudgetSelect;
