import React from 'react';
import Button from '../common/Button';
import { Role } from '../../types/roles';
import { Permission } from '../../types/permissions';

interface RolePermissionManagerProps {
  role: Role;
  allPermissions: Permission[];
  assignedPermissions: Permission[];
  onAssign: (permissionId: number) => void | Promise<void>;
  onRemove: (permissionId: number) => void | Promise<void>;
  isLoading?: boolean;
}

const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  role,
  allPermissions,
  assignedPermissions,
  onAssign,
  onRemove,
  isLoading = false,
}) => {
  const availablePermissions: Permission[] = allPermissions.filter(
    (permission) => !assignedPermissions.find((ap) => ap.id === permission.id)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-lg rounded-md border border-neutral-border dark:border-neutral-border-dark bg-neutral-surface dark:bg-neutral-surface-alt space-y-sm">
        <div className="animate-spin rounded-full h-md w-md border-b-2 border-primary"></div>
        <p className="text-neutral-text-disabled dark:text-neutral-text-disabled-dark italic">Loading permissions...</p>
      </div>
    );
  }

  const renderPermissionList = (permissions: Permission[], actionType: 'assign' | 'remove') => {
    if (permissions.length === 0) {
      return (
        <div className="p-md text-sm-regular text-neutral-text-disabled dark:text-neutral-text-disabled-dark italic">
          {actionType === 'assign' ? 'No available permissions to assign.' : 'No permissions currently assigned.'}
        </div>
      );
    }
    return permissions.map((permission) => (
      <div
        key={permission.id}
        className="p-md flex items-center justify-between hover:bg-neutral-surface-hover dark:hover:bg-neutral-surface-hover-dark transition-colors"
      >
        <div>
          <p className="text-sm-medium text-neutral-text-primary dark:text-neutral-text-primary-dark">{permission.name}</p>
          {permission.description && (
            <p className="text-sm-regular text-neutral-text-secondary dark:text-neutral-text-secondary-dark mt-xxs">{permission.description}</p>
          )}
        </div>
        <Button
          variant={actionType === 'remove' ? 'destructive' : 'primary'} // Use 'primary' for assign, 'destructive' for remove
          size="sm"
          onClick={() => actionType === 'assign' ? onAssign(permission.id) : onRemove(permission.id)}
          aria-label={`${actionType === 'assign' ? 'Assign' : 'Remove'} permission ${permission.name}`}
          className="ml-md"
        >
          {actionType === 'assign' ? 'Assign' : 'Remove'}
        </Button>
      </div>
    ));
  };

  return (
    <div className="space-y-lg">
      <div>
        {/* The title is now part of the Modal in RoleManagementPage.tsx */}
        {/* <h3 className="text-lg-strong text-neutral-text-primary dark:text-neutral-text-primary-dark">
          Manage Permissions for Role: <span className="text-primary dark:text-primary-dark">{role.name}</span>
        </h3>
        <p className="mt-xs text-sm-regular text-neutral-text-secondary dark:text-neutral-text-secondary-dark">
          Assign or remove permissions for this role.
        </p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Available Permissions */}
        <div className="space-y-sm">
          <h4 className="text-md-medium text-neutral-text-primary dark:text-neutral-text-primary-dark">Available Permissions</h4>
          <div className="border border-neutral-border dark:border-neutral-border-dark rounded-md divide-y divide-neutral-border dark:divide-neutral-border-dark bg-neutral-surface dark:bg-neutral-surface-alt">
            {renderPermissionList(availablePermissions, 'assign')}
          </div>
        </div>

        {/* Assigned Permissions */}
        <div className="space-y-sm">
          <h4 className="text-md-medium text-neutral-text-primary dark:text-neutral-text-primary-dark">Assigned Permissions</h4>
          <div className="border border-neutral-border dark:border-neutral-border-dark rounded-md divide-y divide-neutral-border dark:divide-neutral-border-dark bg-neutral-surface dark:bg-neutral-surface-alt">
            {renderPermissionList(assignedPermissions, 'remove')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManager; 