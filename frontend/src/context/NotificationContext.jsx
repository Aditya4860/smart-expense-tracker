import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { notificationApi } from '../services/api/notificationApi';
import useAuth from '../hooks/useAuth';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'BUDGET' | 'GOALS' | 'TRANSACTIONS'

  // Fetch full notifications list
  const fetchNotifications = useCallback(async (opts = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications(opts);
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch quick unread counter
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const counts = await notificationApi.getUnreadCount();
      setUnreadCount(counts.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [user]);

  // Initial load and periodic polling (every 45s)
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 45000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Mark single as read
  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchNotifications(); // revert on failure
    }
  }, [fetchNotifications]);

  // Mark single as unread
  const markAsUnread = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: false } : n))
    );
    setUnreadCount(prev => prev + 1);

    try {
      await notificationApi.markAsUnread(id);
    } catch (err) {
      console.error('Failed to mark notification as unread:', err);
      fetchNotifications(); // revert on failure
    }
  }, [fetchNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (id) => {
    const target = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  // Clear all read
  const clearRead = useCallback(async () => {
    setNotifications(prev => prev.filter(n => !n.isRead));

    try {
      await notificationApi.clearReadNotifications();
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Seed sample demo notifications
  const seedDemo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationApi.seedDemoNotifications();
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to seed demo notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'UNREAD':
        return notifications.filter(n => !n.isRead);
      case 'BUDGET':
        return notifications.filter(n =>
          n.type === 'BUDGET_EXCEEDED' || n.type === 'BUDGET_WARNING'
        );
      case 'GOALS':
        return notifications.filter(n =>
          n.type === 'GOAL_ACHIEVED' || n.type === 'GOAL_MILESTONE'
        );
      case 'REMINDERS':
        return notifications.filter(n =>
          n.type === 'REMINDER'
        );
      case 'TRANSACTIONS':
        return notifications.filter(n =>
          n.type === 'LARGE_EXPENSE' ||
          n.type === 'LARGE_INCOME' ||
          n.type === 'RECURRING_EXECUTED' ||
          n.type === 'TRANSACTION_FAILED'
        );
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const value = useMemo(
    () => ({
      notifications,
      filteredNotifications,
      unreadCount,
      totalCount: notifications.length,
      loading,
      error,
      activeFilter,
      setActiveFilter,
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      clearRead,
      seedDemo,
    }),
    [
      notifications,
      filteredNotifications,
      unreadCount,
      loading,
      error,
      activeFilter,
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      clearRead,
      seedDemo,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
