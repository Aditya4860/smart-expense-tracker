import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { recurringApi } from '../services/api/recurringApi';
import useAuth from '../hooks/useAuth';

const RecurringContext = createContext(null);

export function RecurringProvider({ children }) {
  const { user } = useAuth();
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [counts, setCounts] = useState({
    total_active: 0,
    active_expenses: 0,
    active_income: 0,
    paused_count: 0,
    cancelled_count: 0,
    total_monthly_recurring_expense: 0,
    total_monthly_recurring_income: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch recurring transactions and counts
  const fetchRecurring = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [items, countData] = await Promise.all([
        recurringApi.getRecurringTransactions(params),
        recurringApi.getRecurringCounts(),
      ]);
      setRecurringTransactions(items);
      setCounts(countData);
    } catch (err) {
      console.error('Failed to fetch recurring transactions:', err);
      setError(err.message || 'Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRecurring();
    } else {
      setRecurringTransactions([]);
      setCounts({
        total_active: 0,
        active_expenses: 0,
        active_income: 0,
        paused_count: 0,
        cancelled_count: 0,
        total_monthly_recurring_expense: 0,
        total_monthly_recurring_income: 0,
      });
    }
  }, [user, fetchRecurring]);

  // Create
  const addRecurring = useCallback(async (data) => {
    try {
      const created = await recurringApi.createRecurringTransaction(data);
      await fetchRecurring();
      return created;
    } catch (err) {
      console.error('Failed to create recurring transaction:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Update
  const updateRecurring = useCallback(async (id, data) => {
    try {
      const updated = await recurringApi.updateRecurringTransaction(id, data);
      await fetchRecurring();
      return updated;
    } catch (err) {
      console.error('Failed to update recurring transaction:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Delete
  const deleteRecurring = useCallback(async (id) => {
    try {
      await recurringApi.deleteRecurringTransaction(id);
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
      await fetchRecurring();
    } catch (err) {
      console.error('Failed to delete recurring transaction:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Pause
  const pauseRecurring = useCallback(async (id) => {
    try {
      const updated = await recurringApi.pauseRecurringTransaction(id);
      setRecurringTransactions(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      await fetchRecurring();
      return updated;
    } catch (err) {
      console.error('Failed to pause recurring transaction:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Resume
  const resumeRecurring = useCallback(async (id) => {
    try {
      const updated = await recurringApi.resumeRecurringTransaction(id);
      setRecurringTransactions(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      await fetchRecurring();
      return updated;
    } catch (err) {
      console.error('Failed to resume recurring transaction:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Cancel
  const cancelRecurring = useCallback(async (id) => {
    try {
      const updated = await recurringApi.cancelRecurringTransaction(id);
      setRecurringTransactions(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      await fetchRecurring();
      return updated;
    } catch (err) {
      console.error('Failed to cancel recurring transaction:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Skip Next Occurrence
  const skipOccurrence = useCallback(async (id) => {
    try {
      const updated = await recurringApi.skipOccurrence(id);
      setRecurringTransactions(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      await fetchRecurring();
      return updated;
    } catch (err) {
      console.error('Failed to skip occurrence:', err);
      throw err;
    }
  }, [fetchRecurring]);

  // Process Due Now
  const processDue = useCallback(async () => {
    try {
      const result = await recurringApi.processAllDue();
      await fetchRecurring();
      return result;
    } catch (err) {
      console.error('Failed to process due recurring transactions:', err);
      throw err;
    }
  }, [fetchRecurring]);

  const value = useMemo(
    () => ({
      recurringTransactions,
      counts,
      loading,
      error,
      fetchRecurring,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      pauseRecurring,
      resumeRecurring,
      cancelRecurring,
      skipOccurrence,
      processDue,
    }),
    [
      recurringTransactions,
      counts,
      loading,
      error,
      fetchRecurring,
      addRecurring,
      updateRecurring,
      deleteRecurring,
      pauseRecurring,
      resumeRecurring,
      cancelRecurring,
      skipOccurrence,
      processDue,
    ]
  );

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
}

export function useRecurring() {
  const context = useContext(RecurringContext);
  if (!context) {
    throw new Error('useRecurring must be used within a RecurringProvider');
  }
  return context;
}
