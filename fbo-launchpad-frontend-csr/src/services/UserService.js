import apiService from './apiService';

export const getUsers = async (params = {}) => {
  try {
    const response = await apiService.get('/users', { params });
    return response.data.users || []; // Assuming { message, users } structure
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
}; 