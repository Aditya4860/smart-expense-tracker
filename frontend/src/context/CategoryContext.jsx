import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { categoryApi } from '../services/api/categoryApi';
import { useAuth } from './AuthContext';
import { DEFAULT_PRESET_CATEGORIES } from '../constants/defaultCategories';

export const CategoryContext = createContext(null);

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEY = 'smart_expense_tracker_custom_categories';

function getSavedLocalCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCategories(cats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Failed to save categories to localStorage:', e);
  }
}

export function CategoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState(() => {
    const local = getSavedLocalCategories();
    return [...DEFAULT_PRESET_CATEGORIES, ...local];
  });
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    const local = getSavedLocalCategories();
    if (!isAuthenticated) {
      setCategories([...DEFAULT_PRESET_CATEGORIES, ...local]);
      return;
    }

    try {
      setLoading(true);
      let data = [];
      try {
        data = await categoryApi.getCategories();
      } catch (err) {
        console.warn('Backend unavailable, using preset categories:', err?.message);
      }

      if (data && data.length > 0) {
        // Merge backend data with any local-only categories
        const backendNames = new Set(data.map(c => c.name.toLowerCase().trim()));
        const unSyncedLocal = local.filter(c => !backendNames.has(c.name.toLowerCase().trim()));
        setCategories([...data, ...unSyncedLocal]);
      } else {
        // If backend returned empty array, auto-seed defaults if authenticated
        try {
          const seeded = await categoryApi.seedPresets();
          if (seeded && seeded.length > 0) {
            setCategories([...seeded, ...local]);
            return;
          }
        } catch {
          // Seed call failed, keep defaults
        }
        setCategories([...DEFAULT_PRESET_CATEGORIES, ...local]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([...DEFAULT_PRESET_CATEGORIES, ...local]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const incomeCategories = categories.filter(c => c.type === 'INCOME');

  const createCategory = useCallback(async ({ name, type = 'EXPENSE', icon = '🏷️', color = 'text-primary-400' }) => {
    const trimmedName = name.trim();
    let newCategory = null;

    try {
      newCategory = await categoryApi.createCategory({
        name: trimmedName,
        type,
        icon: icon || (type === 'INCOME' ? '💰' : '📦'),
        color: color || 'text-primary-400',
      });
    } catch (err) {
      console.warn('Backend category creation failed/offline, creating local category:', err?.message);
      newCategory = {
        id: generateUUID(),
        name: trimmedName,
        type,
        icon: icon || (type === 'INCOME' ? '💰' : '📦'),
        color: color || 'text-primary-400',
        bg: 'bg-primary-500/15',
        isLocal: true,
        created_at: new Date().toISOString(),
      };
    }

    if (newCategory) {
      setCategories((prev) => {
        const next = [...prev, newCategory];
        // Save local categories
        const localOnly = next.filter(c => c.isLocal || String(c.id).startsWith('custom_'));
        saveLocalCategories(localOnly);
        return next;
      });
    }

    return newCategory;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    try {
      await categoryApi.deleteCategory(id);
    } catch (err) {
      console.warn('Backend delete category failed, deleting locally:', err?.message);
    }
    setCategories((prev) => {
      const next = prev.filter(c => c.id !== id);
      const localOnly = next.filter(c => c.isLocal || String(c.id).startsWith('custom_'));
      saveLocalCategories(localOnly);
      return next;
    });
  }, []);

  const getCategoryById = useCallback((id) => {
    if (!id) return null;
    return categories.find(
      c => c.id === id || 
      String(c.id).toLowerCase() === String(id).toLowerCase() || 
      c.name.toLowerCase() === String(id).toLowerCase()
    ) || null;
  }, [categories]);

  const getCategoryMeta = useCallback((idOrName, type = 'EXPENSE') => {
    if (!idOrName) {
      return { id: '', name: 'Uncategorized', icon: type === 'INCOME' ? '💰' : '📦', color: 'text-slate-400', bg: 'bg-slate-500/15' };
    }
    const found = categories.find(
      c => c.id === idOrName || 
      String(c.id).toLowerCase() === String(idOrName).toLowerCase() || 
      c.name.toLowerCase() === String(idOrName).toLowerCase()
    );
    if (found) {
      return {
        id: found.id,
        name: found.name,
        icon: found.icon || (found.type === 'INCOME' ? '💰' : '🏷️'),
        color: found.color?.startsWith('text-') ? found.color : 'text-slate-300',
        bg: found.bg || 'bg-slate-500/15'
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
    try {
      setLoading(true);
      const data = await categoryApi.seedPresets();
      if (data && data.length > 0) {
        setCategories(data);
        return data;
      }
    } catch (error) {
      console.warn('Failed to seed preset categories on server, using defaults:', error?.message);
    } finally {
      setLoading(false);
    }
    setCategories(DEFAULT_PRESET_CATEGORIES);
    return DEFAULT_PRESET_CATEGORIES;
  }, []);

  const value = {
    categories,
    expenseCategories,
    incomeCategories,
    getCategoryById,
    getCategoryMeta,
    fetchCategories,
    createCategory,
    deleteCategory,
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
