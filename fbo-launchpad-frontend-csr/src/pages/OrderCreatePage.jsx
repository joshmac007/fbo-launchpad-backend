import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/UserService';
import { getFuelTrucks } from '../services/FuelTruckService';
import { createFuelOrder } from '../services/FuelOrderService';

function OrderCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tail_number: '',
    fuel_type: 'Jet A', // Default value
    assigned_lst_user_id: '',
    assigned_truck_id: '',
    requested_amount: '',
    location_on_ramp: '',
    additive_requested: false,
    csr_notes: '',
    customer_id: null // Optional
  });

  const [lsts, setLsts] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch LSTs and Trucks on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        const [lstData, truckData] = await Promise.all([
          getUsers({ role: 'LST', is_active: 'true' }),
          getFuelTrucks({ is_active: 'true' })
        ]);
        setLsts(lstData);
        setTrucks(truckData);
      } catch (err) {
        setError('Failed to load LSTs or Trucks. Please try again.');
        console.error(err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.tail_number || !formData.assigned_lst_user_id || !formData.assigned_truck_id || !formData.fuel_type) {
      setError('Please fill in all required fields: Tail Number, Fuel Type, Assigned LST, Assigned Truck.');
      return false;
    }
    // Add more specific validation if needed
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    // Prepare data for API (ensure correct types if needed, e.g., parsing numbers)
    const orderData = {
      ...formData,
      // Convert empty strings for optional numbers to null or omit them
      requested_amount: formData.requested_amount || null,
      customer_id: formData.customer_id || null,
      // Ensure IDs are numbers if necessary (depends on input type)
      assigned_lst_user_id: parseInt(formData.assigned_lst_user_id, 10),
      assigned_truck_id: parseInt(formData.assigned_truck_id, 10),
    };

    try {
      const result = await createFuelOrder(orderData);
      setSubmitSuccess(true);
      // Optionally reset form: setFormData({ ...initial state... })
      setTimeout(() => navigate('/'), 1500); // Redirect after delay
    } catch (err) {
      setError(err.message || 'Failed to create fuel order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Fuel Order</h1>
        <div>Loading form data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Fuel Order</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tail Number Input */}
        <div className="form-group">
          <label htmlFor="tail_number" className="block text-sm font-medium mb-1">
            Tail Number*
          </label>
          <input
            type="text"
            id="tail_number"
            name="tail_number"
            value={formData.tail_number}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Fuel Type Input */}
        <div className="form-group">
          <label htmlFor="fuel_type" className="block text-sm font-medium mb-1">
            Fuel Type*
          </label>
          <select
            id="fuel_type"
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="Jet A">Jet A</option>
            <option value="Jet A-1">Jet A-1</option>
            <option value="100LL">100LL</option>
          </select>
        </div>

        {/* Assigned LST Select */}
        <div className="form-group">
          <label htmlFor="assigned_lst_user_id" className="block text-sm font-medium mb-1">
            Assign LST*
          </label>
          <select
            id="assigned_lst_user_id"
            name="assigned_lst_user_id"
            value={formData.assigned_lst_user_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select LST...</option>
            {lsts.map(lst => (
              <option key={lst.id} value={lst.id}>
                {lst.name} (ID: {lst.id})
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Truck Select */}
        <div className="form-group">
          <label htmlFor="assigned_truck_id" className="block text-sm font-medium mb-1">
            Assign Truck*
          </label>
          <select
            id="assigned_truck_id"
            name="assigned_truck_id"
            value={formData.assigned_truck_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Truck...</option>
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>
                {truck.name} (ID: {truck.id})
              </option>
            ))}
          </select>
        </div>

        {/* Requested Amount Input */}
        <div className="form-group">
          <label htmlFor="requested_amount" className="block text-sm font-medium mb-1">
            Requested Amount (Gal)
          </label>
          <input
            type="number"
            step="0.01"
            id="requested_amount"
            name="requested_amount"
            value={formData.requested_amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Location Input */}
        <div className="form-group">
          <label htmlFor="location_on_ramp" className="block text-sm font-medium mb-1">
            Location on Ramp
          </label>
          <input
            type="text"
            id="location_on_ramp"
            name="location_on_ramp"
            value={formData.location_on_ramp}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Additive Checkbox */}
        <div className="form-group">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="additive_requested"
              name="additive_requested"
              checked={formData.additive_requested}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span className="text-sm font-medium">Additive Requested</span>
          </label>
        </div>

        {/* CSR Notes Textarea */}
        <div className="form-group">
          <label htmlFor="csr_notes" className="block text-sm font-medium mb-1">
            CSR Notes
          </label>
          <textarea
            id="csr_notes"
            name="csr_notes"
            value={formData.csr_notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        {/* Error Message */}
        {error && !isSubmitting && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="text-green-600 text-sm">
            Fuel order created successfully! Redirecting...
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoadingData}
          className={`w-full p-2 text-white rounded ${
            isSubmitting || isLoadingData
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Creating Order...' : 'Create Fuel Order'}
        </button>
      </form>
    </div>
  );
}

export default OrderCreatePage; 