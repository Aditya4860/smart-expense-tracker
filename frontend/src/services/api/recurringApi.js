import apiClient from './apiClient';

const mapToFrontend = (apiItem) => ({
  id: apiItem.id,
  userId: apiItem.user_id,
  type: apiItem.type,
  amount: Number(apiItem.amount),
  frequency: apiItem.frequency,
  categoryId: apiItem.category_id,
  categoryName: apiItem.category_name || 'General',
  title: apiItem.title || '',
  description: apiItem.description || '',
  merchant: apiItem.merchant || '',
  paymentMethod: apiItem.payment_method || '',
  startDate: apiItem.start_date,
  endDate: apiItem.end_date,
  isNeverEnding: apiItem.is_never_ending,
  nextDate: apiItem.next_date,
  lastProcessedDate: apiItem.last_processed_date,
  status: apiItem.status,
  autoProcess: apiItem.auto_process,
  createdAt: apiItem.created_at,
  updatedAt: apiItem.updated_at,
});

export const recurringApi = {
  getRecurringTransactions: async (params = {}) => {
    const response = await apiClient.get('/recurring-transactions', { params });
    return response.data.map(mapToFrontend);
  },

  getRecurringCounts: async () => {
    const response = await apiClient.get('/recurring-transactions/counts');
    return response.data;
  },

  getRecurringTransaction: async (id) => {
    const response = await apiClient.get(`/recurring-transactions/${id}`);
    return mapToFrontend(response.data);
  },

  createRecurringTransaction: async (data) => {
    const payload = {
      type: data.type,
      amount: Number(data.amount),
      frequency: data.frequency,
      category_id: data.categoryId || data.category_id,
      title: data.title || null,
      description: data.description || null,
      merchant: data.merchant || null,
      payment_method: data.paymentMethod || data.payment_method || null,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date || null,
      is_never_ending: data.isNeverEnding !== undefined ? data.isNeverEnding : true,
      auto_process: data.autoProcess !== undefined ? data.autoProcess : true,
    };
    const response = await apiClient.post('/recurring-transactions', payload);
    return mapToFrontend(response.data);
  },

  updateRecurringTransaction: async (id, data) => {
    const payload = {
      type: data.type,
      amount: data.amount !== undefined ? Number(data.amount) : undefined,
      frequency: data.frequency,
      category_id: data.categoryId || data.category_id,
      title: data.title,
      description: data.description,
      merchant: data.merchant,
      payment_method: data.paymentMethod || data.payment_method,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      is_never_ending: data.isNeverEnding,
      next_date: data.nextDate || data.next_date,
      status: data.status,
      auto_process: data.autoProcess,
    };
    // Strip undefined
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    const response = await apiClient.put(`/recurring-transactions/${id}`, payload);
    return mapToFrontend(response.data);
  },

  deleteRecurringTransaction: async (id) => {
    const response = await apiClient.delete(`/recurring-transactions/${id}`);
    return response.data;
  },

  pauseRecurringTransaction: async (id) => {
    const response = await apiClient.post(`/recurring-transactions/${id}/pause`);
    return mapToFrontend(response.data);
  },

  resumeRecurringTransaction: async (id) => {
    const response = await apiClient.post(`/recurring-transactions/${id}/resume`);
    return mapToFrontend(response.data);
  },

  cancelRecurringTransaction: async (id) => {
    const response = await apiClient.post(`/recurring-transactions/${id}/cancel`);
    return mapToFrontend(response.data);
  },

  skipOccurrence: async (id) => {
    const response = await apiClient.post(`/recurring-transactions/${id}/skip`);
    return mapToFrontend(response.data);
  },

  processOccurrence: async (id, occurrenceDate = null) => {
    const params = occurrenceDate ? { occurrence_date: occurrenceDate } : {};
    const response = await apiClient.post(`/recurring-transactions/${id}/process`, null, { params });
    return response.data;
  },

  processAllDue: async (targetDate = null) => {
    const params = targetDate ? { target_date: targetDate } : {};
    const response = await apiClient.post('/recurring-transactions/process-due', null, { params });
    return response.data;
  },
};
