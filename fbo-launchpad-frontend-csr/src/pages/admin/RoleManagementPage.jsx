import React, { useState, useEffect } from 'react';
import RoleService from '../../services/RoleService';
import PermissionService from '../../services/PermissionService';
import RoleTable from '../../components/admin/RoleTable';
import RoleForm from '../../components/admin/RoleForm';
import RolePermissionManager from '../../components/admin/RolePermissionManager';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';

const RoleManagementPage = () => {
  // State
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [roleFormModalOpen, setRoleFormModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  const { isAuthenticated, hasPermission } = useAuth();

  // Fetch roles and permissions on mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const data = await RoleService.getRoles();
      setRoles(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch roles');
      setIsLoading(false);
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const data = await PermissionService.getPermissions();
      setAllPermissions(data);
    } catch (err) {
      setError('Failed to fetch permissions');
    }
  };

  // Fetch role permissions
  const fetchRolePermissions = async (roleId) => {
    try {
      const data = await RoleService.getRolePermissions(roleId);
      setAssignedPermissions(data);
    } catch (err) {
      setError('Failed to fetch role permissions');
    }
  };

  // Create role
  const handleCreate = () => {
    setSelectedRole(null);
    setRoleFormModalOpen(true);
  };

  // Edit role
  const handleEdit = (role) => {
    setSelectedRole(role);
    setRoleFormModalOpen(true);
  };

  // Delete role
  const handleDelete = (role) => {
    setSelectedRole(role);
    setDeleteConfirmModalOpen(true);
  };

  // Manage permissions
  const handleManagePermissions = async (role) => {
    setSelectedRole(role);
    await fetchRolePermissions(role.id);
    setPermissionModalOpen(true);
  };

  // Submit role form
  const handleRoleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (selectedRole) {
        await RoleService.updateRole(selectedRole.id, formData);
      } else {
        await RoleService.createRole(formData);
      }
      await fetchRoles();
      setRoleFormModalOpen(false);
    } catch (err) {
      setError('Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm role deletion
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await RoleService.deleteRole(selectedRole.id);
      await fetchRoles();
      setDeleteConfirmModalOpen(false);
    } catch (err) {
      setError('Failed to delete role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign permission to role
  const handleAssignPermission = async (permissionId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await RoleService.assignPermissionToRole(selectedRole.id, permissionId);
      await fetchRolePermissions(selectedRole.id);
    } catch (err) {
      setError('Failed to assign permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove permission from role
  const handleRemovePermission = async (permissionId) => {
    setIsSubmitting(true);
    setError('');

    try {
      await RoleService.removePermissionFromRole(selectedRole.id, permissionId);
      await fetchRolePermissions(selectedRole.id);
    } catch (err) {
      setError('Failed to remove permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Role Management</h1>
        {isAuthenticated && hasPermission('MANAGE_ROLES') && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Role
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <RoleTable
        roles={roles}
        onEdit={isAuthenticated && hasPermission('EDIT_ROLE') ? handleEdit : undefined}
        onDelete={isAuthenticated && hasPermission('DELETE_ROLE') ? handleDelete : undefined}
        onManagePermissions={isAuthenticated && hasPermission('MANAGE_ROLE_PERMISSIONS') ? handleManagePermissions : undefined}
        isLoading={isLoading}
      />

      {/* Role Form Modal */}
      <Modal
        isOpen={roleFormModalOpen}
        onClose={() => setRoleFormModalOpen(false)}
        title={selectedRole ? 'Edit Role' : 'Create Role'}
      >
        <RoleForm
          initialData={selectedRole}
          onSubmit={handleRoleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        title="Delete Role"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete the role "{selectedRole?.name}"?</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setDeleteConfirmModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Permission Management Modal */}
      <Modal
        isOpen={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        title="Manage Permissions"
      >
        {selectedRole && (
          <RolePermissionManager
            role={selectedRole}
            allPermissions={allPermissions}
            assignedPermissions={assignedPermissions}
            onAssign={handleAssignPermission}
            onRemove={handleRemovePermission}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default RoleManagementPage; 