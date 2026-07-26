import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { incomeApi } from '../services/api/incomeApi';

const INITIAL_FILTERS = {
  category: '',
  source:   '',
  dateFrom: '',
  dateTo:   '',
};

const IncomeContext = createContext(null);

export function IncomeProvider({ children }) {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQueryRaw] = useState('');
  const [filters, setFiltersRaw] = useState(INITIAL_FILTERS);
  const [sortOrder, setSortOrderRaw] = useState('newest');

  // ── Fetching Data ───────────────────────────────────────────────────────

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchQuery.trim()) {
        const data = await incomeApi.searchIncome(searchQuery.trim());
        setIncome(prev => {
          const optimistic = prev.filter(i => String(i.id).startsWith('temp-'));
          return [...optimistic, ...data];
        });
      } else {
        const params = {};
        if (filters.category) params.category = filters.category;
        if (filters.dateFrom) params.start_date = filters.dateFrom;
        if (filters.dateTo) params.end_date = filters.dateTo;
        
        const data = await incomeApi.getIncome(params);
        setIncome(prev => {
          const optimistic = prev.filter(i => String(i.id).startsWith('temp-'));
          return [...optimistic, ...data];
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch income');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  // ── Mutations (Optimistic) ──────────────────────────────────────────────

  const addIncome = useCallback(async (values) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticIncome = { ...values, id: tempId, amount: Number(values.amount), type: 'income' };
    
    setIncome(prev => [optimisticIncome, ...prev]);
    
    try {
      const created = await incomeApi.createIncome(values);
      setIncome(prev => prev.map(i => i.id === tempId ? created : i));
    } catch (err) {
      setIncome(prev => prev.filter(i => i.id !== tempId));
      setError('Failed to add income');
      throw err;
    }
  }, []);

  const updateIncome = useCallback(async (id, values) => {
    const original = income.find(i => i.id === id);
    const optimisticIncome = { ...original, ...values, amount: Number(values.amount) };
    
    setIncome(prev => prev.map(i => i.id === id ? optimisticIncome : i));
    
    try {
      const updated = await incomeApi.updateIncome(id, values);
      setIncome(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err) {
      if (original) {
        setIncome(prev => prev.map(i => i.id === id ? original : i));
      }
      setError('Failed to update income');
      throw err;
    }
  }, [income]);

  const deleteIncome = useCallback(async (id) => {
    const original = income.find(i => i.id === id);
    setIncome(prev => prev.filter(i => i.id !== id));
    
    try {
      await incomeApi.deleteIncome(id);
    } catch (err) {
      if (original) {
        setIncome(prev => [original, ...prev]);
      }
      setError('Failed to delete income');
      throw err;
    }
  }, [income]);

  const getIncome = useCallback((id) => {
    return income.find(r => r.id === id) ?? null;
  }, [income]);

  const clearIncome = useCallback(() => {
    income.forEach(i => deleteIncome(i.id).catch(() => {}));
  }, [income, deleteIncome]);

  // ── Search / filter / sort ─────────────────────────────────────────────

  const setSearchQuery = useCallback((query) => setSearchQueryRaw(query), []);
  const setFilters = useCallback((partial) => setFiltersRaw(prev => ({ ...prev, ...partial })), []);
  const resetFilters = useCallback(() => {
    setFiltersRaw(INITIAL_FILTERS);
    setSearchQueryRaw('');
    setSortOrderRaw('newest');
  }, []);
  const setSortOrder = useCallback((order) => setSortOrderRaw(order), []);

  // ── Derived data ───────────────────────────────────────────────────────

  const processedIncome = useMemo(() => {
    let list = [...income];

    // Local filter for anything not supported directly
    if (filters.source) {
      list = list.filter(r => r.source.toLowerCase().includes(filters.source.toLowerCase()));
    }

    switch (sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);           break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);           break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));  break;
    }

    return list;
  }, [income, filters.source, sortOrder]);

  const summary = useMemo(() => {
    if (!income.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = income.reduce((s, r) => s + r.amount, 0);
    const largest = Math.max(...income.map(r => r.amount));
    return { total, count: income.length, largest, average: total / income.length };
  }, [income]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    income,
    loading,
    error,
    searchQuery,
    filters,
    sortOrder,
    processedIncome,
    summary,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncome,
    clearIncome,
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
    refreshIncome: fetchIncome,
  }), [
    income,
    loading,
    error,
    searchQuery,
    filters,
    sortOrder,
    processedIncome,
    summary,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncome,
    clearIncome,
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
    fetchIncome,
  ]);

  return (
    <IncomeContext.Provider value={value}>
      {children}
    </IncomeContext.Provider>
  );
}

export function useIncomeContext() {
  const ctx = useContext(IncomeContext);
  if (!ctx) throw new Error('useIncomeContext must be called inside <IncomeProvider>');
  return ctx;
}

export default IncomeContext;
