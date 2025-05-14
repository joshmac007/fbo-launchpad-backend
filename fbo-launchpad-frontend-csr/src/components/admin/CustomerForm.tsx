import React, { useState, useEffect, FormEvent } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { Customer } from '../../types/customers'; // Assuming Customer type is defined here

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: { name: string }) => void;
  isSubmitting?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  error = null,
  onCancel,
}) => {
  const isEditMode = Boolean(initialData && initialData.id);
  const [name, setName] = useState<string>(initialData.name || '');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    setName(initialData.name || '');
    setFormError('');
  }, [initialData]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    onSubmit({ name: name.trim() });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-md p-xs sm:p-sm md:p-md">
        <h2 className="text-lg-strong text-neutral-text-primary mb-md">
          {isEditMode ? 'Edit Customer' : 'Create New Customer'}
        </h2>
        <div>
          <label htmlFor="customerName" className="block mb-xs font-medium text-neutral-text-secondary">Customer Name *</label>
          <Input
            id="customerName"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Enter customer name"
          />
        </div>
        {(formError || error) && (
          <div className="text-status-error-text text-sm-regular mt-sm">{formError || error}</div>
        )}
        <div className="flex flex-col sm:flex-row gap-sm pt-md">
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            fullWidthOnMobile
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Create Customer')}
          </Button>
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting} fullWidthOnMobile>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default CustomerForm; 