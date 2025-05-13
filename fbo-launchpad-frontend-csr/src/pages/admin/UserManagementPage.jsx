import React, { useEffect, useState } from 'react';
import UserService from '../../services/UserService';
import RoleService from '../../services/RoleService';
import UserForm from '../../components/admin/UserForm';
import Modal from '../../components/common/Modal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, hasPermission } = useAuth();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        UserService.getUsers(),
        RoleService.getRoles()
      ]);
      setUsers(usersData);
      setAvailableRoles(rolesData.roles || []);
    } catch (e) {
      setError('Failed to load data.');
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await UserService.deleteUser(id);
      fetchData();
    } catch (e) {
      alert('Delete failed.');
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingUser && editingUser.id) {
        await UserService.updateUser(editingUser.id, formData);
      } else {
        await UserService.createUser(formData);
      }
      setShowFormModal(false);
      setEditingUser(null);
      fetchData();
    } catch (e) {
      alert('Save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">User Management</h1>
        {isAuthenticated && hasPermission('MANAGE_USERS') && (
          <button className="btn btn-primary shadow-md" onClick={handleCreate}>Create New User</button>
        )}
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4">
        {isLoading ? (
          <div className="py-8 text-center text-blue-600 animate-pulse">Loading users...</div>
        ) : error ? (
          <div className="text-red-600 py-8 text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-xl overflow-hidden">
              <thead className="sticky top-0 z-10 bg-blue-50/80">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left">ID</th>
                  <th className="px-4 py-2 font-semibold text-left">Name</th>
                  <th className="px-4 py-2 font-semibold text-left">Email</th>
                  <th className="px-4 py-2 font-semibold text-left">Roles</th>
                  <th className="px-4 py-2 font-semibold text-left">Active</th>
                  <th className="px-4 py-2 font-semibold text-left">Created At</th>
                  <th className="px-4 py-2 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id} className={i % 2 === 0 ? 'even:bg-gray-50' : ''}>
                    <td className="px-4 py-2 whitespace-nowrap">{user.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <span
                            key={role.id}
                            className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {role.name}
                          </span>
                        )) || 'No roles'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {user.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : ''}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center space-x-1">
                      {isAuthenticated && hasPermission('EDIT_USER') && (
                        <button
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-blue-100 text-blue-700 transition"
                          title="Edit"
                          onClick={() => handleEdit(user)}
                        >
                          <FaEdit />
                        </button>
                      )}
                      {isAuthenticated && hasPermission('DELETE_USER') && (
                        <button
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-red-100 text-red-700 transition"
                          title="Delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <UserForm
          initialData={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
          isEditMode={!!editingUser}
          availableRoles={availableRoles}
        />
      </Modal>
    </div>
  );
}

