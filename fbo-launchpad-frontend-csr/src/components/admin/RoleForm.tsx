import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea'; // Import the new Textarea component
import { Role, RoleCreateDto, RoleUpdateDto } from '../../services/RoleService'; // Assuming types are here

interface RoleFormProps {
  initialData?: Partial<Role> | null; // Allow partial for initial data, ID might be missing for create
  onSubmit: (data: RoleCreateDto | RoleUpdateDto) => void | Promise<void>;
  isSubmitting?: boolean;
  apiError?: string | null;
  onCancel?: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  apiError,
  onCancel,
}) => {
  const [formData, setFormData] = useState<RoleCreateDto | RoleUpdateDto>({
    name: '',
    description: '',
  });

  const isEditMode = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    // The Card wrapper might be redundant if the Modal already provides one.
    // For now, keeping it as per original structure. Can be removed if Modal handles Card styling.
    // <Card>
      <form onSubmit={handleSubmit} className="space-y-md">
        {/* Title is now handled by the Modal in RoleManagementPage.tsx */}
        {/* <h2 className="text-lg-strong text-neutral-text-primary dark:text-neutral-text-primary-dark mb-md">
          {isEditMode ? 'Edit Role' : 'Create New Role'}
        </h2> */}

        {apiError && (
          <div className="text-status-error-text dark:text-status-error-text-dark text-sm-regular mb-sm p-sm border border-status-error-border dark:border-status-error-border-dark bg-status-error-surface dark:bg-status-error-surface-dark rounded-md">
            {apiError}
          </div>
        )}

        <Input
          label="Name *"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter role name"
          disabled={isSubmitting}
        />

        <Textarea
          label="Description"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Enter role description (optional)"
          disabled={isSubmitting}
        />

        <div className="flex flex-col sm:flex-row gap-sm pt-md">
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting} // Added isLoading prop to Button
            fullWidthOnMobile
          >
            {isEditMode ? 'Update Role' : 'Create Role'}
          </Button>
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting} fullWidthOnMobile>
              Cancel
            </Button>
          )}
        </div>
      </form>
    // </Card>
  );
};

export default RoleForm; 