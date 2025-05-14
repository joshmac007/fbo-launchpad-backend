import { API_BASE_URL } from '../config';
import { getAuthToken } from '../utils/auth';
import { Role, RoleCreateDto, RoleUpdateDto, RoleListResponse as RolesApiResponse } from '../types/roles'; // Use types from types/roles
import { Permission } from '../types/permissions'; // Use types from types/permissions

// Removed local Role interface
// Removed local Permission interface

const ROLES_ENDPOINT = `${API_BASE_URL}/roles`;

// Basic fetchApi helper (can be moved to a shared util)
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
  // Check for 204 No Content before .json()
  if (response.status === 204) {
    return null as T; // Or handle as appropriate for void promises
  }
  return response.json();
}

const RoleService = {
  // Ensure this matches the expected structure (e.g. { roles: Role[] } or Role[])
  async getRoles(): Promise<RolesApiResponse> { // Expecting { roles: Role[] }
    // If API returns Role[] directly, change return type to Promise<Role[]> and adjust usage
    const data = await fetchApi<RolesApiResponse | Role[]>(ROLES_ENDPOINT);
    if (Array.isArray(data)) {
        return { roles: data }; // Normalize to RolesApiResponse
    }
    return data as RolesApiResponse; // Assuming it's already RolesApiResponse
  },
  async getRoleById(id: number): Promise<Role> {
    return fetchApi<Role>(`${ROLES_ENDPOINT}/${id}`);
  },
  async createRole(data: RoleCreateDto): Promise<Role> {
    return fetchApi<Role>(ROLES_ENDPOINT, { method: 'POST', body: JSON.stringify(data) });
  },
  async updateRole(id: number, data: RoleUpdateDto): Promise<Role> {
    return fetchApi<Role>(`${ROLES_ENDPOINT}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteRole(id: number): Promise<void> {
    await fetchApi<void>(`${ROLES_ENDPOINT}/${id}`, { method: 'DELETE' });
  },
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return fetchApi<Permission[]>(`${ROLES_ENDPOINT}/${roleId}/permissions`);
  },
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await fetchApi<void>(`${ROLES_ENDPOINT}/${roleId}/permissions/${permissionId}`, { method: 'POST' });
  },
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await fetchApi<void>(`${ROLES_ENDPOINT}/${roleId}/permissions/${permissionId}`, { method: 'DELETE' });
  },
};

export default RoleService; 