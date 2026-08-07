const ACTION_BADGES = {
  CREATED: { label: 'Created', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  NOTIFIED: { label: 'Notified', cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  SNOOZED: { label: 'Snoozed', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  DISMISSED: { label: 'Dismissed', cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  ADVANCED: { label: 'Advanced', cls: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  UPDATED: { label: 'Updated', cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
};

function formatTimestamp(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReminderHistoryDrawer({ isOpen, onClose, reminder, historyList = [] }) {
  if (!isOpen) return null;

  const items = reminder ? reminder.history || [] : historyList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 animate-slide-in-right">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Reminder History
              </h3>
              {reminder && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {reminder.title}
                </p>
              )}
            </div>
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

        {/* History Timeline */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <span className="text-3xl mb-2">📜</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No activity logged yet
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Actions and trigger alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6">
              {items.map((item, idx) => {
                const badge = ACTION_BADGES[item.action] || {
                  label: item.action,
                  cls: 'bg-slate-100 text-slate-600',
                };

                return (
                  <div key={item.id || idx} className="relative pl-6">
                    {/* Timeline Node */}
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-600 dark:border-slate-900 shadow-sm" />

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTimestamp(item.createdAt || item.created_at)}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {item.notes}
                      </p>
                    )}

                    <div className="mt-1 text-[10px] text-slate-400 font-mono">
                      Date: {item.actionDate || item.action_date}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
