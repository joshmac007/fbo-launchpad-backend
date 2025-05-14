import React from 'react';
import { OrderStatus } from '../../types/orders'; // Assuming path to your OrderStatus enum

// Helper to get display text for an OrderStatus
const getStatusDisplayText = (status: OrderStatus | string): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.IN_PROGRESS:
      return 'In Progress';
    case OrderStatus.COMPLETED:
      return 'Completed';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      if (typeof status === 'string') {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      }
      return 'Unknown';
  }
};

const STATUS_STYLES: Record<OrderStatus | 'UNKNOWN_STATUS', string> = {
  [OrderStatus.PENDING]: "bg-status-warning-surface text-status-warning-text",
  [OrderStatus.IN_PROGRESS]: "bg-status-info-surface text-status-info-text",
  [OrderStatus.COMPLETED]: "bg-status-success-surface text-status-success-text",
  [OrderStatus.CANCELLED]: "bg-status-error-surface text-status-error-text",
  UNKNOWN_STATUS: "bg-neutral-muted text-neutral-text-secondary"
};

interface StatusBadgeProps {
  status: OrderStatus | string; 
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styleKey = Object.values(OrderStatus).includes(status as OrderStatus) 
    ? status as OrderStatus 
    : 'UNKNOWN_STATUS';
  
  const statusStyle = STATUS_STYLES[styleKey];
  const displayText = getStatusDisplayText(status);

  const baseBadgeStyles = "px-3 py-1 rounded-full text-xs font-semibold";

  return (
    <span className={`${baseBadgeStyles} ${statusStyle} ${className}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;
