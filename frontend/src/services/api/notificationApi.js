import apiClient from './apiClient';

const mapToFrontend = (apiNotification) => ({
  id: apiNotification.id,
  title: apiNotification.title,
  message: apiNotification.message,
  type: apiNotification.type || 'SYSTEM',
  isRead: apiNotification.is_read,
  data: apiNotification.data || null,
  date: apiNotification.created_at,
  updatedAt: apiNotification.updated_at,
});

export const notificationApi = {
  getNotifications: async ({ unreadOnly = false, type = null, sort = 'desc', skip = 0, limit = 100 } = {}) => {
    const params = {
      unread_only: unreadOnly,
      sort,
      skip,
      limit,
    };
    if (type) {
      params.type = type;
    }
    const response = await apiClient.get('/notifications', { params });
    return response.data.map(mapToFrontend);
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/mark-read`);
    return mapToFrontend(response.data);
  },

  markAsUnread: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/mark-unread`);
    return mapToFrontend(response.data);
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  clearReadNotifications: async () => {
    const response = await apiClient.post('/notifications/clear-read');
    return response.data;
  },

  seedDemoNotifications: async () => {
    const response = await apiClient.post('/notifications/seed-demo');
    return response.data.map(mapToFrontend);
  },
};

