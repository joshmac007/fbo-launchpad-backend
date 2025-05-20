import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal'; // Assuming Modal component exists
import Button from '../common/Button'; // Assuming Button component exists
import { FuelOrderStatus, FuelOrder, UpdateFuelOrderStatusPayload, SubmitFuelDataPayload } from '../../types/fuelOrder'; // Corrected: Types from types/fuelOrder
import * as FuelOrderService from '../../services/FuelOrderService';
// import { FuelOrder, UpdateFuelOrderStatusPayload, SubmitFuelDataPayload } from '../../services/FuelOrderService'; // OLD INCORRECT IMPORT
import toast from 'react-hot-toast'; // Changed to react-hot-toast
import SubmitFuelDataModal from './SubmitFuelDataModal'; // Import the new modal
import OrderStatusBadge from '../common/OrderStatusBadge'; // Import the badge
import { useAuth } from '../../contexts/AuthContext'; // For role/permission checks for actions

/**
 * Props for the OrderDetailModal component.
 * @property orderId - The ID of the order to display. If null, the modal might not fetch or display data.
 * @property isOpen - Whether the modal is currently open.
 * @property onClose - Callback function to close the modal.
 * @property onOrderUpdated - Optional. Callback function invoked when the order is successfully updated (e.g., after an action).
 * @todo Consider adding onOpenSubmitFuelDataModal: (order: FuelOrder) => void; for better parent-child communication regarding the SubmitFuelDataModal.
 */
interface OrderDetailModalProps {
  orderId: number | null; // Changed: Pass orderId instead of full order object
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: FuelOrder) => void; // Callback to refresh list after an action
  // TODO: Add onOpenSubmitFuelDataModal: (order: FuelOrder) => void;
}

/**
 * A small stateless component to render a detail item (label and value) consistently.
 * @param label - The label for the detail item.
 * @param value - The value to display for the detail item. Can be a string or other React node.
 */
const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{value || 'N/A'}</dd>
  </div>
);

/**
 * OrderDetailModal displays detailed information about a specific fuel order.
 * It fetches the order details based on the provided orderId and allows users
 * (with appropriate permissions) to perform actions on the order, such as updating its status.
 */
const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, isOpen, onClose, onOrderUpdated }) => {
  const [internalOrder, setInternalOrder] = useState<FuelOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  const { user, hasPermission } = useAuth(); // For conditional actions
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmittingFuelData, setIsSubmittingFuelData] = useState(false); // State for new modal

  /** Effect to fetch order details when the modal is opened or orderId changes. */
  useEffect(() => {
    if (isOpen && orderId) {
      setIsActionLoading(false);
      setActionError(null);
      setOrderError(null);
      setIsLoadingOrder(true);
      FuelOrderService.getOrderById(orderId)
        .then(response => {
          setInternalOrder(response.fuel_order);
        })
        .catch(err => {
          const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch order details.';
          setOrderError(errorMsg);
          toast.error(errorMsg);
        })
        .finally(() => {
          setIsLoadingOrder(false);
        });
    } else if (!isOpen) {
      setInternalOrder(null); // Clear order data when modal closes
      setIsSubmittingFuelData(false);
      setOrderError(null);
    }
  }, [isOpen, orderId]);

  // Use internalOrder for all operations now
  const order = internalOrder; // Shadow prop for convenience within existing logic

  if (!isOpen) return null; // Keep early exit if not open

  // Loading and error states for the order fetch itself
  if (isLoadingOrder) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading Order Details...">
        <div className="p-lg text-center">Loading...</div>
      </Modal>
    );
  }

  if (orderError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error">
        <div className="p-lg text-center text-status-error-text">
          <p>{orderError}</p>
          <Button onClick={onClose} variant="primary" className="mt-md">Close</Button>
        </div>
      </Modal>
    );
  }
  
  if (!order) return null; // If still no order after loading/error checks (e.g. closed before fetch completed)

  /**
   * Handles actions that update the order status.
   * @param newStatus - The new status to set for the order.
   */
  const handleStatusUpdateAction = async (newStatus: FuelOrderStatus) => {
    if (!order) return;

    if (newStatus === FuelOrderStatus.CANCELLED) {
      if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        return; // User cancelled the confirmation
      }
    }

    setIsActionLoading(true);
    setActionError(null);
    
    let truckIdToAssign = order.assigned_truck_id;

    // Special handling for dispatch if no truck assigned (as an example of pre-action validation)
    if (newStatus === FuelOrderStatus.DISPATCHED && (!truckIdToAssign || truckIdToAssign === -1)) {
        toast.error('Cannot dispatch: No truck is assigned. Please assign a truck first.');
        setActionError('Cannot dispatch: No truck is assigned. Please assign a truck first.');
        setIsActionLoading(false);
        return;
    }
    // For other LST actions, they operate on the already assigned truck contextually.
    // If truck_id is -1 for ACKNOWLEDGED, EN_ROUTE, FUELING, backend might error or auto-assign if logic exists there.
    // For simplicity, we pass the current truck_id. If it's -1, the backend needs to handle it or error.
    // The backend /fuel-orders/<id>/status endpoint requires assigned_truck_id in payload.
    if (!truckIdToAssign && 
        [FuelOrderStatus.ACKNOWLEDGED, FuelOrderStatus.EN_ROUTE, FuelOrderStatus.FUELING, FuelOrderStatus.DISPATCHED].includes(newStatus)){
        // This check is technically covered by the dispatch specific one for now.
        // If we allow truck re-assignment via status updates, this needs more thought.
        // For now, if a truck is not assigned (-1 or null) and the status requires one, it should error.
        // The create_fuel_order allows -1, but status updates via PATCH to /status seem to expect a valid truck ID.
        // Current backend for PATCH /status expects assigned_truck_id.
        truckIdToAssign = -2; // Sentinel to indicate error if not caught by dispatch
    }
     if (truckIdToAssign === -2 || truckIdToAssign === -1) {
         // Check backend: fuel_order_routes.py PATCH /<order_id>/status requires assigned_truck_id
         // if it's -1, the updateOrderStatus will likely fail unless backend handles -1 for PATCH like it does for POST.
         // Assuming for now that an actual truck ID must be present for these state transitions by an LST or CSR.
         // This logic needs to align with backend requirements for the PATCH /status endpoint for these states.
         // For now, let's assume it must be a positive ID for these state changes via this modal.
        if ([FuelOrderStatus.ACKNOWLEDGED, FuelOrderStatus.EN_ROUTE, FuelOrderStatus.FUELING, FuelOrderStatus.DISPATCHED].includes(newStatus)){
            toast.error('A valid truck must be assigned for this action.');
            setActionError('A valid truck must be assigned for this action.');
            setIsActionLoading(false);
            return;
        }
    }

    try {
      const payload: UpdateFuelOrderStatusPayload = {
        status: newStatus,
        assigned_truck_id: truckIdToAssign === null ? 0 : truckIdToAssign, 
      };
      const updatedOrder = await FuelOrderService.updateOrderStatus(order.id, payload);
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
      onOrderUpdated?.(updatedOrder);
      // Close the modal after any successful status update via this handler.
      onClose(); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to update status.`;
      console.error(`Error updating status to ${newStatus}:`, err);
      toast.error(errorMsg);
      setActionError(errorMsg);
    }
    setIsActionLoading(false);
  };

  /** Handles the action to mark an order as reviewed. */
  const handleReviewAction = async () => {
    if (!order) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      const reviewResponse = await FuelOrderService.reviewOrder(order.id);
      toast.success(reviewResponse.message || 'Order marked as reviewed.');
      if(reviewResponse.fuel_order) {
        onOrderUpdated?.(reviewResponse.fuel_order as FuelOrder); // Ensure partial is cast
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to review order.';
      console.error('Error reviewing order:', err);
      toast.error(errorMsg);
      setActionError(errorMsg);
    }
    setIsActionLoading(false);
  };

  /** Placeholder handler for opening the Submit Fuel Data modal. Currently closes this detail modal. */
  // TODO: Implement proper opening of SubmitFuelDataModal via parent component state change.
  const handleOpenSubmitFuelDataModal = () => {
    if(!order) return;
    console.log('Open submit fuel data modal for order:', order.id);
    // Call a prop like onOpenSubmitFuelDataModal(order) which would be handled by FuelOrdersPage
    // For now, just log and close this modal as if it were a redirect.
    onClose();
  }

  /**
   * Formats an ISO string timestamp into a locale-specific string.
   * @param isoString - The ISO date string to format.
   * @returns A formatted date string or 'N/A' if input is invalid.
   */
  const formatTimestamp = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  /**
   * Callback for when fuel data has been successfully submitted from the SubmitFuelDataModal.
   * @param updatedOrder - The order object with updated data after submission.
   */
  const handleFuelDataSubmitted = (updatedOrder: FuelOrder) => {
    onOrderUpdated?.(updatedOrder);
    setIsSubmittingFuelData(false); // Close the fuel data modal
    toast.success('Fuel data submitted and order completed!');
    // Potentially close the OrderDetailModal as well if desired
    // onClose(); 
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Order Details: #${order.id}`}
      data-testid="order-detail-modal"
    >
      <div className="space-y-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          <DetailItem label="Order ID" value={order.id} />
          <DetailItem label="Status" value={<OrderStatusBadge status={order.status} />} />
          <DetailItem label="Tail Number" value={order.tail_number} />
          
          <DetailItem label="Fuel Type" value={order.fuel_type} />
          <DetailItem label="Requested Amount" value={`${order.requested_amount || '?'} Gallons`} />
          <DetailItem label="Additive Requested" value={order.additive_requested ? 'Yes' : 'No'} />
          
          <DetailItem label="Location on Ramp" value={order.location_on_ramp} />
          <DetailItem label="Assigned LST ID" value={order.assigned_lst_user_id} />
          <DetailItem label="Assigned Truck ID" value={order.assigned_truck_id} />
          
          <DetailItem label="Customer ID" value={order.customer_id} />
          <DetailItem label="CSR Notes" value={order.csr_notes} />
          <DetailItem label="Created At" value={formatTimestamp(order.created_at)} />

          {/* Fields from LST completion */}
          <DetailItem label="Start Meter" value={order.start_meter_reading} />
          <DetailItem label="End Meter" value={order.end_meter_reading} />
          <DetailItem label="Gallons Dispensed" value={order.calculated_gallons_dispensed} />
          <DetailItem label="LST Notes" value={order.lst_notes} />

          {/* Timestamps */}
          <DetailItem label="Dispatched At" value={formatTimestamp(order.dispatch_timestamp)} />
          <DetailItem label="Acknowledged At" value={formatTimestamp(order.acknowledge_timestamp)} />
          <DetailItem label="En Route At" value={formatTimestamp(order.en_route_timestamp)} />
          <DetailItem label="Fueling Started At" value={formatTimestamp(order.fueling_start_timestamp)} />
          <DetailItem label="Completed At" value={formatTimestamp(order.completion_timestamp)} />
          
          {/* Review Info */}
          <DetailItem label="Reviewed At" value={formatTimestamp(order.reviewed_timestamp)} />
          <DetailItem label="Reviewed By CSR ID" value={order.reviewed_by_csr_user_id} />
        </dl>

        {actionError && <p className="my-2 text-sm text-red-500">Error: {actionError}</p>}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {/* CSR/Admin Actions */}
            {user?.user_claims?.role?.name === 'CSR' && hasPermission('DISPATCH_ORDER') && order.status === FuelOrderStatus.PENDING && (
              <Button variant="primary" onClick={() => handleStatusUpdateAction(FuelOrderStatus.DISPATCHED)} disabled={isActionLoading}>
                {isActionLoading ? 'Dispatching...' : 'Dispatch'}
              </Button>
            )}
            {user?.user_claims?.role?.name === 'CSR' && hasPermission('REVIEW_ORDER') && order.status === FuelOrderStatus.COMPLETED && (
              <Button variant="primary" onClick={handleReviewAction} disabled={isActionLoading}>
                {isActionLoading ? 'Marking Reviewed...' : 'Mark as Reviewed'}
              </Button>
            )}
            {(user?.user_claims?.role?.name === 'CSR' || user?.user_claims?.role?.name === 'ADMIN') && hasPermission('CANCEL_ORDER') && 
             ![FuelOrderStatus.COMPLETED, FuelOrderStatus.REVIEWED, FuelOrderStatus.CANCELLED].includes(order.status as FuelOrderStatus) && (
              <Button variant="destructive" onClick={() => handleStatusUpdateAction(FuelOrderStatus.CANCELLED)} disabled={isActionLoading} className="bg-red-600 hover:bg-red-700 text-white">
                {isActionLoading ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}

            {/* LST Actions */}
            {user?.user_claims?.role?.name === 'LST' && hasPermission('ACKNOWLEDGE_ORDER') && order.status === FuelOrderStatus.DISPATCHED && (
              <Button variant="primary" onClick={() => handleStatusUpdateAction(FuelOrderStatus.ACKNOWLEDGED)} disabled={isActionLoading}>
                {isActionLoading ? 'Acknowledging...' : 'Acknowledge'}
              </Button>
            )}
            {user?.user_claims?.role?.name === 'LST' && hasPermission('SET_EN_ROUTE') && order.status === FuelOrderStatus.ACKNOWLEDGED && (
              <Button variant="primary" onClick={() => handleStatusUpdateAction(FuelOrderStatus.EN_ROUTE)} disabled={isActionLoading}>
                {isActionLoading ? 'Setting En Route...' : 'Set En Route'}
              </Button>
            )}
            {user?.user_claims?.role?.name === 'LST' && hasPermission('START_FUELING') && order.status === FuelOrderStatus.EN_ROUTE && (
              <Button variant="primary" onClick={() => handleStatusUpdateAction(FuelOrderStatus.FUELING)} disabled={isActionLoading}>
                {isActionLoading ? 'Starting Fueling...' : 'Start Fueling'}
              </Button>
            )}
            {user?.user_claims?.role?.name === 'LST' && hasPermission('SUBMIT_FUEL_DATA') && order.status === FuelOrderStatus.FUELING && (
              <Button variant="success" onClick={() => setIsSubmittingFuelData(true)} disabled={isActionLoading}>
                Submit Fuel Data / Complete
              </Button>
            )}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* Render SubmitFuelDataModal */}
      {order && (
        <SubmitFuelDataModal
          isOpen={isSubmittingFuelData}
          onClose={() => setIsSubmittingFuelData(false)}
          order={order}
          onFuelDataSubmitted={handleFuelDataSubmitted}
        />
      )}
    </Modal>
  );
};

export default OrderDetailModal; 