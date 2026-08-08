import { useState, useCallback, useEffect } from 'react';
import { useCategory } from '../../context/CategoryContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FormLabel } from '../ui/FormField';

const ICONS = ['💰', '🍔', '🚗', '🏠', '🎬', '🛒', '🎓', '🏥', '✈️', '🐶', '💸', '💼', '⚡', '🍽️', '🛍️', '📚', '🎯', '🎁', '🏦', '📈', '💻', '🏢', '🔄', '📦'];

export default function CategoryModal({ isOpen, onClose, onCreated, type = 'EXPENSE' }) {
  const { createCategory } = useCategory();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setIcon(type === 'INCOME' ? '💼' : '🍽️');
      setError(null);
    }
  }, [isOpen, type]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Category name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const created = await createCategory({
        name: cleanName,
        type: type,
        icon: icon,
        color: type === 'INCOME' ? 'text-green-400' : 'text-primary-400'
      });
      if (onCreated && created) {
        onCreated(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  }, [name, type, icon, createCategory, onCreated, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Create ${type === 'INCOME' ? 'Income' : 'Expense'} Category`} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl bg-danger-500/10 p-3 text-xs font-medium text-danger-400 border border-danger-500/20">
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
              className="input w-full"
              placeholder={type === 'INCOME' ? 'e.g. Consulting, Dividends' : 'e.g. Groceries, Travel, Gym'}
              autoFocus
            />
          </div>
          
          <div>
            <FormLabel>Choose Icon</FormLabel>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mt-2 max-h-48 overflow-y-auto p-1 rounded-xl bg-surface-950 border border-surface-700/60">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-11 w-11 flex items-center justify-center rounded-xl text-xl border transition-all ${
                    icon === i 
                      ? 'border-primary-500 bg-primary-500/25 scale-105 shadow-md shadow-primary-500/20' 
                      : 'border-surface-700/80 bg-surface-800 hover:bg-surface-700 text-slate-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-2xl">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Create Category</Button>
        </div>
      </form>
    </Modal>
  );
}
