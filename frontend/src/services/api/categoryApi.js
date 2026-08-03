import apiClient from './apiClient';

export const categoryApi = {
  getCategories: async (type = null) => {
    const params = type ? { type } : {};
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },
  
  createCategory: async (data) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },
  
  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  }
};
