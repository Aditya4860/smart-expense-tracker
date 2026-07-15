import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loadExpenses, saveExpenses, buildExpense } from '../services/expenseStorage';

/**
 * ExpenseContext — manages all expense state.
 * Persists to localStorage automatically on every mutation.
 *
 * Provides:
 *   expenses, processedExpenses, summary,
 *   addExpense, updateExpense, deleteExpense,
 *   searchQuery, setSearchQuery,
 *   filters, setFilters, resetFilters,
 *   sortOrder, setSortOrder
 */
const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses,    setExpenses]    = useState(() => loadExpenses());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters,     setFiltersRaw]  = useState({
    category:      '',
    paymentMethod: '',
    dateFrom:      '',
    dateTo:        '',
  });
  const [sortOrder, setSortOrder] = useState('newest'); // newest | oldest | highest | lowest

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addExpense = useCallback((values) => {
    const expense = buildExpense(values);
    setExpenses(prev => {
      const next = [expense, ...prev];
      saveExpenses(next);
      return next;
    });
    return expense;
  }, []);

  const updateExpense = useCallback((id, values) => {
    setExpenses(prev => {
      const existing = prev.find(e => e.id === id);
      if (!existing) return prev;
      const updated = buildExpense(values, id, existing.createdAt);
      const next = prev.map(e => (e.id === id ? updated : e));
      saveExpenses(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      saveExpenses(next);
      return next;
    });
  }, []);

  // ── Filter helpers ────────────────────────────────────────────────────────

  const setFilters = useCallback((partial) => {
    setFiltersRaw(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersRaw({ category: '', paymentMethod: '', dateFrom: '', dateTo: '' });
    setSearchQuery('');
    setSortOrder('newest');
  }, []);

  // ── Derived list (filtered + sorted) ─────────────────────────────────────

  const processedExpenses = useMemo(() => {
    let list = [...expenses];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      );
    }

    if (filters.category)      list = list.filter(e => e.category      === filters.category);
    if (filters.paymentMethod) list = list.filter(e => e.paymentMethod === filters.paymentMethod);
    if (filters.dateFrom)      list = list.filter(e => e.date          >= filters.dateFrom);
    if (filters.dateTo)        list = list.filter(e => e.date          <= filters.dateTo);

    switch (sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));     break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);              break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);              break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));     break;
    }

    return list;
  }, [expenses, searchQuery, filters, sortOrder]);

  // ── Summary stats (over ALL expenses, not just filtered) ─────────────────

  const summary = useMemo(() => {
    if (!expenses.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = expenses.reduce((s, e) => s + e.amount, 0);
    const largest = Math.max(...expenses.map(e => e.amount));
    return { total, count: expenses.length, largest, average: total / expenses.length };
  }, [expenses]);

  // ── Context value ─────────────────────────────────────────────────────────

  const value = useMemo(() => ({
    expenses,
    processedExpenses,
    summary,
    addExpense,
    updateExpense,
    deleteExpense,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resetFilters,
    sortOrder,
    setSortOrder,
  }), [
    expenses, processedExpenses, summary,
    addExpense, updateExpense, deleteExpense,
    searchQuery, filters, sortOrder,
    setFilters, resetFilters,
  ]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenseContext must be used inside <ExpenseProvider>');
  return ctx;
}

export default ExpenseContext;
