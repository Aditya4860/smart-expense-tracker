import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect
} from 'react';
import { budgetApi } from '../services/api/budgetApi';
import useExpenses from '../hooks/useExpenses';

// ── Context ────────────────────────────────────────────────────────────────

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetching Data ───────────────────────────────────────────────────────

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetApi.getBudgets();
      setBudgets(prev => {
        const optimistic = prev.filter(b => String(b.id).startsWith('temp-'));
        return [...optimistic, ...data];
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // ── Mutations (Optimistic) ──────────────────────────────────────────────

  const addBudget = useCallback(async (values) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticBudget = { 
      ...values, 
      id: tempId, 
      amount: Number(values.amount || values.monthlyLimit), 
      period: values.period || 'MONTHLY',
      createdAt: new Date().toISOString()
    };
    
    setBudgets(prev => [optimisticBudget, ...prev]);
    
    try {
      const created = await budgetApi.createBudget(values);
      setBudgets(prev => prev.map(b => b.id === tempId ? created : b));
      return created;
    } catch (err) {
      setBudgets(prev => prev.filter(b => b.id !== tempId));
      setError('Failed to add budget');
      throw err;
    }
  }, []);

  const updateBudget = useCallback(async (id, values) => {
    const original = budgets.find(b => b.id === id);
    const optimisticBudget = { 
      ...original, 
      ...values, 
      amount: Number(values.amount || values.monthlyLimit)
    };
    
    setBudgets(prev => prev.map(b => b.id === id ? optimisticBudget : b));
    
    try {
      const updated = await budgetApi.updateBudget(id, values);
      setBudgets(prev => prev.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      if (original) {
        setBudgets(prev => prev.map(b => b.id === id ? original : b));
      }
      setError('Failed to update budget');
      throw err;
    }
  }, [budgets]);

  const deleteBudget = useCallback(async (id) => {
    const original = budgets.find(b => b.id === id);
    setBudgets(prev => prev.filter(b => b.id !== id));
    
    try {
      await budgetApi.deleteBudget(id);
    } catch (err) {
      if (original) {
        setBudgets(prev => [original, ...prev]);
      }
      setError('Failed to delete budget');
      throw err;
    }
  }, [budgets]);

  const getBudget = useCallback((id) => {
    return budgets.find(b => b.id === id) ?? null;
  }, [budgets]);

  const clearBudgets = useCallback(() => {
    budgets.forEach(b => deleteBudget(b.id).catch(() => {}));
  }, [budgets, deleteBudget]);

  // ── Derived computations ───────────────────────────────────────────────

  const { expenses } = useExpenses();
  const [includeSavings, setIncludeSavings] = useState(() => {
    return localStorage.getItem('sxp_include_savings_budget') !== 'false';
  });

  const toggleIncludeSavings = useCallback(() => {
    setIncludeSavings(prev => {
      const next = !prev;
      localStorage.setItem('sxp_include_savings_budget', String(next));
      return next;
    });
  }, []);

  const enrichedBudgets = useMemo(() => {
    return budgets.map(budget => {
      // 1. Sum spent by matching category (Note: month/year matching removed if backend uses fixed monthly period)
      // If we still want local month/year matching, we use current month
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const spent = expenses.reduce((sum, e) => {
        // Skip savings contributions if the toggle is OFF
        if (!includeSavings && e.type === 'savings_contribution') return sum;
        
        if (e.category !== budget.category) return sum;
        
        const [eYear, eMonth] = e.date.split('-');
        if (Number(eMonth) === currentMonth && Number(eYear) === currentYear) {
          return sum + e.amount;
        }
        return sum;
      }, 0);

      const parsedSpent = parseFloat(spent.toFixed(2));
      // Handle the fact that UI expects 'monthlyLimit' on budget object sometimes
      const monthlyLimit = budget.amount;
      const parsedRemaining = parseFloat((monthlyLimit - parsedSpent).toFixed(2));

      return {
        ...budget,
        monthlyLimit: monthlyLimit, 
        spent: parsedSpent,
        remaining: parsedRemaining
      };
    });
  }, [budgets, expenses, includeSavings]);

  const calculateRemainingBudget = useCallback((id) => {
    const budget = enrichedBudgets.find(b => b.id === id);
    if (!budget) return 0;
    return budget.remaining;
  }, [enrichedBudgets]);

  const calculateSpentBudget = useCallback((id) => {
    const budget = enrichedBudgets.find(b => b.id === id);
    if (!budget) return 0;
    return budget.spent;
  }, [enrichedBudgets]);

  const calculateBudgetProgress = useCallback((id) => {
    const budget = enrichedBudgets.find(b => b.id === id);
    if (!budget || budget.monthlyLimit <= 0) return 0;
    const pct = (budget.spent / budget.monthlyLimit) * 100;
    return parseFloat(Math.min(pct, 100).toFixed(2));
  }, [enrichedBudgets]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    budgets: enrichedBudgets,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    clearBudgets,
    includeSavings,
    toggleIncludeSavings,
    calculateRemainingBudget,
    calculateSpentBudget,
    calculateBudgetProgress,
    refreshBudgets: fetchBudgets
  }), [
    enrichedBudgets,
    loading,
    error,
    includeSavings,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    clearBudgets,
    toggleIncludeSavings,
    calculateRemainingBudget,
    calculateSpentBudget,
    calculateBudgetProgress,
    fetchBudgets
  ]);

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgetContext must be called inside <BudgetProvider>');
  return ctx;
}

export default BudgetContext;
