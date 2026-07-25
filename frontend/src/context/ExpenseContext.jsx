import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { expenseApi } from '../services/api/expenseApi';

const INITIAL_FILTERS = {
  category:      '',
  paymentMethod: '',
  dateFrom:      '',
  dateTo:        '',
};

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQueryRaw] = useState('');
  const [filters, setFiltersRaw] = useState(INITIAL_FILTERS);
  const [sortOrder, setSortOrderRaw] = useState('newest');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(100);

  // ── Fetching Data ───────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim()) {
        const data = await expenseApi.searchExpenses(searchQuery.trim());
        setExpenses(data);
      } else {
        const skip = (page - 1) * limit;
        const params = { skip, limit };
        if (filters.category) params.category = filters.category;
        if (filters.dateFrom) params.start_date = filters.dateFrom;
        if (filters.dateTo) params.end_date = filters.dateTo;
        
        const data = await expenseApi.getExpenses(params);
        setExpenses(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page, limit]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // ── Mutations (Optimistic) ──────────────────────────────────────────────

  const addExpense = useCallback(async (values) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticExpense = { ...values, id: tempId, amount: Number(values.amount), type: 'expense' };
    
    // Optimistic update
    setExpenses(prev => [optimisticExpense, ...prev]);
    
    try {
      const created = await expenseApi.createExpense(values);
      setExpenses(prev => prev.map(e => e.id === tempId ? created : e));
    } catch (err) {
      // Rollback
      setExpenses(prev => prev.filter(e => e.id !== tempId));
      setError('Failed to add expense');
      throw err;
    }
  }, []);

  const updateExpense = useCallback(async (id, values) => {
    // Save original for rollback
    const originalExpense = expenses.find(e => e.id === id);
    const updatedExpense = { ...originalExpense, ...values, amount: Number(values.amount) };
    
    // Optimistic update
    setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
    
    try {
      const updated = await expenseApi.updateExpense(id, values);
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    } catch (err) {
      // Rollback
      if (originalExpense) {
        setExpenses(prev => prev.map(e => e.id === id ? originalExpense : e));
      }
      setError('Failed to update expense');
      throw err;
    }
  }, [expenses]);

  const deleteExpense = useCallback(async (id) => {
    // Save original for rollback
    const originalExpense = expenses.find(e => e.id === id);
    
    // Optimistic delete
    setExpenses(prev => prev.filter(e => e.id !== id));
    
    try {
      await expenseApi.deleteExpense(id);
    } catch (err) {
      // Rollback
      if (originalExpense) {
        setExpenses(prev => [originalExpense, ...prev]);
      }
      setError('Failed to delete expense');
      throw err;
    }
  }, [expenses]);

  const getExpense = useCallback((id) => {
    return expenses.find(e => e.id === id) ?? null;
  }, [expenses]);

  const clearExpenses = useCallback(() => {
    expenses.forEach(e => deleteExpense(e.id).catch(() => {}));
  }, [expenses, deleteExpense]);

  // ── Search / filter / sort ─────────────────────────────────────────────

  const setSearchQuery = useCallback((query) => {
    setSearchQueryRaw(query);
    setPage(1); // Reset to page 1 on search
  }, []);
  
  const setFilters = useCallback((partial) => {
    setFiltersRaw(prev => ({ ...prev, ...partial }));
    setPage(1); // Reset to page 1 on filter
  }, []);
  
  const resetFilters = useCallback(() => {
    setFiltersRaw(INITIAL_FILTERS);
    setSearchQueryRaw('');
    setSortOrderRaw('newest');
    setPage(1);
  }, []);
  
  const setSortOrder = useCallback((order) => setSortOrderRaw(order), []);

  // ── Derived data ───────────────────────────────────────────────────────

  const processedExpenses = useMemo(() => {
    let list = [...expenses];

    // Local filter for anything backend didn't handle (like paymentMethod)
    if (filters.paymentMethod) {
      list = list.filter(e => e.paymentMethod === filters.paymentMethod);
    }

    // Sort order (backend only sorts by date desc by default)
    switch (sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);           break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);           break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));  break;
    }

    return list;
  }, [expenses, filters.paymentMethod, sortOrder]);

  const summary = useMemo(() => {
    if (!processedExpenses.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = processedExpenses.reduce((s, e) => s + e.amount, 0);
    const largest = Math.max(...processedExpenses.map(e => e.amount));
    return { total, count: processedExpenses.length, largest, average: total / processedExpenses.length };
  }, [processedExpenses]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    expenses,
    loading,
    error,
    searchQuery,
    filters,
    sortOrder,
    page,
    limit,
    // Derived
    processedExpenses,
    summary,
    // Mutations
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    clearExpenses,
    // Actions
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
    setPage,
    refreshExpenses: fetchExpenses
  }), [
    expenses,
    loading,
    error,
    searchQuery,
    filters,
    sortOrder,
    page,
    limit,
    processedExpenses,
    summary,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    clearExpenses,
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
    setPage,
    fetchExpenses
  ]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenseContext must be called inside <ExpenseProvider>');
  return ctx;
}

export default ExpenseContext;
