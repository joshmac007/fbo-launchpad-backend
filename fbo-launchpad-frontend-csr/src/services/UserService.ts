import apiService from './apiService';
import { User, UserListResponse, UserCreateDto, UserUpdateDto } from '../types/users';

interface GetUsersFilters {
  role_ids?: (number | string)[];
  is_active?: boolean;
  // Add other potential filter keys here
  [key: string]: any; // Allow arbitrary filters for extensibility
}

export const getUsers = async (filters: GetUsersFilters = {}): Promise<UserListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.role_ids && filters.role_ids.length > 0) {
      filters.role_ids.forEach(id => params.append('role_ids', String(id)));
    }
    if (filters.is_active !== undefined && filters.is_active !== null) {
      params.append('is_active', String(filters.is_active));
    }
    // Extend with other filters if necessary
    Object.keys(filters).forEach(key => {
      if (key !== 'role_ids' && key !== 'is_active' && filters[key] !== undefined) {
        params.append(key, String(filters[key]));
      }
    });
        
    const queryString = params.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    // console.log(`UserService.getUsers: Fetching URL: ${url}`);
    const response = await apiService.get<UserListResponse | User[]>(url); // Backend might return User[] directly or UserListResponse
    // console.log("UserService.getUsers response:", response.data);

    // Normalize to UserListResponse
    if (Array.isArray(response.data)) {
      return { users: response.data };
    }
    return response.data; 
  } catch (error: any) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch users');
  }
};

export const createUser = async (userData: UserCreateDto): Promise<User> => {
  try {
    // console.log("UserService.createUser: Sending data:", userData);
    const response = await apiService.post<User>('/admin/users', userData);
    // console.log("UserService.createUser response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create user');
  }
};

export const updateUser = async (userId: number | string, userData: UserUpdateDto): Promise<User> => {
  try {
    // console.log(`UserService.updateUser: Updating user ${userId} with data:`, userData);
    const response = await apiService.patch<User>(`/admin/users/${userId}`, userData);
    // console.log("UserService.updateUser response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update user');
  }
};

// This function actually deactivates/activates a user (soft delete or status change)
// The original .js used DELETE for deactivation. Assuming PATCH is more appropriate for is_active toggle.
// If backend strictly uses DELETE for deactivation, then this needs adjustment.
// For now, let's assume updateUser handles is_active toggle.
export const deleteUser = async (userId: number | string): Promise<void> => {
  try {
    // console.log(`UserService.deleteUser: Deactivating user ${userId}`);
    // If the backend has a specific DELETE endpoint for soft delete that sets is_active=false:
    await apiService.delete(`/admin/users/${userId}`);
    // console.log("UserService.deleteUser response: User deactivated");
    // No specific data returned usually for a 204 No Content response
  } catch (error: any) {
    console.error(`Error deactivating user ${userId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to deactivate user');
  }
};

const UserService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser // This is more like a soft delete/deactivate
};

export default UserService; 