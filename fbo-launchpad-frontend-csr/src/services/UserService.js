import apiService, { getApiUrl } from './apiService';

export const getUsers = async (params = {}) => {
  try {
    const response = await apiService.get(getApiUrl('/users/'), { params });
    return response.data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

export const createUser = async (userData) => {
  // userData: {name, email, password, role_ids, is_active}
  try {
    const response = await apiService.post(getApiUrl('/users/'), userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create user' };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await apiService.get(getApiUrl(`/users/${userId}`));
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

export const updateUser = async (userId, updateData) => {
  // updateData: {name, email, role_ids, is_active} (no password)
  try {
    const response = await apiService.patch(getApiUrl(`/users/${userId}`), updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiService.delete(getApiUrl(`/users/${userId}`));
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

const UserService = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};

export default UserService;