import { useState, useCallback, useEffect } from 'react';
import { useCategory } from '../../context/CategoryContext';
import { categoryApi } from '../../services/api/categoryApi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FormLabel, FieldError } from '../ui/FormField';

const ICONS = ['💰', '🍔', '🚗', '🏠', '🎬', '🛒', '🎓', '🏥', '✈️', '🐶', '💸', '💼'];

export default function CategoryModal({ isOpen, onClose, type = 'EXPENSE' }) {
  const { fetchCategories } = useCategory();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setIcon(type === 'INCOME' ? '💸' : '🛒');
      setError(null);
    }
  }, [isOpen, type]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await categoryApi.createCategory({
        name: name.trim(),
        type: type,
        icon: icon,
        color: '#3b82f6' // Default blue
      });
      await fetchCategories();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  }, [name, type, icon, fetchCategories, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Create ${type === 'INCOME' ? 'Income' : 'Expense'} Category`} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-danger-500/10 p-3 text-sm text-danger-400 border border-danger-500/20">
              {error}
            </div>
          )}
          
          <div>
            <FormLabel htmlFor="cat-name" required>Category Name</FormLabel>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Groceries"
              autoFocus
            />
          </div>
          
          <div>
            <FormLabel>Icon</FormLabel>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-10 w-10 flex items-center justify-center rounded-lg text-xl border transition-colors ${
                    icon === i 
                      ? 'border-primary-500 bg-primary-500/20' 
                      : 'border-surface-600 bg-surface-700 hover:bg-surface-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-2xl sm:rounded-b-2xl">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
