import apiService from './apiService';

class RoleService {
  async getRoles() {
    try {
      const response = await apiService.get('/api/admin/roles');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createRole(data) {
    try {
      const response = await apiService.post('/api/admin/roles', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(id) {
    try {
      const response = await apiService.get(`/api/admin/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id, data) {
    try {
      const response = await apiService.put(`/api/admin/roles/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(id) {
    try {
      const response = await apiService.delete(`/api/admin/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRolePermissions(id) {
    try {
      const response = await apiService.get(`/api/admin/roles/${id}/permissions`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async assignPermissionToRole(roleId, permissionId) {
    try {
      const response = await apiService.post(`/api/admin/roles/${roleId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removePermissionFromRole(roleId, permissionId) {
    try {
      const response = await apiService.delete(`/api/admin/roles/${roleId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new RoleService(); 