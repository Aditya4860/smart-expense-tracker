import { memo, useMemo, useState, useCallback } from 'react';
import { useCategory } from '../../context/CategoryContext';
import Select from '../ui/Select';
import CategoryModal from '../categories/CategoryModal';

/**
 * CategorySelect — styled category <select>.
 *
 * Props:
 *   id       — element id for label association
 *   value    — selected category id string
 *   onChange — native change handler (e) => void
 *   onBlur   — native blur handler  (e) => void  (optional)
 *   error    — validation error string, drives red border
 *   type     — 'INCOME' or 'EXPENSE'
 */
const CategorySelect = memo(function CategorySelect({
  id = 'category',
  value,
  onChange,
  onBlur,
  error,
  type = 'INCOME'
}) {
  const { incomeCategories, expenseCategories } = useCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = type === 'INCOME' ? incomeCategories : expenseCategories;

  const options = useMemo(() => {
    const list = categories.map(cat => ({
      value: cat.id,
      label: `${cat.icon || '💰'}  ${cat.name}`
    }));
    return [
      { value: '', label: 'Select a category' },
      ...list,
      { value: 'create_new', label: '+ Create Category' }
    ];
  }, [categories]);

  const handleChange = useCallback((e) => {
    if (e.target.value === 'create_new') {
      setIsModalOpen(true);
      // Do not trigger onChange for 'create_new', reset to previous value or ''
      const syntheticEvent = { target: { name: e.target.name, value: '' } };
      if (onChange) onChange(syntheticEvent);
    } else {
      if (onChange) onChange(e);
    }
  }, [onChange]);

  return (
    <>
      <Select
        id={id}
        name="category"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        options={options}
      />
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={type} 
      />
    </>
  );
});

export default CategorySelect;

