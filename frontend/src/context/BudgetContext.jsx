import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useState,
  useEffect
} from 'react';
import {
  loadBudgets,
  saveBudgets,
  clearBudgets as storageClear,
  buildBudget,
} from '../services/budgetStorage';
import useExpenses from '../hooks/useExpenses';

// ── Action types ───────────────────────────────────────────────────────────

const ADD    = 'ADD';
const UPDATE = 'UPDATE';
const DELETE = 'DELETE';
const CLEAR  = 'CLEAR';

// ── Initial state ──────────────────────────────────────────────────────────

function makeInitialState() {
  return {
    budgets: loadBudgets(),
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case ADD: {
      const next = [action.payload, ...state.budgets];
      saveBudgets(next);
      return { ...state, budgets: next };
    }

    case UPDATE: {
      const next = state.budgets.map(b =>
        b.id === action.payload.id ? action.payload : b
      );
      saveBudgets(next);
      return { ...state, budgets: next };
    }

    case DELETE: {
      const next = state.budgets.filter(b => b.id !== action.id);
      saveBudgets(next);
      return { ...state, budgets: next };
    }

    case CLEAR: {
      storageClear();
      return { ...state, budgets: [] };
    }

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

const BudgetContext = createContext(null);

/**
 * BudgetProvider — wraps the app and makes budget state available everywhere.
 *
 * Persists to localStorage automatically on every mutation.
 * Restores state from localStorage on first render.
 */
export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addBudget = useCallback((values) => {
    const budget = buildBudget(values);
    dispatch({ type: ADD, payload: budget });
    return budget;
  }, []);

  const updateBudget = useCallback((id, values) => {
    const existing = state.budgets.find(b => b.id === id);
    if (!existing) return;
    const updated = buildBudget(values, id, existing.createdAt);
    dispatch({ type: UPDATE, payload: updated });
    return updated;
  }, [state.budgets]);

  const deleteBudget = useCallback((id) => {
    dispatch({ type: DELETE, id });
  }, []);

  const getBudget = useCallback((id) => {
    return state.budgets.find(b => b.id === id) ?? null;
  }, [state.budgets]);

  const clearBudgets = useCallback(() => {
    dispatch({ type: CLEAR });
  }, []);

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
    return state.budgets.map(budget => {
      // 1. Sum spent by matching category and month/year
      const spent = expenses.reduce((sum, e) => {
        // Skip savings contributions if the toggle is OFF
        if (!includeSavings && e.type === 'savings_contribution') return sum;
        
        if (e.category !== budget.category) return sum;
        
        const [eYear, eMonth] = e.date.split('-');
        if (Number(eMonth) === budget.month && Number(eYear) === budget.year) {
          return sum + e.amount;
        }
        return sum;
      }, 0);

      const parsedSpent = parseFloat(spent.toFixed(2));
      const parsedRemaining = parseFloat((budget.monthlyLimit - parsedSpent).toFixed(2));

      return {
        ...budget,
        spent: parsedSpent,
        remaining: parsedRemaining
      };
    });
  }, [state.budgets, expenses]);

  /**
   * Calculate the remaining amount for a specific budget by id.
   * @param {string} id
   * @returns {number}
   */
  const calculateRemainingBudget = useCallback((id) => {
    const budget = enrichedBudgets.find(b => b.id === id);
    if (!budget) return 0;
    return budget.remaining;
  }, [enrichedBudgets]);

  /**
   * Calculate the spent amount for a specific budget by id.
   * @param {string} id
   * @returns {number}
   */
  const calculateSpentBudget = useCallback((id) => {
    const budget = enrichedBudgets.find(b => b.id === id);
    if (!budget) return 0;
    return budget.spent;
  }, [enrichedBudgets]);

  /**
   * Calculate progress (0–100) as a percentage of limit spent.
   * Capped at 100 when over-budget.
   * @param {string} id
   * @returns {number}
   */
  const calculateBudgetProgress = useCallback((id) => {
    const budget = enrichedBudgets.find(b => b.id === id);
    if (!budget || budget.monthlyLimit <= 0) return 0;
    const pct = (budget.spent / budget.monthlyLimit) * 100;
    return parseFloat(Math.min(pct, 100).toFixed(2));
  }, [enrichedBudgets]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state (now enriched)
    budgets: enrichedBudgets,
    // Mutations
    addBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    clearBudgets,
    // Settings
    includeSavings,
    toggleIncludeSavings,
    // Derived
    calculateRemainingBudget,
    calculateSpentBudget,
    calculateBudgetProgress,
  }), [
    enrichedBudgets,
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
  ]);

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

/**
 * useBudgetContext — internal hook.
 * Throws a descriptive error if called outside <BudgetProvider>.
 */
export function useBudgetContext() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgetContext must be called inside <BudgetProvider>');
  return ctx;
}

export default BudgetContext;
