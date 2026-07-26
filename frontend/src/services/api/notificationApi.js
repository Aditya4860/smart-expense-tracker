import apiClient from './apiClient';

const mapToFrontend = (apiNotification) => ({
  id: apiNotification.id,
  title: apiNotification.title,
  message: apiNotification.message,
  isRead: apiNotification.is_read,
  date: apiNotification.created_at,
});

export const notificationApi = {
  getNotifications: async (unreadOnly = false) => {
    const response = await apiClient.get('/notifications', {
      params: { unread_only: unreadOnly }
    });
    return response.data.map(mapToFrontend);
  },

  markAsRead: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/mark-read`);
    return mapToFrontend(response.data);
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  }
};
