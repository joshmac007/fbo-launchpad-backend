import apiService from './apiService'; // Import shared apiService
import { Permission, PermissionListResponse } from '../types/permissions';

const PERMISSIONS_ENDPOINT = '/permissions'; // No API_BASE_URL prefix needed

const PermissionService = {
  async getPermissions(): Promise<PermissionListResponse> {
    const response = await apiService.get<PermissionListResponse | Permission[]>(PERMISSIONS_ENDPOINT);
    // Normalize if API returns Permission[] directly
    if (Array.isArray(response.data)) {
      return { permissions: response.data };
    }
    return response.data as PermissionListResponse; // Assuming it's already { permissions: Permission[] }
  },
  // Add other permission-related service methods if needed (e.g., getPermissionById, createPermission, etc.)
};

export default PermissionService; 