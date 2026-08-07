import { useState } from 'react';

export default function SnoozeModal({ isOpen, onClose, onSnooze, reminder }) {
  const [selectedOption, setSelectedOption] = useState(1);
  const [customDate, setCustomDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !reminder) return null;

  const presets = [
    { label: 'Tomorrow (+1 day)', days: 1 },
    { label: 'In 3 Days', days: 3 },
    { label: 'In 1 Week', days: 7 },
    { label: 'In 2 Weeks', days: 14 },
    { label: 'Custom Date', days: 'custom' },
  ];

  const handleSnooze = async () => {
    setIsSubmitting(true);
    try {
      if (selectedOption === 'custom') {
        if (!customDate) return;
        await onSnooze(reminder.id, { snoozeUntil: customDate });
      } else {
        await onSnooze(reminder.id, { days: selectedOption });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Snooze Reminder
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Snoozing <span className="font-semibold text-slate-700 dark:text-slate-200">{reminder.title}</span> will temporarily hide overdue alerts until the selected date.
        </p>

        <div className="mt-4 space-y-2">
          {presets.map((p) => (
            <label
              key={p.days}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all ${
                selectedOption === p.days
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-950/30 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{p.label}</span>
              <input
                type="radio"
                name="snooze-option"
                checked={selectedOption === p.days}
                onChange={() => setSelectedOption(p.days)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>

        {selectedOption === 'custom' && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Specific Date
            </label>
            <input
              type="date"
              required
              value={customDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCustomDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || (selectedOption === 'custom' && !customDate)}
            onClick={handleSnooze}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Snoozing...' : 'Snooze Reminder'}
          </button>
        </div>
      </div>
    </div>
  );
}
