import apiClient from './apiClient';

const mapToFrontend = (apiBudget) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return {
    id: apiBudget.id,
    amount: Number(apiBudget.amount),
    monthlyLimit: Number(apiBudget.amount),
    period: apiBudget.period || 'MONTHLY',
    category: apiBudget.category_id,
    category_id: apiBudget.category_id,
    categoryName: apiBudget.category_name || '',
    month: apiBudget.month || currentMonth,
    year: apiBudget.year || currentYear,
    createdAt: apiBudget.created_at,
  };
};

const mapToBackend = (uiBudget) => {
  const cat = uiBudget.category || uiBudget.category_id || uiBudget.categoryId;
  return {
    amount: Number(uiBudget.amount || uiBudget.monthlyLimit || 0),
    period: uiBudget.period ? String(uiBudget.period).toUpperCase() : 'MONTHLY',
    category_id: cat && String(cat).trim() !== '' ? String(cat).trim() : null,
  };
};

export const budgetApi = {
  getBudgets: async () => {
    const response = await apiClient.get('/budget');
    return response.data.map(mapToFrontend);
  },

  createBudget: async (data) => {
    const response = await apiClient.post('/budget', mapToBackend(data));
    return mapToFrontend(response.data);
  },

  updateBudget: async (id, data) => {
    const response = await apiClient.put(`/budget/${id}`, mapToBackend(data));
    return mapToFrontend(response.data);
  },

  deleteBudget: async (id) => {
    const response = await apiClient.delete(`/budget/${id}`);
    return response.data;
  },

  getUtilization: async (id, targetDate) => {
    const response = await apiClient.get(`/budget/${id}/utilization`, {
      params: { target_date: targetDate }
    });
    return response.data;
  }
};
