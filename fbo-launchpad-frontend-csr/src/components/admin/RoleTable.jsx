import React from 'react';
import PropTypes from 'prop-types';

const RoleTable = ({ roles, onEdit, onDelete, onManagePermissions, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading roles...</div>;
  }

  if (!roles?.length) {
    return <div className="text-center py-4">No roles found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.name}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{role.description || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onManagePermissions(role)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Permissions
                </button>
                <button
                  onClick={() => onEdit(role)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(role)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

RoleTable.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onManagePermissions: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

RoleTable.defaultProps = {
  isLoading: false,
};

export default RoleTable; 