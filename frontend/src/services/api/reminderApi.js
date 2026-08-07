import apiClient from './apiClient';

const mapToFrontend = (item) => ({
  id: item.id,
  userId: item.user_id,
  title: item.title,
  description: item.description || '',
  amount: item.amount !== null && item.amount !== undefined ? Number(item.amount) : null,
  type: item.type,
  frequency: item.frequency,
  dueDate: item.due_date,
  dueTime: item.due_time || '',
  categoryId: item.category_id || null,
  categoryName: item.category_name || 'General',
  isAutoNotified: item.is_auto_notified,
  status: item.status,
  isOverdue: item.is_overdue || false,
  lastNotifiedAt: item.last_notified_at,
  snoozeUntil: item.snooze_until,
  history: (item.history || []).map((h) => ({
    id: h.id,
    reminderId: h.reminder_id,
    action: h.action,
    actionDate: h.action_date,
    notes: h.notes,
    createdAt: h.created_at,
  })),
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export const reminderApi = {
  getReminders: async (params = {}) => {
    const response = await apiClient.get('/reminders', { params });
    return response.data.map(mapToFrontend);
  },

  getReminderCounts: async () => {
    const response = await apiClient.get('/reminders/counts');
    return response.data;
  },

  getReminderHistory: async (params = {}) => {
    const response = await apiClient.get('/reminders/history', { params });
    return response.data;
  },

  getReminder: async (id) => {
    const response = await apiClient.get(`/reminders/${id}`);
    return mapToFrontend(response.data);
  },

  createReminder: async (data) => {
    const payload = {
      title: data.title,
      description: data.description || null,
      amount: data.amount ? Number(data.amount) : null,
      type: data.type || 'CUSTOM',
      frequency: data.frequency || 'ONCE',
      due_date: data.dueDate || data.due_date,
      due_time: data.dueTime || data.due_time || null,
      category_id: data.categoryId || data.category_id || null,
      is_auto_notified: data.isAutoNotified !== undefined ? data.isAutoNotified : true,
    };
    const response = await apiClient.post('/reminders', payload);
    return mapToFrontend(response.data);
  },

  updateReminder: async (id, data) => {
    const payload = {
      title: data.title,
      description: data.description,
      amount: data.amount !== undefined ? (data.amount ? Number(data.amount) : null) : undefined,
      type: data.type,
      frequency: data.frequency,
      due_date: data.dueDate || data.due_date,
      due_time: data.dueTime || data.due_time,
      category_id: data.categoryId || data.category_id,
      status: data.status,
      is_auto_notified: data.isAutoNotified,
      snooze_until: data.snoozeUntil || data.snooze_until,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);
    const response = await apiClient.put(`/reminders/${id}`, payload);
    return mapToFrontend(response.data);
  },

  deleteReminder: async (id) => {
    const response = await apiClient.delete(`/reminders/${id}`);
    return response.data;
  },

  completeReminder: async (id) => {
    const response = await apiClient.post(`/reminders/${id}/complete`);
    return mapToFrontend(response.data);
  },

  snoozeReminder: async (id, { days = 1, snoozeUntil = null } = {}) => {
    const payload = {
      days: Number(days),
      snooze_until: snoozeUntil,
    };
    const response = await apiClient.post(`/reminders/${id}/snooze`, payload);
    return mapToFrontend(response.data);
  },

  dismissReminder: async (id) => {
    const response = await apiClient.post(`/reminders/${id}/dismiss`);
    return mapToFrontend(response.data);
  },

  processDueReminders: async (targetDate = null) => {
    const params = targetDate ? { target_date: targetDate } : {};
    const response = await apiClient.post('/reminders/process-due', null, { params });
    return response.data;
  },
};
