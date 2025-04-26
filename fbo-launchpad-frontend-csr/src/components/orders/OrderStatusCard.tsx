import React from 'react';
import { IconClock, IconPlane, IconCheck } from '../../components/common/Icons';

interface OrderStatusCardProps {
  title: string;
  description: string;
  count: number;
  icon: 'clock' | 'plane' | 'check';
  onViewAll: () => void;
}

const iconMap = {
  clock: IconClock,
  plane: IconPlane,
  check: IconCheck,
};

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  title,
  description,
  count,
  icon,
  onViewAll,
}) => {
  const Icon = iconMap[icon];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{count}</h3>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button
        onClick={onViewAll}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View All
      </button>
    </div>
  );
}; 