import { useState, useRef, useEffect, memo } from 'react';
import { useNotifications } from '../../context/NotificationContext';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getNotificationConfig(type) {
  switch (type) {
    case 'BUDGET_EXCEEDED':
      return {
        icon: '🚨',
        color: 'text-red-400 bg-red-500/15 border-red-500/30',
        badge: 'Budget Exceeded',
      };
    case 'BUDGET_WARNING':
      return {
        icon: '⚠️',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
        badge: 'Budget Alert',
      };
    case 'GOAL_ACHIEVED':
      return {
        icon: '🏆',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        badge: 'Goal Achieved',
      };
    case 'GOAL_MILESTONE':
      return {
        icon: '🎯',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
        badge: 'Milestone',
      };
    case 'LARGE_EXPENSE':
      return {
        icon: '💸',
        color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
        badge: 'Large Expense',
      };
    case 'LARGE_INCOME':
      return {
        icon: '📈',
        color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
        badge: 'Large Income',
      };
    case 'RECURRING_EXECUTED':
      return {
        icon: '🔄',
        color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
        badge: 'Recurring',
      };
    case 'REMINDER':
      return {
        icon: '⏰',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
        badge: 'Reminder',
      };
    case 'MONTHLY_SUMMARY':
      return {
        icon: '📊',
        color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
        badge: 'Summary',
      };
    case 'TRANSACTION_FAILED':
      return {
        icon: '❌',
        color: 'text-red-400 bg-red-500/15 border-red-500/30',
        badge: 'Failed',
      };
    default:
      return {
        icon: 'ℹ️',
        color: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
        badge: 'Notice',
      };
  }
}

const NotificationDropdown = memo(function NotificationDropdown() {
  const {
    filteredNotifications,
    unreadCount,
    totalCount,
    loading,
    activeFilter,
    setActiveFilter,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearRead,
    seedDemo,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const hasReadNotifications = filteredNotifications.some(n => n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-[8px] text-surface-400 hover:bg-surface-800 hover:text-white transition-all focus:outline-none"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
          <path fillRule="evenodd" d="M4 8a6 6 0 1 1 12 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 0 1-.515 1.076 32.91 32.91 0 0 1-3.256.508 3.5 3.5 0 0 1-6.972 0 32.903 32.903 0 0 1-3.256-.508.75.75 0 0 1-.515-1.076A11.448 11.448 0 0 0 4 8Zm6 7c-.655 0-1.286-.02-1.9-.057A2 2 0 0 0 12 15H10Z" clipRule="evenodd" />
        </svg>

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg ring-2 ring-surface-950 animate-in fade-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-surface-700 bg-surface-900/95 shadow-2xl backdrop-blur-2xl transition-all duration-200 z-50 overflow-hidden flex flex-col max-h-[85vh]"
          role="dialog"
          aria-label="Notifications list"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-700/60 px-4 py-3 bg-surface-900/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-surface-400 hover:text-brand-400 transition-colors"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={seedDemo}
                className="text-[11px] font-medium text-surface-400 hover:text-white px-2 py-0.5 rounded-md bg-surface-800/60 hover:bg-surface-700 transition-colors"
                title="Populate demo alerts"
              >
                + Demo Alerts
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 border-b border-surface-700/40 bg-surface-950/40 no-scrollbar">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'BUDGET', label: 'Budgets' },
              { id: 'GOALS', label: 'Goals' },
              { id: 'REMINDERS', label: 'Reminders' },
              { id: 'TRANSACTIONS', label: 'Transactions' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-white text-surface-950 shadow-sm'
                    : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List Content */}
          <div className="overflow-y-auto flex-1 divide-y divide-surface-800/60 max-h-[380px]">
            {loading && filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-surface-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-600 border-t-brand-400"></div>
                <p className="mt-2 text-xs">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-800/80 text-xl text-surface-400 mb-3 shadow-inner">
                  🔔
                </div>
                <p className="text-sm font-semibold text-white">All caught up!</p>
                <p className="mt-1 text-xs text-surface-400 max-w-[220px]">
                  {activeFilter === 'UNREAD'
                    ? 'No unread notifications at the moment.'
                    : 'You have no notifications in this category.'}
                </p>
                {totalCount === 0 && (
                  <button
                    type="button"
                    onClick={seedDemo}
                    className="mt-4 rounded-xl bg-brand-500/15 border border-brand-500/30 px-3 py-1.5 text-xs font-medium text-brand-300 hover:bg-brand-500/25 transition-all shadow-sm"
                  >
                    ✨ Seed Sample Notifications
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map(notification => {
                const config = getNotificationConfig(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors ${
                      notification.isRead
                        ? 'bg-transparent hover:bg-surface-800/30'
                        : 'bg-brand-500/[0.04] hover:bg-brand-500/[0.08]'
                    }`}
                  >
                    {/* Icon Badge */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm shadow-sm ${config.color}`}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                          {config.badge}
                        </span>
                        <span className="text-[10px] text-surface-500">•</span>
                        <span className="text-[10px] text-surface-400">
                          {formatRelativeTime(notification.date)}
                        </span>
                        {!notification.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                        )}
                      </div>

                      <h4 className={`text-xs font-semibold mt-0.5 leading-snug ${
                        notification.isRead ? 'text-surface-200' : 'text-white'
                      }`}>
                        {notification.title}
                      </h4>

                      <p className="mt-1 text-xs text-surface-400 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Toggle Read/Unread */}
                      <button
                        type="button"
                        onClick={() =>
                          notification.isRead
                            ? markAsUnread(notification.id)
                            : markAsRead(notification.id)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-700 hover:text-white transition-colors"
                        title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notification.isRead ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2Z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteNotification(notification.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-surface-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                        title="Delete notification"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {hasReadNotifications && (
            <div className="flex items-center justify-between border-t border-surface-700/60 px-4 py-2 bg-surface-900/50">
              <span className="text-[11px] text-surface-400">
                {totalCount} total alert{totalCount === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={clearRead}
                className="text-[11px] font-medium text-surface-400 hover:text-red-400 transition-colors"
              >
                Clear all read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default NotificationDropdown;
