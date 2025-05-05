import React from 'react';
import PropTypes from 'prop-types';

function PermissionListTable({ permissions, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No permissions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permission Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {permissions.map((permission) => (
            <tr key={permission.name} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{permission.name}</code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {permission.description || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

PermissionListTable.propTypes = {
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default PermissionListTable; 