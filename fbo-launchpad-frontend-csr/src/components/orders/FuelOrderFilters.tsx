import React, { useState, useEffect, useCallback } from 'react';
import { FuelOrderStatus } from '../../types/fuelOrder';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Search, X } from 'lucide-react';

/**
 * Represents the state of the fuel order filters.
 * @property tail_number - Optional. The tail number to filter by.
 * @property status - Optional. The fuel order status to filter by.
 * @todo Add other filter fields: LST, Truck, Date Range, Sort By, etc.
 */
export interface FuelOrderFiltersState {
  tail_number?: string;
  status?: FuelOrderStatus | string;
  // Add other filter fields here later: LST, Truck, Date Range, Sort By, etc.
}

/**
 * Props for the FuelOrderFilters component.
 * @property initialFilters - The initial filter values to set.
 * @property onFilterChange - Callback function invoked when filters are applied or cleared.
 * @property isLoading - Optional. If true, filter inputs could be disabled (not currently implemented).
 */
interface FuelOrderFiltersProps {
  initialFilters: FuelOrderFiltersState;
  onFilterChange: (filters: FuelOrderFiltersState) => void;
  // isLoading?: boolean; // If filters need to be disabled during load
}

/**
 * FuelOrderFilters component allows users to filter a list of fuel orders.
 * It provides inputs for various filter criteria and buttons to apply or clear filters.
 */
const FuelOrderFilters: React.FC<FuelOrderFiltersProps> = ({
  initialFilters,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<FuelOrderFiltersState>(initialFilters);

  // Update internal state if initialFilters prop changes from parent
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Handles changes to individual filter fields.
   * @param field - The key of the filter state to update.
   * @param value - The new value for the filter field.
   */
  const handleChange = (field: keyof FuelOrderFiltersState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Applies the current filter state by invoking the onFilterChange callback.
   */
  const handleApplyFilters = useCallback(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  /**
   * Clears all filter inputs and applies the empty filter state.
   */
  const handleClearFilters = useCallback(() => {
    const clearedFilters: FuelOrderFiltersState = { tail_number: '', status: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  }, [onFilterChange]);

  // Get string values from FuelOrderStatus enum for the Select options
  const statusOptions = Object.entries(FuelOrderStatus).map(([key, value]) => ({
    value: value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' '), // Format like "Pending", "En Route"
  }));

  return (
    <div className="p-md mb-lg bg-neutral-surface-raised rounded-lg shadow-sm border border-neutral-border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md items-end">
        <Input
          label="Tail Number"
          id="filter-tail-number"
          placeholder="e.g., N12345"
          value={filters.tail_number || ''}
          onChange={(e) => handleChange('tail_number', e.target.value)}
          // Consider adding a delay/debounce if API calls are made on every keystroke
        />
        <Select
          label="Status"
          id="filter-status"
          options={[
            { value: '', label: 'All Statuses' }, 
            ...statusOptions
          ]}
          value={filters.status || ''}
          onChange={(eventOrValue) => {
            // Assuming the Select component might pass the event or just the value based on its implementation
            // For safety, check if it's an event with a target, otherwise assume it's the value.
            const newValue = eventOrValue && typeof eventOrValue === 'object' && eventOrValue.target
              ? (eventOrValue as React.ChangeEvent<HTMLSelectElement>).target.value
              : eventOrValue;
            handleChange('status', newValue);
          }}
        />

        {/* Placeholders for more filters */}
        {/* <div>LST Filter (TBD)</div> */}
        {/* <div>Truck Filter (TBD)</div> */}
        {/* <div>Date Range Filter (TBD)</div> */}
        {/* <div>Sort By (TBD)</div> */}
      </div>
      <div className="mt-md flex items-center justify-end space-x-sm">
        <Button variant="outline" onClick={handleClearFilters} size="sm">
          <X className="mr-xs h-sm w-sm" /> Clear Filters
        </Button>
        <Button variant="primary" onClick={handleApplyFilters} size="sm">
          <Search className="mr-xs h-sm w-sm" /> Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FuelOrderFilters; 