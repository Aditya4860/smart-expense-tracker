import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardLayout from '../layouts/DashboardLayout';
import ExpenseTable from '../components/expenses/ExpenseTable';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseSearch from '../components/expenses/ExpenseSearch';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import useExpenses from '../hooks/useExpenses';
import { formatCurrency } from '../utils/formatters';


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

import { useSearchParams } from 'react-router-dom';
import RecurringList from '../components/recurring/RecurringList';

function ExpensesInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'recurring' ? 'recurring' : 'all';

  const { addExpense, summary, filters } = useExpenses();
  const [addOpen,     setAddOpen]     = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saving,      setSaving]      = useState(false);

  const activeFilters = Object.values(filters).some(Boolean);

  const handleAdd = useCallback(async (values) => {
    setSaving(true);
    try {
      await addExpense(values);
      setAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [addExpense]);

  const handleTabChange = (tab) => {
    if (tab === 'recurring') {
      setSearchParams({ tab: 'recurring' });
    } else {
      setSearchParams({});
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track, search and manage all your spending and recurring commitments in one place.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-surface-800 p-1 border border-surface-700">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-surface-950 shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              All Expenses
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('recurring')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'recurring'
                  ? 'bg-white text-surface-950 shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              🔄 Recurring Schedules
            </button>
          </div>

          {activeTab === 'all' && (
            <Button
              id="open-add-expense-modal"
              variant="primary"
              size="md"
              onClick={() => setAddOpen(true)}
            >
              {PlusIcon}
              Add Expense
            </Button>
          )}
        </div>
      </motion.div>

      {activeTab === 'recurring' ? (
        <motion.div variants={itemVariants}>
          <RecurringList initialType="EXPENSE" />
        </motion.div>
      ) : (
        <>
          {/* ── Summary row ─────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              id="stat-total"
              label="Total Spent"
              value={formatCurrency(summary.total)}
              sub={`${summary.count} ${summary.count === 1 ? 'expense' : 'expenses'}`}
              valueCls="text-danger-400"
            />
            <StatCard
              id="stat-count"
              label="Transactions"
              value={String(summary.count)}
              sub="All time"
              valueCls="text-white"
            />
            <StatCard
              id="stat-largest"
              label="Largest"
              value={summary.count > 0 ? formatCurrency(summary.largest) : '—'}
              sub="Single expense"
              valueCls="text-yellow-400"
            />
            <StatCard
              id="stat-average"
              label="Average"
              value={summary.count > 0 ? formatCurrency(summary.average) : '—'}
              sub="Per transaction"
              valueCls="text-accent-400"
            />
          </motion.div>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <ExpenseSearch />
            </div>
            <div className="shrink-0">
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
          </motion.div>

          {/* ── Filters panel ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div 
                id="expense-filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ExpenseFilters onClose={() => setFiltersOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Table ───────────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <ExpenseTable />
          </motion.div>

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
        </>
      )}
    </motion.div>
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
