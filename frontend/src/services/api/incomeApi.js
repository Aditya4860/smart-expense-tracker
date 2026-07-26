import apiClient from './apiClient';

const mapToFrontend = (apiIncome) => ({
  id: apiIncome.id,
  amount: apiIncome.amount,
  date: apiIncome.date,
  source: apiIncome.source || '',
  category: apiIncome.category_id, // If category_id maps to frontend category string
  type: 'income',
});

const mapToBackend = (uiIncome) => ({
  amount: Number(uiIncome.amount),
  date: uiIncome.date,
  source: uiIncome.source || null,
  category_id: uiIncome.category, // Assuming category passes the ID or string matching backend
});

export const incomeApi = {
  getIncome: async (params = {}) => {
    const response = await apiClient.get('/income', { params });
    return response.data.map(mapToFrontend);
  },

  searchIncome: async (query) => {
    const response = await apiClient.get('/income/search', { params: { q: query } });
    return response.data.map(mapToFrontend);
  },

  createIncome: async (data) => {
    const response = await apiClient.post('/income', mapToBackend(data));
    return mapToFrontend(response.data);
  },

  updateIncome: async (id, data) => {
    const response = await apiClient.put(`/income/${id}`, mapToBackend(data));
    return mapToFrontend(response.data);
  },

  deleteIncome: async (id) => {
    const response = await apiClient.delete(`/income/${id}`);
    return response.data;
  },
};
