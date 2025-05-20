import apiService from './apiService'; // Import shared apiService
import { Role, RoleCreateDto, RoleUpdateDto, RoleListResponse as RolesApiResponse } from '../types/roles'; // Use types from types/roles
import { Permission } from '../types/permissions'; // Use types from types/permissions

// Removed local Role interface
// Removed local Permission interface

const ROLES_ENDPOINT = '/admin/roles'; // Changed from '/roles' to '/admin/roles'

const RoleService = {
  // Ensure this matches the expected structure (e.g. { roles: Role[] } or Role[])
  async getRoles(): Promise<RolesApiResponse> { // Expecting { roles: Role[] }
    const response = await apiService.get<RolesApiResponse | Role[]>(ROLES_ENDPOINT);
    // If API returns Role[] directly, apiService.get would likely give Role[]. 
    // If backend gives {roles: Role[]}, then RolesApiResponse is correct.
    // Assuming backend response matches RolesApiResponse: { roles: Role[] }
    if (Array.isArray(response.data)) {
        return { roles: response.data }; // Normalize to RolesApiResponse if backend returns Role[]
    }
    return response.data as RolesApiResponse; // Or directly response.data if it matches RolesApiResponse
  },
  async getRoleById(id: number): Promise<Role> {
    const response = await apiService.get<Role>(`${ROLES_ENDPOINT}/${id}`);
    return response.data;
  },
  async createRole(data: RoleCreateDto): Promise<Role> {
    const response = await apiService.post<Role>(ROLES_ENDPOINT, data);
    return response.data;
  },
  async updateRole(id: number, data: RoleUpdateDto): Promise<Role> {
    const response = await apiService.put<Role>(`${ROLES_ENDPOINT}/${id}`, data);
    return response.data;
  },
  async deleteRole(id: number): Promise<void> {
    await apiService.delete(`${ROLES_ENDPOINT}/${id}`);
  },
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const response = await apiService.get<Permission[]>(`${ROLES_ENDPOINT}/${roleId}/permissions`);
    return response.data;
  },
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await apiService.post(`${ROLES_ENDPOINT}/${roleId}/permissions/${permissionId}`);
  },
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await apiService.delete(`${ROLES_ENDPOINT}/${roleId}/permissions/${permissionId}`);
  },
};

export default RoleService; 