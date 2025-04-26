import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FuelOrder, OrderStatus } from '../../types/orders';

interface FuelOrdersTableProps {
  orders: FuelOrder[] | null;
  loading: boolean;
  error: Error | null;
}

export const FuelOrdersTable: React.FC<FuelOrdersTableProps> = ({
  orders,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading orders: {error.message}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No orders found
      </div>
    );
  }

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.aircraft}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fuelType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity} gal</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.created).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </button>
                {order.status === OrderStatus.COMPLETED && (
                  <button
                    onClick={() => navigate(`/orders/${order.id}/receipt`)}
                    className="ml-4 text-blue-600 hover:text-blue-900"
                  >
                    View Receipt
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 