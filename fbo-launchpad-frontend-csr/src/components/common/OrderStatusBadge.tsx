import React from 'react';
import { FuelOrderStatus } from '../../types/fuelOrder';

interface OrderStatusBadgeProps {
  status: FuelOrderStatus | string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';

  switch (status) {
    case FuelOrderStatus.PENDING:
      bgColor = 'bg-yellow-200';
      textColor = 'text-yellow-800';
      break;
    case FuelOrderStatus.ACKNOWLEDGED:
      bgColor = 'bg-blue-200';
      textColor = 'text-blue-800';
      break;
    case FuelOrderStatus.DISPATCHED:
      bgColor = 'bg-indigo-200';
      textColor = 'text-indigo-800';
      break;
    case FuelOrderStatus.EN_ROUTE:
      bgColor = 'bg-purple-200';
      textColor = 'text-purple-800';
      break;
    case FuelOrderStatus.FUELING:
      bgColor = 'bg-pink-200';
      textColor = 'text-pink-800';
      break;
    case FuelOrderStatus.COMPLETED:
      bgColor = 'bg-green-200';
      textColor = 'text-green-800';
      break;
    case FuelOrderStatus.REVIEWED:
      bgColor = 'bg-teal-200';
      textColor = 'text-teal-800';
      break;
    case FuelOrderStatus.CANCELLED:
      bgColor = 'bg-red-200';
      textColor = 'text-red-800';
      break;
    case FuelOrderStatus.ON_HOLD:
      bgColor = 'bg-gray-400'; // Darker gray for ON_HOLD
      textColor = 'text-gray-900';
      break;
    default:
      // For any string status not matching FuelOrderStatus enum exactly
      // Or if a new status is added to enum but not to switch case
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
      break;
  }

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {typeof status === 'string' ? status.replace(/_/g, ' ') : status}
    </span>
  );
};

export default OrderStatusBadge; 