import React from 'react';
import { Clock, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

interface OrderStatusCardProps {
  title: string;
  count: number;
  status: 'pending' | 'inProgress' | 'completed' | 'cancelled';
}

const statusConfig = {
  pending: {
    Icon: Clock,
    iconBgClass: 'bg-status-warning-surface',
    iconTextClass: 'text-status-warning-text',
  },
  inProgress: {
    Icon: Send,
    iconBgClass: 'bg-status-info-surface',
    iconTextClass: 'text-status-info-text',
  },
  completed: {
    Icon: CheckCircle2,
    iconBgClass: 'bg-status-success-surface',
    iconTextClass: 'text-status-success-text',
  },
  cancelled: {
    Icon: AlertTriangle,
    iconBgClass: 'bg-status-error-surface',
    iconTextClass: 'text-status-error-text',
  },
};

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  title,
  count,
  status,
}) => {
  const { Icon, iconBgClass, iconTextClass } = statusConfig[status];

  return (
    <Card padding="md">
      <div>
        <div className="flex items-center">
          <div className="flex items-center gap-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass}`}>
              <Icon className={`w-5 h-5 ${iconTextClass}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-text-primary">{count}</h3>
              <p className="text-sm text-neutral-text-secondary">{title}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrderStatusCard; 