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

const mapToBackend = (uiExpense) => ({
  merchant: uiExpense.merchant || null,
  description: uiExpense.description || null,
  amount: Number(uiExpense.amount),
  category_id: uiExpense.category,
  payment_method: uiExpense.paymentMethod || null,
  date: uiExpense.date,
  receipt_url: uiExpense.receiptUrl || null,
});

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
