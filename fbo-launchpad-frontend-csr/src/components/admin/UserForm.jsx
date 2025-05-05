import React, { useState, useEffect } from 'react';

export default function UserForm({ initialData = {}, onSubmit, onCancel, isSubmitting, isEditMode, availableRoles = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_active: true
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Don't populate password for edit
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
      // Set selected roles from initialData.roles array
      setSelectedRoleIds(initialData.roles?.map(role => role.id) || []);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        email: '',
        password: '',
        is_active: true
      });
      setSelectedRoleIds([]);
    }
  }, [initialData]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (roleId) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || (!isEditMode && !formData.password.trim())) {
      setError('Name, email, and password (on create) are required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Invalid email format.');
      return;
    }
    if (!isEditMode && formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (selectedRoleIds.length === 0) {
      setError('Please select at least one role.');
      return;
    }
    setError(null);

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role_ids: selectedRoleIds,
      is_active: formData.is_active
    };

    if (!isEditMode) {
      userData.password = formData.password;
    }

    onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{isEditMode ? 'Edit User' : 'Create User'}</h2>
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          className="input input-bordered w-full"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          className="input input-bordered w-full"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>
      {!isEditMode && (
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            className="input input-bordered w-full"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      )}
      <div>
        <label className="block mb-1 font-medium">Roles*</label>
        <div className="space-y-2 border rounded-lg p-3">
          {availableRoles.length === 0 ? (
            <p className="text-gray-500 italic">Loading roles...</p>
          ) : (
            availableRoles.map(role => (
              <div key={role.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => handleRoleChange(role.id)}
                  disabled={isSubmitting}
                  className="checkbox checkbox-primary"
                />
                <label htmlFor={`role-${role.id}`} className="cursor-pointer">
                  {role.name}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          disabled={isSubmitting}
          className="checkbox"
        />
        <label htmlFor="is_active">Active</label>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
