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
import { useAuth } from './AuthContext';

// ── Context ────────────────────────────────────────────────────────────────

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetching Data ───────────────────────────────────────────────────────

  const fetchBudgets = useCallback(async () => {
    if (!isAuthenticated) {
      setBudgets([]);
      setLoading(false);
      return;
    }
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
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // ── Mutations (Optimistic) ──────────────────────────────────────────────

  const addBudget = useCallback(async (values) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const tempId = `temp-${crypto.randomUUID()}`;
    const amountVal = Number(values.amount || values.monthlyLimit || 0);
    const optimisticBudget = { 
      ...values, 
      id: tempId, 
      amount: amountVal,
      monthlyLimit: amountVal,
      period: values.period || 'MONTHLY',
      month: Number(values.month || currentMonth),
      year: Number(values.year || currentYear),
      createdAt: new Date().toISOString()
    };
    
    setBudgets(prev => [optimisticBudget, ...prev]);
    
    try {
      const created = await budgetApi.createBudget(values);
      setBudgets(prev => {
        const filtered = prev.filter(b => b.id !== tempId && b.id !== created.id);
        return [created, ...filtered];
      });
      return created;
    } catch (err) {
      setBudgets(prev => prev.filter(b => b.id !== tempId));
      setError('Failed to add budget');
      throw err;
    }
  }, []);

  const updateBudget = useCallback(async (id, values) => {
    const original = budgets.find(b => b.id === id);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const amountVal = Number(values.amount || values.monthlyLimit || (original ? original.amount : 0));
    const optimisticBudget = { 
      ...original, 
      ...values, 
      amount: amountVal,
      monthlyLimit: amountVal,
      month: Number(values.month || (original ? original.month : currentMonth)),
      year: Number(values.year || (original ? original.year : currentYear)),
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
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return budgets.map(budget => {
      const bMonth = Number(budget.month || currentMonth);
      const bYear = Number(budget.year || currentYear);

      const spent = expenses.reduce((sum, e) => {
        // Skip savings contributions if the toggle is OFF
        if (!includeSavings && e.type === 'savings_contribution') return sum;
        
        if (e.category !== budget.category) return sum;
        
        const [eYear, eMonth] = (e.date || '').split('-');
        if (Number(eMonth) === bMonth && Number(eYear) === bYear) {
          return sum + (Number(e.amount) || 0);
        }
        return sum;
      }, 0);

      const parsedSpent = parseFloat(spent.toFixed(2));
      const monthlyLimit = Number(budget.monthlyLimit || budget.amount || 0);
      const parsedRemaining = parseFloat((monthlyLimit - parsedSpent).toFixed(2));

      return {
        ...budget,
        month: bMonth,
        year: bYear,
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
