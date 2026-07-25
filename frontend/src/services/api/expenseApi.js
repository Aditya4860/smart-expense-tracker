import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('set_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapToFrontend = (apiExpense) => ({
  id: apiExpense.id,
  title: apiExpense.title,
  description: apiExpense.description || '',
  amount: apiExpense.amount,
  category: apiExpense.category,
  paymentMethod: apiExpense.payment_method || '',
  date: apiExpense.transaction_date,
  notes: apiExpense.notes || '',
  receiptUrl: apiExpense.receipt_url || '',
  type: 'expense'
});

const mapToBackend = (uiExpense) => ({
  title: uiExpense.title,
  description: uiExpense.description || null,
  amount: Number(uiExpense.amount),
  category: uiExpense.category,
  payment_method: uiExpense.paymentMethod || null,
  transaction_date: uiExpense.date,
  notes: uiExpense.notes || null,
  receipt_url: uiExpense.receiptUrl || null,
});

export const expenseApi = {
  getExpenses: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/expenses`, {
      headers: getAuthHeaders(),
      params,
    });
    return response.data.map(mapToFrontend);
  },

  searchExpenses: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/search`, {
      headers: getAuthHeaders(),
      params: { q: query },
    });
    return response.data.map(mapToFrontend);
  },

  getExpenseById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/${id}`, {
      headers: getAuthHeaders(),
    });
    return mapToFrontend(response.data);
  },

  createExpense: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/expenses`, mapToBackend(data), {
      headers: getAuthHeaders(),
    });
    return mapToFrontend(response.data);
  },

  updateExpense: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/expenses/${id}`, mapToBackend(data), {
      headers: getAuthHeaders(),
    });
    return mapToFrontend(response.data);
  },

  deleteExpense: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/expenses/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getStatistics: async (startDate, endDate) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/statistics`, {
      headers: getAuthHeaders(),
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getMonthlySummary: async (year, month) => {
    const response = await axios.get(`${API_BASE_URL}/expenses/monthly-summary`, {
      headers: getAuthHeaders(),
      params: { year, month },
    });
    return response.data;
  }
};
