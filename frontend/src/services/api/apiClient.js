import axios from 'axios';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'set_auth_token',
  REFRESH_TOKEN: 'set_refresh_token',
  USER: 'set_auth_user',
};

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, retries, and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // If the response follows the standard { success: true, message, data }, unwrap it
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      // Modify response.data to just be the inner data
      // So that existing code relying on response.data works transparently
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    // Check if this is an authentication endpoint
    const url = originalRequest.url || '';
    const isAuthEndpoint = url.includes('/auth/login') ||
                           url.includes('/auth/register') ||
                           url.includes('/auth/refresh');

    // Handle 401 Unauthorized (Token expired or invalid) only for non-auth endpoints
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('Session expired');

        // Call backend refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        // If response is wrapped by middleware, use response.data.data, else response.data
        const tokenData = response.data.data || response.data;
        const { access_token, refresh_token: new_refresh_token } = tokenData;
        
        // Update tokens
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, access_token);
        if (new_refresh_token) {
          localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, new_refresh_token);
        }
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.warn('Session expired or token refresh failed.');
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }

    // Extract standardized backend error message if available
    if (error.response && error.response.data) {
      if (typeof error.response.data.message === 'string') {
        error.message = error.response.data.message;
      } else if (typeof error.response.data.detail === 'string') {
        error.message = error.response.data.detail;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
