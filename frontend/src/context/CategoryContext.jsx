import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { categoryApi } from '../services/api/categoryApi';
import { useAuth } from './AuthContext';

export const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const incomeCategories = categories.filter(c => c.type === 'INCOME');

  const getCategoryById = useCallback((id) => {
    if (!id) return null;
    return categories.find(c => c.id === id || String(c.id).toLowerCase() === String(id).toLowerCase() || c.name.toLowerCase() === String(id).toLowerCase()) || null;
  }, [categories]);

  const getCategoryMeta = useCallback((idOrName, type = 'EXPENSE') => {
    if (!idOrName) {
      return { id: '', name: 'Uncategorized', icon: type === 'INCOME' ? '💰' : '📦', color: 'text-slate-400', bg: 'bg-slate-500/15' };
    }
    const found = categories.find(c => c.id === idOrName || String(c.id).toLowerCase() === String(idOrName).toLowerCase() || c.name.toLowerCase() === String(idOrName).toLowerCase());
    if (found) {
      return {
        id: found.id,
        name: found.name,
        icon: found.icon || (found.type === 'INCOME' ? '💰' : '🏷️'),
        color: found.color?.startsWith('text-') ? found.color : 'text-slate-300',
        bg: 'bg-slate-500/15'
      };
    }
    return {
      id: idOrName,
      name: String(idOrName),
      icon: type === 'INCOME' ? '💰' : '📦',
      color: 'text-slate-400',
      bg: 'bg-slate-500/15'
    };
  }, [categories]);

  const seedPresets = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await categoryApi.seedPresets();
      setCategories(data);
      return data;
    } catch (error) {
      console.error('Failed to seed preset categories:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const value = {
    categories,
    expenseCategories,
    incomeCategories,
    getCategoryById,
    getCategoryMeta,
    fetchCategories,
    seedPresets,
    loading
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}
