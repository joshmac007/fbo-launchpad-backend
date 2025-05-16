import React, { useEffect, useState } from 'react';
import FuelTruckService from '../../services/FuelTruckService';
import TruckForm from '../../components/admin/TruckForm';
import Modal from '../../components/common/Modal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { PlusCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import { Edit3, Trash2 } from 'lucide-react';

export default function TruckManagementPage() {
  const [trucks, setTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, hasPermission } = useAuth();

  const fetchTrucks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await FuelTruckService.getFuelTrucks();
      setTrucks(data);
    } catch (e) {
      setError('Failed to load trucks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this truck?')) return;
    try {
      await FuelTruckService.deleteFuelTruck(id);
      fetchTrucks();
    } catch (e) {
      alert('Delete failed.');
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTruck && editingTruck.id) {
        await FuelTruckService.updateFuelTruck(editingTruck.id, formData);
      } else {
        await FuelTruckService.createFuelTruck(formData);
      }
      setShowFormModal(false);
      setEditingTruck(null);
      fetchTrucks();
    } catch (e) {
      alert('Save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    setEditingTruck({});
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingTruck(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-lg py-lg bg-neutral-background min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg">
        <h1 className="text-h1 font-bold text-neutral-text-primary">Fuel Truck Management</h1>
        {isAuthenticated && hasPermission('MANAGE_TRUCKS') && (
          <Button 
            variant="primary" 
            onClick={handleCreate}
            className="mt-sm sm:mt-0"
          >
            <PlusCircle size={18} className="mr-xs" />
            Create New Truck
          </Button>
        )}
      </div>
      <Card padding="lg">
        {isLoading ? (
          <div className="py-lg text-center text-primary animate-pulse">Loading trucks...</div>
        ) : error ? (
          <div className="text-status-error py-lg text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-neutral-border">
                <tr>
                  <th className="px-md py-sm font-semibold text-left text-neutral-text-secondary">Name</th>
                  <th className="px-md py-sm font-semibold text-left text-neutral-text-secondary">Active</th>
                  <th className="px-md py-sm font-semibold text-center text-neutral-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck, i) => (
                  <tr key={truck.id} className="border-b border-neutral-border last:border-b-0">
                    <td className="px-md py-sm whitespace-nowrap text-neutral-text-primary">{truck.truck_number}</td>
                    <td className="px-md py-sm whitespace-nowrap">
                      <span className={`inline-block px-sm py-xs rounded-full text-tiny font-medium 
                                        ${truck.is_active 
                                          ? 'bg-status-success-surface text-status-success-text' 
                                          : 'bg-neutral-surface-hover text-neutral-text-secondary'}`}>
                        {truck.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-md py-sm whitespace-nowrap text-center space-x-xs">
                      {isAuthenticated && hasPermission('MANAGE_TRUCKS') && (
                         <button
                          className="p-xs rounded text-primary hover:bg-primary-light transition-colors"
                          title="Edit"
                          onClick={() => handleEdit(truck)}
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      {isAuthenticated && hasPermission('MANAGE_TRUCKS') && (
                        <button
                          className="p-xs rounded text-status-error hover:bg-status-error-surface transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(truck.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        title={editingTruck && editingTruck.id ? 'Edit Truck' : 'Create Truck'}
      >
        <TruckForm
          initialData={editingTruck}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}

