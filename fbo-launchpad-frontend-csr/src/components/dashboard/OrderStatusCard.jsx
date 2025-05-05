import React from "react";

const OrderStatusCard = ({ title, count, description, icon, color = "bg-blue-100", onViewAll }) => {
  return (
    <div className={`flex flex-col justify-between rounded-lg shadow-sm p-5 min-w-[220px] bg-white border border-gray-100 h-32`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${color}`}>
          {icon || (
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /></svg>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-800">{count}</span>
          <span className="text-gray-600 text-sm font-medium">{title}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{description}</span>
        {onViewAll && (
          <button
            className="text-xs text-blue-600 hover:underline font-semibold ml-2"
            onClick={onViewAll}
          >
            View All
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderStatusCard;
