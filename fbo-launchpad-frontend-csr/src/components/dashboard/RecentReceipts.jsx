import React from "react";
import StatusBadge from "../common/StatusBadge";
import { Link } from "react-router-dom";

const RecentReceipts = ({ receipts }) => {
  if (!receipts?.length) {
    return <div className="py-8 text-center text-gray-400">No recent receipts.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {receipts.map((receipt) => (
        <div key={receipt.receipt_id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">Receipt #{receipt.receipt_id}</span>
            <StatusBadge status={receipt.status} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
            <div>Aircraft:</div>
            <div className="text-gray-700">{receipt.tail_number} ({receipt.aircraft_type})</div>
            <div>Customer:</div>
            <div className="text-gray-700">{receipt.customer}</div>
            <div>Fuel Type:</div>
            <div className="text-gray-700">{receipt.fuel_type}</div>
            <div>Actual Quantity:</div>
            <div className="text-gray-700">{receipt.calculated_gallons_dispensed}</div>
            <div>Completed:</div>
            <div className="text-gray-700">{receipt.completed_at}</div>
          </div>
          <div>
            <Link to={`/receipts/${receipt.receipt_id}`} className="text-blue-600 hover:underline text-xs font-medium">View Receipt</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentReceipts;
