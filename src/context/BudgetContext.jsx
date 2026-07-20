import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import {
  loadBudgets,
  saveBudgets,
  clearBudgets as storageClear,
  buildBudget,
} from '../services/budgetStorage';

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

  /**
   * Calculate the remaining amount for a specific budget by id.
   * @param {string} id
   * @returns {number}
   */
  const calculateRemainingBudget = useCallback((id) => {
    const budget = state.budgets.find(b => b.id === id);
    if (!budget) return 0;
    return parseFloat((budget.monthlyLimit - budget.spent).toFixed(2));
  }, [state.budgets]);

  /**
   * Calculate the spent amount for a specific budget by id.
   * @param {string} id
   * @returns {number}
   */
  const calculateSpentBudget = useCallback((id) => {
    const budget = state.budgets.find(b => b.id === id);
    if (!budget) return 0;
    return budget.spent;
  }, [state.budgets]);

  /**
   * Calculate progress (0–100) as a percentage of limit spent.
   * Capped at 100 when over-budget.
   * @param {string} id
   * @returns {number}
   */
  const calculateBudgetProgress = useCallback((id) => {
    const budget = state.budgets.find(b => b.id === id);
    if (!budget || budget.monthlyLimit <= 0) return 0;
    const pct = (budget.spent / budget.monthlyLimit) * 100;
    return parseFloat(Math.min(pct, 100).toFixed(2));
  }, [state.budgets]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    budgets: state.budgets,
    // Mutations
    addBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    clearBudgets,
    // Derived
    calculateRemainingBudget,
    calculateSpentBudget,
    calculateBudgetProgress,
  }), [
    state.budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudget,
    clearBudgets,
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
