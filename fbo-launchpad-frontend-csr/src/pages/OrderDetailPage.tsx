import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFuelOrderById, reviewFuelOrder } from '../services/FuelOrderService'; // Corrected path
import { formatDisplayValue } from '../utils/formatters'; // Corrected path
import { useAuth } from '../contexts/AuthContext'; // Corrected path
import { FuelOrder, OrderStatus } from '../types/orders'; // Corrected path
import Card from '../components/common/Card'; // Corrected path
import Button from '../components/common/Button'; // Corrected path
import StatusBadge from '../components/common/StatusBadge'; // Corrected path
import { Loader2, AlertTriangle, Info } from 'lucide-react'; // Icons
import PageHeader from '../components/common/PageHeader'; // Corrected path, will verify existence

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<FuelOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const { isAuthenticated, hasPermission } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFuelOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleMarkAsReviewed = async () => {
    if (!order || order.status !== OrderStatus.COMPLETED || !orderId) return;

    setIsReviewing(true);
    setReviewError(null);
    try {
      const updatedOrder = await reviewFuelOrder(orderId);
      setOrder(updatedOrder);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to mark order as reviewed');
    } finally {
      setIsReviewing(false);
    }
  };

  // Detail Item component for consistent styling
  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-sm sm:grid sm:grid-cols-3 sm:gap-md">
      <dt className="text-sm-medium text-neutral-text-secondary">{label}</dt>
      <dd className="mt-xs text-sm-regular text-neutral-text-primary sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin h-xl w-xl text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-lg">
        <PageHeader title="Error" breadcrumbs={[{ name: 'Orders', path: '/orders' }, { name: 'Error' }]} />
        <Card className="mt-md p-lg flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-2xl w-2xl text-status-error-icon mb-md" />
          <h2 className="text-xl-semibold text-status-error-text mb-sm">Failed to Load Order</h2>
          <p className="text-md-regular text-neutral-text-secondary">{error}</p>
          <Button onClick={() => navigate('/orders')} variant="outline" className="mt-lg">Back to Orders</Button>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-lg">
        <PageHeader title="Order Not Found" breadcrumbs={[{ name: 'Orders', path: '/orders' }, { name: 'Not Found' }]} />
        <Card className="mt-md p-lg flex flex-col items-center justify-center text-center">
          <Info className="h-2xl w-2xl text-neutral-icon mb-md" />
          <h2 className="text-xl-semibold text-neutral-text-primary mb-sm">Order Not Found</h2>
          <p className="text-md-regular text-neutral-text-secondary">
            The requested order could not be found. It might have been deleted or the ID is incorrect.
          </p>
          <Button onClick={() => navigate('/orders')} variant="outline" className="mt-lg">Back to Orders</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-lg">
      <PageHeader 
        title={`Fuel Order #${order.id}`}
        breadcrumbs={[{ name: 'Orders', path: '/orders' }, { name: `#${order.id}` }]}
      />

      <Card className="mt-md">
        <div className="p-lg">
          <dl className="divide-y divide-neutral-border-subtle">
            <DetailItem label="Order ID" value={order.id} />
            <DetailItem label="Status" value={<StatusBadge status={order.status} />} />
            <DetailItem label="Customer" value={order.customer} />
            <DetailItem label="Aircraft Tail Number" value={order.tail_number} />
            <DetailItem label="Fuel Type" value={order.fuel_type} />
            <DetailItem label="Requested Amount (Gallons)" value={order.requested_amount} />
            <DetailItem label="Created At" value={formatDisplayValue(order.created_at, 'datetime')} />
            
            {order.completed_at && (
              <DetailItem label="Completed At" value={formatDisplayValue(order.completed_at, 'datetime')} />
            )}
            
            {order.assigned_lst && (
                 <DetailItem label="Assigned LST" value={order.assigned_lst.username || order.assigned_lst_id} />
            )}

            {order.reviewed_at && (
              <>
                <DetailItem label="Reviewed At" value={formatDisplayValue(order.reviewed_at, 'datetime')} />
                <DetailItem label="Reviewed By (CSR ID)" value={order.reviewed_by_csr_user_id} />
              </>
            )}
          </dl>
        </div>
      </Card>

      {order.status === OrderStatus.COMPLETED && isAuthenticated && hasPermission('MARK_ORDER_REVIEWED') && (
        <Card className="mt-lg p-lg">
          <h2 className="text-lg-semibold text-neutral-text-primary mb-md">Order Review</h2>
          <Button
            onClick={handleMarkAsReviewed}
            disabled={isReviewing || !!order.reviewed_at} // Disable if already reviewed
            variant="primary"
            className="w-full sm:w-auto"
          >
            {isReviewing ? <Loader2 className="animate-spin mr-sm h-sm w-sm" /> : null}
            {order.reviewed_at ? 'Already Reviewed' : (isReviewing ? 'Submitting Review...' : 'Mark as Reviewed')}
          </Button>
          {reviewError && (
            <p className="mt-sm text-sm-regular text-status-error-text">Error: {reviewError}</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default OrderDetailPage; 