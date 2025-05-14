import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { Truck, TruckCreateDto, TruckUpdateDto } from '../../types/trucks';

interface TruckFormData {
  truck_number: string;
  fuel_type: string;
  capacity: string; // Keep as string for form input, convert on submit
}

interface TruckFormProps {
  initialData?: Partial<Truck>;
  onSubmit: (data: TruckCreateDto | TruckUpdateDto) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null; // For API errors passed from parent
}

const TruckForm: React.FC<TruckFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  error: apiError, // Rename to avoid conflict with local error state
}) => {
  const [formData, setFormData] = useState<TruckFormData>({
    truck_number: initialData.truck_number || '',
    fuel_type: initialData.fuel_type || '',
    capacity: initialData.capacity?.toString() || ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData && initialData.id);

  useEffect(() => {
    setFormData({
      truck_number: initialData.truck_number || '',
      fuel_type: initialData.fuel_type || '',
      capacity: initialData.capacity?.toString() || ''
    });
    setFormError(null); // Clear local form error when initialData changes
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    if (!formData.truck_number.trim() || !formData.fuel_type.trim() || !formData.capacity.trim()) {
      setFormError('All fields are required.');
      return;
    }
    const capacityNum = Number(formData.capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      setFormError('Capacity must be a positive number.');
      return;
    }

    onSubmit({
      truck_number: formData.truck_number.trim(),
      fuel_type: formData.fuel_type.trim(),
      capacity: capacityNum
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-md p-xs sm:p-sm md:p-md">
        <h2 className="text-lg-strong text-neutral-text-primary mb-md">
          {isEditMode ? 'Edit Truck' : 'Create New Truck'}
        </h2>
        <div>
          <label htmlFor="truck_number" className="block mb-xs font-medium text-neutral-text-secondary">Truck Number *</label>
          <Input
            id="truck_number"
            name="truck_number"
            type="text"
            value={formData.truck_number}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g., T-101"
            required
          />
        </div>
        <div>
          <label htmlFor="fuel_type" className="block mb-xs font-medium text-neutral-text-secondary">Fuel Type *</label>
          <Input
            id="fuel_type"
            name="fuel_type"
            type="text"
            value={formData.fuel_type}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g., Jet A, 100LL"
            required
          />
        </div>
        <div>
          <label htmlFor="capacity" className="block mb-xs font-medium text-neutral-text-secondary">Capacity (gallons) *</label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g., 5000"
            required
          />
        </div>
        {(formError || apiError) && (
          <div className="text-status-error-text text-sm-regular mt-sm">
            {formError || apiError}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-sm pt-md">
          <Button variant="primary" type="submit" disabled={isSubmitting} fullWidthOnMobile>
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Truck' : 'Create Truck')}
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

export default TruckForm; 