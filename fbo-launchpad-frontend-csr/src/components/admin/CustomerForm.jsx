import React, { useState, useEffect } from 'react';

const CustomerForm = ({ initialData = {}, onSubmit, isSubmitting, error }) => {
  const isEditMode = Boolean(initialData && initialData.id);
  const [name, setName] = useState(initialData.name || '');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setName(initialData.name || '');
    setFormError('');
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Customer Name *</label>
        <input
          type="text"
          className="input w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Customer name"
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
        {isEditMode ? 'Update Customer' : 'Create Customer'}
      </button>
    </form>
  );
};

export default CustomerForm;
