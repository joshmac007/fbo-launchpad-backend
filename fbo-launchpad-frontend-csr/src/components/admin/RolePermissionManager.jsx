import React from 'react';
import PropTypes from 'prop-types';

const RolePermissionManager = ({
  role,
  allPermissions,
  assignedPermissions,
  onAssign,
  onRemove,
  isLoading,
}) => {
  const availablePermissions = allPermissions.filter(
    (permission) => !assignedPermissions.find((ap) => ap.id === permission.id)
  );

  if (isLoading) {
    return <div className="text-center py-4">Loading permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Manage Permissions for Role: {role.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Assign or remove permissions for this role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Permissions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Permissions</h4>
          <div className="border rounded-md divide-y">
            {availablePermissions.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No available permissions</div>
            ) : (
              availablePermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                    {permission.description && (
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onAssign(permission.id)}
                    className="ml-4 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Assign
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Permissions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Permissions</h4>
          <div className="border rounded-md divide-y">
            {assignedPermissions.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No assigned permissions</div>
            ) : (
              assignedPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                    {permission.description && (
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(permission.id)}
                    className="ml-4 text-sm text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

RolePermissionManager.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  allPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  assignedPermissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  onAssign: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

RolePermissionManager.defaultProps = {
  isLoading: false,
};

export default RolePermissionManager; 