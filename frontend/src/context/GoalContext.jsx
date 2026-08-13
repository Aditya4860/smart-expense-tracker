import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { goalApi } from '../services/api/goalApi';
import { calculateGoalProgressRaw, calculateGoalRemainingRaw, calculateRemainingMonthsRaw } from '../utils/goalUtils';
import { useAuth } from './AuthContext';

const GoalContext = createContext(null);

export function GoalProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetching Data ───────────────────────────────────────────────────────

  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await goalApi.getGoals();
      setGoals(prev => {
        const optimistic = prev.filter(g => String(g.id).startsWith('temp-'));
        const merged = data.map(serverGoal => ({
          ...serverGoal,
          history: prev.find(g => g.id === serverGoal.id)?.history || [],
        }));
        return [...optimistic, ...merged];
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // ── Derived goals with dynamic currentAmount ───────────────

  const processedGoals = useMemo(() => {
    return goals.map(g => {
      const history = g.history || [];
      // Calculate current amount locally from history for real-time responsiveness,
      // falling back to backend's currentAmount if history is missing.
      const currentAmount = history.length > 0 
        ? history.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        : g.currentAmount;

      return {
        ...g,
        history,
        currentAmount
      };
    });
  }, [goals]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addGoal = useCallback(async (values) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticGoal = { 
      ...values, 
      id: tempId, 
      targetAmount: Number(values.targetAmount),
      currentAmount: 0,
      history: [],
      createdAt: new Date().toISOString()
    };
    
    setGoals(prev => [optimisticGoal, ...prev]);
    
    try {
      const created = await goalApi.createGoal(values);
      const newGoalWithHistory = { ...created, history: [] };
      setGoals(prev => prev.map(g => g.id === tempId ? newGoalWithHistory : g));
      return created;
    } catch (err) {
      setGoals(prev => prev.filter(g => g.id !== tempId));
      setError('Failed to create goal');
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (id, values) => {
    const original = goals.find(g => g.id === id);
    const optimisticGoal = { 
      ...original, 
      ...values, 
      targetAmount: Number(values.targetAmount) 
    };
    
    setGoals(prev => prev.map(g => g.id === id ? optimisticGoal : g));
    
    try {
      const updated = await goalApi.updateGoal(id, values);
      setGoals(prev => prev.map(g => g.id === id ? { ...updated, history: original.history } : g));
      return updated;
    } catch (err) {
      if (original) {
        setGoals(prev => prev.map(g => g.id === id ? original : g));
      }
      setError('Failed to update goal');
      throw err;
    }
  }, [goals]);

  const deleteGoal = useCallback(async (id) => {
    const original = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    
    try {
      await goalApi.deleteGoal(id);
    } catch (err) {
      if (original) {
        setGoals(prev => [original, ...prev]);
      }
      setError('Failed to delete goal');
      throw err;
    }
  }, [goals]);

  const getGoal = useCallback((id) => {
    return processedGoals.find(g => g.id === id) ?? null;
  }, [processedGoals]);

  const updateProgress = useCallback((id, newAmount) => {
    console.warn('updateProgress is deprecated in favor of addGoalSaving');
  }, []);

  const addGoalSaving = useCallback(async (goalId, amount, type = 'custom', notes = '', date = null) => {
    const originalGoal = goals.find(g => g.id === goalId);
    if (!originalGoal) return;

    const tempContribId = `temp-contrib-${crypto.randomUUID()}`;
    const targetDate = date || new Date().toISOString();
    
    const optimisticContrib = {
      id: tempContribId,
      goalId,
      amount: Number(amount),
      date: targetDate,
      type: 'savings_contribution',
      notes
    };

    // Optimistic Update
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        history: [optimisticContrib, ...g.history].sort((a, b) => new Date(b.date) - new Date(a.date))
      };
    }));

    try {
      const createdContrib = await goalApi.addContribution(goalId, amount, targetDate);
      
      // Update with real ID from backend
      setGoals(prev => prev.map(g => {
        if (g.id !== goalId) return g;
        const newHistory = g.history.map(c => c.id === tempContribId ? createdContrib : c);
        return {
          ...g,
          history: newHistory.sort((a, b) => new Date(b.date) - new Date(a.date))
        };
      }));
    } catch (err) {
      // Rollback
      setGoals(prev => prev.map(g => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          history: g.history.filter(c => c.id !== tempContribId)
        };
      }));
      setError('Failed to add saving contribution');
      throw err;
    }
  }, [goals]);

  const clearGoals = useCallback(() => {
    goals.forEach(g => deleteGoal(g.id).catch(() => {}));
  }, [goals, deleteGoal]);

  // ── Derived computations ───────────────────────────────────────────────

  const calculateProgress = useCallback((id) => {
    const goal = processedGoals.find(g => g.id === id);
    if (!goal) return 0;
    return calculateGoalProgressRaw(goal.currentAmount, goal.targetAmount);
  }, [processedGoals]);

  const calculateRemainingAmount = useCallback((id) => {
    const goal = processedGoals.find(g => g.id === id);
    if (!goal) return 0;
    return calculateGoalRemainingRaw(goal.currentAmount, goal.targetAmount);
  }, [processedGoals]);

  const calculateRemainingMonths = useCallback((id) => {
    const goal = processedGoals.find(g => g.id === id);
    if (!goal) return 0;
    return calculateRemainingMonthsRaw(goal.targetDate);
  }, [processedGoals]);

  const calculateMonthlyTarget = useCallback((id) => {
    const goal = processedGoals.find(g => g.id === id);
    if (!goal) return 0;
    
    const remainingAmt = calculateGoalRemainingRaw(goal.currentAmount, goal.targetAmount);
    const remainingMths = calculateRemainingMonthsRaw(goal.targetDate);
    
    if (remainingMths <= 0) return remainingAmt;
    return parseFloat((remainingAmt / remainingMths).toFixed(2));
  }, [processedGoals]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    goals: processedGoals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    clearGoals,
    updateProgress,
    addGoalSaving,
    calculateProgress,
    calculateRemainingAmount,
    calculateRemainingMonths,
    calculateMonthlyTarget,
    refreshGoals: fetchGoals
  }), [
    processedGoals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoal,
    clearGoals,
    updateProgress,
    addGoalSaving,
    calculateProgress,
    calculateRemainingAmount,
    calculateRemainingMonths,
    calculateMonthlyTarget,
    fetchGoals
  ]);

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoals must be called inside <GoalProvider>');
  return ctx;
}

export default GoalContext;
