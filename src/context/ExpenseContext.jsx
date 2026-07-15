import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import {
  loadExpenses,
  saveExpenses,
  clearExpenses as storageClear,
  buildExpense,
} from '../services/expenseStorage';

// ── Action types ───────────────────────────────────────────────────────────

const ADD     = 'ADD';
const UPDATE  = 'UPDATE';
const DELETE  = 'DELETE';
const CLEAR   = 'CLEAR';
const SEARCH  = 'SEARCH';
const FILTER  = 'FILTER';
const SORT    = 'SORT';

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_FILTERS = {
  category:      '',
  paymentMethod: '',
  dateFrom:      '',
  dateTo:        '',
};

function makeInitialState() {
  return {
    expenses:    loadExpenses(),
    searchQuery: '',
    filters:     INITIAL_FILTERS,
    sortOrder:   'newest',   // newest | oldest | highest | lowest
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case ADD: {
      const next = [action.payload, ...state.expenses];
      saveExpenses(next);
      return { ...state, expenses: next };
    }

    case UPDATE: {
      const next = state.expenses.map(e =>
        e.id === action.payload.id ? action.payload : e
      );
      saveExpenses(next);
      return { ...state, expenses: next };
    }

    case DELETE: {
      const next = state.expenses.filter(e => e.id !== action.id);
      saveExpenses(next);
      return { ...state, expenses: next };
    }

    case CLEAR: {
      storageClear();
      return { ...state, expenses: [] };
    }

    case SEARCH:
      return { ...state, searchQuery: action.query };

    case FILTER:
      return { ...state, filters: { ...state.filters, ...action.partial } };

    case SORT:
      return { ...state, sortOrder: action.order };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

const ExpenseContext = createContext(null);

/**
 * ExpenseProvider — wraps the app and makes expense state available everywhere.
 *
 * Persists to localStorage automatically on every mutation.
 * Restores state from localStorage on first render.
 */
export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addExpense = useCallback((values) => {
    const expense = buildExpense(values);
    dispatch({ type: ADD, payload: expense });
    return expense;
  }, []);

  const updateExpense = useCallback((id, values) => {
    const existing = state.expenses.find(e => e.id === id);
    if (!existing) return;
    const updated = buildExpense(values, id, existing.createdAt);
    dispatch({ type: UPDATE, payload: updated });
    return updated;
  }, [state.expenses]);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: DELETE, id });
  }, []);

  const getExpense = useCallback((id) => {
    return state.expenses.find(e => e.id === id) ?? null;
  }, [state.expenses]);

  const clearExpenses = useCallback(() => {
    dispatch({ type: CLEAR });
  }, []);

  // ── Search / filter / sort ─────────────────────────────────────────────

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: SEARCH, query });
  }, []);

  const setFilters = useCallback((partial) => {
    dispatch({ type: FILTER, partial });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: FILTER, partial: INITIAL_FILTERS });
    dispatch({ type: SEARCH, query: '' });
    dispatch({ type: SORT, order: 'newest' });
  }, []);

  const setSortOrder = useCallback((order) => {
    dispatch({ type: SORT, order });
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────

  const processedExpenses = useMemo(() => {
    let list = [...state.expenses];

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      list = list.filter(
        e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      );
    }

    const { category, paymentMethod, dateFrom, dateTo } = state.filters;
    if (category)      list = list.filter(e => e.category      === category);
    if (paymentMethod) list = list.filter(e => e.paymentMethod === paymentMethod);
    if (dateFrom)      list = list.filter(e => e.date          >= dateFrom);
    if (dateTo)        list = list.filter(e => e.date          <= dateTo);

    switch (state.sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);           break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);           break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));  break;
    }

    return list;
  }, [state.expenses, state.searchQuery, state.filters, state.sortOrder]);

  const summary = useMemo(() => {
    const { expenses } = state;
    if (!expenses.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = expenses.reduce((s, e) => s + e.amount, 0);
    const largest = Math.max(...expenses.map(e => e.amount));
    return { total, count: expenses.length, largest, average: total / expenses.length };
  }, [state.expenses]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    expenses:    state.expenses,
    searchQuery: state.searchQuery,
    filters:     state.filters,
    sortOrder:   state.sortOrder,
    // Derived
    processedExpenses,
    summary,
    // Mutations
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    clearExpenses,
    // Search / filter / sort
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
  }), [
    state,
    processedExpenses,
    summary,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    clearExpenses,
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
  ]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

/**
 * useExpenseContext — internal hook.
 * Throws a descriptive error if called outside <ExpenseProvider>.
 */
export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenseContext must be called inside <ExpenseProvider>');
  return ctx;
}

export default ExpenseContext;
