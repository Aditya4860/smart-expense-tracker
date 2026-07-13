import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import useAuth from '../hooks/useAuth';
import {
  getExpenses,
  addExpense as svcAdd,
  updateExpense as svcUpdate,
  deleteExpense as svcDelete,
  getStats,
} from '../services/expenseService';

/**
 * ExpenseContext — global state for the expense management module.
 *
 * Consumed via the `useExpenses` hook. Never consume directly.
 */
export const ExpenseContext = createContext(null);

/**
 * Default filter state. All filters are optional; null means "unset".
 *
 * {
 *   search:     string | ''         — filters on description (case-insensitive)
 *   categories: string[]            — empty array = show all
 *   dateFrom:   'YYYY-MM-DD' | ''
 *   dateTo:     'YYYY-MM-DD' | ''
 *   sortBy:     'date' | 'amount'
 *   sortDir:    'desc' | 'asc'
 * }
 */
const DEFAULT_FILTERS = {
  search:     '',
  categories: [],
  dateFrom:   '',
  dateTo:     '',
  sortBy:     'date',
  sortDir:    'desc',
};

/**
 * Applies filters + sort to a raw expense array.
 */
function applyFilters(expenses, filters) {
  let result = [...expenses];

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      e =>
        e.description.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
    );
  }

  if (filters.categories.length > 0) {
    result = result.filter(e => filters.categories.includes(e.category));
  }

  if (filters.dateFrom) {
    result = result.filter(e => e.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    result = result.filter(e => e.date <= filters.dateTo);
  }

  result.sort((a, b) => {
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    if (filters.sortBy === 'amount') return dir * (a.amount - b.amount);
    // default: date
    if (a.date !== b.date) return dir * a.date.localeCompare(b.date);
    return dir * a.createdAt.localeCompare(b.createdAt);
  });

  return result;
}

/**
 * ExpenseProvider — wraps protected pages that need expense state.
 */
export function ExpenseProvider({ children }) {
  const { user } = useAuth();

  const [allExpenses, setAllExpenses] = useState([]);
  const [filters,     setFiltersState] = useState(DEFAULT_FILTERS);
  const [stats,       setStats]        = useState({ total: 0, thisMonth: 0, count: 0, byCategory: [] });
  const [loading,     setLoading]      = useState(true);

  // Load from localStorage whenever the logged-in user changes
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const data = getExpenses(user.id);
    setAllExpenses(data);
    setStats(getStats(user.id));
    setLoading(false);
  }, [user?.id]);

  /** addExpense(payload) — adds and syncs state */
  const addExpense = useCallback((payload) => {
    if (!user?.id) return;
    const newExpense = svcAdd(user.id, payload);
    setAllExpenses(prev => [newExpense, ...prev]);
    setStats(getStats(user.id));
    return newExpense;
  }, [user?.id]);

  /** updateExpense(id, patch) — updates and syncs state */
  const updateExpense = useCallback((id, patch) => {
    if (!user?.id) return;
    const updated = svcUpdate(user.id, id, patch);
    if (!updated) return;
    setAllExpenses(prev => prev.map(e => e.id === id ? updated : e));
    setStats(getStats(user.id));
    return updated;
  }, [user?.id]);

  /** deleteExpense(id) — removes and syncs state */
  const deleteExpense = useCallback((id) => {
    if (!user?.id) return;
    svcDelete(user.id, id);
    setAllExpenses(prev => prev.filter(e => e.id !== id));
    setStats(getStats(user.id));
  }, [user?.id]);

  /** setFilters(partial) — merges partial filter updates */
  const setFilters = useCallback((partial) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  /** resetFilters() — restores default filter state */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Derived: filtered + sorted view of expenses
  const expenses = useMemo(
    () => applyFilters(allExpenses, filters),
    [allExpenses, filters]
  );

  const value = useMemo(() => ({
    expenses,      // filtered + sorted
    allExpenses,   // raw, unfiltered
    stats,
    filters,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    setFilters,
    resetFilters,
  }), [
    expenses, allExpenses, stats, filters, loading,
    addExpense, updateExpense, deleteExpense, setFilters, resetFilters,
  ]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}
