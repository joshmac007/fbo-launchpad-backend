import React, { useState } from "react";
import OrderStatusCard from "../dashboard/OrderStatusCard";
import FuelOrdersTable from "./FuelOrdersTable";
import RecentReceipts from "../dashboard/RecentReceipts";
import PaginationControls from "../common/PaginationControls";
import { useNavigate } from "react-router-dom";




const FILTER_TABS = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("all");
  // Placeholder removal: use empty arrays as default; real data will be fetched later
  const [orders] = useState([]);
  const [isLoading] = useState(false);
  const [error] = useState(null);
  const [receipts] = useState([]);
  const navigate = useNavigate();

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const inProgressCount = orders.filter(o => o.status === "In Progress").length;
  const completedCount = orders.filter(o => o.status === "Completed").length;

  return (
    <div className="space-y-8">
      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OrderStatusCard
          title="Pending Orders"
          count={pendingCount}
          description="Orders waiting for fueling"
          color="bg-yellow-100"
          onViewAll={() => setActiveTab("Pending")}
        />
        <OrderStatusCard
          title="In Progress"
          count={inProgressCount}
          description="Orders currently being fueled"
          color="bg-blue-100"
          onViewAll={() => setActiveTab("In Progress")}
        />
        <OrderStatusCard
          title="Completed Orders"
          count={completedCount}
          description="Recently completed fuel orders"
          color="bg-green-100"
          onViewAll={() => setActiveTab("Completed")}
        />
      </div>

      {/* Fuel Orders Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Fuel Orders</h2>
            <p className="text-sm text-gray-500">Manage and track fuel orders</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-gray-700 text-sm font-medium hover:bg-gray-200">Export</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700" onClick={() => navigate('/orders/new')}>New Order</button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors duration-100 ${
                activeTab === tab.value
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Orders Table */}
        <FuelOrdersTable orders={filteredOrders} isLoading={isLoading} error={error} />
        {/* Pagination Controls (if needed) */}
        <div className="mt-4">
          <PaginationControls
            paginationData={{
              page: 1,
              total_pages: 1,
              has_prev: false,
              has_next: false,
              total_items: filteredOrders.length
            }}
            onPageChange={() => {}}
          />
        </div>
      </section>

      {/* Recent Receipts Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Fueling Receipts</h2>
        <RecentReceipts receipts={receipts} />
      </section>
    </div>
  );
};

export default Dashboard;
