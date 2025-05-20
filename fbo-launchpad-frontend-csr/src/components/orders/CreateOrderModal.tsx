import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select, { SelectOption } from '../common/Select';
import Textarea from '../common/Textarea';
import Checkbox from '../common/Checkbox';
import * as FuelOrderService from '../../services/FuelOrderService';
import { FuelOrder, FuelOrderStatus, CreateFuelOrderPayload, UpdateFuelOrderPayload } from '../../types/fuelOrder';
import { FuelTruck } from '../../types/fuelTruck';
import { LST } from '../../types/lst';
import { toast } from 'react-hot-toast';
import * as UserService from '../../services/UserService';
import * as FuelTruckService from '../../services/FuelTruckService';

/**
 * Props for the CreateOrderModal component.
 * @property isOpen - Whether the modal is currently open.
 * @property onClose - Callback function to close the modal.
 * @property onOrderCreated - Callback function invoked when a new order is successfully created.
 * @property editingOrderId - Optional. The ID of the order to edit. If provided, the modal operates in edit mode.
 * @property onOrderUpdated - Optional. Callback function invoked when an existing order is successfully updated.
 */
interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (newOrder: FuelOrder) => void;
  editingOrderId?: number | null; // Added for edit mode
  onOrderUpdated?: (updatedOrder: FuelOrder) => void; // Added for edit mode
}

/**
 * Represents the structure of the fuel order form data.
 * @property tailNumber - The tail number of the aircraft.
 * @property aircraftId - Identifier for the aircraft (e.g., type or existing ID). Consider clarifying if this is type for new, or ID for existing.
 * @property location - The location of the aircraft on the ramp.
 * @property status - The current status of the fuel order (defaults to PENDING).
 * @property priority - The priority of the fuel order.
 * @property notes - Optional CSR notes for the order.
 * @property requestedAmount - The amount of fuel requested (as a string, parsed to number).
 * @property additiveRequested - Whether an additive is requested for the fuel.
 * @property targetTailNumber - Review for redundancy: Seems duplicative if tailNumber is the primary identifier.
 * @property assignedFuelTruckId - Optional. The ID of the assigned fuel truck.
 * @property lstId - Optional. The ID of the assigned LST.
 * @property fuelType - The type of fuel requested (e.g., Jet A, 100LL).
 * @property customerId - Optional. The ID of the customer associated with the order.
 */
interface TFuelOrderForm {
  tailNumber: string;
  aircraftId: string; // Assuming ID for an existing aircraft, or type for a new one.
  location: string;
  status: FuelOrderStatus; // Defaulted to PENDING, managed by system mostly.
  priority: 'Low' | 'Normal' | 'High'; // For UI sorting/filtering or internal prioritization
  notes?: string;
  requestedAmount: string; 
  additiveRequested: boolean;
  targetTailNumber: string; // This seems redundant if tailNumber is the primary identifier. To be reviewed.
  assignedFuelTruckId?: string; // Stores ID of the truck
  lstId?: string; // Stores ID of the LST
  fuelType: string; // Added field
  customerId?: string; // Added field, optional
}

/** Initial state for the fuel order form. */
const initialFormData: TFuelOrderForm = {
  tailNumber: '', 
  aircraftId: '',
  location: '',
  status: FuelOrderStatus.PENDING,
  priority: 'Normal',
  notes: '',
  requestedAmount: "", 
  additiveRequested: false,
  targetTailNumber: '', // To be reviewed for redundancy
  assignedFuelTruckId: undefined, // Or '-1' if using that as unassigned marker for Selects
  lstId: undefined, // Or '-1'
  fuelType: 'Jet A', // Default fuel type
  customerId: '', // Default empty
};

/**
 * CreateOrderModal is a component for creating new fuel orders or editing existing ones.
 * It includes a form with various fields related to the fuel order, fetches
 * LST and Fuel Truck data for assignment, and handles form submission and validation.
 */
const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onOrderCreated, 
  editingOrderId, 
  onOrderUpdated 
}) => {
  const [formData, setFormData] = useState<TFuelOrderForm>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [isLoadingDropdownData, setIsLoadingDropdownData] = useState(false);
  const [dynamicLstOptions, setDynamicLstOptions] = useState<SelectOption[]>([]);
  const [dynamicFuelTruckOptions, setDynamicFuelTruckOptions] = useState<SelectOption[]>([]);

  // Static base options for auto-assign
  const baseLstOption: SelectOption = { value: '-1', label: 'Auto-assign LST' };
  const baseFuelTruckOption: SelectOption = { value: '-1', label: 'Auto-assign Truck' };

  // Original dummy data for LSTs and Trucks - will be replaced by dynamic data
  // const lstUserOptions: SelectOption[] = [ ... ];
  // const fuelTruckOptions: SelectOption[] = [ ... ];

  // Dummy data for LSTs and Trucks - replace with API call later
  const lstUserOptions: SelectOption[] = [
    { value: '-1', label: 'Auto-assign LST' },
    { value: '1', label: 'LST User 1 (ID: 1)' }, 
    { value: '2', label: 'LST User 2 (ID: 2)' }
  ];
  const fuelTruckOptions: SelectOption[] = [
    { value: '-1', label: 'Auto-assign Truck' },
    { value: '1', label: 'Truck 101 (ID: 1)' }, 
    { value: '2', label: 'Truck 102 (ID: 2)' }
  ];
  const fuelTypeOptions: SelectOption[] = [
    { value: 'Jet A', label: 'Jet A' },
    { value: '100LL', label: '100LL' },
    // Add other fuel types as needed
  ];
  const priorityOptions: SelectOption[] = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Low', label: 'Low' },
    { value: 'High', label: 'High' },
  ];

  // Effect for fetching dropdown data (LSTs, Trucks)
  useEffect(() => {
    // Initialize with base options immediately to avoid empty dropdowns before load
    setDynamicLstOptions([baseLstOption]);
    setDynamicFuelTruckOptions([baseFuelTruckOption]);

    if (isOpen) { 
      setIsLoadingDropdownData(true);
      Promise.all([
        // (UserService.default ? UserService.default.getUsers : UserService.getUsers)({ role_ids: ['3'] }), 
        UserService.getUsers({ role_ids: ['3'] }), // Direct call
        // (FuelTruckService.default ? FuelTruckService.default.getFuelTrucks : FuelTruckService.getFuelTrucks)() 
        FuelTruckService.getFuelTrucks() // Direct call
      ]).then(([lstUsersResponse, trucksResponse]) => {
        const lstOptions = lstUsersResponse.users.map(user => ({
          value: String(user.id),
          label: user.name || user.email || `User ${user.id}` // Corrected: user.name instead of user.username
        }));
        setDynamicLstOptions([baseLstOption, ...lstOptions]);

        const truckOptions = trucksResponse.map(truck => ({
          value: String(truck.id),
          label: truck.identifier || `Truck ${truck.id}` 
        }));
        setDynamicFuelTruckOptions([baseFuelTruckOption, ...truckOptions]);

      }).catch(err => {
        console.error("Failed to load dropdown data:", err);
        toast.error("Failed to load LST/Truck options.");
        // Already initialized with base options, so UI won't break
      }).finally(() => {
        setIsLoadingDropdownData(false);
      });
    }
  }, [isOpen]);

  // Effect for handling edit mode and form reset
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);

      if (editingOrderId) {
        setIsEditMode(true);
        setIsLoadingOrderDetails(true);
        FuelOrderService.getOrderById(editingOrderId)
          .then(response => {
            const orderData = response.fuel_order;
            setFormData({
              tailNumber: orderData.tail_number,
              aircraftId: initialFormData.aircraftId, // Default to empty or previously entered if form persists across opens
              location: orderData.location_on_ramp,
              status: orderData.status as FuelOrderStatus, 
              priority: initialFormData.priority, 
              notes: orderData.csr_notes || '',
              requestedAmount: String(orderData.requested_amount || ''),
              additiveRequested: orderData.additive_requested,
              targetTailNumber: initialFormData.targetTailNumber, 
              assignedFuelTruckId: String(orderData.assigned_truck_id || ''), 
              lstId: String(orderData.assigned_lst_user_id || ''), 
              fuelType: orderData.fuel_type,
              customerId: String(orderData.customer_id || ''),
            });
          })
          .catch(err => {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch order details for editing.';
            setError(errorMsg);
            toast.error(errorMsg);
            // Consider closing modal or allowing retry if fetch fails critically
          })
          .finally(() => {
            setIsLoadingOrderDetails(false);
          });
      } else {
        setIsEditMode(false);
        setFormData(initialFormData); // Reset for new order creation
      }
    } else {
      // Optional: if you want to clear/reset form explicitly when modal is commanded to close,
      // though the above logic handles reset on next open.
      // setIsEditMode(false); 
      // setFormData(initialFormData);
    }
  }, [isOpen, editingOrderId]); // Add other dependencies like initialFormData if it could change, though it's const

  /**
   * Handles the submission of the fuel order form.
   * Performs validation, then calls the appropriate service to create or update the order.
   * @param e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.tailNumber.trim()) { setError('Tail number is required.'); return; }
    const requestedAmountNum = parseFloat(formData.requestedAmount);
    if (isNaN(requestedAmountNum) || requestedAmountNum <= 0) { 
        setError('Requested amount must be a positive number.'); 
        return; 
    }
    if (!formData.location.trim()) { setError('Location on ramp is required.'); return; }

    setIsSubmitting(true);

    // Construct payload common fields first
    // Note: TFuelOrderForm has status and priority, but these are not in CreateFuelOrderPayload/UpdateFuelOrderPayload by default
    // Backend handles status changes via specific endpoints. Priority might be UI only or needs specific handling if sent.
    const commonPayloadFields = {
      tail_number: formData.tailNumber.trim(),
      aircraft_type: formData.aircraftId.trim() || undefined,
      fuel_type: formData.fuelType,
      requested_amount: requestedAmountNum,
      location_on_ramp: formData.location.trim(),
      assigned_lst_user_id: formData.lstId ? parseInt(formData.lstId, 10) : -1,
      assigned_truck_id: formData.assignedFuelTruckId ? parseInt(formData.assignedFuelTruckId, 10) : -1,
      customer_id: formData.customerId ? parseInt(formData.customerId, 10) : undefined,
      additive_requested: formData.additiveRequested,
      csr_notes: formData.notes?.trim() || undefined,
    };

    try {
      if (isEditMode && editingOrderId) {
        const updatePayload: UpdateFuelOrderPayload = {
           ...commonPayloadFields,
           priority: formData.priority, // Add priority specifically for update payload
        }; 
        const updatedOrder = await FuelOrderService.updateOrder(editingOrderId, updatePayload);
        toast.success('Order updated successfully!');
        onOrderUpdated?.(updatedOrder);
      } else {
        const createPayload: CreateFuelOrderPayload = { ...commonPayloadFields }; //priority is not in CreateFuelOrderPayload
        const response = await FuelOrderService.createOrder(createPayload);
        toast.success('Order created successfully!');
        onOrderCreated(response.fuel_order);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || (isEditMode ? 'Failed to update order.' : 'Failed to create fuel order.');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Display loading indicator if fetching order details for editing
  if (isLoadingOrderDetails) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading Order Data...">
        <div className="p-lg text-center">Loading details...</div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? `Edit Fuel Order #${editingOrderId}` : "Create New Fuel Order"}
      size="lg"
      data-testid="create-order-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && <p className="mb-md text-status-error-text text-sm-regular bg-status-error-surface p-sm rounded-md">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input 
            id="tailNumberCreate"
            label="Tail Number"
            type="text" 
            value={formData.tailNumber} 
            onChange={(e) => setFormData(prev => ({ ...prev, tailNumber: e.target.value.toUpperCase() }))} 
            required 
            autoFocus
            placeholder="e.g., N123AB"
          />
          <Input 
            id="aircraftTypeCreate"
            label="Aircraft ID / Type (if new tail)"
            type="text" 
            value={formData.aircraftId} 
            onChange={(e) => setFormData(prev => ({ ...prev, aircraftId: e.target.value }))} 
            placeholder="e.g., Cessna 172 or Aircraft ID"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Select
            id="fuelTypeCreate"
            label="Fuel Type"
            options={fuelTypeOptions}
            value={formData.fuelType}
            onChange={(value) => setFormData(prev => ({ ...prev, fuelType: String(value) }))}
            required
          />
          <Input 
            id="requestedAmountCreate"
            label="Requested Amount (Gallons)"
            type="number" 
            value={formData.requestedAmount}
            onChange={(e) => setFormData(prev => ({...prev, requestedAmount: e.target.value}))}
            required 
            min="0.01" 
            step="0.01" 
            placeholder="e.g., 100.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Select
            id="priorityCreate"
            label="Priority"
            options={priorityOptions}
            value={formData.priority}
            onChange={(value) => setFormData(prev => ({ ...prev, priority: value as unknown as TFuelOrderForm['priority'] }))}
            required
          />
          <Input 
            id="locationOnRampCreate"
            label="Location on Ramp"
            type="text" 
            value={formData.location} 
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} 
            required 
            placeholder="e.g., Hangar 3, Spot A1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Select
            label="Assigned LST"
            id="assigned-lst"
            options={isLoadingDropdownData ? [{ value: '', label: 'Loading LSTs...'}] : dynamicLstOptions}
            value={formData.lstId || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, lstId: String(e.target.value) }))}
            data-testid="assigned-lst-select"
            disabled={isLoadingDropdownData}
          />
          <Select
            label="Assigned Fuel Truck"
            id="assigned-fuel-truck"
            options={isLoadingDropdownData ? [{ value: '', label: 'Loading Trucks...'}] : dynamicFuelTruckOptions}
            value={formData.assignedFuelTruckId || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedFuelTruckId: String(e.target.value) }))}
            data-testid="assigned-truck-select"
            disabled={isLoadingDropdownData}
          />
        </div>

        <Input 
          id="customerIdCreate"
          label="Customer ID (Optional)"
          type="text"
          value={formData.customerId || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
          placeholder="Enter Customer ID if applicable (numeric)"
        />

        <Checkbox 
          id="additiveRequestedCreate"
          name="additiveRequested"
          label="Additive Requested"
          checked={formData.additiveRequested}
          onChange={(e) => setFormData(prev => ({ ...prev, additiveRequested: e.target.checked }))}
          labelSide="right"
        />

        <Textarea
          id="csrNotesCreate"
          label="CSR Notes (Optional)"
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="Enter any relevant notes for the LST or for records..."
        />

        <div className="flex justify-end space-x-sm pt-md border-t border-neutral-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoadingOrderDetails || isLoadingDropdownData}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting || isLoadingOrderDetails || isLoadingDropdownData} disabled={isSubmitting || isLoadingOrderDetails || isLoadingDropdownData}>
            {isEditMode ? (isSubmitting ? 'Updating...' : 'Update Order') : (isSubmitting ? 'Creating...' : 'Create Order')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrderModal; 