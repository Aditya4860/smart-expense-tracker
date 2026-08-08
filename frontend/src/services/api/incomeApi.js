import apiClient from './apiClient';

const mapToFrontend = (apiIncome) => ({
  id: apiIncome.id,
  amount: Number(apiIncome.amount),
  date: apiIncome.date,
  source: apiIncome.source || '',
  description: apiIncome.description || '',
  category: apiIncome.category_id,
  category_id: apiIncome.category_id,
  categoryName: apiIncome.category_name,
  type: 'income',
});

const mapToBackend = (uiIncome) => {
  const cat = uiIncome.category || uiIncome.category_id || uiIncome.categoryId;
  const rawDate = uiIncome.date;

  return {
    amount: Number(uiIncome.amount || 0),
    date: rawDate ? (typeof rawDate === 'string' ? rawDate.split('T')[0] : rawDate) : new Date().toISOString().slice(0, 10),
    source: uiIncome.source ? String(uiIncome.source).trim() : null,
    description: uiIncome.description ? String(uiIncome.description).trim() : null,
    category_id: cat && String(cat).trim() !== '' ? String(cat).trim() : null,
  };
};

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
