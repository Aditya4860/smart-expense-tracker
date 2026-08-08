import { useState, useEffect } from 'react';
import { useCategory } from '../../context/CategoryContext';
import Select from '../ui/Select';
import CategorySelect from '../ui/CategorySelect';

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
  { value: 'DAILY', label: 'Daily (Every day)' },
  { value: 'WEEKLY', label: 'Weekly (Every 7 days)' },
  { value: 'MONTHLY', label: 'Monthly (Every month)' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl sm:max-w-3xl rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl shadow-black/50 animate-scale-up max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-surface-700/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400 border border-primary-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Edit Reminder' : 'Create New Reminder'}
              </h2>
              <p className="text-xs text-surface-400">Set scheduled alerts for recurring bills, EMIs, or targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
          {error && (
            <div className="rounded-xl bg-danger-500/15 border border-danger-500/30 p-3.5 text-xs font-medium text-danger-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Reminder Title <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WiFi Bill Payment, Car EMI, Netflix Renewal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              autoFocus
            />
          </div>

          {/* Type & Frequency row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="relative z-30">
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Reminder Type
              </label>
              <Select
                id="reminder-type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={REMINDER_TYPES}
              />
            </div>

            <div className="relative z-20">
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Repeat Frequency
              </label>
              <Select
                id="reminder-frequency"
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                options={FREQUENCIES}
              />
            </div>
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Amount (₹) <span className="text-surface-500 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full tabular-nums font-mono"
              />
            </div>

            <div className="relative z-10">
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Category <span className="text-surface-500 font-normal">(Optional)</span>
              </label>
              <CategorySelect
                id="reminder-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                type="EXPENSE"
              />
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Due Date <span className="text-danger-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input w-full font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-300 mb-1.5">
                Due Time <span className="text-surface-500 font-normal">(Optional)</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="input w-full font-mono text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 mb-1.5">
              Notes / Description <span className="text-surface-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="3"
              placeholder="Add payment portal link, policy number, or reference instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full text-sm resize-none"
            />
          </div>

          {/* Auto-notify switch */}
          <div className="flex items-center justify-between rounded-xl bg-surface-800/80 border border-surface-700 p-4">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm font-semibold text-white">
                Auto In-App Notification
              </span>
              <span className="text-xs text-surface-400">
                Send an alert and update dashboard notification badge when this reminder is due
              </span>
            </div>
            <input
              type="checkbox"
              checked={isAutoNotified}
              onChange={(e) => setIsAutoNotified(e.target.checked)}
              className="h-5 w-5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-0 cursor-pointer flex-shrink-0"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-surface-700/80 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 transition-all"
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
