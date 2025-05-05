import React, { useState } from 'react';

export default function TruckForm({ initialData = {}, onSubmit, onCancel, isSubmitting }) {
  const [truckNumber, setTruckNumber] = useState(initialData.truck_number || '');
  const [fuelType, setFuelType] = useState(initialData.fuel_type || '');
  const [capacity, setCapacity] = useState(initialData.capacity || '');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!truckNumber.trim() || !fuelType.trim() || !capacity) {
      setError('All fields are required');
      return;
    }
    if (isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError('Capacity must be a positive number');
      return;
    }
    setError(null);
    onSubmit({
      truck_number: truckNumber.trim(),
      fuel_type: fuelType.trim(),
      capacity: Number(capacity)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{initialData.id ? 'Edit Truck' : 'Create Truck'}</h2>
      <div>
        <label className="block mb-1 font-medium">Truck Number</label>
        <input
          className="input input-bordered w-full"
          type="text"
          value={truckNumber}
          onChange={e => setTruckNumber(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Fuel Type</label>
        <input
          className="input input-bordered w-full"
          type="text"
          value={fuelType}
          onChange={e => setFuelType(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Capacity (gallons)</label>
        <input
          className="input input-bordered w-full"
          type="number"
          min="1"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  );
}
