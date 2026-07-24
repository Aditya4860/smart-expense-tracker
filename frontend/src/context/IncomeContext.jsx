import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useTransactionContext } from './TransactionContext';

const INITIAL_FILTERS = {
  category: '',
  source:   '',
  dateFrom: '',
  dateTo:   '',
};

const IncomeContext = createContext(null);

export function IncomeProvider({ children }) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionContext();
  
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [filters, setFiltersRaw] = useState(INITIAL_FILTERS);
  const [sortOrder, setSortOrderRaw] = useState('newest');

  const income = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addIncome = useCallback((values) => {
    return addTransaction({ ...values, type: 'income' });
  }, [addTransaction]);

  const updateIncome = useCallback((id, values) => {
    return updateTransaction(id, { ...values, type: 'income' });
  }, [updateTransaction]);

  const deleteIncome = deleteTransaction;

  const getIncome = useCallback((id) => {
    return income.find(r => r.id === id) ?? null;
  }, [income]);

  const clearIncome = useCallback(() => {
    income.forEach(i => deleteTransaction(i.id));
  }, [income, deleteTransaction]);

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

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
      );
    }

    const { category, source, dateFrom, dateTo } = filters;
    if (category) list = list.filter(r => r.category === category);
    if (source)   list = list.filter(r => r.source.toLowerCase().includes(source.toLowerCase()));
    if (dateFrom) list = list.filter(r => r.date >= dateFrom);
    if (dateTo)   list = list.filter(r => r.date <= dateTo);

    switch (sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);           break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);           break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));  break;
    }

    return list;
  }, [income, searchQuery, filters, sortOrder]);

  const summary = useMemo(() => {
    if (!income.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = income.reduce((s, r) => s + r.amount, 0);
    const largest = Math.max(...income.map(r => r.amount));
    return { total, count: income.length, largest, average: total / income.length };
  }, [income]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    income,
    searchQuery,
    filters,
    sortOrder,
    // Derived
    processedIncome,
    summary,
    // Mutations
    addIncome,
    updateIncome,
    deleteIncome,
    getIncome,
    clearIncome,
    // Search / filter / sort
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
  }), [
    income,
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
