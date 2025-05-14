import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config'; // Import from centralized config

const apiService: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // Use imported API_BASE_URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiService.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const data = error.response?.data;

    const isAuthError =
      status && [401, 422].includes(status) &&
      (
        (typeof data === 'string' && data.toLowerCase().includes('signature verification failed')) ||
        (typeof data?.msg === 'string' && data.msg.toLowerCase().includes('signature verification failed')) ||
        (typeof data?.error === 'string' && data.error.toLowerCase().includes('signature verification failed'))
      );

    if (isAuthError || (status === 401 && originalRequest && !originalRequest._retry)) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiService; 