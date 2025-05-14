import { API_BASE_URL } from '../config';
import { getAuthToken } from '../utils/auth';
import { Permission, PermissionListResponse } from '../types/permissions';

const PERMISSIONS_ENDPOINT = `${API_BASE_URL}/permissions`;

// Basic fetchApi helper (can be moved to a shared util or imported if RoleService's is made exportable)
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }
  return response.status === 204 ? null as T : response.json();
}

const PermissionService = {
  async getPermissions(): Promise<PermissionListResponse> {
    const data = await fetchApi<PermissionListResponse | Permission[]>(PERMISSIONS_ENDPOINT);
    // Normalize if API returns Permission[] directly
    if (Array.isArray(data)) {
      return { permissions: data };
    }
    return data as PermissionListResponse; // Assuming it's already { permissions: Permission[] }
  },
  // Add other permission-related service methods if needed (e.g., getPermissionById, createPermission, etc.)
};

export default PermissionService; 