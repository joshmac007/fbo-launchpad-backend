import apiService, { getApiUrl } from './apiService';

export const loginUser = async (email, password) => {
  // Always clear any old token before login
  localStorage.removeItem('accessToken');
  try {
    const response = await apiService.post(getApiUrl('/auth/login'), {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      return response.data;
    }
    
    throw new Error('Login failed: No access token received');
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};

export const logoutUser = () => {
  localStorage.removeItem('accessToken');
};

export const getStoredToken = () => {
  return localStorage.getItem('accessToken');
}; 