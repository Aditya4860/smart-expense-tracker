/**
 * expenseService.js — localStorage-backed CRUD for expenses.
 *
 * All data is stored under a user-scoped key so accounts never share data.
 * Key format: `expenses_<userId>`
 *
 * Expense shape:
 * {
 *   id:          string   (nanoid-style)
 *   userId:      string
 *   amount:      number   (positive, in ₹)
 *   category:    string   (matches categories.js id)
 *   description: string
 *   date:        string   (ISO "YYYY-MM-DD")
 *   notes:       string   (optional)
 *   createdAt:   string   (ISO timestamp)
 *   updatedAt:   string   (ISO timestamp)
 * }
 */

function storageKey(userId) {
  return `expenses_${userId}`;
}

function generateId() {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(userId, expenses) {
  localStorage.setItem(storageKey(userId), JSON.stringify(expenses));
}

/**
 * getExpenses(userId) → Expense[] sorted newest-first by date.
 */
export function getExpenses(userId) {
  return readAll(userId).sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/**
 * addExpense(userId, payload) → Expense
 * payload: { amount, category, description, date, notes? }
 */
export function addExpense(userId, payload) {
  const now = new Date().toISOString();
  const expense = {
    id: generateId(),
    userId,
    amount:      Number(payload.amount),
    category:    payload.category,
    description: payload.description.trim(),
    date:        payload.date,
    notes:       payload.notes?.trim() ?? '',
    createdAt:   now,
    updatedAt:   now,
  };
  const all = readAll(userId);
  writeAll(userId, [...all, expense]);
  return expense;
}

/**
 * updateExpense(userId, id, patch) → Expense | null
 * patch: Partial<{ amount, category, description, date, notes }>
 */
export function updateExpense(userId, id, patch) {
  const all = readAll(userId);
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) return null;
  const updated = {
    ...all[idx],
    ...patch,
    amount:      patch.amount !== undefined ? Number(patch.amount) : all[idx].amount,
    description: patch.description !== undefined ? patch.description.trim() : all[idx].description,
    notes:       patch.notes !== undefined ? patch.notes.trim() : all[idx].notes,
    updatedAt:   new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeAll(userId, next);
  return updated;
}

/**
 * deleteExpense(userId, id) → void
 */
export function deleteExpense(userId, id) {
  const all = readAll(userId);
  writeAll(userId, all.filter(e => e.id !== id));
}

/**
 * getStats(userId) → { total, thisMonth, count, byCategory[] }
 *
 * byCategory: [{ category, total, count }] sorted by total desc
 */
export function getStats(userId) {
  const all = getExpenses(userId);
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let total = 0;
  let thisMonth = 0;
  const catMap = {};

  for (const e of all) {
    total += e.amount;

    const d = new Date(e.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      thisMonth += e.amount;
    }

    if (!catMap[e.category]) catMap[e.category] = { total: 0, count: 0 };
    catMap[e.category].total += e.amount;
    catMap[e.category].count += 1;
  }

  const byCategory = Object.entries(catMap)
    .map(([category, s]) => ({ category, ...s }))
    .sort((a, b) => b.total - a.total);

  return { total, thisMonth, count: all.length, byCategory };
}
