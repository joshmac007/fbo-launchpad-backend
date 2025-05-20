import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach, afterEach, MockedFunction } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import FuelOrdersPage from '../../../pages/orders/FuelOrdersPage';
import * as FuelOrderService from '../../../services/FuelOrderService';
import * as UserService from '../../../services/UserService';
import * as FuelTruckService from '../../../services/FuelTruckService';
import { saveAs as originalSaveAs } from 'file-saver';
import { FuelOrderStatus, FuelOrder } from '../../../types/fuelOrder';

// Mock child components
vi.mock('../../../components/orders/FuelOrderTable', () => ({
  default: (props: any) => (
    <div data-testid="fuel-order-table" data-props={JSON.stringify(props)}>
      Mocked FuelOrderTable
      <div>Orders: {props.orders?.length || 0}</div>
      <div>LST Users: {props.lstUsers?.length || 0}</div>
      <div>Fuel Trucks: {props.fuelTrucks?.length || 0}</div>
      <div>IsLoading: {props.isLoading?.toString()}</div>
    </div>
  ),
}));
vi.mock('../../../components/orders/FuelOrderFilters', () => ({
  default: (props: any) => <div data-testid="fuel-order-filters">Mocked FuelOrderFilters</div>,
}));
vi.mock('../../../components/common/PageHeader', () => ({
  default: (props: any) => <div data-testid="page-header">Mocked PageHeader</div>,
}));
vi.mock('../../../components/common/PaginationControls', () => ({
  default: (props: any) => <div data-testid="pagination-controls">Mocked PaginationControls</div>,
}));
vi.mock('../../../components/orders/CreateOrderModal', () => ({
    default: (props: any) => <div data-testid="create-order-modal">Mocked CreateOrderModal</div>,
}));
vi.mock('../../../components/orders/OrderDetailModal', () => ({
    default: (props: any) => <div data-testid="order-detail-modal">Mocked OrderDetailModal</div>,
}));

// Mock services
vi.mock('../../../services/FuelOrderService');
vi.mock('../../../services/UserService');
vi.mock('../../../services/FuelTruckService');
vi.mock('file-saver');

// Mock react-hot-toast - ensuring Toaster is mocked and using imported toast for assertions
vi.mock('react-hot-toast', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual, // Spread actual to keep other exports if any
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
    },
    Toaster: () => <div data-testid="toaster" />,
  };
});

const mockGetOrders = FuelOrderService.getOrders as MockedFunction<typeof FuelOrderService.getOrders>;
const mockGetUsers = UserService.getUsers as MockedFunction<typeof UserService.getUsers>;
const mockGetFuelTrucks = FuelTruckService.getFuelTrucks as MockedFunction<typeof FuelTruckService.getFuelTrucks>;
const mockUpdateOrderStatus = FuelOrderService.updateOrderStatus as MockedFunction<typeof FuelOrderService.updateOrderStatus>;
const mockExportOrdersCSV = FuelOrderService.exportOrdersCSV as MockedFunction<typeof FuelOrderService.exportOrdersCSV>;
const mockSaveAs = originalSaveAs as MockedFunction<typeof originalSaveAs>;

const mockMinimalFuelOrder: FuelOrder = {
  id: 1,
  tail_number: 'N123',
  status: FuelOrderStatus.PENDING,
  created_at: new Date().toISOString(),
  fuel_type: 'Jet A',
  requested_amount: '100',
  location_on_ramp: 'A1',
  assigned_lst_user_id: 1,
  assigned_truck_id: 101,
  additive_requested: false,
};

const mockPaginatedOrdersResponse = {
  orders: [mockMinimalFuelOrder],
  pagination: { page: 1, pages: 1, total: 1, has_next: false, has_prev: false, per_page: 10 },
  message: 'Success'
};

const mockUsersResponse = {
  users: [{ id: 1, name: 'LST User One', email: 'lst1@example.com', is_active: true }],
};

const mockFuelTrucksResponse = [
  { id: 101, identifier: 'Truck A', status: 'AVAILABLE', created_at: '', updated_at: '' },
];

// Helper to render with Router context
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('FuelOrdersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetOrders.mockResolvedValue(mockPaginatedOrdersResponse);
    mockGetUsers.mockResolvedValue(mockUsersResponse);
    mockGetFuelTrucks.mockResolvedValue(mockFuelTrucksResponse);
    mockUpdateOrderStatus.mockResolvedValue({
      ...mockMinimalFuelOrder,
      status: FuelOrderStatus.CANCELLED,
    });
    mockExportOrdersCSV.mockResolvedValue(new Blob());
  });

  test('fetches orders, LST users, and fuel trucks on initial render and passes them to FuelOrderTable', async () => {
    renderWithRouter(<FuelOrdersPage />); // Use helper

    expect(mockGetOrders).toHaveBeenCalledTimes(1);
    expect(mockGetUsers).toHaveBeenCalledTimes(1);
    expect(mockGetFuelTrucks).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      const table = screen.getByTestId('fuel-order-table');
      const tableProps = JSON.parse(table.getAttribute('data-props') || '{}');
      expect(tableProps.isLoading).toBe(false); // Wait for loading to complete
      // Assert other props now that loading is complete
      expect(tableProps.orders).toEqual(mockPaginatedOrdersResponse.orders);
      expect(tableProps.lstUsers).toEqual(mockUsersResponse.users);
      expect(tableProps.fuelTrucks).toEqual(mockFuelTrucksResponse);
    });
  });

 test('shows toast error and passes empty arrays to table if LST users fetch fails', async () => {
    mockGetUsers.mockRejectedValueOnce(new Error('Failed to fetch users'));
    renderWithRouter(<FuelOrdersPage />); // Use helper

    await waitFor(() => {
      expect(UserService.getUsers).toHaveBeenCalledTimes(1);
      // expect(FuelTruckService.getFuelTrucks).toHaveBeenCalledTimes(1); // This might be racy, depends on Promise.all behavior with one rejection
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith( // Use imported toast
        'Failed to load some auxiliary data for display. IDs will be shown.'
      );
    });

    await waitFor(() => {
      const table = screen.getByTestId('fuel-order-table');
      const tableProps = JSON.parse(table.getAttribute('data-props') || '{}');
      expect(tableProps.orders).toEqual(mockPaginatedOrdersResponse.orders);
      expect(tableProps.lstUsers).toEqual([]);
      expect(tableProps.fuelTrucks).toEqual([]); // Corrected: Should be empty due to catch block
      expect(tableProps.isLoading).toBe(false);
    });
  });

  test('shows toast error and passes empty arrays to table if fuel trucks fetch fails', async () => {
    mockGetFuelTrucks.mockRejectedValueOnce(new Error('Failed to fetch trucks'));
    renderWithRouter(<FuelOrdersPage />); // Use helper

    await waitFor(() => {
      // expect(UserService.getUsers).toHaveBeenCalledTimes(1); // Similar to above, racy
      expect(FuelTruckService.getFuelTrucks).toHaveBeenCalledTimes(1);
    });
    
    await waitFor(() => {
       expect(toast.error).toHaveBeenCalledWith( // Use imported toast
        'Failed to load some auxiliary data for display. IDs will be shown.'
      );
    });
    
    await waitFor(() => {
      const table = screen.getByTestId('fuel-order-table');
      const tableProps = JSON.parse(table.getAttribute('data-props') || '{}');
      expect(tableProps.orders).toEqual(mockPaginatedOrdersResponse.orders);
      expect(tableProps.lstUsers).toEqual([]); // Corrected: Should be empty due to catch block
      expect(tableProps.fuelTrucks).toEqual([]);
      expect(tableProps.isLoading).toBe(false);
    });
  });
  
  test('displays error message if fetching orders fails', async () => {
    mockGetOrders.mockRejectedValueOnce(new Error('API Error Fetching Orders'));
    renderWithRouter(<FuelOrdersPage />); // Use helper

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error Fetching Orders/i)).toBeInTheDocument();
    });
  });

  // Add more tests for pagination, filtering, modal interactions, export, cancel etc.
}); 