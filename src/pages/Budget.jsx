import { useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import BudgetSummary from '../components/budget/BudgetSummary';
import BudgetTable from '../components/budget/BudgetTable';
import BudgetCard from '../components/budget/BudgetCard';
import BudgetModal from '../components/budget/BudgetModal';
import BudgetForm from '../components/budget/BudgetForm';
import Button from '../components/ui/Button';
import useBudget from '../hooks/useBudget';

// ── Icons ──────────────────────────────────────────────────────────────────

const PlusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
  </svg>
);

const TableIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path fillRule="evenodd" d="M1 3.75C1 2.784 1.784 2 2.75 2h10.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 13.25 14H2.75A1.75 1.75 0 0 1 1 12.25v-8.5ZM2.5 5v7.25c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V5h-11Zm0-1.5h11V3.75a.25.25 0 0 0-.25-.25H2.75a.25.25 0 0 0-.25.25V3.5Z" clipRule="evenodd" />
  </svg>
);

const GridIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M1 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3ZM9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V3ZM1 11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2ZM9 11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2Z" />
  </svg>
);

// ── Inner page (consumes BudgetContext) ────────────────────────────────────

function BudgetInner() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();
  const [addOpen,    setAddOpen]    = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [delBudget,  setDelBudget]  = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [viewMode,   setViewMode]   = useState('table'); // 'table' | 'grid'

  const handleAdd = useCallback((values) => {
    setSaving(true);
    addBudget({ ...values, spent: 0 });
    setSaving(false);
    setAddOpen(false);
  }, [addBudget]);

  const handleEdit = useCallback((values) => {
    if (!editBudget) return;
    setSaving(true);
    updateBudget(editBudget.id, { ...values, spent: editBudget.spent });
    setSaving(false);
    setEditBudget(null);
  }, [editBudget, updateBudget]);

  const handleDelete = useCallback(() => {
    if (!delBudget) return;
    deleteBudget(delBudget.id);
    setDelBudget(null);
  }, [delBudget, deleteBudget]);

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Budgets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Plan monthly spending limits and track your progress in real time.
          </p>
        </div>
        <Button
          id="open-add-budget-modal"
          variant="primary"
          size="md"
          onClick={() => setAddOpen(true)}
        >
          {PlusIcon}
          Add Budget
        </Button>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <BudgetSummary />

      {/* ── View toggle + count ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {budgets.length === 0 ? (
            <span className="text-slate-600">No budgets yet</span>
          ) : (
            <>
              <span className="font-semibold text-white">{budgets.length}</span>
              {' '}
              {budgets.length === 1 ? 'budget' : 'budgets'} configured
            </>
          )}
        </p>

        <div className="flex items-center gap-1 rounded-xl border border-surface-700/60 bg-surface-800 p-1">
          <button
            id="budget-view-table"
            type="button"
            onClick={() => setViewMode('table')}
            aria-pressed={viewMode === 'table'}
            aria-label="Table view"
            className={[
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              viewMode === 'table'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-slate-500 hover:text-slate-300',
            ].join(' ')}
          >
            {TableIcon}
          </button>
          <button
            id="budget-view-grid"
            type="button"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            className={[
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              viewMode === 'grid'
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-slate-500 hover:text-slate-300',
            ].join(' ')}
          >
            {GridIcon}
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {viewMode === 'table' ? (
        <BudgetTable />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-700/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-8 w-8 text-slate-500"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-white">No budgets yet</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Add your first budget using the button above to start planning your spending.
              </p>
            </div>
          ) : (
            budgets.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={() => setEditBudget(budget)}
                onDelete={() => setDelBudget(budget)}
              />
            ))
          )}
        </div>
      )}

      {/* ── Add modal ────────────────────────────────────────────────────── */}
      <BudgetModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Budget"
      >
        <BudgetForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={saving}
        />
      </BudgetModal>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      <BudgetModal
        isOpen={Boolean(editBudget)}
        onClose={() => setEditBudget(null)}
        title="Edit Budget"
      >
        <BudgetForm
          initialValues={editBudget}
          onSubmit={handleEdit}
          onCancel={() => setEditBudget(null)}
          loading={saving}
        />
      </BudgetModal>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      <BudgetModal
        isOpen={Boolean(delBudget)}
        onClose={() => setDelBudget(null)}
        title="Delete Budget"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-danger-500/20 bg-danger-500/5 p-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete the{' '}
              <span className="font-semibold text-white">
                "{delBudget?.category}"
              </span>{' '}
              budget? This action{' '}
              <span className="font-semibold text-danger-400">cannot be undone</span>.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
            <Button variant="ghost" onClick={() => setDelBudget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Budget</Button>
          </div>
        </div>
      </BudgetModal>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

/**
 * Budget — protected page wrapped in DashboardLayout.
 * BudgetContext is provided by App.jsx above the route tree.
 */
export default function Budget() {
  return (
    <DashboardLayout>
      <BudgetInner />
    </DashboardLayout>
  );
}
