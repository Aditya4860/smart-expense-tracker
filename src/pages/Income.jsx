import { useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import IncomeSummary from '../components/income/IncomeSummary';
import IncomeTable from '../components/income/IncomeTable';
import IncomeModal from '../components/income/IncomeModal';
import IncomeForm from '../components/income/IncomeForm';
import Button from '../components/ui/Button';
import useIncome from '../hooks/useIncome';

// ── Icons ──────────────────────────────────────────────────────────────────

const PlusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
  </svg>
);

// ── Search input (inline — no separate component needed) ───────────────────

function IncomeSearch() {
  const { searchQuery, setSearchQuery } = useIncome();

  return (
    <div className="relative flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
      </svg>
      <input
        id="income-search"
        type="search"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search by title or category…"
        aria-label="Search income records"
        autoComplete="off"
        className="input h-10 w-full pl-9 pr-4 text-sm"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Inner page (consumes IncomeContext) ────────────────────────────────────

function IncomeInner() {
  const { addIncome } = useIncome();
  const [addOpen, setAddOpen] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleAdd = useCallback((values) => {
    setSaving(true);
    addIncome(values);
    setSaving(false);
    setAddOpen(false);
  }, [addIncome]);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Income</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track all your income sources in one place.
          </p>
        </div>
        <Button
          id="open-add-income-modal"
          variant="primary"
          size="md"
          onClick={() => setAddOpen(true)}
        >
          {PlusIcon}
          Add Income
        </Button>
      </div>

      {/* Summary cards */}
      <IncomeSummary />

      {/* Search toolbar */}
      <IncomeSearch />

      {/* Table */}
      <IncomeTable />

      {/* Add income modal */}
      <IncomeModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Income"
      >
        <IncomeForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={saving}
        />
      </IncomeModal>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

/**
 * Income — protected page wrapped in DashboardLayout.
 * IncomeContext is provided by App.jsx above the route tree.
 */
export default function Income() {
  return (
    <DashboardLayout>
      <IncomeInner />
    </DashboardLayout>
  );
}
