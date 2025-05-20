import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FuelOrderFilters, { FuelOrderFiltersState } from '../../../components/orders/FuelOrderFilters';
import { FuelOrderStatus } from '../../../types/fuelOrder';

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const original = await importOriginal<typeof import('lucide-react')>();
  return {
    ...original,
    Search: (props: any) => <svg data-testid="search-icon" {...props} />,
    X: (props: any) => <svg data-testid="x-icon" {...props} />,
  };
});

describe('FuelOrderFilters', () => {
  const mockOnFilterChange = vi.fn();
  const initialFiltersBase: FuelOrderFiltersState = {
    tail_number: '',
    status: '',
  };

  const renderComponent = (props: Partial<React.ComponentProps<typeof FuelOrderFilters>> = {}) => {
    const defaultProps = {
      initialFilters: initialFiltersBase,
      onFilterChange: mockOnFilterChange,
    };
    return render(<FuelOrderFilters {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter inputs and buttons', () => {
    renderComponent();
    expect(screen.getByLabelText(/Tail Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply Filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('should initialize with provided initialFilters', () => {
    const specificInitialFilters: FuelOrderFiltersState = {
      tail_number: 'N54321',
      status: FuelOrderStatus.COMPLETED,
    };
    renderComponent({ initialFilters: specificInitialFilters });

    expect(screen.getByLabelText<HTMLInputElement>(/Tail Number/i).value).toBe('N54321');
    expect(screen.getByLabelText<HTMLSelectElement>(/Status/i).value).toBe(FuelOrderStatus.COMPLETED);
  });

  it('should update tail_number input when typed into', () => {
    renderComponent();
    const tailInput = screen.getByLabelText<HTMLInputElement>(/Tail Number/i);
    fireEvent.change(tailInput, { target: { value: 'N111' } });
    expect(tailInput.value).toBe('N111');
  });

  it('should update status select when an option is chosen', () => {
    renderComponent();
    const statusSelect = screen.getByLabelText<HTMLSelectElement>(/Status/i);
    fireEvent.change(statusSelect, { target: { value: FuelOrderStatus.PENDING } });
    expect(statusSelect.value).toBe(FuelOrderStatus.PENDING);
  });

  it('should call onFilterChange with current filters when "Apply Filters" is clicked', () => {
    renderComponent();
    const tailInput = screen.getByLabelText<HTMLInputElement>(/Tail Number/i);
    const statusSelect = screen.getByLabelText<HTMLSelectElement>(/Status/i);

    fireEvent.change(tailInput, { target: { value: 'N222' } });
    fireEvent.change(statusSelect, { target: { value: FuelOrderStatus.DISPATCHED } });

    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyButton);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tail_number: 'N222',
      status: FuelOrderStatus.DISPATCHED,
    });
  });

  it('should call onFilterChange with cleared filters and reset inputs when "Clear Filters" is clicked', () => {
    const specificInitialFilters: FuelOrderFiltersState = {
      tail_number: 'N54321',
      status: FuelOrderStatus.COMPLETED,
    };
    renderComponent({ initialFilters: specificInitialFilters });

    // Verify initial state is set
    const tailInput = screen.getByLabelText<HTMLInputElement>(/Tail Number/i);
    const statusSelect = screen.getByLabelText<HTMLSelectElement>(/Status/i);
    expect(tailInput.value).toBe('N54321');
    expect(statusSelect.value).toBe(FuelOrderStatus.COMPLETED);

    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tail_number: '',
      status: '',
    });

    // Check if inputs are cleared
    expect(tailInput.value).toBe('');
    expect(statusSelect.value).toBe('');
  });

  it('should update internal state if initialFilters prop changes', () => {
    const { rerender } = renderComponent({ initialFilters: { tail_number: 'FIRST', status: FuelOrderStatus.PENDING } });
    expect(screen.getByLabelText<HTMLInputElement>(/Tail Number/i).value).toBe('FIRST');

    const newInitialFilters: FuelOrderFiltersState = { tail_number: 'SECOND', status: FuelOrderStatus.EN_ROUTE };
    rerender(<FuelOrderFilters initialFilters={newInitialFilters} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByLabelText<HTMLInputElement>(/Tail Number/i).value).toBe('SECOND');
    expect(screen.getByLabelText<HTMLSelectElement>(/Status/i).value).toBe(FuelOrderStatus.EN_ROUTE);
  });

  it('Status select should contain "All Statuses" and all FuelOrderStatus options', () => {
    renderComponent();
    const statusSelect = screen.getByLabelText<HTMLSelectElement>(/Status/i);
    const options = Array.from(statusSelect.options).map(opt => ({ value: opt.value, label: opt.text }));

    expect(options).toContainEqual({ value: '', label: 'All Statuses' });

    Object.entries(FuelOrderStatus).forEach(([key, value]) => {
      const expectedLabel = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ');
      expect(options).toContainEqual({ value: value, label: expectedLabel });
    });
  });
}); 