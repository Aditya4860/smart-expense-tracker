import { useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseSearch from '../components/expenses/ExpenseSearch';
import Button from '../components/ui/Button';
import useExpenses from '../hooks/useExpenses';

// ── Stat card ──────────────────────────────────────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

function StatCard({ id, label, value, sub, accentClass }) {
  return (
    <div
      id={id}
      className="rounded-2xl border border-surface-700/60 bg-surface-800 p-5 shadow-card-dark"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${accentClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ── Filter icon ────────────────────────────────────────────────────────────

const FilterIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M14 2H2a1 1 0 0 0-.894 1.447L5 10.236V14a1 1 0 0 0 1.447.894l4-2A1 1 0 0 0 11 12V10.236l3.894-6.789A1 1 0 0 0 14 2Z" />
  </svg>
);

const PlusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
  </svg>
);

// ── Inner page (consumes context) ──────────────────────────────────────────

function ExpensesInner() {
  const { addExpense, summary, filters } = useExpenses();
  const [addOpen,     setAddOpen]     = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saving,      setSaving]      = useState(false);

  const activeFilters = Object.values(filters).some(Boolean);

  const handleAdd = useCallback((values) => {
    setSaving(true);
    addExpense(values);
    setSaving(false);
    setAddOpen(false);
  }, [addExpense]);

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track, search and manage all your spending in one place.
          </p>
        </div>
        <Button
          id="open-add-expense-modal"
          variant="primary"
          size="md"
          onClick={() => setAddOpen(true)}
        >
          {PlusIcon}
          Add Expense
        </Button>
      </div>

      {/* ── Summary row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          id="stat-total"
          label="Total Spent"
          value={amountFmt.format(summary.total)}
          sub={`${summary.count} ${summary.count === 1 ? 'expense' : 'expenses'}`}
          accentClass="text-danger-400"
        />
        <StatCard
          id="stat-count"
          label="Transactions"
          value={String(summary.count)}
          sub="All time"
          accentClass="text-white"
        />
        <StatCard
          id="stat-largest"
          label="Largest"
          value={summary.count > 0 ? amountFmt.format(summary.largest) : '—'}
          sub="Single expense"
          accentClass="text-yellow-400"
        />
        <StatCard
          id="stat-average"
          label="Average"
          value={summary.count > 0 ? amountFmt.format(summary.average) : '—'}
          sub="Per transaction"
          accentClass="text-accent-400"
        />
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <ExpenseSearch />
        <Button
          id="toggle-expense-filters"
          variant={activeFilters ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
          aria-controls="expense-filters-panel"
        >
          {FilterIcon}
          Filters
          {activeFilters && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* ── Filters panel ───────────────────────────────────────────────── */}
      {filtersOpen && (
        <div id="expense-filters-panel">
          <ExpenseFilters onClose={() => setFiltersOpen(false)} />
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <ExpenseTable />

      {/* ── Add modal ───────────────────────────────────────────────────── */}
      <ExpenseModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Expense"
      >
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={saving}
        />
      </ExpenseModal>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

/**
 * Expenses — protected page wrapped in DashboardLayout.
 * ExpenseContext is provided by App.jsx above the route tree.
 */
export default function Expenses() {
  return (
    <DashboardLayout>
      <ExpensesInner />
    </DashboardLayout>
  );
}
