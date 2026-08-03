import apiClient from './apiClient';

const mapToFrontend = (apiIncome) => ({
  id: apiIncome.id,
  amount: apiIncome.amount,
  date: apiIncome.date,
  source: apiIncome.source || '',
  description: apiIncome.description || '',
  category: apiIncome.category_id,
  categoryName: apiIncome.category_name,
  type: 'income',
});

const mapToBackend = (uiIncome) => ({
  amount: Number(uiIncome.amount),
  date: uiIncome.date,
  source: uiIncome.source || null,
  description: uiIncome.description || null,
  category_id: uiIncome.category,
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
