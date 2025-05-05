import axios from 'axios';

// Helper function to build the correct API path
// Only add '/api' for endpoints that require it (like users and trucks)
// Do NOT add '/api' for endpoints like fuel-orders
export function getApiUrl(endpoint) {
  // Remove leading slash for consistency
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // Endpoints that need '/api' prefix
  const apiPrefixed = ['users', 'fuel-trucks', 'auth'];
  if (apiPrefixed.some(prefix => cleanEndpoint.startsWith(prefix))) {
    return `/api/${cleanEndpoint}`;
  }
  // All others (like 'fuel-orders') do NOT get '/api' prefix
  return `/${cleanEndpoint}`;
}

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    // Detect invalid/expired JWT or signature verification failure
    const isAuthError =
      [401, 422].includes(status) &&
      (
        (typeof data === 'string' && data.toLowerCase().includes('signature verification failed')) ||
        (typeof data?.msg === 'string' && data.msg.toLowerCase().includes('signature verification failed')) ||
        (typeof data?.error === 'string' && data.error.toLowerCase().includes('signature verification failed'))
      );

    if (isAuthError || (status === 401 && !originalRequest._retry)) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiService;
// Usage example elsewhere in your code:
// apiService.get(getApiUrl('/users')) // will call /api/users
// apiService.get(getApiUrl('/fuel-orders')) // will call /fuel-orders