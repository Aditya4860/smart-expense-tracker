import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { reminderApi } from '../../services/api/reminderApi';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import Card from '../ui/Card';

const TYPE_ICONS = {
  BILL: '🧾',
  SUBSCRIPTION: '📱',
  EMI: '🏦',
  SAVINGS: '💰',
  BUDGET: '📊',
  GOAL: '🎯',
  CUSTOM: '🔔',
};

const UpcomingRemindersWidget = memo(function UpcomingRemindersWidget() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDue() {
      try {
        const items = await reminderApi.getReminders({ status: 'PENDING' });
        if (isMounted) {
          // Sort by due date ascending
          const sorted = items
            .filter((r) => r.status === 'PENDING' || r.status === 'SNOOZED')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3);
          setReminders(sorted);
        }
      } catch (err) {
        console.error('Failed to load upcoming reminders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDue();
    return () => {
      isMounted = false;
    };
  }, []);

  const getDueBadge = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, cls: 'bg-rose-500/20 text-rose-400' };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', cls: 'bg-amber-500/20 text-amber-400 font-bold' };
    }
    if (diffDays === 1) {
      return { text: 'Due Tomorrow', cls: 'bg-blue-500/20 text-blue-400' };
    }
    return { text: `In ${diffDays}d`, cls: 'bg-surface-700/60 text-surface-300' };
  };

  return (
    <Card padding="md" className="flex flex-col gap-3 h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 text-xs">
              ⏰
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Upcoming Reminders
            </h3>
          </div>
          <Link
            to="/reminders"
            className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-6 text-center text-xs text-surface-500">
            Loading upcoming reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-surface-400">No pending reminders due soon.</p>
            <Link
              to="/reminders"
              className="mt-2 inline-block text-[11px] font-semibold text-brand-400 hover:underline"
            >
              + Create a bill or EMI reminder
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reminders.map((r) => {
              const badge = getDueBadge(r.dueDate);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-surface-700/30 p-2.5 border border-surface-700/50 hover:bg-surface-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-base flex-shrink-0">
                      {TYPE_ICONS[r.type] || '🔔'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {r.title}
                      </p>
                      <p className="text-[10px] text-surface-400">
                        {r.dueDate ? formatLocalDate(r.dueDate) : 'No date'}
                        {r.amount ? ` • ${formatCurrency(r.amount)}` : ''}
                      </p>
                    </div>
                  </div>

                  {badge && (
                    <span
                      className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-surface-700/40 flex items-center justify-between text-[11px] text-surface-400">
        <span>Auto-notified on schedule</span>
        <Link to="/reminders" className="hover:text-white transition-colors">
          Manage ({reminders.length})
        </Link>
      </div>
    </Card>
  );
});

export default UpcomingRemindersWidget;
