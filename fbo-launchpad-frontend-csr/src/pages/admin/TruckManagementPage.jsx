import React, { useEffect, useState } from 'react';
import FuelTruckService from '../../services/FuelTruckService';
import TruckForm from '../../components/admin/TruckForm';
import Modal from '../../components/common/Modal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

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
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Fuel Truck Management</h1>
        {isAuthenticated && hasPermission('MANAGE_TRUCKS') && (
          <button className="btn btn-primary shadow-md" onClick={handleCreate}>Create New Truck</button>
        )}
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4">
        {isLoading ? (
          <div className="py-8 text-center text-blue-600 animate-pulse">Loading trucks...</div>
        ) : error ? (
          <div className="text-red-600 py-8 text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm rounded-xl overflow-hidden">
              <thead className="sticky top-0 z-10 bg-blue-50/80">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left">ID</th>
                  <th className="px-4 py-2 font-semibold text-left">Name</th>
                  <th className="px-4 py-2 font-semibold text-left">Active</th>
                  <th className="px-4 py-2 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck, i) => (
                  <tr key={truck.id} className={i % 2 === 0 ? 'even:bg-gray-50' : ''}>
                    <td className="px-4 py-2 whitespace-nowrap">{truck.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{truck.truck_number}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${truck.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{truck.is_active ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center space-x-1">
                      {isAuthenticated && hasPermission('EDIT_TRUCK') && (
                        <button
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-blue-100 text-blue-700 transition"
                          title="Edit"
                          onClick={() => handleEdit(truck)}
                        >
                          <FaEdit />
                        </button>
                      )}
                      {isAuthenticated && hasPermission('DELETE_TRUCK') && (
                        <button
                          className="inline-flex items-center justify-center p-2 rounded hover:bg-red-100 text-red-700 transition"
                          title="Delete"
                          onClick={() => handleDelete(truck.id)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

