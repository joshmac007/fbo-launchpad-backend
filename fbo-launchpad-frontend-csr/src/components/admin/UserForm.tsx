import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Checkbox from '../common/Checkbox'; // Import the common Checkbox component

interface Role {
  id: number;
  name: string;
  // Add other role properties if necessary
}

interface UserFormData {
  name: string;
  email: string;
  password?: string; // Password is optional, especially in edit mode
  is_active: boolean;
}

// Data structure for initialData prop, might include more fields than UserFormData
interface InitialUser extends Partial<UserFormData> { // Use Partial as not all fields might be present
  id?: number; // Assuming user might have an ID
  roles?: Role[];
}

// Data structure for submission
interface UserSubmitData extends Omit<UserFormData, 'password'> {
  id?: number; // id might be needed for updates
  role_ids: number[];
  password?: string; // Conditionally added for creation
}

interface UserFormProps {
  initialData?: InitialUser;
  onSubmit: (data: UserSubmitData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  availableRoles: Role[];
}

const UserForm: React.FC<UserFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting,
  isEditMode,
  availableRoles = [],
}) => {
  const [formData, setFormData] = useState<UserFormData>(() => ({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
  }));
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(() => 
    initialData?.roles?.map(role => role.id) || []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '', // Always clear password field on initial load/data change for security
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    });
    setSelectedRoleIds(initialData?.roles?.map(role => role.id) || []);
  }, [initialData]);

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    // For type 'checkbox', `checked` property is on e.target, but our common Checkbox handles its own state via onCheckedChange
    // This standard handleChange is mostly for Input components now.
    setFormData(prev => ({
      ...prev,
      [name]: value, // Assuming Checkbox component's onCheckedChange will handle boolean values separately
    }));
  };

  const handleActiveChange = (newCheckedState: boolean) => {
    setFormData(prev => ({ ...prev, is_active: newCheckedState }));
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!formData.name.trim() || !formData.email.trim() || (!isEditMode && (!formData.password || !formData.password.trim()))) {
      setError('Name, email, and password (on create) are required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Invalid email format.');
      return;
    }
    if (formData.password && formData.password.length < 6 && !isEditMode) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (selectedRoleIds.length === 0) {
      setError('Please select at least one role.');
      return;
    }
    
    const userData: UserSubmitData = {
      id: initialData?.id, // Include ID if it exists (for updates)
      name: formData.name.trim(),
      email: formData.email.trim(),
      role_ids: selectedRoleIds,
      is_active: formData.is_active,
    };

    if (!isEditMode && formData.password) {
      userData.password = formData.password; // Only include password for creation
    } else if (isEditMode && formData.password && formData.password.trim() !== '') {
      // Optionally include password in edit mode if it's been changed and is not empty
      userData.password = formData.password.trim();
    }

    onSubmit(userData);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-md p-md">
        <h2 className="text-xl-strong text-neutral-text-primary dark:text-neutral-text-primary-dark mb-lg">
          {isEditMode ? 'Edit User' : 'Create User'}
        </h2>
        
        <Input
          id="name"
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Enter full name"
          required
        />
        
        <Input
          id="email"
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Enter email address"
          required
        />
        
        {!isEditMode && (
          <Input
            id="password"
            label="Password"
            type="password"
            name="password"
            value={formData.password || ''} // Ensure value is not undefined
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Enter password (min. 6 characters)"
            required
          />
        )}
         {isEditMode && (
          <Input
            id="password"
            label="New Password (optional)"
            type="password"
            name="password"
            value={formData.password || ''} // Ensure value is not undefined
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="Leave blank to keep current password"
          />
        )}

        <div>
          <label className="block mb-xs font-medium text-neutral-text-secondary dark:text-neutral-text-secondary-dark">Roles*</label>
          <div className="space-y-sm border border-neutral-border dark:border-neutral-border-dark rounded-md p-sm bg-neutral-surface-subtle dark:bg-neutral-surface-subtle-dark">
            {availableRoles.length === 0 ? (
              <p className="text-neutral-text-disabled dark:text-neutral-text-disabled-dark italic">Loading roles...</p>
            ) : (
              availableRoles.map(role => (
                <Checkbox
                  key={role.id}
                  id={`role-${role.id}`}
                  label={role.name}
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => handleRoleChange(role.id)}
                  disabled={isSubmitting}
                />
              ))
            )}
          </div>
        </div>

        <Checkbox
          id="is_active"
          label="Active"
          checked={formData.is_active}
          onChange={() => handleActiveChange(!formData.is_active)}
          disabled={isSubmitting}
        />

        {error && <div className="text-status-error-text dark:text-status-error-text-dark text-sm-regular p-sm bg-status-error-surface dark:bg-status-error-surface-dark rounded-md">{error}</div>}
        
        <div className="flex flex-col sm:flex-row gap-sm pt-md border-t border-neutral-border dark:border-neutral-border-dark mt-lg">
          <Button variant="primary" type="submit" disabled={isSubmitting} isLoading={isSubmitting} fullWidthOnMobile>
            {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Creating User...') : (isEditMode ? 'Save Changes' : 'Create User')}
          </Button>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting} fullWidthOnMobile>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm; 