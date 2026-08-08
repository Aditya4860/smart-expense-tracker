import { memo, useMemo, useState, useCallback } from 'react';
import { useCategory } from '../../context/CategoryContext';
import Select from '../ui/Select';
import CategoryModal from '../categories/CategoryModal';

/**
 * CategorySelect — styled category dropdown with preset list and "+ Create Category" at the bottom.
 *
 * Props:
 *   id       — element id for label association
 *   name     — field name (defaults to 'category')
 *   value    — selected category id or name
 *   onChange — native change handler (e) => void
 *   onBlur   — native blur handler  (e) => void  (optional)
 *   error    — validation error string
 *   type     — 'INCOME' or 'EXPENSE'
 */
const CategorySelect = memo(function CategorySelect({
  id = 'category',
  name = 'category',
  value,
  onChange,
  onBlur,
  error,
  type = 'EXPENSE'
}) {
  const { incomeCategories, expenseCategories } = useCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = type === 'INCOME' ? incomeCategories : expenseCategories;
  const fieldName = name || (id && id.includes('category') ? 'category' : id) || 'category';

  // Find selected category ID even if value is a name or legacy key
  const normalizedValue = useMemo(() => {
    if (!value) return '';
    const match = categories.find(
      c => String(c.id).toLowerCase() === String(value).toLowerCase() ||
           String(c.name).toLowerCase() === String(value).toLowerCase()
    );
    return match ? match.id : value;
  }, [categories, value]);

  const options = useMemo(() => {
    const list = categories.map(cat => ({
      value: cat.id,
      label: `${cat.icon || (type === 'INCOME' ? '💰' : '📦')}  ${cat.name}`
    }));
    return [
      { value: '', label: 'Select a category' },
      ...list,
      { value: 'create_new', label: '+ Create Category', isAction: true }
    ];
  }, [categories, type]);

  const handleChange = useCallback((e) => {
    const selectedVal = e.target.value;
    if (selectedVal === 'create_new') {
      setIsModalOpen(true);
    } else {
      if (onChange) {
        onChange({
          target: {
            name: fieldName,
            value: selectedVal
          }
        });
      }
    }
  }, [onChange, fieldName]);

  const handleCategoryCreated = useCallback((newCategory) => {
    if (onChange && newCategory) {
      onChange({
        target: {
          name: fieldName,
          value: newCategory.id
        }
      });
    }
  }, [onChange, fieldName]);

  return (
    <>
      <Select
        id={id}
        name={fieldName}
        value={normalizedValue}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        options={options}
      />
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={handleCategoryCreated}
        type={type} 
      />
    </>
  );
});

export default CategorySelect;
