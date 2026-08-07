import { useState, useEffect } from 'react';
import { useCategory } from '../../context/CategoryContext';


const REMINDER_TYPES = [
  { value: 'BILL', label: '📄 Bill Reminder' },
  { value: 'SUBSCRIPTION', label: '🔁 Subscription Renewal' },
  { value: 'EMI', label: '💳 EMI Payment' },
  { value: 'SAVINGS', label: '💰 Savings Reminder' },
  { value: 'BUDGET', label: '📊 Budget Review' },
  { value: 'GOAL', label: '🎯 Goal Contribution' },
  { value: 'CUSTOM', label: '⏰ Custom Reminder' },
];

const FREQUENCIES = [
  { value: 'ONCE', label: 'One-time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export default function ReminderFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const { categories = [] } = useCategory();


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('BILL');
  const [frequency, setFrequency] = useState('ONCE');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAutoNotified, setIsAutoNotified] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setAmount(initialData.amount !== null && initialData.amount !== undefined ? String(initialData.amount) : '');
      setType(initialData.type || 'BILL');
      setFrequency(initialData.frequency || 'ONCE');
      setDueDate(initialData.dueDate || initialData.due_date || '');
      setDueTime(initialData.dueTime || initialData.due_time || '');
      setCategoryId(initialData.categoryId || initialData.category_id || '');
      setIsAutoNotified(initialData.isAutoNotified !== undefined ? initialData.isAutoNotified : true);
    } else {
      setTitle('');
      setDescription('');
      setAmount('');
      setType('BILL');
      setFrequency('ONCE');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('09:00');
      setCategoryId('');
      setIsAutoNotified(true);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a reminder title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }
    if (amount && Number(amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      amount: amount ? parseFloat(amount) : null,
      type,
      frequency,
      dueDate,
      dueTime: dueTime || null,
      categoryId: categoryId || null,
      isAutoNotified,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {initialData ? 'Edit Reminder' : 'Create New Reminder'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reminder Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WiFi Bill Payment, Car EMI, Netflix Renewal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Type & Frequency row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reminder Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {REMINDER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Repeat Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">General / None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Time <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Notes / Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="Add payment portal link, policy number, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Auto-notify switch */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Auto In-App Notification
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Send an alert when this reminder is due
              </span>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isAutoNotified}
                onChange={(e) => setIsAutoNotified(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-5 w-9 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-slate-700"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>Save Reminder</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
