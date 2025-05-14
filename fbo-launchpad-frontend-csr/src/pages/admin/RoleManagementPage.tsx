import React, { useState, useEffect, useCallback } from 'react';
import { Role, RoleCreateDto, RoleUpdateDto, RoleListResponse } from '../../types/roles';
import { Permission, PermissionListResponse } from '../../types/permissions';
import RoleService from '../../services/RoleService';
import PermissionService from '../../services/PermissionService';
import Table, { ColumnDef } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import RolePermissionManager from '../../components/admin/RolePermissionManager';
import RoleForm from '../../components/admin/RoleForm';
import { useAuth } from '../../contexts/AuthContext';
import { PlusCircle, Edit3, Trash2, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiFormError, setApiFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [roleFormModalOpen, setRoleFormModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

  const { isAuthenticated, hasPermission } = useAuth();

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: RoleListResponse = await RoleService.getRoles();
      setRoles(response.roles || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
      toast.error(err.message || 'Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      const response: PermissionListResponse = await PermissionService.getPermissions();
      setAllPermissions(response.permissions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
      toast.error(err.message || 'Failed to fetch permissions');
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const data = await RoleService.getRolePermissions(roleId);
      setAssignedPermissions(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch role permissions');
      toast.error(err.message || 'Failed to fetch role permissions');
    }
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setApiFormError(null);
    setRoleFormModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setApiFormError(null);
    setRoleFormModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteConfirmModalOpen(true);
  };

  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    await fetchRolePermissions(role.id);
    setPermissionModalOpen(true);
  };

  const handleRoleSubmit = async (formData: RoleCreateDto | RoleUpdateDto) => {
    setIsSubmitting(true);
    setApiFormError(null);
    try {
      if (selectedRole && selectedRole.id) {
        await RoleService.updateRole(selectedRole.id, formData as RoleUpdateDto);
        toast.success('Role updated successfully');
      } else {
        await RoleService.createRole(formData as RoleCreateDto);
        toast.success('Role created successfully');
      }
      await fetchRoles();
      setRoleFormModalOpen(false);
      setSelectedRole(null);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save role';
      setApiFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setApiFormError(null);
    try {
      await RoleService.deleteRole(selectedRole.id);
      toast.success('Role deleted successfully');
      await fetchRoles();
      setDeleteConfirmModalOpen(false);
      setSelectedRole(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPermission = async (permissionId: number) => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await RoleService.assignPermissionToRole(selectedRole.id, permissionId);
      toast.success('Permission assigned');
      await fetchRolePermissions(selectedRole.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await RoleService.removePermissionFromRole(selectedRole.id, permissionId);
      toast.success('Permission removed');
      await fetchRolePermissions(selectedRole.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = React.useMemo<ColumnDef<Role>[]>(() => [
    { accessorKey: 'id', header: 'ID', cell: info => info.getValue() },
    { accessorKey: 'name', header: 'Name', cell: info => info.getValue() },
    { accessorKey: 'description', header: 'Description', cell: info => info.getValue() || 'N/A' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center justify-end gap-xs">
            {isAuthenticated && hasPermission('MANAGE_ROLE_PERMISSIONS') && (
              <Button variant="ghost" size="icon" onClick={() => handleManagePermissions(role)} aria-label="Manage Permissions">
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {isAuthenticated && hasPermission('EDIT_ROLE') && (
              <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} aria-label="Edit Role">
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {isAuthenticated && hasPermission('DELETE_ROLE') && (
              <Button variant="destructive" size="icon" onClick={() => handleDelete(role)} aria-label="Delete Role">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [isAuthenticated, hasPermission, fetchRoles]);

  return (
    <div className="p-md lg:p-lg">
      <PageHeader 
        title="Role Management"
        actions={
          isAuthenticated && hasPermission('MANAGE_ROLES') ? (
            <Button variant="primary" onClick={handleCreate} icon={<PlusCircle />}>
              Create Role
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="my-md p-sm bg-status-error-surface dark:bg-status-error-surface-dark text-status-error-text dark:text-status-error-text-dark rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-lg">
        <Table<Role>
          columns={columns}
          data={roles}
          isLoading={isLoading}
          emptyStateMessage="No roles found. Click 'Create Role' to add a new one."
        />
      </div>

      {roleFormModalOpen && (
        <Modal
          isOpen={roleFormModalOpen}
          onClose={() => { setRoleFormModalOpen(false); setSelectedRole(null); setApiFormError(null); }}
          title={selectedRole ? 'Edit Role' : 'Create Role'}
          size="md"
        >
          <RoleForm
            initialData={selectedRole}
            onSubmit={handleRoleSubmit}
            isSubmitting={isSubmitting}
            apiError={apiFormError}
            onCancel={() => { setRoleFormModalOpen(false); setSelectedRole(null); setApiFormError(null); }}
          />
        </Modal>
      )}

      {deleteConfirmModalOpen && selectedRole && (
        <Modal
          isOpen={deleteConfirmModalOpen}
          onClose={() => { setDeleteConfirmModalOpen(false); setSelectedRole(null); }}
          title="Confirm Delete Role"
          size="sm"
        >
          <div className="space-y-md">
            <p>Are you sure you want to delete the role "<strong>{selectedRole.name}</strong>"?</p>
            <p className="text-sm-regular text-neutral-text-secondary dark:text-neutral-text-secondary-dark">This action cannot be undone.</p>
            <div className="flex justify-end gap-sm pt-md">
              <Button variant="outline" onClick={() => { setDeleteConfirmModalOpen(false); setSelectedRole(null); }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete Role'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {permissionModalOpen && selectedRole && (
        <Modal
          isOpen={permissionModalOpen}
          onClose={() => setPermissionModalOpen(false)}
          title={`Manage Permissions for ${selectedRole.name}`}
          size="lg"
        >
          <RolePermissionManager
            role={selectedRole}
            assignedPermissions={assignedPermissions}
            allPermissions={allPermissions}
            onAssign={handleAssignPermission}
            onRemove={handleRemovePermission}
            isLoading={isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
};

export default RoleManagementPage; 