import apiClient from './apiClient';

export const authApi = {
  login: async (email, password) => {
    // In a real OAuth2 / JWT backend, this might use FormData for OAuth2PasswordRequestForm
    // But assuming the backend accepts a JSON payload for login based on typical schemas:
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { full_name: name, email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateMe: async (data) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },
};

