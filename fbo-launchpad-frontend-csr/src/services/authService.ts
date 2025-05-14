import apiService from './apiService';
import { Permission } from '../types/permissions'; // Assuming Permission type is defined here

interface LoginResponse {
  token: string;
  user?: any; // Define a User type if backend provides user details on login
  // Add other potential fields from login response
}

interface PermissionsResponse {
  permissions: Permission[];
  // Add other potential fields from permissions response
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  localStorage.removeItem('accessToken');
  try {
    const response = await apiService.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    if (response.data && response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      return response.data;
    }
    throw new Error('Login failed: No access token received');
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem('accessToken');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getMyPermissions = async (): Promise<Permission[]> => {
  try {
    // Assuming the endpoint /auth/me/permissions returns an object like { permissions: Permission[] }
    const response = await apiService.get<PermissionsResponse>('/auth/me/permissions');
    return response.data?.permissions || [];
  } catch (error: any) {
    console.error("Error fetching user permissions:", error.response?.data || error.message);
    // Ensure a consistent error shape or re-throw a new error with a message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user permissions';
    throw new Error(errorMessage);
  }
};

const AuthService = {
  loginUser,
  logoutUser,
  getStoredToken,
  getMyPermissions,
};

export default AuthService; 