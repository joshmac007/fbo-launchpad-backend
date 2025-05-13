import React from "react";
import StatusBadge from "../common/StatusBadge";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const FuelOrdersTable = ({ orders = [], isLoading, error }) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (isLoading) {
    return <div className="py-8 text-center text-gray-400">Loading orders...</div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }
  if (!orders.length) {
    return <div className="py-8 text-center text-gray-400">No orders found.</div>;
  }
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">ID</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Aircraft</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Customer</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Fuel Type</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Quantity</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Status</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Created</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id || order.ID} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-blue-600 font-semibold">#{order.id || order.ID}</td>
              <td className="px-4 py-2 text-sm">{order.aircraft}</td>
              <td className="px-4 py-2 text-sm">{order.customer}</td>
              <td className="px-4 py-2 text-sm">{order.fuelType}</td>
              <td className="px-4 py-2 text-sm">{order.quantity}</td>
              <td className="px-4 py-2 text-sm"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-2 text-sm">{order.created_at}</td>
              <td className="px-4 py-2 text-sm flex gap-2">
                <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline text-xs font-medium">View</Link>
                {order.status === "COMPLETED" && isAuthenticated && hasPermission('VIEW_RECEIPT') && (
                  <Link to={`/orders/${order.id}/receipt`} className="text-green-600 hover:underline text-xs font-medium">View Receipt</Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FuelOrdersTable;
