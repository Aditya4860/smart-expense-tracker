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
    const rawCat = data.categoryId || data.category_id || data.category;
    const rawStartDate = data.startDate || data.start_date;
    const rawEndDate = data.endDate || data.end_date;

    const payload = {
      type: (data.type || 'EXPENSE').toUpperCase(),
      amount: Number(data.amount || 0),
      frequency: (data.frequency || 'MONTHLY').toUpperCase(),
      category_id: rawCat && String(rawCat).trim() !== '' ? String(rawCat).trim() : null,
      title: data.title ? String(data.title).trim() : null,
      description: data.description ? String(data.description).trim() : null,
      merchant: data.merchant ? String(data.merchant).trim() : null,
      payment_method: data.paymentMethod || data.payment_method || null,
      start_date: rawStartDate ? (typeof rawStartDate === 'string' ? rawStartDate.split('T')[0] : rawStartDate) : new Date().toISOString().slice(0, 10),
      end_date: rawEndDate ? (typeof rawEndDate === 'string' ? rawEndDate.split('T')[0] : rawEndDate) : null,
      is_never_ending: rawEndDate ? false : (data.isNeverEnding !== undefined ? Boolean(data.isNeverEnding) : true),
      auto_process: data.autoProcess !== undefined ? Boolean(data.autoProcess) : true,
    };
    const response = await apiClient.post('/recurring-transactions', payload);
    return mapToFrontend(response.data);
  },

  updateRecurringTransaction: async (id, data) => {
    const rawCat = data.categoryId !== undefined ? data.categoryId : data.category_id !== undefined ? data.category_id : data.category;
    const rawStartDate = data.startDate !== undefined ? data.startDate : data.start_date;
    const rawEndDate = data.endDate !== undefined ? data.endDate : data.end_date;

    const payload = {
      type: data.type ? String(data.type).toUpperCase() : undefined,
      amount: data.amount !== undefined ? Number(data.amount) : undefined,
      frequency: data.frequency ? String(data.frequency).toUpperCase() : undefined,
      category_id: rawCat !== undefined ? (rawCat && String(rawCat).trim() !== '' ? String(rawCat).trim() : null) : undefined,
      title: data.title !== undefined ? (data.title ? String(data.title).trim() : null) : undefined,
      description: data.description !== undefined ? (data.description ? String(data.description).trim() : null) : undefined,
      merchant: data.merchant !== undefined ? (data.merchant ? String(data.merchant).trim() : null) : undefined,
      payment_method: data.paymentMethod !== undefined ? data.paymentMethod : data.payment_method,
      start_date: rawStartDate ? (typeof rawStartDate === 'string' ? rawStartDate.split('T')[0] : rawStartDate) : undefined,
      end_date: rawEndDate !== undefined ? (rawEndDate ? (typeof rawEndDate === 'string' ? rawEndDate.split('T')[0] : rawEndDate) : null) : undefined,
      is_never_ending: data.isNeverEnding !== undefined ? Boolean(data.isNeverEnding) : undefined,
      next_date: data.nextDate || data.next_date,
      status: data.status ? String(data.status).toUpperCase() : undefined,
      auto_process: data.autoProcess !== undefined ? Boolean(data.autoProcess) : undefined,
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
