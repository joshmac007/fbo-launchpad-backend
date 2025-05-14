import React from 'react';
import { FuelOrder, OrderStatus } from '../../types/orders'; // Assuming these types are available
import { formatDisplayValue } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { Loader2, AlertTriangle, FolderOpen } from 'lucide-react'; // Icons

interface OrderGridProps {
  orders: FuelOrder[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (id: string | number) => void;
}

const OrderGrid: React.FC<OrderGridProps> = ({
  orders,
  isLoading,
  error,
  onViewDetails,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-md">
          <Loader2 className="animate-spin h-xl w-xl text-primary" />
          <p className="text-sm-regular text-neutral-text-secondary">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-md">
        <EmptyState
          icon={<AlertTriangle className="h-2xl w-2xl text-status-error-icon" />}
          title="Error Loading Orders"
          message={error}
          className="w-full max-w-lg"
        />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-md">
        <EmptyState
          icon={<FolderOpen className="h-2xl w-2xl text-neutral-icon" />}
          title="No Fuel Orders Found"
          message="Get started by creating a new fuel order, or adjust your filters."
          className="w-full max-w-lg"
          // Example of how an action could be added if needed in the future:
          // action={{
          //   text: 'Create New Order',
          //   onClick: () => console.log('Create new order clicked'),
          // }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-neutral-border">
      <table className="min-w-full divide-y divide-neutral-border">
        <thead className="bg-neutral-surface-subtle">
          <tr>
            <th scope="col" className="px-lg py-md text-left text-xs-medium text-neutral-text-tertiary uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-lg py-md text-left text-xs-medium text-neutral-text-tertiary uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-lg py-md text-left text-xs-medium text-neutral-text-tertiary uppercase tracking-wider">
              Tail Number
            </th>
            <th scope="col" className="px-lg py-md text-left text-xs-medium text-neutral-text-tertiary uppercase tracking-wider">
              Assigned LST
            </th>
            <th scope="col" className="px-lg py-md text-left text-xs-medium text-neutral-text-tertiary uppercase tracking-wider">
              Created At
            </th>
            <th scope="col" className="px-lg py-md text-right text-xs-medium text-neutral-text-tertiary uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-neutral-surface-default divide-y divide-neutral-border-subtle">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-neutral-surface-hover transition-colors duration-150">
              <td className="px-lg py-md whitespace-nowrap text-sm-medium text-neutral-text-primary">
                {order.id}
              </td>
              <td className="px-lg py-md whitespace-nowrap">
                <StatusBadge status={order.status as OrderStatus} />
              </td>
              <td className="px-lg py-md whitespace-nowrap text-sm-regular text-neutral-text-secondary">
                {order.tail_number}
              </td>
              <td className="px-lg py-md whitespace-nowrap text-sm-regular text-neutral-text-secondary">
                {order.assigned_lst?.username || order.assigned_lst_id || 'N/A'} 
              </td>
              <td className="px-lg py-md whitespace-nowrap text-sm-regular text-neutral-text-secondary">
                {formatDisplayValue(order.created_at, 'datetime')}
              </td>
              <td className="px-lg py-md whitespace-nowrap text-right">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onViewDetails(order.id)}
                  className="text-primary hover:text-primary-hover focus:ring-primary"
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderGrid; 