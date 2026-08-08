import apiClient from './apiClient';

const mapToFrontend = (apiNotification) => ({
  id: String(apiNotification.id),
  title: apiNotification.title || '',
  message: apiNotification.message || '',
  type: String(apiNotification.type || 'SYSTEM').toUpperCase(),
  isRead: Boolean(apiNotification.is_read ?? apiNotification.isRead),
  data: apiNotification.data || null,
  date: apiNotification.created_at || apiNotification.date || new Date().toISOString(),
  updatedAt: apiNotification.updated_at || apiNotification.updatedAt,
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
    const rawList = Array.isArray(response.data)
      ? response.data
      : (Array.isArray(response.data?.data) ? response.data.data : []);
    return rawList.map(mapToFrontend);
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data?.data || response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/mark-read`);
    const data = response.data?.data || response.data;
    return mapToFrontend(data);
  },

  markAsUnread: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/mark-unread`);
    const data = response.data?.data || response.data;
    return mapToFrontend(data);
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data?.data || response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data?.data || response.data;
  },

  clearReadNotifications: async () => {
    const response = await apiClient.post('/notifications/clear-read');
    return response.data?.data || response.data;
  },

  seedDemoNotifications: async () => {
    const response = await apiClient.post('/notifications/seed-demo');
    const rawList = Array.isArray(response.data)
      ? response.data
      : (Array.isArray(response.data?.data) ? response.data.data : []);
    return rawList.map(mapToFrontend);
  },
};

