import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useTransactionContext } from './TransactionContext';

const INITIAL_FILTERS = {
  category:      '',
  paymentMethod: '',
  dateFrom:      '',
  dateTo:        '',
};

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, clearTransactions: clearAllTrx } = useTransactionContext();
  
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [filters, setFiltersRaw] = useState(INITIAL_FILTERS);
  const [sortOrder, setSortOrderRaw] = useState('newest');

  const expenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense' || t.type === 'savings_contribution'),
  [transactions]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addExpense = useCallback((values) => {
    return addTransaction({ ...values, type: 'expense' });
  }, [addTransaction]);

  const updateExpense = useCallback((id, values) => {
    // preserve the type if it was savings_contribution
    const existing = expenses.find(e => e.id === id);
    return updateTransaction(id, { 
      ...values, 
      type: existing?.type || 'expense',
      linkedGoalId: existing?.linkedGoalId 
    });
  }, [updateTransaction, expenses]);

  // Note: deleteExpense just deletes the transaction (even if it's a savings contribution)
  const deleteExpense = deleteTransaction;

  const getExpense = useCallback((id) => {
    return expenses.find(e => e.id === id) ?? null;
  }, [expenses]);

  const clearExpenses = useCallback(() => {
    expenses.forEach(e => deleteTransaction(e.id));
  }, [expenses, deleteTransaction]);

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

  const processedExpenses = useMemo(() => {
    let list = [...expenses];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      );
    }

    const { category, paymentMethod, dateFrom, dateTo } = filters;
    if (category)      list = list.filter(e => e.category      === category);
    if (paymentMethod) list = list.filter(e => e.paymentMethod === paymentMethod);
    if (dateFrom)      list = list.filter(e => e.date          >= dateFrom);
    if (dateTo)        list = list.filter(e => e.date          <= dateTo);

    switch (sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);           break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);           break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));  break;
    }

    return list;
  }, [expenses, searchQuery, filters, sortOrder]);

  const summary = useMemo(() => {
    if (!expenses.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = expenses.reduce((s, e) => s + e.amount, 0);
    const largest = Math.max(...expenses.map(e => e.amount));
    return { total, count: expenses.length, largest, average: total / expenses.length };
  }, [expenses]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    expenses,
    searchQuery,
    filters,
    sortOrder,
    // Derived
    processedExpenses,
    summary,
    // Mutations
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    clearExpenses,
    // Search / filter / sort
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
  }), [
    expenses,
    searchQuery,
    filters,
    sortOrder,
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
