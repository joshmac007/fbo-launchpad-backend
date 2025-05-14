import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { FileText } from 'lucide-react'; // Icon for empty state
import { OrderStatus } from '../../types/orders'; // Assuming receipt status can reuse OrderStatus or a similar enum exists

// Define the Receipt type based on usage
interface Receipt {
  receipt_id: string | number;
  status: OrderStatus | string; // Allow string for flexibility if a separate ReceiptStatus enum isn't defined yet
  tail_number: string;
  aircraft_type: string;
  customer: string;
  fuel_type: string;
  calculated_gallons_dispensed: number | string;
  completed_at?: string | null; // Make optional as it's checked
}

interface RecentReceiptsProps {
  receipts?: Receipt[]; // Make optional to handle undefined case leading to empty state
}

const RecentReceipts: React.FC<RecentReceiptsProps> = ({ receipts }) => {
  if (!receipts || receipts.length === 0) {
    return (
      <EmptyState 
        icon={<FileText className="h-xl w-xl text-neutral-icon" />}
        title="No Recent Receipts"
        message="When new receipts are generated, they will appear here."
        className="py-lg"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
      {receipts.map((receipt) => (
        <Card key={receipt.receipt_id} className="flex flex-col justify-between p-md min-h-[180px] shadow-sm hover:shadow-md transition-shadow duration-150">
          <div>
            <div className="flex items-center justify-between mb-sm">
              <span className="text-md-semibold text-neutral-text-primary">Receipt #{receipt.receipt_id}</span>
              {/* Assuming StatusBadge can handle string status or OrderStatus directly */}
              <StatusBadge status={receipt.status as OrderStatus} /> 
            </div>
            <div className="grid grid-cols-2 gap-x-md gap-y-xs text-xs-regular mb-sm">
              <div className="text-neutral-text-secondary">Aircraft:</div>
              <div className="text-neutral-text-primary truncate" title={`${receipt.tail_number} (${receipt.aircraft_type})`}>{receipt.tail_number} ({receipt.aircraft_type})</div>
              <div className="text-neutral-text-secondary">Customer:</div>
              <div className="text-neutral-text-primary truncate" title={receipt.customer}>{receipt.customer}</div>
              <div className="text-neutral-text-secondary">Fuel Type:</div>
              <div className="text-neutral-text-primary">{receipt.fuel_type}</div>
              <div className="text-neutral-text-secondary">Actual Qty:</div>
              <div className="text-neutral-text-primary">{receipt.calculated_gallons_dispensed} gal</div>
              <div className="text-neutral-text-secondary">Completed:</div>
              <div className="text-neutral-text-primary">
                {receipt.completed_at ? new Date(receipt.completed_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          <div className="mt-auto pt-sm"> {/* Added pt-sm for spacing */}
            <Button 
              as={Link} 
              to={`/receipts/${receipt.receipt_id}`} 
              variant="link"
              size="sm" // Changed from xs for better consistency if applicable
              className="self-start text-primary hover:text-primary-hover focus:ring-primary"
            >
              View Receipt
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RecentReceipts; 