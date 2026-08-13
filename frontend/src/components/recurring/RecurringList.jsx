import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useRecurring from '../../hooks/useRecurring';
import RecurringCard from './RecurringCard';
import RecurringModal from './RecurringModal';
import RecurringForm from './RecurringForm';
import { formatCurrency } from '../../utils/formatters';
import Button from '../ui/Button';

const RecurringList = memo(function RecurringList({
  initialType = 'ALL',
  showHeader = true,
  onAddNew,
}) {
  const {
    recurringTransactions,
    counts,
    loading,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    pauseRecurring,
    resumeRecurring,
    skipOccurrence,
    processDue,
  } = useRecurring();

  const [activeFilter, setActiveFilter] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showToast = (text, isError = false) => {
    setFeedback({ text, isError });
    setTimeout(() => setFeedback(null), 3500);
  };

  const filteredItems = useMemo(() => {
    return recurringTransactions.filter((item) => {
      // Type or status filter
      if (activeFilter === 'EXPENSE' && item.type !== 'EXPENSE') return false;
      if (activeFilter === 'INCOME' && item.type !== 'INCOME') return false;
      if (activeFilter === 'ACTIVE' && item.status !== 'ACTIVE') return false;
      if (activeFilter === 'PAUSED' && item.status !== 'PAUSED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchCategory = item.categoryName?.toLowerCase().includes(q);
        const matchMerchant = item.merchant?.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchMerchant) return false;
      }

      return true;
    });
  }, [recurringTransactions, activeFilter, searchQuery]);

  const handleFormSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingItem) {
        await updateRecurring(editingItem.id, values);
        showToast('Recurring schedule updated!');
      } else {
        await addRecurring(values);
        showToast('Recurring schedule created!');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save recurring schedule', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring schedule?')) return;
    try {
      await deleteRecurring(id);
      showToast('Recurring schedule deleted');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete schedule', true);
    }
  };

  const handlePause = async (id) => {
    try {
      await pauseRecurring(id);
      showToast('Schedule paused');
    } catch (err) {
      console.error(err);
      showToast('Failed to pause schedule', true);
    }
  };

  const handleResume = async (id) => {
    try {
      await resumeRecurring(id);
      showToast('Schedule resumed');
    } catch (err) {
      console.error(err);
      showToast('Failed to resume schedule', true);
    }
  };

  const handleSkip = async (id) => {
    try {
      await skipOccurrence(id);
      showToast('Advanced to next occurrence');
    } catch (err) {
      console.error(err);
      showToast('Failed to skip occurrence', true);
    }
  };

  const handleProcessDue = async () => {
    setProcessing(true);
    try {
      const res = await processDue();
      showToast(
        res.processed_count > 0
          ? `Processed ${res.processed_count} due recurring transaction(s)!`
          : 'All recurring schedules are up to date.'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to process due schedules', true);
    } finally {
      setProcessing(false);
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
      {/* Toast */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-md animate-fade-in ${
            feedback.isError
              ? 'border-rose-500/30 bg-rose-500/90 text-white'
              : 'border-emerald-500/30 bg-emerald-600/90 text-white'
          }`}
        >
          <span>{feedback.isError ? '⚠️' : '✅'}</span>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header & Metric Row */}
      {showHeader && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-surface-700 bg-surface-800/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
              Active Schedules
            </p>
            <p className="mt-1 text-2xl font-bold text-white tabular-nums">
              {counts.total_active}
            </p>
            <p className="mt-0.5 text-xs text-surface-500">
              {counts.paused_count} paused
            </p>
          </div>

          <div className="rounded-2xl border border-danger-500/20 bg-danger-500/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-danger-400">
              Monthly Rec. Expense
            </p>
            <p className="mt-1 text-2xl font-bold text-danger-400 tabular-nums font-mono">
              {formatCurrency(counts.total_monthly_recurring_expense)}
            </p>
            <p className="mt-0.5 text-xs text-surface-500">
              {counts.active_expenses} active plans
            </p>
          </div>

          <div className="rounded-2xl border border-success-500/20 bg-success-500/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-success-400">
              Monthly Rec. Income
            </p>
            <p className="mt-1 text-2xl font-bold text-success-400 tabular-nums font-mono">
              {formatCurrency(counts.total_monthly_recurring_income)}
            </p>
            <p className="mt-0.5 text-xs text-surface-500">
              {counts.active_income} active plans
            </p>
          </div>

          <div className="rounded-2xl border border-surface-700 bg-surface-800/80 p-4 flex flex-col justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
              Auto Engine
            </p>
            <button
              type="button"
              onClick={handleProcessDue}
              disabled={processing}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-surface-700 hover:bg-surface-600 px-3 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <span className={processing ? 'animate-spin' : ''}>🔄</span>
              {processing ? 'Processing...' : 'Run Due Now'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter and Action Bar */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recurring schedules..."
            className="input w-full pl-9 text-xs"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl bg-surface-800 p-1 border border-surface-700">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'EXPENSE', label: 'Expenses' },
              { id: 'INCOME', label: 'Income' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'PAUSED', label: 'Paused' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white text-surface-950 shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
              if (onAddNew) onAddNew();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Schedule Recurring
          </Button>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <AnimatePresence mode="wait">
      {loading && recurringTransactions.length === 0 ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 text-center text-surface-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-600 border-t-brand-400 mb-3"></div>
          <p className="text-sm">Loading recurring schedules...</p>
        </motion.div>
      ) : filteredItems.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-700 bg-surface-800/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-800 text-2xl text-surface-400 mb-3 shadow-inner">
            🔄
          </div>
          <h3 className="text-base font-bold text-white">No Recurring Schedules Found</h3>
          <p className="mt-1 text-xs text-surface-400 max-w-sm">
            {searchQuery
              ? 'No schedules match your search query.'
              : 'Automate your regular expenses (rent, bills, subscriptions) or income (salary, retainers).'}
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-5"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            Create Your First Schedule
          </Button>
        </motion.div>
      ) : (
        <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onEdit={(it) => {
                setEditingItem(it);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
              onPause={handlePause}
              onResume={handleResume}
              onSkip={handleSkip}
            />
          ))}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Recurring Schedule' : 'New Recurring Schedule'}
      >
        <RecurringForm
          initialData={editingItem}
          defaultType={activeFilter === 'INCOME' ? 'INCOME' : 'EXPENSE'}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          loading={saving}
        />
      </RecurringModal>
    </motion.div>
  );
});

export default RecurringList;
