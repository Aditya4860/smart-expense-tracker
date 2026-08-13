import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardLayout from '../layouts/DashboardLayout';
import ReminderCard from '../components/reminders/ReminderCard';
import ReminderCalendar from '../components/reminders/ReminderCalendar';
import ReminderFormModal from '../components/reminders/ReminderFormModal';
import SnoozeModal from '../components/reminders/SnoozeModal';
import ReminderHistoryDrawer from '../components/reminders/ReminderHistoryDrawer';
import { reminderApi } from '../services/api/reminderApi';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [counts, setCounts] = useState({
    pending_count: 0,
    overdue_count: 0,
    completed_count: 0,
    total_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processingDue, setProcessingDue] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'calendar' | 'history'

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'ALL' | 'PENDING' | 'SNOOZED' | 'COMPLETED'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [snoozeReminder, setSnoozeReminder] = useState(null);
  const [historyReminder, setHistoryReminder] = useState(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [globalHistory, setGlobalHistory] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const [items, countData] = await Promise.all([
        reminderApi.getReminders(),
        reminderApi.getReminderCounts(),
      ]);
      setReminders(items);
      setCounts(countData);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleCreateOrUpdate = async (values) => {
    try {
      if (editingReminder) {
        await reminderApi.updateReminder(editingReminder.id, values);
        showToast('Reminder updated successfully!');
      } else {
        await reminderApi.createReminder(values);
        showToast('Reminder created successfully!');
      }
      setIsAddOpen(false);
      setEditingReminder(null);
      fetchReminders();
    } catch (err) {
      console.error('Save failed:', err);
      showToast('Failed to save reminder', true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await reminderApi.deleteReminder(id);
      showToast('Reminder deleted');
      fetchReminders();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete reminder', true);
    }
  };

  const handleComplete = async (id) => {
    try {
      await reminderApi.completeReminder(id);
      showToast('Marked as completed!');
      fetchReminders();
    } catch (err) {
      console.error(err);
      showToast('Failed to complete reminder', true);
    }
  };

  const handleSnooze = async (id, payload) => {
    try {
      await reminderApi.snoozeReminder(id, payload);
      showToast('Reminder snoozed');
      setSnoozeReminder(null);
      fetchReminders();
    } catch (err) {
      console.error(err);
      showToast('Failed to snooze reminder', true);
    }
  };

  const handleProcessDue = async () => {
    setProcessingDue(true);
    try {
      const res = await reminderApi.processDueReminders();
      showToast(
        res.notified_count > 0
          ? `Processed ${res.notified_count} due reminder(s)!`
          : 'All reminders up to date.'
      );
      fetchReminders();
    } catch (err) {
      console.error(err);
      showToast('Error checking due reminders', true);
    } finally {
      setProcessingDue(false);
    }
  };

  const handleOpenGlobalHistory = async () => {
    try {
      const hist = await reminderApi.getReminderHistory({ limit: 50 });
      setGlobalHistory(hist);
      setHistoryReminder(null);
      setIsHistoryDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg, isError = false) => {
    setFeedbackMsg({ text: msg, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Filter items
  const filteredReminders = reminders.filter((r) => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (statusFilter === 'PENDING' && r.status !== 'PENDING' && r.status !== 'SNOOZED') return false;
    if (statusFilter === 'COMPLETED' && r.status !== 'COMPLETED') return false;
    if (statusFilter === 'SNOOZED' && r.status !== 'SNOOZED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchDesc = r.description?.toLowerCase().includes(q);
      const matchCat = r.categoryName?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

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
    <DashboardLayout>
      <motion.div 
        className="space-y-6 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Toast Notification */}
        {feedbackMsg && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-md animate-fade-in ${
              feedbackMsg.isError
                ? 'border-rose-500/30 bg-rose-500/90 text-white'
                : 'border-emerald-500/30 bg-emerald-600/90 text-white'
            }`}
          >
            <span>{feedbackMsg.isError ? '⚠️' : '✅'}</span>
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Top Header & Quick Actions */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Reminders & Due Dates
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track bills, EMIs, subscriptions, and financial targets with auto-notifications.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleProcessDue}
              disabled={processingDue}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              <svg
                className={`w-4 h-4 text-indigo-500 ${processingDue ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{processingDue ? 'Checking...' : 'Check Due'}</span>
            </button>

            <button
              onClick={handleOpenGlobalHistory}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </button>

            <button
              onClick={() => {
                setEditingReminder(null);
                setIsAddOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-500 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Reminder</span>
            </button>
          </div>
        </motion.div>

        {/* Summary Metric Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                ⏰
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {counts.pending_count}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-50/30 p-4 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                Overdue
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse">
                ⚠️
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {counts.overdue_count}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Completed
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                ✅
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {counts.completed_count}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Tracked
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                📋
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {counts.total_count}
            </p>
          </div>
        </motion.div>

        {/* View Switcher & Filters */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          {/* View Mode Buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Card Grid</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Calendar</span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Types</option>
              <option value="BILL">📄 Bills</option>
              <option value="SUBSCRIPTION">🔁 Subscriptions</option>
              <option value="EMI">💳 EMIs</option>
              <option value="SAVINGS">💰 Savings</option>
              <option value="BUDGET">📊 Budgets</option>
              <option value="GOAL">🎯 Goals</option>
              <option value="CUSTOM">⏰ Custom</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="PENDING">Active / Pending</option>
              <option value="SNOOZED">Snoozed</option>
              <option value="COMPLETED">Completed</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </motion.div>

        {/* Content Views */}
        <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50"
              />
            ))}
          </motion.div>
        ) : viewMode === 'calendar' ? (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <ReminderCalendar
            reminders={reminders}
            onComplete={handleComplete}
            onSnooze={(r) => setSnoozeReminder(r)}
            onEdit={(r) => {
              setEditingReminder(r);
              setIsAddOpen(true);
            }}
            onDelete={handleDelete}
            onViewHistory={(r) => {
              setHistoryReminder(r);
              setIsHistoryDrawerOpen(true);
            }}
          />
          </motion.div>
        ) : (
          <motion.div key="cards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {filteredReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/30">
                <span className="text-4xl mb-3">🔔</span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No reminders found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Create reminders for your recurring bills, loan EMIs, or savings targets to stay on track.
                </p>
                <button
                  onClick={() => {
                    setEditingReminder(null);
                    setIsAddOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Reminder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onComplete={handleComplete}
                    onSnooze={(r) => setSnoozeReminder(r)}
                    onEdit={(r) => {
                      setEditingReminder(r);
                      setIsAddOpen(true);
                    }}
                    onDelete={handleDelete}
                    onViewHistory={(r) => {
                      setHistoryReminder(r);
                      setIsHistoryDrawerOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Modals & Drawers */}
        <ReminderFormModal
          isOpen={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            setEditingReminder(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialData={editingReminder}
        />

        <SnoozeModal
          isOpen={!!snoozeReminder}
          reminder={snoozeReminder}
          onClose={() => setSnoozeReminder(null)}
          onSnooze={handleSnooze}
        />

        <ReminderHistoryDrawer
          isOpen={isHistoryDrawerOpen}
          onClose={() => {
            setIsHistoryDrawerOpen(false);
            setHistoryReminder(null);
          }}
          reminder={historyReminder}
          historyList={globalHistory}
        />
      </motion.div>
    </DashboardLayout>
  );
}
