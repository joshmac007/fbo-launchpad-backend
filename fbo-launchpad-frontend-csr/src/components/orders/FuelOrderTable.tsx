import React from 'react';
import { FuelOrder, FuelOrderStatus } from '../../types/fuelOrder';
import Table, { ColumnDef } from '../common/Table'; // Import common Table and ColumnDef
import Button from '../common/Button';
import { Eye, Edit3, XCircle } from 'lucide-react';
import OrderStatusBadge from '../common/OrderStatusBadge'; // Added import for common badge
import { User } from '../../types/users'; // Import User type
import { FuelTruck } from '../../types/fuelTruck'; // Import FuelTruck type

// Local OrderStatusBadge removed

interface FuelOrderTableProps {
  orders: FuelOrder[];
  onViewDetails: (orderId: number) => void;
  onEditOrder: (orderId: number) => void;
  onCancelOrder: (orderId: number) => void;
  isLoading?: boolean; 
  lstUsers: User[]; // Added prop for LST users
  fuelTrucks: FuelTruck[]; // Added prop for fuel trucks
}

const FuelOrderTable: React.FC<FuelOrderTableProps> = ({
  orders,
  onViewDetails,
  onEditOrder,
  onCancelOrder,
  isLoading = false,
  lstUsers, // Destructure new prop
  fuelTrucks, // Destructure new prop
}) => {

  const columns: ColumnDef<FuelOrder>[] = React.useMemo(() => [
    { header: 'ID', accessorKey: 'id', cell: info => <span className="font-medium">{info.getValue<number>()}</span> },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: info => <OrderStatusBadge status={info.getValue<FuelOrderStatus | string>()} /> 
    },
    { header: 'Tail #', accessorKey: 'tail_number' },
    {
      header: 'Fuel Type',
      accessorKey: 'fuel_type',
      cell: info => {
        const fuelTypeData = info.getValue<any>();
        if (typeof fuelTypeData === 'object' && fuelTypeData !== null) {
          return fuelTypeData.name || fuelTypeData.code || JSON.stringify(fuelTypeData);
        }
        if (typeof fuelTypeData === 'string') {
          return fuelTypeData;
        }
        return 'N/A';
      }
    },
    {
      header: 'Req. Amt.',
      accessorKey: 'requested_amount',
      cell: info => `${info.getValue<string>() ? parseFloat(info.getValue<string>()).toFixed(2) : 'N/A'} gal`
    },
    {
      header: 'Assigned LST',
      accessorKey: 'assigned_lst_user_id',
      cell: info => {
        const lstId = info.getValue<number | null>();
        if (lstId === null || lstId === undefined) return 'N/A';
        const user = lstUsers.find(u => u.id === lstId);
        return user?.name || user?.email || (lstId === -1 ? 'Auto-assign' : lstId) || 'N/A'; // Display name, fallback to email, then ID
      }
    },
    {
      header: 'Assigned Truck',
      accessorKey: 'assigned_truck_id',
      cell: info => {
        const truckId = info.getValue<number | null>();
        if (truckId === null || truckId === undefined) return 'N/A';
        const truck = fuelTrucks.find(t => t.id === truckId);
        return truck?.identifier || (truckId === -1 ? 'Auto-assign' : truckId) || 'N/A'; // Display identifier, fallback to ID
      }
    },
    { header: 'Location', accessorKey: 'location_on_ramp', cell: info => info.getValue() || 'N/A' },
    {
      header: 'Created At',
      accessorKey: 'created_at',
      cell: info => new Date(info.getValue<string>()).toLocaleDateString()
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        const isCompleted = order.status === FuelOrderStatus.COMPLETED || order.status === 'COMPLETED';
        const isCancelled = order.status === FuelOrderStatus.CANCELLED || order.status === 'CANCELLED';
        const canModify = !isCompleted && !isCancelled;
        return (
          <div className="space-x-xs flex items-center">
            <Button variant="ghost" size="icon" onClick={() => onViewDetails(order.id)} title="View Details">
              <Eye className="h-sm w-sm" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEditOrder(order.id)} title="Edit Order" disabled={!canModify}>
              <Edit3 className="h-sm w-sm" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onCancelOrder(order.id)} title="Cancel Order" className="text-status-error-text hover:text-status-error-text-hover disabled:text-neutral-text-disabled" disabled={!canModify}>
              <XCircle className="h-sm w-sm" />
            </Button>
          </div>
        );
      }
    }
  ], [onViewDetails, onEditOrder, onCancelOrder, lstUsers, fuelTrucks]); // Added lstUsers and fuelTrucks to dependencies

  return (
    <Table<FuelOrder>
      columns={columns}
      data={orders}
      isLoading={isLoading}
      emptyStateMessage="No fuel orders match your current filters."
      // onRowClick={(row) => onViewDetails(row.original.id)} // Example: make row clickable
    />
  );
};

export default FuelOrderTable; 