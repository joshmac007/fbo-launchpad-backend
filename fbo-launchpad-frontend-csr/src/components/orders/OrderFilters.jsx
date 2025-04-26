import React from 'react';
import PropTypes from 'prop-types';

// Define possible statuses for filtering (match backend enum names/values)
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'EN_ROUTE', label: 'En Route' },
  { value: 'FUELING', label: 'Fueling' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Basic styling (inline for simplicity)
const styles = {
  container: { 
    marginBottom: '15px', 
    display: 'flex', 
    gap: '10px', 
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  label: { 
    marginRight: '5px',
    fontWeight: '500',
    color: '#333',
  },
  select: { 
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    minWidth: '200px',
    cursor: 'pointer',
  },
};

function OrderFilters({ currentFilters, onFilterChange }) {
  const handleStatusChange = (event) => {
    onFilterChange('status', event.target.value);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center space-x-2">
        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
          Status:
        </label>
        <select
          id="statusFilter"
          value={currentFilters?.status || ''}
          onChange={handleStatusChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* Additional filters can be added here */}
    </div>
  );
}

OrderFilters.propTypes = {
  currentFilters: PropTypes.shape({
    status: PropTypes.string,
  }),
  onFilterChange: PropTypes.func.isRequired,
};

OrderFilters.defaultProps = {
  currentFilters: {
    status: '',
  },
};

export default OrderFilters; 