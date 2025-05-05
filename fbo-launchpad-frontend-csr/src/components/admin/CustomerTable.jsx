import React from 'react';

const CustomerTable = ({ customerList = [], onEdit, onDelete, isLoading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Name</th>
            <th className="px-4 py-2 border-b">Created At</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
          ) : (
            customerList.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No customers found.</td></tr>
            ) : (
              customerList.map(customer => (
                <tr key={customer.id}>
                  <td className="px-4 py-2 border-b">{customer.id}</td>
                  <td className="px-4 py-2 border-b">{customer.name}</td>
                  <td className="px-4 py-2 border-b">{customer.created_at ? new Date(customer.created_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 border-b space-x-2">
                    <button className="btn btn-xs btn-outline" onClick={() => onEdit(customer)}>Edit</button>
                    <button className="btn btn-xs btn-danger" onClick={() => onDelete(customer.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
