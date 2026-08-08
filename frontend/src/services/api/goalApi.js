import apiClient from './apiClient';

const mapGoalToFrontend = (apiGoal) => ({
  id: apiGoal.id,
  title: apiGoal.name, // UI uses title
  targetAmount: apiGoal.target_amount,
  currentAmount: apiGoal.current_amount,
  targetDate: apiGoal.deadline, // UI uses targetDate
  description: apiGoal.description,
  priority: apiGoal.priority,
  status: apiGoal.status,
  createdAt: apiGoal.created_at,
});

const mapGoalToBackend = (uiGoal) => ({
  name: (uiGoal.name || uiGoal.title || '').trim(),
  target_amount: Number(uiGoal.targetAmount || uiGoal.target_amount || 0),
  current_amount: uiGoal.currentAmount !== undefined && uiGoal.currentAmount !== ''
    ? Number(uiGoal.currentAmount)
    : (uiGoal.current_amount !== undefined && uiGoal.current_amount !== '' ? Number(uiGoal.current_amount) : 0),
  deadline: uiGoal.targetDate || uiGoal.deadline || null,
  description: uiGoal.description ? String(uiGoal.description).trim() : null,
  priority: (uiGoal.priority || 'medium').toLowerCase(),
  status: uiGoal.status || 'ACTIVE',
});

const mapContribToFrontend = (apiContrib) => ({
  id: apiContrib.id,
  goalId: apiContrib.goal_id,
  amount: apiContrib.amount,
  date: apiContrib.date,
  type: 'savings_contribution',
});

export const goalApi = {
  // Goals
  getGoals: async () => {
    const response = await apiClient.get('/goals');
    return response.data.map(mapGoalToFrontend);
  },

  createGoal: async (data) => {
    const response = await apiClient.post('/goals', mapGoalToBackend(data));
    return mapGoalToFrontend(response.data);
  },

  updateGoal: async (id, data) => {
    const response = await apiClient.put(`/goals/${id}`, mapGoalToBackend(data));
    return mapGoalToFrontend(response.data);
  },

  deleteGoal: async (id) => {
    const response = await apiClient.delete(`/goals/${id}`);
    return response.data;
  },

  getGoalProgress: async (id) => {
    const response = await apiClient.get(`/goals/${id}/progress`);
    return response.data;
  },

  // Contributions
  getContributions: async (goalId) => {
    const response = await apiClient.get(`/goals/${goalId}/contributions`);
    return response.data.map(mapContribToFrontend);
  },

  addContribution: async (goalId, amount, date) => {
    const response = await apiClient.post(`/goals/${goalId}/contributions`, {
      goal_id: goalId,
      amount: Number(amount),
      date: date.split('T')[0] // Backend expects date format
    });
    return mapContribToFrontend(response.data);
  },

  deleteContribution: async (contributionId) => {
    const response = await apiClient.delete(`/goals/contributions/${contributionId}`);
    return response.data;
  }
};
