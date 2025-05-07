import React, { useState, useEffect } from 'react';

const AircraftForm = ({ initialData, onSubmit, isSubmitting, error }) => {
  const currentInitialData = initialData || {}; // Ensure currentInitialData is an object
  const isEditMode = Boolean(currentInitialData && currentInitialData.tail_number);
  const [formData, setFormData] = useState({
    tail_number: currentInitialData.tail_number || '',
    customer_id: currentInitialData.customer_id || '',
    aircraft_type: currentInitialData.aircraft_type || '',
    fuel_type: currentInitialData.fuel_type || ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const effectiveInitialData = initialData || {}; // Ensure effectiveInitialData is an object
    setFormData({
      tail_number: effectiveInitialData.tail_number || '',
      customer_id: effectiveInitialData.customer_id || '',
      aircraft_type: effectiveInitialData.aircraft_type || '',
      fuel_type: effectiveInitialData.fuel_type || ''
    });
    setFormError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (!formData.tail_number.trim() && !isEditMode) {
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

    // Prepare submission data
    const submissionData = {
      ...formData,
      customer_id: formData.customer_id ? Number(formData.customer_id) : null,
      tail_number: formData.tail_number.trim(),
      aircraft_type: formData.aircraft_type.trim(),
      fuel_type: formData.fuel_type.trim()
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Tail Number *</label>
        <input
          type="text"
          name="tail_number"
          className="input w-full"
          value={formData.tail_number}
          onChange={handleChange}
          required
          readOnly={isEditMode}
          placeholder="e.g. N12345"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Customer ID</label>
        <input
          type="number"
          name="customer_id"
          className="input w-full"
          value={formData.customer_id}
          onChange={handleChange}
          placeholder="Customer ID (optional)"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Aircraft Type *</label>
        <input
          type="text"
          name="aircraft_type"
          className="input w-full"
          value={formData.aircraft_type}
          onChange={handleChange}
          required
          placeholder="e.g. Boeing 737"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Fuel Type *</label>
        <input
          type="text"
          name="fuel_type"
          className="input w-full"
          value={formData.fuel_type}
          onChange={handleChange}
          required
          placeholder="e.g. Jet A"
        />
      </div>
      {(formError || error) && (
        <div className="text-red-600 text-sm">{formError || error}</div>
      )}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Aircraft' : 'Create Aircraft')}
      </button>
    </form>
  );
};

export default AircraftForm;
