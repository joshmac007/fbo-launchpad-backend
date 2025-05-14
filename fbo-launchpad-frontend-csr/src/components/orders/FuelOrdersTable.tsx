import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FuelOrder, OrderStatus } from '../../types/orders';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../common/EmptyState';
import { FileText, PlusCircle } from 'lucide-react';

interface FuelOrdersTableProps {
  orders: FuelOrder[] | null;
  loading: boolean;
  error: Error | null;
}

const FuelOrdersTable: React.FC<FuelOrdersTableProps> = ({
  orders,
  loading,
  error,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="py-lg px-md text-center text-neutral-text-secondary italic rounded-md border border-neutral-border bg-neutral-surface">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-lg px-md text-center text-status-error-text rounded-md border border-status-error-border bg-status-error-surface">
        Error loading orders: {error.message}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={48} />}
        title="No Fuel Orders Found"
        message="New fuel orders will appear here once created."
        className="py-xl"
      />
    );
  }

  return (
    <div className="overflow-x-auto bg-neutral-surface rounded-lg border border-neutral-border shadow-sm">
      <table className="min-w-full divide-y divide-neutral-border">
        <thead className="bg-neutral-surface-subtle">
          <tr>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">ID</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Aircraft</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Customer</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Fuel Type</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Quantity</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Status</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Created</th>
            <th className="px-md py-sm text-left text-xs-strong text-neutral-text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-neutral-surface divide-y divide-neutral-border">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-neutral-surface-hover transition-colors">
              <td className="px-md py-sm whitespace-nowrap text-sm-medium text-primary">#{order.id}</td>
              <td className="px-md py-sm whitespace-nowrap text-sm-regular text-neutral-text-primary">{order.tail_number}</td>
              <td className="px-md py-sm whitespace-nowrap text-sm-regular text-neutral-text-primary">{order.customer}</td>
              <td className="px-md py-sm whitespace-nowrap text-sm-regular text-neutral-text-primary">{order.fuel_type}</td>
              <td className="px-md py-sm whitespace-nowrap text-sm-regular text-neutral-text-primary">{order.requested_amount} gal</td>
              <td className="px-md py-sm whitespace-nowrap">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-md py-sm whitespace-nowrap text-sm-regular text-neutral-text-secondary">
                {new Date(order.created_at).toLocaleDateString()}
              </td>
              <td className="px-md py-sm whitespace-nowrap">
                <div className="flex items-center gap-sm">
                  <Button 
                    as={Link} 
                    to={`/orders/${order.id}`} 
                    variant="link"
                    size="xs"
                    aria-label={`View order ${order.id}`}
                    onClick={() => {}}
                  >
                    View
                  </Button>
                  {order.status === OrderStatus.COMPLETED && isAuthenticated && 
                    hasPermission && hasPermission('VIEW_RECEIPT') && (
                    <Button 
                      as={Link} 
                      to={`/orders/${order.id}/receipt`} 
                      variant="success"
                      size="xs"
                      aria-label={`View receipt for order ${order.id}`}
                      onClick={() => {}}
                    >
                      View Receipt
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FuelOrdersTable; 