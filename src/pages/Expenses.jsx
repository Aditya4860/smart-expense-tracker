import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ExpenseSummary from '../components/expenses/ExpenseSummary';
import ExpenseSearch from '../components/expenses/ExpenseSearch';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Button from '../components/ui/Button';
import useExpenses from '../hooks/useExpenses';

/**
 * ExpensesInner — consumes ExpenseContext (already provided by App).
 */
function ExpensesInner() {
  const { addExpense } = useExpenses();
  const [modalOpen,    setModalOpen]    = useState(false);
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const [saving,       setSaving]       = useState(false);

  async function handleAdd(values) {
    setSaving(true);
    addExpense(values);
    setSaving(false);
    setModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage all your spending.</p>
        </div>
        <Button
          id="open-add-expense-modal"
          variant="primary"
          size="md"
          onClick={() => setModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Add Expense
        </Button>
      </div>

      {/* Summary cards */}
      <ExpenseSummary />

      {/* Toolbar: search + filter toggle */}
      <div className="flex items-center gap-3">
        <ExpenseSearch />
        <Button
          id="toggle-filters"
          variant="secondary"
          size="md"
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
          aria-controls="expense-filters-panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M14 2H2a1 1 0 0 0-.894 1.447L5 10.236V14a1 1 0 0 0 1.447.894l4-2A1 1 0 0 0 11 12V10.236l3.894-6.789A1 1 0 0 0 14 2Z" />
          </svg>
          Filters
        </Button>
      </div>

      {/* Collapsible filters panel */}
      {filtersOpen && (
        <div id="expense-filters-panel">
          <ExpenseFilters onClose={() => setFiltersOpen(false)} />
        </div>
      )}

      {/* Table */}
      <ExpenseTable />

      {/* Add expense modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Expense"
      >
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </ExpenseModal>
    </div>
  );
}

/**
 * Expenses — page wrapper with DashboardLayout.
 */
export default function Expenses() {
  return (
    <DashboardLayout>
      <ExpensesInner />
    </DashboardLayout>
  );
}
