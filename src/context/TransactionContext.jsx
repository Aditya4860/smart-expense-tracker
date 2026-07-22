import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  loadTransactions,
  saveTransactions,
  clearTransactions as storageClear,
  buildTransaction,
} from '../services/transactionStorage';

const ADD    = 'ADD';
const UPDATE = 'UPDATE';
const DELETE = 'DELETE';
const CLEAR  = 'CLEAR';

function makeInitialState() {
  return {
    transactions: loadTransactions(),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case ADD: {
      const next = [action.payload, ...state.transactions];
      saveTransactions(next);
      return { ...state, transactions: next };
    }
    case UPDATE: {
      const next = state.transactions.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      saveTransactions(next);
      return { ...state, transactions: next };
    }
    case DELETE: {
      const next = state.transactions.filter(t => t.id !== action.id);
      saveTransactions(next);
      return { ...state, transactions: next };
    }
    case CLEAR: {
      storageClear();
      return { ...state, transactions: [] };
    }
    default:
      return state;
  }
}

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, makeInitialState);

  const addTransaction = useCallback((values) => {
    const trx = buildTransaction(values);
    dispatch({ type: ADD, payload: trx });
    return trx;
  }, []);

  const updateTransaction = useCallback((id, values) => {
    const existing = state.transactions.find(t => t.id === id);
    if (!existing) return null;
    const updated = buildTransaction(values, id, existing.createdAt);
    dispatch({ type: UPDATE, payload: updated });
    return updated;
  }, [state.transactions]);

  const deleteTransaction = useCallback((id) => {
    dispatch({ type: DELETE, id });
  }, []);

  const clearTransactions = useCallback(() => {
    dispatch({ type: CLEAR });
  }, []);

  const value = useMemo(() => ({
    transactions: state.transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
  }), [
    state.transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
  ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactionContext must be called inside <TransactionProvider>');
  return ctx;
}

export default TransactionContext;
