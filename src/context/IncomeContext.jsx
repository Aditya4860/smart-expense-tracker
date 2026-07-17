import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import {
  loadIncome,
  saveIncome,
  clearIncome as storageClear,
  buildIncome,
} from '../services/incomeStorage';

// ── Action types ───────────────────────────────────────────────────────────

const ADD    = 'ADD';
const UPDATE = 'UPDATE';
const DELETE = 'DELETE';
const CLEAR  = 'CLEAR';
const SEARCH = 'SEARCH';
const FILTER = 'FILTER';
const SORT   = 'SORT';

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_FILTERS = {
  category: '',
  source:   '',
  dateFrom: '',
  dateTo:   '',
};

function makeInitialState() {
  return {
    income:      loadIncome(),
    searchQuery: '',
    filters:     INITIAL_FILTERS,
    sortOrder:   'newest',   // newest | oldest | highest | lowest
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case ADD: {
      const next = [action.payload, ...state.income];
      saveIncome(next);
      return { ...state, income: next };
    }

    case UPDATE: {
      const next = state.income.map(r =>
        r.id === action.payload.id ? action.payload : r
      );
      saveIncome(next);
      return { ...state, income: next };
    }

    case DELETE: {
      const next = state.income.filter(r => r.id !== action.id);
      saveIncome(next);
      return { ...state, income: next };
    }

    case CLEAR: {
      storageClear();
      return { ...state, income: [] };
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

const IncomeContext = createContext(null);

/**
 * IncomeProvider — wraps the app and makes income state available everywhere.
 *
 * Persists to localStorage automatically on every mutation.
 * Restores state from localStorage on first render.
 */
export function IncomeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  // ── Mutations ──────────────────────────────────────────────────────────

  const addIncome = useCallback((values) => {
    const record = buildIncome(values);
    dispatch({ type: ADD, payload: record });
    return record;
  }, []);

  const updateIncome = useCallback((id, values) => {
    const existing = state.income.find(r => r.id === id);
    if (!existing) return;
    const updated = buildIncome(values, id, existing.createdAt);
    dispatch({ type: UPDATE, payload: updated });
    return updated;
  }, [state.income]);

  const deleteIncome = useCallback((id) => {
    dispatch({ type: DELETE, id });
  }, []);

  const getIncome = useCallback((id) => {
    return state.income.find(r => r.id === id) ?? null;
  }, [state.income]);

  const clearIncome = useCallback(() => {
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

  const processedIncome = useMemo(() => {
    let list = [...state.income];

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      list = list.filter(
        r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
      );
    }

    const { category, source, dateFrom, dateTo } = state.filters;
    if (category) list = list.filter(r => r.category === category);
    if (source)   list = list.filter(r => r.source.toLowerCase().includes(source.toLowerCase()));
    if (dateFrom) list = list.filter(r => r.date >= dateFrom);
    if (dateTo)   list = list.filter(r => r.date <= dateTo);

    switch (state.sortOrder) {
      case 'oldest':  list.sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'highest': list.sort((a, b) => b.amount - a.amount);           break;
      case 'lowest':  list.sort((a, b) => a.amount - b.amount);           break;
      default:        list.sort((a, b) => b.date.localeCompare(a.date));  break;
    }

    return list;
  }, [state.income, state.searchQuery, state.filters, state.sortOrder]);

  const summary = useMemo(() => {
    const { income } = state;
    if (!income.length) return { total: 0, count: 0, largest: 0, average: 0 };
    const total   = income.reduce((s, r) => s + r.amount, 0);
    const largest = Math.max(...income.map(r => r.amount));
    return { total, count: income.length, largest, average: total / income.length };
  }, [state.income]);

  // ── Context value ──────────────────────────────────────────────────────

  const value = useMemo(() => ({
    // Raw state
    income:      state.income,
    searchQuery: state.searchQuery,
    filters:     state.filters,
    sortOrder:   state.sortOrder,
    // Derived
    processedIncome,
    summary,
    // Mutations
    addIncome,
    updateIncome,
    deleteIncome,
    getIncome,
    clearIncome,
    // Search / filter / sort
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
  }), [
    state,
    processedIncome,
    summary,
    addIncome,
    updateIncome,
    deleteIncome,
    getIncome,
    clearIncome,
    setSearchQuery,
    setFilters,
    resetFilters,
    setSortOrder,
  ]);

  return (
    <IncomeContext.Provider value={value}>
      {children}
    </IncomeContext.Provider>
  );
}

/**
 * useIncomeContext — internal hook.
 * Throws a descriptive error if called outside <IncomeProvider>.
 */
export function useIncomeContext() {
  const ctx = useContext(IncomeContext);
  if (!ctx) throw new Error('useIncomeContext must be called inside <IncomeProvider>');
  return ctx;
}

export default IncomeContext;
