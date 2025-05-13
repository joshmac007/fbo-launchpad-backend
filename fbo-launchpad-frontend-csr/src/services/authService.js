import apiService from './apiService';

export const loginUser = async (email, password) => {
  localStorage.removeItem('accessToken');
  try {
    const response = await apiService.post('/auth/login', {
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

export const getMyPermissions = async () => {
  try {
    const response = await apiService.get('/auth/me/permissions');
    return response.data.permissions || [];
  } catch (error) {
    console.error("Error fetching user permissions:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch user permissions' };
  }
}; 