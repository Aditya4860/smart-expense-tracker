import { makeStorageHelpers } from '../utils/storageUtils';
import { loadExpenses } from './expenseStorage';
import { loadIncome } from './incomeStorage';
import { loadGoals, saveGoals } from './goalStorage';

const STORAGE_KEY = 'sxp_transactions_v1';
const MIGRATION_KEY = 'sxp_transactions_migrated_v1';

const storageHelpers = makeStorageHelpers(STORAGE_KEY, 'transactionStorage');

export function loadTransactions() {
  // Check if we need to migrate
  const hasMigrated = localStorage.getItem(MIGRATION_KEY) === 'true';
  
  if (!hasMigrated) {
    migrateData();
    localStorage.setItem(MIGRATION_KEY, 'true');
  }
  
  return storageHelpers.load();
}

export const saveTransactions = storageHelpers.save;
export const clearTransactions = storageHelpers.clear;

function migrateData() {
  const transactions = [];
  
  // 1. Migrate Expenses
  const expenses = loadExpenses();
  expenses.forEach(e => {
    transactions.push({
      ...e,
      type: 'expense'
    });
  });
  
  // 2. Migrate Income
  const income = loadIncome();
  income.forEach(i => {
    transactions.push({
      ...i,
      type: 'income'
    });
  });
  
  // 3. Migrate Goal History and Current Amounts
  const goals = loadGoals();
  let goalsModified = false;
  const migratedGoals = goals.map(g => {
    // If the goal has history, convert each history record to a transaction
    if (g.history && g.history.length > 0) {
      g.history.forEach(h => {
        transactions.push({
          id: h.id.replace('gol_sav_', 'trx_sav_'),
          type: 'savings_contribution',
          amount: h.amount,
          category: 'Savings',
          title: `Transfer to ${g.title}`,
          date: h.date.split('T')[0], // Extract YYYY-MM-DD
          notes: h.notes || `Goal Contribution (${h.type})`,
          linkedGoalId: g.id,
          createdAt: h.date,
          updatedAt: h.date
        });
      });
      goalsModified = true;
    } else if (g.currentAmount > 0) {
      // If there is a current amount but no history, create a synthetic transaction
      transactions.push({
        id: `trx_sav_init_${g.id}`,
        type: 'savings_contribution',
        amount: g.currentAmount,
        category: 'Savings',
        title: `Initial Transfer to ${g.title}`,
        date: g.createdAt.split('T')[0],
        notes: 'Initial goal balance',
        linkedGoalId: g.id,
        createdAt: g.createdAt,
        updatedAt: g.createdAt
      });
      goalsModified = true;
    }
    
    // Strip history and currentAmount from the goal as they are now calculated dynamically
    const { history, currentAmount, ...cleanGoal } = g;
    return cleanGoal;
  });
  
  // Save all transactions
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveTransactions(transactions);
  
  // Update goals if needed
  if (goalsModified) {
    saveGoals(migratedGoals);
  }
}

export function generateTransactionId() {
  return `trx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function buildTransaction(values, existingId, existingCreatedAt) {
  const now = new Date().toISOString();
  return {
    id:            existingId ?? generateTransactionId(),
    type:          values.type,
    title:         values.title?.trim(),
    amount:        parseFloat(parseFloat(values.amount).toFixed(2)),
    category:      values.category,
    date:          values.date,
    paymentMethod: values.paymentMethod ?? '',
    source:        values.source?.trim() ?? '',
    notes:         values.notes?.trim() ?? '',
    linkedGoalId:  values.linkedGoalId ?? null,
    createdAt:     existingCreatedAt ?? now,
    updatedAt:     now,
  };
}
