import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderStatusCard } from './OrderStatusCard';
import { FuelOrdersTable } from './FuelOrdersTable';
import { OrderStatus } from '../../types/orders';
import { useOrders } from '../../hooks/useOrders';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, error } = useOrders();
  
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    if (orders) {
      setStats({
        pending: orders.filter(order => order.status === OrderStatus.PENDING).length,
        inProgress: orders.filter(order => order.status === OrderStatus.IN_PROGRESS).length,
        completed: orders.filter(order => order.status === OrderStatus.COMPLETED).length
      });
    }
  }, [orders]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">CSR Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome, Super User</div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <OrderStatusCard
          title="Pending Orders"
          description="Orders waiting for fueling"
          count={stats.pending}
          icon="clock"
          onViewAll={() => navigate('/orders?status=pending')}
        />
        <OrderStatusCard
          title="In Progress"
          description="Orders currently being fueled"
          count={stats.inProgress}
          icon="plane"
          onViewAll={() => navigate('/orders?status=in-progress')}
        />
        <OrderStatusCard
          title="Completed Orders"
          description="Recently completed fuel orders"
          count={stats.completed}
          icon="check"
          onViewAll={() => navigate('/orders?status=completed')}
        />
      </div>

      {/* Fuel Orders Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fuel Orders</h2>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/orders/export')}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <span>Export</span>
              </button>
              <button
                onClick={() => navigate('/orders/new')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <span>New Order</span>
              </button>
            </div>
          </div>
        </div>
        
        <FuelOrdersTable orders={orders} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default Dashboard; 