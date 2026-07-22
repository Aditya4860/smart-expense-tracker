import {
  createContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import {
  loadGoals,
  saveGoals,
  clearGoals as storageClear,
  buildGoal,
} from '../services/goalStorage';

// ── Action types ───────────────────────────────────────────────────────────

const ADD             = 'ADD';
const UPDATE          = 'UPDATE';
const DELETE          = 'DELETE';
const CLEAR           = 'CLEAR';
const UPDATE_PROGRESS = 'UPDATE_PROGRESS';

// ── Initial state ──────────────────────────────────────────────────────────

function makeInitialState() {
  return {
    goals: loadGoals(),
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case ADD: {
      const next = [action.payload, ...state.goals];
      saveGoals(next);
      return { ...state, goals: next };
    }

    case UPDATE: {
      const next = state.goals.map(g =>
        g.id === action.payload.id ? action.payload : g
      );
      saveGoals(next);
      return { ...state, goals: next };
    }

    case DELETE: {
      const next = state.goals.filter(g => g.id !== action.id);
      saveGoals(next);
      return { ...state, goals: next };
    }

    case CLEAR: {
      storageClear();
      return { ...state, goals: [] };
    }

    case UPDATE_PROGRESS: {
      const next = state.goals.map(g => {
        if (g.id !== action.payload.id) return g;
        return {
          ...g,
          currentAmount: Math.min(g.targetAmount, Math.max(0, action.payload.newAmount)),
          updatedAt: new Date().toISOString()
        };
      });
      saveGoals(next);
      return { ...state, goals: next };
    }

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

const GoalContext = createContext(null);

/**
 * GoalProvider — wraps the app and makes goal state available everywhere.
 *
 * Persists to localStorage automatically on every mutation.
 * Restores state from localStorage on first render.
 */
export function GoalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addGoal = useCallback((values) => {
    const goal = buildGoal(values);
    dispatch({ type: ADD, payload: goal });
    return goal;
  }, []);

  const updateGoal = useCallback((id, values) => {
    const existing = state.goals.find(g => g.id === id);
    if (!existing) return;
    const updated = buildGoal(values, id, existing.createdAt);
    dispatch({ type: UPDATE, payload: updated });
    return updated;
  }, [state.goals]);

  const deleteGoal = useCallback((id) => {
    dispatch({ type: DELETE, id });
  }, []);

  const getGoal = useCallback((id) => {
    return state.goals.find(g => g.id === id) ?? null;
  }, [state.goals]);

  const updateProgress = useCallback((id, newAmount) => {
    dispatch({ type: UPDATE_PROGRESS, payload: { id, newAmount } });
  }, []);

  // ── Derived computations ───────────────────────────────────────────────

  const calculateProgress = useCallback((id) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return 0;
    const target = Number(goal.targetAmount) || 0;
    const current = Number(goal.currentAmount) || 0;
    if (target <= 0) return 0;
    const pct = (current / target) * 100;
    return parseFloat(Math.min(pct, 100).toFixed(2)) || 0;
  }, [state.goals]);

  const calculateRemainingAmount = useCallback((id) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return 0;
    const target = Number(goal.targetAmount) || 0;
    const current = Number(goal.currentAmount) || 0;
    return parseFloat(Math.max(0, target - current).toFixed(2)) || 0;
  }, [state.goals]);

  const calculateRemainingMonths = useCallback((id) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return 0;
    const now = new Date();
    const target = new Date(goal.targetDate);
    if (target <= now) return 0;
    const diffTime = Math.abs(target - now);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
  }, [state.goals]);

  const calculateMonthlyTarget = useCallback((id) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return 0;
    const target = Number(goal.targetAmount) || 0;
    const current = Number(goal.currentAmount) || 0;
    const remainingAmt = Math.max(0, target - current);
    const remainingMths = calculateRemainingMonths(id);
    if (remainingMths <= 0) return remainingAmt;
    return parseFloat((remainingAmt / remainingMths).toFixed(2));
  }, [state.goals, calculateRemainingMonths]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    goals: state.goals,
    // Mutations
    addGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    updateProgress,
    // Derived computations
    calculateProgress,
    calculateRemainingAmount,
    calculateRemainingMonths,
    calculateMonthlyTarget
  }), [
    state.goals,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    updateProgress,
    calculateProgress,
    calculateRemainingAmount,
    calculateRemainingMonths,
    calculateMonthlyTarget
  ]);

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
}

export default GoalContext;
