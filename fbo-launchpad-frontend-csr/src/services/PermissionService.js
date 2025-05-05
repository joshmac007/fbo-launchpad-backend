import apiService from './apiService';

class PermissionService {
  async getPermissions() {
    try {
      const response = await apiService.get('/api/admin/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PermissionService(); 