import apiClient from './apiClient';

const mapToFrontend = (apiExpense) => ({
  id: apiExpense.id,
  merchant: apiExpense.merchant || '',
  description: apiExpense.description || '',
  amount: apiExpense.amount,
  category: apiExpense.category_id,
  categoryName: apiExpense.category_name,
  paymentMethod: apiExpense.payment_method || '',
  date: apiExpense.date,
  receiptUrl: apiExpense.receipt_url || '',
  type: 'expense'
});

const mapToBackend = (uiExpense) => {
  const cat = uiExpense.category || uiExpense.category_id || uiExpense.categoryId;
  const rawReceipt = uiExpense.receiptUrl || uiExpense.receipt_url;
  const receipt_url = rawReceipt && String(rawReceipt).trim() !== '' ? String(rawReceipt).trim() : null;
  const rawDate = uiExpense.date;

  return {
    merchant: uiExpense.merchant ? String(uiExpense.merchant).trim() : null,
    description: uiExpense.description ? String(uiExpense.description).trim() : null,
    amount: Number(uiExpense.amount || 0),
    category_id: cat && String(cat).trim() !== '' ? String(cat).trim() : null,
    payment_method: uiExpense.paymentMethod || uiExpense.payment_method || null,
    date: rawDate ? (typeof rawDate === 'string' ? rawDate.split('T')[0] : rawDate) : new Date().toISOString().slice(0, 10),
    receipt_url: receipt_url,
  };
};

export const expenseApi = {
  getExpenses: async (params = {}) => {
    const response = await apiClient.get('/expenses', { params });
    return response.data.map(mapToFrontend);
  },

  searchExpenses: async (query) => {
    const response = await apiClient.get('/expenses/search', { params: { q: query } });
    return response.data.map(mapToFrontend);
  },

  getExpenseById: async (id) => {
    const response = await apiClient.get(`/expenses/${id}`);
    return mapToFrontend(response.data);
  },

  createExpense: async (data) => {
    const response = await apiClient.post('/expenses', mapToBackend(data));
    return mapToFrontend(response.data);
  },

  updateExpense: async (id, data) => {
    const response = await apiClient.put(`/expenses/${id}`, mapToBackend(data));
    return mapToFrontend(response.data);
  },

  deleteExpense: async (id) => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },

  getStatistics: async (startDate, endDate) => {
    const response = await apiClient.get('/expenses/statistics', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getMonthlySummary: async (year, month) => {
    const response = await apiClient.get('/expenses/monthly-summary', {
      params: { year, month },
    });
    return response.data;
  }
};
