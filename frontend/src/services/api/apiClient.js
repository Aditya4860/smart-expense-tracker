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
      
      // Token Refresh Stub
      // Note: Backend does not currently have a /refresh endpoint.
      // If it did, we would call it here, update localStorage, and retry originalRequest.
      // For now, we clear the session and force a logout.
      console.warn('Unauthorized request. Session expired.');
      localStorage.removeItem('set_auth_token');
      localStorage.removeItem('set_auth_user');
      
      // Optionally trigger a custom event that AuthContext can listen to for redirect
      window.dispatchEvent(new Event('auth-unauthorized'));
      
      return Promise.reject(error);
    }

    // Basic Retry Logic for 5xx errors or Network Errors
    if ((!error.response || error.response.status >= 500) && !originalRequest._retry5xx) {
      originalRequest._retry5xx = true;
      console.warn('Network error or 5xx error. Retrying request in 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient(originalRequest);
    }

    // Extract standardized backend error message if available
    if (error.response && error.response.data && error.response.data.detail) {
      error.message = error.response.data.detail;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
