import React, { useState, useEffect, FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/UserService'; // Assuming UserService exports User[] or LSTUser[]
import { getFuelTrucks } from '../services/FuelTruckService'; // Assuming FuelTruckService exports FuelTruck[]
import { createOrder } from '../services/FuelOrderService';
import { useOrdersContext } from '../contexts/OrderContext'; // Import the context hook
// import { useAuth } from '../contexts/AuthContext'; // Not directly used for permissions in this form logic

import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select, { SelectOption } from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import Button from '../components/common/Button';
import { Loader2, AlertCircle } from 'lucide-react';

// Basic local type definitions - consider moving to src/types/
interface LSTUser {
  id: string | number;
  name: string; // Changed from username to name, to match User type
  // Add other relevant fields if needed by selection logic later (e.g., is_available)
}

interface FuelTruck {
  id: string | number;
  identifier: string; // e.g., "Truck 101"
  // Add other relevant fields (e.g., current_fuel_level, status)
}

interface OrderFormData {
  tail_number: string;
  fuel_type: string; 
  assigned_lst_user_id: string; // Store as string from select, parse to number on submit
  assigned_truck_id: string; // Store as string from select, parse to number on submit
  requested_amount: string; // Store as string, parse to float on submit
  location_on_ramp: string;
  additive_requested: boolean;
  csr_notes: string;
  customer_id: string; // Optional, store as string, parse to number on submit
}

const OrderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshOrders } = useOrdersContext(); // Use the context
  // const { isAuthenticated, hasPermission } = useAuth(); // Keep if needed for conditional UI later

  const [formData, setFormData] = useState<OrderFormData>({
    tail_number: '',
    fuel_type: 'Jet A', 
    assigned_lst_user_id: '',
    assigned_truck_id: '',
    requested_amount: '',
    location_on_ramp: '',
    additive_requested: false,
    csr_notes: '',
    customer_id: ''
  });

  const [autoAssign, setAutoAssign] = useState<boolean>(true); // Defaulting to true, assuming global setting allows
  const [lsts, setLsts] = useState<LSTUser[]>([]);
  const [trucks, setTrucks] = useState<FuelTruck[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        const lstResponse = await getUsers();
        setLsts(lstResponse.users || []); // Extract users array, default to [] if undefined

        const truckResponse = await getFuelTrucks(); // We'll assume truckResponse is an array for now, or an object with a .trucks property
        // This might need adjustment based on getFuelTrucks implementation
        if (Array.isArray(truckResponse)) {
          setTrucks(truckResponse);
        } else if (truckResponse && typeof truckResponse === 'object' && 'trucks' in truckResponse && Array.isArray(truckResponse.trucks)) {
          // Assuming a structure like { trucks: [] }
          setTrucks(truckResponse.trucks);
        } else {
          // Fallback if the structure is unexpected or it's not an array
          console.warn('Unexpected data structure for trucks, defaulting to empty array:', truckResponse);
          setTrucks([]);
        }

      } catch (err: unknown) {
        setError('Failed to load LSTs or Trucks. Please ensure services are available and try again.');
        console.error('Dropdown loading error:', err);
        setLsts([]); // Ensure lsts is an array on error
        setTrucks([]); // Ensure trucks is an array on error
      } finally {
        setIsLoadingData(false);
      }
    };
    loadDropdownData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checkedValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checkedValue : value
    }));
  };

  const handleCheckboxChange = (name: keyof OrderFormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    if (!formData.tail_number.trim() || !formData.fuel_type) {
      setError('Tail Number and Fuel Type are required.');
      return false;
    }
    if (!formData.requested_amount || isNaN(parseFloat(formData.requested_amount)) || parseFloat(formData.requested_amount) <= 0) {
      setError('Requested Amount must be a valid positive number.');
      return false;
    }
    if (!autoAssign) {
      if (!formData.assigned_lst_user_id || !formData.assigned_truck_id) {
        setError('When not auto-assigning, both LST and Fuel Truck must be selected.');
        return false;
      }
    }
    // Basic validation for now, can be expanded (e.g. customer_id if provided must be number)
    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);

    let finalAssignedLstUserId: number | null = null;
    let finalAssignedTruckId: number | null = null;

    if (autoAssign) {
      finalAssignedLstUserId = -1; // Backend handles LST auto-assignment with -1
      // If auto-assigning LST, and backend requires a truck ID, ensure one is available or selected.
      // The old logic had issues. For now, let's assume if auto-assign is on,
      // the first available truck is used if no specific logic exists in backend for auto truck.
      // This needs to be clarified with backend requirements.
      if (trucks.length > 0) {
        finalAssignedTruckId = Number(trucks[0].id); 
      } else {
        setError('Auto-assign is enabled, but no fuel trucks are available. Please add trucks or use manual assignment.');
        setIsSubmitting(false);
        return;
      }
    } else {
      finalAssignedLstUserId = formData.assigned_lst_user_id ? Number(formData.assigned_lst_user_id) : null;
      finalAssignedTruckId = formData.assigned_truck_id ? Number(formData.assigned_truck_id) : null;
      if (!finalAssignedLstUserId || !finalAssignedTruckId) {
         setError('LST and Truck must be selected for manual assignment.');
         setIsSubmitting(false);
         return;
      }
    }
    
    const requestedAmount = parseFloat(formData.requested_amount);
    if (isNaN(requestedAmount) || requestedAmount <=0) {
        setError('Requested Amount must be a valid positive number.');
        setIsSubmitting(false);
        return;
    }

    const orderPayload = {
      tail_number: formData.tail_number.trim(),
      fuel_type: formData.fuel_type,
      requested_amount: requestedAmount,
      location_on_ramp: formData.location_on_ramp.trim(),
      additive_requested: formData.additive_requested,
      csr_notes: formData.csr_notes.trim(),
      customer_id: formData.customer_id.trim() ? Number(formData.customer_id.trim()) : undefined,
      assigned_lst_user_id: finalAssignedLstUserId,
      assigned_truck_id: finalAssignedTruckId,
    };

    try {
      await createOrder(orderPayload);
      setSubmitSuccess(true);
      setError(null); // Clear previous errors on success
      await refreshOrders(); // Refresh orders list
      // Keep success message for a bit then navigate
      setTimeout(() => navigate('/orders'), 2000); // Navigate to orders list or detail page
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create fuel order. Please check details and try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const lstOptions: SelectOption[] = lsts.map(lst => ({ value: lst.id, label: lst.name }));
  const truckOptions: SelectOption[] = trucks.map(truck => ({ value: truck.id, label: truck.identifier }));
  const fuelTypeOptions: SelectOption[] = [
    { value: 'Jet A', label: 'Jet A' },
    { value: 'Jet A+', label: 'Jet A+ (with additive)' },
    { value: '100LL', label: '100LL (Avgas)' },
  ];

  if (isLoadingData) {
    return (
      <div className="container mx-auto p-lg flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-xl w-xl text-primary mb-md" />
        <p className="text-md-regular text-neutral-text-secondary">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-lg">
      <PageHeader title="Create New Fuel Order" breadcrumbs={[{name: "Orders", path: "/orders"}, {name: "Create"}]} />

      <form onSubmit={handleSubmit} className="mt-lg space-y-lg">
        <Card>
          <div className="p-lg space-y-md">
            <h2 className="text-lg-semibold text-neutral-text-primary border-b border-neutral-border-subtle pb-sm mb-md">Order Details</h2>
            
            <Input
              label="Tail Number"
              id="tail_number"
              name="tail_number"
              value={formData.tail_number}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="e.g., N12345"
            />

            <Select
              label="Fuel Type"
              id="fuel_type"
              name="fuel_type"
              options={fuelTypeOptions}
              value={formData.fuel_type}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <Input
              label="Requested Amount (Gallons)"
              id="requested_amount"
              name="requested_amount"
              type="number"
              value={formData.requested_amount}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="e.g., 500"
              min="0.01" // Basic HTML5 validation
              step="0.01"
            />

            <Input
              label="Location on Ramp"
              id="location_on_ramp"
              name="location_on_ramp"
              value={formData.location_on_ramp}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g., Hangar 3, Spot A1"
            />
            
            <Checkbox 
              label="Additive Requested?"
              id="additive_requested"
              name="additive_requested"
              checked={formData.additive_requested}
              onChange={(e) => handleCheckboxChange('additive_requested', e.target.checked)}
              disabled={isSubmitting}
            />
          </div>
        </Card>

        <Card>
          <div className="p-lg space-y-md">
            <h2 className="text-lg-semibold text-neutral-text-primary border-b border-neutral-border-subtle pb-sm mb-md">Assignment</h2>
            <Checkbox
              label="Auto-assign LST and Fuel Truck"
              id="autoAssign"
              name="autoAssign"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              disabled={isSubmitting}
              // Add hint text if global auto-assign is disabled by admin setting (not implemented here)
            />
            {!autoAssign && (
              <>
                <Select
                  label="Assign LST"
                  id="assigned_lst_user_id"
                  name="assigned_lst_user_id"
                  options={[{ value: '', label: 'Select LST...', disabled: true }, ...lstOptions]}
                  value={formData.assigned_lst_user_id}
                  onChange={handleChange}
                  required={!autoAssign} // Required only if manual assignment
                  disabled={isSubmitting || isLoadingData || lsts.length === 0}
                  placeholder="Select LST..."
                  error={!autoAssign && !formData.assigned_lst_user_id && error ? 'LST is required for manual assignment' : undefined}
                />
                <Select
                  label="Assign Fuel Truck"
                  id="assigned_truck_id"
                  name="assigned_truck_id"
                  options={[{ value: '', label: 'Select Truck...', disabled: true }, ...truckOptions]}
                  value={formData.assigned_truck_id}
                  onChange={handleChange}
                  required={!autoAssign} // Required only if manual assignment
                  disabled={isSubmitting || isLoadingData || trucks.length === 0}
                  placeholder="Select Fuel Truck..."
                  error={!autoAssign && !formData.assigned_truck_id && error ? 'Truck is required for manual assignment' : undefined}
                />
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-lg space-y-md">
            <h2 className="text-lg-semibold text-neutral-text-primary border-b border-neutral-border-subtle pb-sm mb-md">Additional Information</h2>
            <Input
              label="Customer ID (Optional)"
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter Customer ID if applicable"
            />
            <label htmlFor="csr_notes" className="block text-sm-medium text-neutral-text-secondary mb-xs">CSR Notes</label>
            <textarea
              id="csr_notes"
              name="csr_notes"
              rows={4}
              className="block w-full text-sm-regular bg-neutral-surface-default border border-neutral-border rounded-md shadow-sm focus:ring-primary-focus focus:border-primary-focus disabled:opacity-50 disabled:cursor-not-allowed p-sm"
              value={formData.csr_notes}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Any special instructions or notes for this order..."
            />
          </div>
        </Card>
        
        {error && (
          <div className="p-md rounded-md bg-status-error-surface border border-status-error-border text-status-error-text flex items-start">
            <AlertCircle className="h-md w-md mr-sm flex-shrink-0 mt-xs" />
            <div>
              <h3 className="text-sm-semibold mb-xs">Error</h3>
              <p className="text-sm-regular">{error}</p>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="p-md rounded-md bg-status-success-surface border border-status-success-border text-status-success-text">
            Fuel order created successfully! Navigating to orders page...
          </div>
        )}

        <div className="flex justify-end pt-md">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/orders')} 
            className="mr-md"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || isLoadingData}>
            {isSubmitting ? <Loader2 className="animate-spin mr-sm h-sm w-sm" /> : null}
            {isSubmitting ? 'Creating Order...' : 'Create Fuel Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderCreatePage; 