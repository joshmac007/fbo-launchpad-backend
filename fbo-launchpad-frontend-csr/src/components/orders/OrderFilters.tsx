import React from 'react';

// Define the structure for a single status option
interface StatusOption {
  value: string;
  label: string;
}

// Define possible statuses for filtering
const statusOptions: StatusOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'EN_ROUTE', label: 'En Route' },
  { value: 'FUELING', label: 'Fueling' },
  { value: 'COMPLETED', label: 'Completed' }, 
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CANCELLED', label: 'Cancelled' }, 
];

// Define props for the component
interface OrderFiltersProps {
  currentFilters?: {
    status?: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  currentFilters = { status: '' }, 
  onFilterChange,
}) => {
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange('status', event.target.value);
  };

  return (
    <div className="flex flex-wrap gap-md items-center p-sm bg-neutral-surface-subtle rounded-md border border-neutral-border">
      <div className="flex items-center gap-sm">
        <label htmlFor="statusFilter" className="text-sm-medium text-neutral-text-secondary">
          Status:
        </label>
        <select
          id="statusFilter"
          name="statusFilter"
          value={currentFilters?.status || ''}
          onChange={handleStatusChange}
          className="block w-56 pl-sm pr-lg py-sm text-sm-regular 
                     bg-neutral-surface text-neutral-text-primary 
                     border border-neutral-border-strong rounded-md 
                     focus:ring-1 focus:ring-primary focus:border-primary 
                     transition-colors hover:border-neutral-border-hover 
                     dark:bg-neutral-surface dark:text-neutral-text-primary dark:border-neutral-border-strong"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value} className="text-neutral-text-primary bg-neutral-surface dark:bg-neutral-surface-subtle">
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* Additional filters can be added here */}
    </div>
  );
};

export default OrderFilters; 