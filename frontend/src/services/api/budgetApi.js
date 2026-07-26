import apiClient from './apiClient';

const mapToFrontend = (apiBudget) => ({
  id: apiBudget.id,
  amount: apiBudget.amount,
  period: apiBudget.period,
  category: apiBudget.category_id,
  createdAt: apiBudget.created_at,
});

const mapToBackend = (uiBudget) => ({
  amount: Number(uiBudget.amount || uiBudget.monthlyLimit),
  period: uiBudget.period || 'MONTHLY',
  category_id: uiBudget.category,
});

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
