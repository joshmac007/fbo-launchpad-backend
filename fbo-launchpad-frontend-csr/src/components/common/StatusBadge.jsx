import React from "react";

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  default: "bg-gray-100 text-gray-700"
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.default;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>{status}</span>
  );
};

export default StatusBadge;
