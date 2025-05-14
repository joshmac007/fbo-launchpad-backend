import React, { useState, useEffect, FormEvent } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Aircraft, AircraftCreateDto, AircraftUpdateDto } from '../../services/AircraftService'; // Import types

// Form data can be a subset or mapped version of the main Aircraft type
// For simplicity, let's align it closely with fields the form manages.
// customer_id is string in form, converted to number on submit.
export interface AircraftFormData {
  tail_number: string;
  customer_id: string; // Keep as string for form input, parse on submit
  aircraft_type: string;
  fuel_type: string;
  // model and type from the main Aircraft interface are combined into aircraft_type here?
  // Or is aircraft_type a distinct field?
  // status is not managed by this form
}

interface AircraftFormProps {
  // initialData can be partial, matching the fields this form edits
  initialData?: Partial<Aircraft>; // Use Partial<Aircraft> from service
  onSubmit: (data: AircraftCreateDto | AircraftUpdateDto) => void; // Use DTOs for submission
  isSubmitting: boolean;
  apiError?: string | null; // Renamed from 'error' to avoid conflict with formError
  onCancel: () => void; // Changed from onClose to onCancel to match usage
}

const AircraftForm: React.FC<AircraftFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  apiError,
  onCancel,
}) => {
  const isEditMode = Boolean(initialData && initialData.id); // Check for id for edit mode

  const [formData, setFormData] = useState<AircraftFormData>(() => ({
    tail_number: initialData?.tail_number || '',
    customer_id: initialData?.customer_id?.toString() || '', // Assuming customer_id might be number in Aircraft
    aircraft_type: initialData?.type || initialData?.model || '', // Heuristic: use type or model if available for aircraft_type
    fuel_type: initialData?.fuel_type || '', // Assuming Aircraft might have fuel_type directly
  }));
  
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        tail_number: initialData.tail_number || '',
        customer_id: initialData.customer_id?.toString() || '', // initialData.customer_id might be number
        aircraft_type: initialData.type || initialData.model || '', // Or a specific field if available
        fuel_type: initialData.fuel_type || '',
      });
    }
    setFormError(null); // Reset form error when initialData changes
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError(null); // Clear error on change
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.tail_number.trim()) {
      setFormError('Tail number is required.');
      return;
    }
    if (!formData.aircraft_type.trim()) {
      setFormError('Aircraft type is required.');
      return;
    }
    if (!formData.fuel_type.trim()) {
      setFormError('Fuel type is required.');
      return;
    }

    // Prepare submission data based on DTOs
    const submissionData: Partial<AircraftCreateDto | AircraftUpdateDto> = {
      tail_number: formData.tail_number.trim(),
      // Assuming 'aircraft_type' from form maps to 'type' or 'model' in the backend Aircraft model.
      // This needs clarification. For now, let's assume 'type' is the primary field for this.
      type: formData.aircraft_type.trim(), // Or model, depending on backend
      fuel_type: formData.fuel_type.trim(),
      customer_id: formData.customer_id ? Number(formData.customer_id) : undefined, // Convert to number or undefined
    };

    // If model is also distinct and part of aircraft_type, it needs to be handled.
    // For now, this assumes aircraft_type maps to one field or we need to split it.

    onSubmit(submissionData as AircraftCreateDto | AircraftUpdateDto); // Cast as DTOs are subsets/partials of Aircraft
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <Input
        label="Tail Number *"
        id="tail_number"
        name="tail_number"
        value={formData.tail_number}
        onChange={handleChange}
        required
        readOnly={isEditMode}
        disabled={isSubmitting || isEditMode}
        placeholder="e.g. N12345"
        error={formError?.includes('Tail number') ? formError : undefined}
      />
      <Input
        label="Customer ID"
        id="customer_id"
        name="customer_id"
        type="text" // Changed to text to allow empty string, validation handles number conversion
        value={formData.customer_id}
        onChange={handleChange}
        disabled={isSubmitting}
        placeholder="Customer ID (optional)"
      />
      <Input
        label="Aircraft Type *"
        id="aircraft_type" // This might map to 'model' or 'type' in the backend Aircraft model
        name="aircraft_type"
        value={formData.aircraft_type}
        onChange={handleChange}
        required
        disabled={isSubmitting}
        placeholder="e.g. Cessna 172 / Fixed Wing Single-Engine"
        error={formError?.includes('Aircraft type') ? formError : undefined}
      />
      <Input
        label="Preferred Fuel Type *"
        id="fuel_type" // This field exists on OrderCreatePage, but not explicitly on Aircraft interface in AircraftService yet.
                      // Added it to AircraftService.Aircraft for consistency with this form.
        name="fuel_type"
        value={formData.fuel_type}
        onChange={handleChange}
        required
        disabled={isSubmitting}
        placeholder="e.g. Jet A, 100LL"
        error={formError?.includes('Fuel type') ? formError : undefined}
      />
      
      {(formError || apiError) && (
        <div className="p-sm rounded-md bg-status-error-surface text-status-error-text text-sm-regular">
          {formError || apiError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row-reverse gap-sm pt-md">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          isLoading={isSubmitting}
        >
          {isEditMode ? 'Update Aircraft' : 'Create Aircraft'}
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting} 
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AircraftForm; 