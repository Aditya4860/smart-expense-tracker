import { useContext } from 'react';
import GoalContext from '../context/GoalContext';

/**
 * useGoals — standard hook to consume GoalContext.
 * Throws a descriptive error if called outside <GoalProvider>.
 */
export default function useGoals() {
  const ctx = useContext(GoalContext);
  if (!ctx) {
    throw new Error('useGoals must be called inside <GoalProvider>');
  }
  return ctx;
}
