import { memo } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../ui/Card';

const TYPE_CONFIG = {
  BUDGET_EXCEEDED: { icon: '🚨', label: 'Budget Exceeded', color: 'text-rose-400 bg-rose-500/10' },
  BUDGET_WARNING: { icon: '⚠️', label: 'Budget Warning', color: 'text-amber-400 bg-amber-500/10' },
  GOAL_ACHIEVED: { icon: '🏆', label: 'Goal Achieved', color: 'text-emerald-400 bg-emerald-500/10' },
  GOAL_MILESTONE: { icon: '🎯', label: 'Milestone', color: 'text-blue-400 bg-blue-500/10' },
  LARGE_EXPENSE: { icon: '💸', label: 'Large Expense', color: 'text-orange-400 bg-orange-500/10' },
  LARGE_INCOME: { icon: '💰', label: 'Income Alert', color: 'text-emerald-400 bg-emerald-500/10' },
  RECURRING_EXECUTED: { icon: '🔄', label: 'Recurring Run', color: 'text-indigo-400 bg-indigo-500/10' },
  REMINDER: { icon: '⏰', label: 'Reminder', color: 'text-amber-400 bg-amber-500/10' },
  MONTHLY_SUMMARY: { icon: '📊', label: 'Monthly Summary', color: 'text-purple-400 bg-purple-500/10' },
};

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const RecentNotificationsWidget = memo(function RecentNotificationsWidget() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const recent = notifications.slice(0, 3);

  return (
    <Card padding="md" className="flex flex-col gap-3 h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 text-xs">
              🔔
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Recent Alerts
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-400 border border-brand-500/30">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-surface-400 hover:text-brand-400 transition-colors"
            >
              Mark read
            </button>
          )}
        </div>

        {/* List Content */}
        {loading && notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-surface-500">
            Loading recent alerts...
          </div>
        ) : recent.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-surface-400">All caught up! No recent alerts.</p>
            <p className="text-[10px] text-surface-500 mt-1">
              Budget threshold alerts & scheduler runs will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recent.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || {
                icon: '🔔',
                label: 'Alert',
                color: 'text-surface-300 bg-surface-700/40',
              };
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`group relative flex items-start gap-2.5 rounded-xl p-2.5 border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-surface-700/20 border-surface-700/40 hover:bg-surface-700/40'
                      : 'bg-brand-500/[0.06] border-brand-500/30 hover:bg-brand-500/[0.12]'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs ${cfg.color}`}
                  >
                    {cfg.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-surface-400 flex-shrink-0">
                        {formatTimeAgo(n.date)}
                      </span>
                    </div>
                    <p className="text-[11px] text-surface-400 line-clamp-1 mt-0.5">
                      {n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-brand-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-surface-700/40 flex items-center justify-between text-[11px] text-surface-400">
        <span>In-app alert system</span>
        <span>{notifications.length} total notifications</span>
      </div>
    </Card>
  );
});

export default RecentNotificationsWidget;
