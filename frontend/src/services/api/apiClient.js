import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('set_auth_token');
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired or invalid)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('set_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Call backend refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;
        
        // Update tokens
        localStorage.setItem('set_auth_token', access_token);
        localStorage.setItem('set_refresh_token', new_refresh_token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.warn('Refresh token failed. Session expired.');
        localStorage.removeItem('set_auth_token');
        localStorage.removeItem('set_refresh_token');
        localStorage.removeItem('set_auth_user');
        window.dispatchEvent(new Event('auth-unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    // (Removed naive 5xx retry logic per audit requirements)

    // Extract standardized backend error message if available
    if (error.response && error.response.data && error.response.data.detail) {
      error.message = error.response.data.detail;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
