import React, { useEffect, useState } from 'react';
import AircraftService from '../../services/AircraftService';
import AircraftForm from '../../components/admin/AircraftForm';
import Modal from '../../components/common/Modal';
import AircraftTable from '../../components/admin/AircraftTable';
import { useAuth } from '../../contexts/AuthContext';

export default function AircraftManagementPage() {
  const [aircraftList, setAircraftList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { isAuthenticated, hasPermission } = useAuth();

  // Fetch aircraft list
  useEffect(() => {
    fetchAircraft();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchAircraft = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await AircraftService.getAircraft();
      setAircraftList(res.aircraft || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch aircraft');
      console.error('Error fetching aircraft:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAircraft(null);
    setError('');
    setShowFormModal(true);
  };

  const handleEdit = (aircraft) => {
    setEditingAircraft(aircraft);
    setError('');
    setShowFormModal(true);
  };

  const handleDelete = (tail_number) => {
    setDeleteTarget(tail_number);
    setError('');
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingAircraft) {
        await AircraftService.updateAircraft(editingAircraft.tail_number, formData);
        setSuccessMessage('Aircraft updated successfully');
      } else {
        await AircraftService.createAircraft(formData);
        setSuccessMessage('Aircraft created successfully');
      }
      setShowFormModal(false);
      await fetchAircraft();
    } catch (err) {
      setError(err.message || 'Failed to save aircraft');
      console.error('Error saving aircraft:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setError('');
    try {
      await AircraftService.deleteAircraft(deleteTarget);
      setShowDeleteModal(false);
      setSuccessMessage('Aircraft deleted successfully');
      await fetchAircraft();
    } catch (err) {
      setError(err.message || 'Failed to delete aircraft');
      console.error('Error deleting aircraft:', err);
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingAircraft(null);
    setError('');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setError('');
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Aircraft Management</h1>
        {isAuthenticated && hasPermission('MANAGE_AIRCRAFT') && (
          <button className="btn btn-primary shadow-md" onClick={handleCreate}>Add Aircraft</button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4">
        <AircraftTable
          aircraftList={aircraftList}
          onEdit={isAuthenticated && hasPermission('EDIT_AIRCRAFT') ? handleEdit : undefined}
          onDelete={isAuthenticated && hasPermission('DELETE_AIRCRAFT') ? handleDelete : undefined}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        title={editingAircraft ? 'Edit Aircraft' : 'Add Aircraft'}
      >
        <AircraftForm
          initialData={editingAircraft}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Delete Aircraft"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete aircraft with tail number "{deleteTarget}"?</p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <button 
              className="btn btn-secondary" 
              onClick={handleCloseDeleteModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              className="btn btn-danger" 
              onClick={confirmDelete} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {error && <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded shadow-lg">
        {error}
      </div>}
    </div>
  );
}

