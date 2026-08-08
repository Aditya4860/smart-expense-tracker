import apiClient from './apiClient';

export const categoryApi = {
  getCategories: async (type = null) => {
    const params = type ? { type } : {};
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },
  
  createCategory: async (data) => {
    const payload = {
      name: String(data.name || '').trim(),
      type: String(data.type || 'EXPENSE').toUpperCase(),
      icon: data.icon || null,
      color: data.color || null,
    };
    const response = await apiClient.post('/categories', payload);
    return response.data;
  },
  
  updateCategory: async (id, data) => {
    const payload = {
      name: data.name !== undefined ? String(data.name).trim() : undefined,
      type: data.type !== undefined ? String(data.type).toUpperCase() : undefined,
      icon: data.icon,
      color: data.color,
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    const response = await apiClient.put(`/categories/${id}`, payload);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  seedPresets: async () => {
    const response = await apiClient.post('/categories/seed');
    return response.data;
  }
};
