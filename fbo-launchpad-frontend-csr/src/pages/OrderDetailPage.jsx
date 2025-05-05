import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFuelOrderById, reviewFuelOrder } from '../services/FuelOrderService';
import { formatDisplayValue } from '../utils/formatters';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFuelOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleMarkAsReviewed = async () => {
    if (!order || order.status !== 'COMPLETED') return;

    setIsReviewing(true);
    setReviewError(null);
    try {
      const updatedOrder = await reviewFuelOrder(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      setReviewError(err.message || 'Failed to mark order as reviewed');
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!order) {
    return <div>No order found</div>;
  }

  return (
    <div className="order-detail-page">
      <h1>Fuel Order Details</h1>
      
      <dl className="order-details">
        <dt>Order ID</dt>
        <dd>{order.id}</dd>

        <dt>Status</dt>
        <dd>{order.status}</dd>

        <dt>Customer</dt>
        <dd>{order.customer}</dd>

        <dt>Aircraft</dt>
        <dd>{order.tail_number}</dd>

        <dt>Fuel Type</dt>
        <dd>{order.fuel_type}</dd>

        <dt>Requested Amount (Gallons)</dt>
        <dd>{order.requested_amount}</dd>

        <dt>Created At</dt>
        <dd>{formatDisplayValue(order.created_at, 'datetime')}</dd>

        {order.completed_at && (
          <>
            <dt>Completed At</dt>
            <dd>{formatDisplayValue(order.completed_at, 'datetime')}</dd>
          </>
        )}

        {order.reviewed_at && (
          <>
            <dt>Reviewed At</dt>
            <dd>{formatDisplayValue(order.reviewed_at, 'datetime')}</dd>
            <dt>Reviewed By</dt>
            <dd>{order.reviewed_by_csr_user_id}</dd>
          </>
        )}
      </dl>

      {order.status === 'COMPLETED' && (
        <div className="order-actions">
          <button
            onClick={handleMarkAsReviewed}
            disabled={isReviewing}
            className="review-button"
          >
            {isReviewing ? 'Reviewing...' : 'Mark as Reviewed'}
          </button>
          {reviewError && (
            <p className="error-message">Error: {reviewError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage; 