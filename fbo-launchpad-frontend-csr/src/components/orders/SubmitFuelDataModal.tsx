import React, { useState, useEffect } from 'react';
import { FuelOrderStatus } from '../../types/fuelOrder';
import { FuelOrder, submitFuelData, updateOrderStatus, UpdateFuelOrderStatusPayload } from '../../services/FuelOrderService';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea'; // Assuming Textarea component exists
import Modal from '../common/Modal';

interface SubmitFuelDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: FuelOrder | null;
  onFuelDataSubmitted: (updatedOrder: FuelOrder) => void;
}

const SubmitFuelDataModal: React.FC<SubmitFuelDataModalProps> = ({
  isOpen,
  onClose,
  order,
  onFuelDataSubmitted,
}) => {
  const [startMeterReading, setStartMeterReading] = useState<number | ''>('');
  const [endMeterReading, setEndMeterReading] = useState<number | ''>('');
  const [lstNotes, setLstNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setStartMeterReading(order.start_meter_reading ? parseFloat(order.start_meter_reading) : '');
      setEndMeterReading(order.end_meter_reading ? parseFloat(order.end_meter_reading) : '');
      setLstNotes(order.lst_notes || '');
    } else {
      // Reset form when order is not present or modal is closed
      setStartMeterReading('');
      setEndMeterReading('');
      setLstNotes('');
      setError(null);
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startMeterReading === '' || endMeterReading === '') {
      setError('Start and End Meter Readings are required.');
      return;
    }
    if (Number(startMeterReading) >= Number(endMeterReading)) {
      setError('End Meter Reading must be greater than Start Meter Reading.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Submit meter data
      await submitFuelData(order.id, {
        start_meter_reading: Number(startMeterReading),
        end_meter_reading: Number(endMeterReading),
        lst_notes: lstNotes,
      });

      // Step 2: Update status to COMPLETED
      // Backend should fill assigned_truck_id if not already set or based on LST user
      // For now, we pass what's already on the order or a default if necessary.
      const statusUpdatePayload: UpdateFuelOrderStatusPayload = {
        status: FuelOrderStatus.COMPLETED,
        assigned_truck_id: order.assigned_truck_id, // Or handle if null
      };
      const updatedOrder = await updateOrderStatus(order.id, statusUpdatePayload);
      
      onFuelDataSubmitted(updatedOrder);
      onClose();
    } catch (err: any) {
      let errorMessage = 'Failed to submit fuel data or complete order. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complete Fuel Order: ${order.tail_number}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="startMeterReading"
          label="Start Meter Reading"
          type="number"
          value={startMeterReading}
          onChange={(e) => setStartMeterReading(e.target.value === '' ? '' : parseFloat(e.target.value))}
          required
          min="0"
          step="0.01"
          autoFocus
        />
        <Input
          id="endMeterReading"
          label="End Meter Reading"
          type="number"
          value={endMeterReading}
          onChange={(e) => setEndMeterReading(e.target.value === '' ? '' : parseFloat(e.target.value))}
          required
          min="0"
          step="0.01"
        />
        <Textarea
          id="lstNotes"
          label="LST Notes (Optional)"
          value={lstNotes}
          onChange={(e) => setLstNotes(e.target.value)}
          rows={3}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-3 pt-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit & Complete Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitFuelDataModal; 