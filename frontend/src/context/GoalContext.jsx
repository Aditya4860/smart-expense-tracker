import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loadGoals, saveGoals, clearGoals as storageClear, buildGoal } from '../services/goalStorage';
import { useTransactionContext } from './TransactionContext';
import { calculateGoalProgressRaw, calculateGoalRemainingRaw, calculateRemainingMonthsRaw } from '../utils/goalUtils';

const GoalContext = createContext(null);

export function GoalProvider({ children }) {
  const [goals, setGoalsRaw] = useState(() => loadGoals());
  const { transactions, addTransaction } = useTransactionContext();

  // ── Derived goals with dynamic history and currentAmount ───────────────

  const processedGoals = useMemo(() => {
    return goals.map(g => {
      // Find all savings contributions for this goal
      const history = transactions
        .filter(t => t.type === 'savings_contribution' && t.linkedGoalId === g.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

      // Sum them up
      const currentAmount = history.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      return {
        ...g,
        history,
        currentAmount
      };
    });
  }, [goals, transactions]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addGoal = useCallback((values) => {
    const goal = buildGoal(values);
    setGoalsRaw(prev => {
      const next = [goal, ...prev];
      saveGoals(next);
      return next;
    });
    return goal;
  }, []);

  const updateGoal = useCallback((id, values) => {
    let updated;
    setGoalsRaw(prev => {
      const existing = prev.find(g => g.id === id);
      if (!existing) return prev;
      updated = buildGoal(values, id, existing.createdAt);
      const next = prev.map(g => g.id === id ? updated : g);
      saveGoals(next);
      return next;
    });
    return updated;
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoalsRaw(prev => {
      const next = prev.filter(g => g.id !== id);
      saveGoals(next);
      return next;
    });
  }, []);

  const getGoal = useCallback((id) => {
    return processedGoals.find(g => g.id === id) ?? null;
  }, [processedGoals]);

  // Deprecated, keep for backwards compatibility but it shouldn't be used
  const updateProgress = useCallback((id, newAmount) => {
    console.warn('updateProgress is deprecated in favor of addGoalSaving');
  }, []);

  const addGoalSaving = useCallback((goalId, amount, type = 'custom', notes = '', date = null) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    // Dispatch to TransactionContext! This automatically updates processedGoals via useMemo
    addTransaction({
      type: 'savings_contribution',
      amount: Number(amount),
      category: 'Savings',
      title: `Transfer to ${goal.title}`,
      date: date || new Date().toISOString(),
      notes: notes || `Goal Contribution (${type})`,
      linkedGoalId: goalId
    });
  }, [goals, addTransaction]);

  const clearGoals = useCallback(() => {
    storageClear();
    setGoalsRaw([]);
  }, []);

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
    calculateMonthlyTarget
  }), [
    processedGoals,
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
    calculateMonthlyTarget
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
