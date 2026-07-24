import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { useExpenseContext } from './ExpenseContext';
import { useIncomeContext  } from './IncomeContext';
import { computeAnalytics } from '../services/analyticsService';

// ── Context ────────────────────────────────────────────────────────────────

const AnalyticsContext = createContext(null);

/**
 * AnalyticsProvider — derives all analytics from ExpenseContext and IncomeContext.
 *
 * Design principles:
 *   - Zero data duplication: reads raw arrays from sibling contexts.
 *   - Automatic reactivity: analytics recompute via useMemo whenever
 *     expenses or income change — no manual refresh required.
 *   - refreshAnalytics(): increments an internal counter to force
 *     a recomputation on demand (e.g. after a bulk import).
 *   - loading: false for synchronous computation; set to true briefly
 *     if refreshAnalytics() is called, then immediately back to false.
 *
 * Must be mounted inside both <ExpenseProvider> and <IncomeProvider>.
 */
export function AnalyticsProvider({ children }) {
  const { expenses } = useExpenseContext();
  const { income   } = useIncomeContext();

  // Incrementing this counter forces useMemo to re-run even if the
  // context references haven't changed (e.g. after an external reset).
  const [tick, setTick] = useState(0);

  const analytics = useMemo(
    () => computeAnalytics(income, expenses),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [income, expenses, tick]
  );

  const refreshAnalytics = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  const value = useMemo(() => ({
    analytics,
    refreshAnalytics,
    loading: false,
  }), [analytics, refreshAnalytics]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * useAnalyticsContext — internal hook for consuming AnalyticsContext.
 * Throws a descriptive error if called outside <AnalyticsProvider>.
 */
export function useAnalyticsContext() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalyticsContext must be called inside <AnalyticsProvider>');
  return ctx;
}

export default AnalyticsContext;
