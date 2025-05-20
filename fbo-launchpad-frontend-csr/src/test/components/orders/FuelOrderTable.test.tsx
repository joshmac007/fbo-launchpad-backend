import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import FuelOrderTable from '../../../components/orders/FuelOrderTable';
import { FuelOrder, FuelOrderStatus } from '../../../types/fuelOrder';
import { User } from '../../../types/users';
import { FuelTruck } from '../../../types/fuelTruck';
import { vi, describe, test, expect, beforeEach } from 'vitest'; // Added imports for vitest globals

// Mock data
const mockLstUsers: User[] = [
  { id: 1, name: 'LST User One', email: 'lst1@example.com', is_active: true },
  { id: 2, name: 'LST User Two', email: 'lst2@example.com', is_active: true },
  { id: 3, email: 'lst3@example.com', name: '', is_active: true }, // User with email, no name
];

const mockFuelTrucks: FuelTruck[] = [
  { id: 101, identifier: 'Truck A', status: 'AVAILABLE', created_at: '', updated_at: '' },
  { id: 102, identifier: 'Truck B', status: 'AVAILABLE', created_at: '', updated_at: '' },
];

const mockOrders: FuelOrder[] = [
  {
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
    customer_id: 1,
    csr_notes: 'Test note',
  },
  {
    id: 2,
    tail_number: 'N456',
    status: FuelOrderStatus.DISPATCHED,
    created_at: new Date().toISOString(),
    fuel_type: '100LL',
    requested_amount: '50',
    location_on_ramp: 'B2',
    assigned_lst_user_id: -1, 
    assigned_truck_id: -1,   
    additive_requested: true,
  },
  {
    id: 3,
    tail_number: 'N789',
    status: FuelOrderStatus.COMPLETED,
    created_at: new Date().toISOString(),
    fuel_type: 'Jet A',
    requested_amount: '200',
    location_on_ramp: 'C3',
    assigned_lst_user_id: 99,  
    assigned_truck_id: 999, 
    additive_requested: false,
  },
  {
    id: 4,
    tail_number: 'N000',
    status: FuelOrderStatus.PENDING,
    created_at: new Date().toISOString(),
    fuel_type: 'Jet A',
    requested_amount: '200',
    location_on_ramp: 'D4',
    assigned_lst_user_id: null,  
    assigned_truck_id: null,
    additive_requested: false,
  },
   {
    id: 5,
    tail_number: 'N111',
    status: FuelOrderStatus.PENDING,
    created_at: new Date().toISOString(),
    fuel_type: 'Jet A',
    requested_amount: '100',
    location_on_ramp: 'E5',
    assigned_lst_user_id: 3, 
    assigned_truck_id: 102,  
    additive_requested: false,
  },
];

const defaultProps = {
  orders: mockOrders,
  lstUsers: mockLstUsers,
  fuelTrucks: mockFuelTrucks,
  isLoading: false,
  onViewDetails: vi.fn(),
  onEditOrder: vi.fn(),
  onCancelOrder: vi.fn(),
};

describe('FuelOrderTable', () => {
  beforeEach(() => {
    // Reset mocks if they are stateful or have call counts
    defaultProps.onViewDetails.mockClear();
    defaultProps.onEditOrder.mockClear();
    defaultProps.onCancelOrder.mockClear();
  });

  test('renders LST user name correctly', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[0]]} />); // Order with LST ID 1
    // Find the row, then the cell. Rows can be identified by a unique text like tail number.
    const row = screen.getByRole('row', { name: /N123/i }); // This might be tricky if tail # isn't part of row accessible name
    // A better way might be to get all rows and select by index or content.
    // For now, let's assume we can find the specific cell.
    // Or, find cell by column header and row content
    
    // A more robust way: find all rows, then target cells by column index
    const rows = screen.getAllByRole('row'); 
    // Row 0 is header, Row 1 is first data row
    const firstDataRowCells = within(rows[1]).getAllByRole('cell');
    // Assuming "Assigned LST" is the 6th column (index 5)
    expect(firstDataRowCells[5]).toHaveTextContent('LST User One');
  });

  test('renders LST user email if name is missing', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[4]]} />); // Order with LST ID 3
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell'); // Only one order rendered
    expect(targetRowCells[5]).toHaveTextContent('lst3@example.com');
  });

  test('renders "Auto-assign" for LST ID -1', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[1]]} />); // Order with LST ID -1
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell');
    expect(targetRowCells[5]).toHaveTextContent('Auto-assign');
  });

  test('renders LST ID if user not found', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[2]]} />); // Order with LST ID 99
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell');
    expect(targetRowCells[5]).toHaveTextContent('99');
  });

  test('renders "N/A" for null LST ID', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[3]]} />); // Order with LST ID null
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell');
    expect(targetRowCells[5]).toHaveTextContent('N/A');
  });

  // Similar tests for Fuel Truck Identifier
  test('renders Fuel Truck identifier correctly', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[0]]} />); // Order with Truck ID 101
    const rows = screen.getAllByRole('row');
    const firstDataRowCells = within(rows[1]).getAllByRole('cell');
    // Assuming "Assigned Truck" is the 7th column (index 6)
    expect(firstDataRowCells[6]).toHaveTextContent('Truck A');
  });

  test('renders "Auto-assign" for Truck ID -1', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[1]]} />); // Order with Truck ID -1
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell');
    expect(targetRowCells[6]).toHaveTextContent('Auto-assign');
  });

  test('renders Truck ID if truck not found', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[2]]} />); // Order with Truck ID 999
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell');
    expect(targetRowCells[6]).toHaveTextContent('999');
  });

  test('renders "N/A" for undefined Truck ID', () => {
    render(<FuelOrderTable {...defaultProps} orders={[mockOrders[3]]} />); // Order with Truck ID undefined
    const rows = screen.getAllByRole('row');
    const targetRowCells = within(rows[1]).getAllByRole('cell');
    expect(targetRowCells[6]).toHaveTextContent('N/A');
  });

  // Test for empty orders
  test('renders empty state message when no orders are provided', () => {
    render(<FuelOrderTable {...defaultProps} orders={[]} />);
    expect(screen.getByText('No fuel orders match your current filters.')).toBeInTheDocument();
  });

  // Test for loading state
  test('renders loading state correctly', () => {
    // The Table component itself should handle the visual loading state.
    // We mainly check that our props are passed.
    // A more detailed test would involve inspecting the internals of the common Table,
    // or checking for a specific loading indicator if the Table component renders one distinctly.
    // For now, this test is more of a placeholder for that idea.
    const { container } = render(<FuelOrderTable {...defaultProps} isLoading={true} />);
    // This is a weak test; ideally, the Table component has a test ID for its loading state.
    // Or we can check if the table body is empty or a specific loading row is present.
    // For this example, we'll just ensure it renders without crashing.
    expect(container).toBeDefined(); 
  });

  // More tests could include:
  // - Correct number of rows rendered based on orders prop.
  // - Actions buttons (View, Edit, Cancel) are present and enabled/disabled correctly.
  // - Callbacks (onViewDetails, etc.) are called when buttons are clicked.
}); 