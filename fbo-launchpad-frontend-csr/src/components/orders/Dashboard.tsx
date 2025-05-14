import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderStatusCard from './OrderStatusCard';
import FuelOrdersTable from './FuelOrdersTable';
import { OrderStatus } from '../../types/orders';
import { useOrders } from '../../hooks/useOrders';
import Card from '../common/Card';
import Button from '../common/Button';
import { UploadCloud, PlusCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, error } = useOrders();
  
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    if (orders) {
      setStats({
        pending: orders.filter(order => order.status === OrderStatus.PENDING).length,
        inProgress: orders.filter(order => order.status === OrderStatus.IN_PROGRESS).length,
        completed: orders.filter(order => order.status === OrderStatus.COMPLETED).length,
        cancelled: 0
      });
    }
  }, [orders]);

  const userName = "Super User";

  return (
    <div className="p-md md:p-lg bg-neutral-background dark:bg-neutral-background min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-lg">
        <h1 className="text-xl-strong text-neutral-text-primary">CSR Dashboard</h1>
        <div className="text-sm-regular text-neutral-text-secondary mt-xs sm:mt-0">Welcome, {userName}</div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <OrderStatusCard
          title="Pending Orders"
          description="Orders waiting for action"
          count={stats.pending}
          status="pending"
          onViewAll={() => navigate('/orders?status=pending')}
        />
        <OrderStatusCard
          title="In Progress"
          description="Orders currently being processed"
          count={stats.inProgress}
          status="inProgress"
          onViewAll={() => navigate('/orders?status=in-progress')}
        />
        <OrderStatusCard
          title="Completed Orders"
          description="Recently completed fuel orders"
          count={stats.completed}
          status="completed"
          onViewAll={() => navigate('/orders?status=completed')}
        />
        <OrderStatusCard
          title="Cancelled Orders"
          description="Orders that have been cancelled"
          count={stats.cancelled}
          status="cancelled"
          onViewAll={() => navigate('/orders?status=cancelled')}
        />
      </div>

      {/* Fuel Orders Section */}
      <Card>
        <div className="p-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm">
          <h2 className="text-lg-strong text-neutral-text-primary">Fuel Orders</h2>
          <div className="flex items-center gap-sm flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate('/orders/export')}
              aria-label="Export Orders"
            >
              <UploadCloud size={16} className="mr-xs" />
              Export
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/orders/new')}
              aria-label="Create New Order"
            >
              <PlusCircle size={16} className="mr-xs" />
              New Order
            </Button>
          </div>
        </div>
        <FuelOrdersTable orders={orders} loading={loading} error={error} />
      </Card>
    </div>
  );
};

export default Dashboard; 