import React, { useEffect, useState, useCallback } from 'react';
import { Edit3, Trash2, PlusCircle } from 'lucide-react';
import AircraftService, { Aircraft, AircraftCreateDto, AircraftUpdateDto } from '../../services/AircraftService'; // Use actual service
import AircraftForm from '../../components/admin/AircraftForm'; // Use actual form
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Table, { ColumnDef } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

// Aircraft interface is now imported from AircraftService

export default function AircraftManagementPage() {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Aircraft | null>(null);
  const [apiError, setApiError] = useState<string | null>(null); // For errors from API to pass to form
  
  const { isAuthenticated, hasPermission } = useAuth();

  const fetchAircraft = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await AircraftService.getAircraft();
      setAircraftList(res.aircraft || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch aircraft');
      console.error('Error fetching aircraft:', err);
      setApiError(err.message || 'Failed to fetch aircraft');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAircraft();
  }, [fetchAircraft]);

  const handleCreate = () => {
    setEditingAircraft(null);
    setApiError(null);
    setShowFormModal(true);
  };

  const handleEdit = (aircraft: Aircraft) => {
    setEditingAircraft(aircraft);
    setApiError(null);
    setShowFormModal(true);
  };

  const handleDelete = (aircraft: Aircraft) => {
    setDeleteTarget(aircraft);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData: AircraftCreateDto | AircraftUpdateDto) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      if (editingAircraft && editingAircraft.id) {
        await AircraftService.updateAircraft(editingAircraft.id, formData as AircraftUpdateDto);
        toast.success('Aircraft updated successfully');
      } else {
        await AircraftService.createAircraft(formData as AircraftCreateDto);
        toast.success('Aircraft created successfully');
      }
      setShowFormModal(false);
      setEditingAircraft(null);
      await fetchAircraft();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save aircraft';
      toast.error(errorMsg);
      console.error('Error saving aircraft:', err);
      setApiError(errorMsg); // Set API error to display in the form
      // Keep modal open if API error occurs
      // setShowFormModal(false); // Do not close modal on error
    } finally {
      setIsSubmitting(false);
      // Do not clear editingAircraft on error, so form can be re-submitted
      // if (!apiError) setEditingAircraft(null); 
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      await AircraftService.deleteAircraft(deleteTarget.id);
      setShowDeleteModal(false);
      toast.success('Aircraft deleted successfully');
      await fetchAircraft();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete aircraft');
      console.error('Error deleting aircraft:', err);
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingAircraft(null);
    setApiError(null); // Clear API error when modal is manually closed
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const columns = React.useMemo<ColumnDef<Aircraft>[]>(() => [
    {
      accessorKey: 'tail_number',
      header: 'Tail Number',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'model',
      header: 'Model',
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'type',
      header: 'Aircraft Type',
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'fuel_type',
      header: 'Preferred Fuel',
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'customer_id',
      header: 'Customer ID',
      cell: info => info.getValue()?.toString() || 'N/A', // Ensure string conversion for display
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'created_at',
      header: 'Date Added',
      cell: info => {
        const createdAt = info.getValue() as string | undefined;
        return createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const aircraft = row.original;
        return (
          <div className="flex space-x-xs">
            {isAuthenticated && hasPermission('EDIT_AIRCRAFT') && (
              <Button variant="ghost" size="sm" onClick={() => handleEdit(aircraft)} aria-label="Edit">
                <Edit3 className="h-xs w-xs" />
              </Button>
            )}
            {isAuthenticated && hasPermission('DELETE_AIRCRAFT') && (
              <Button variant="destructive" size="sm" onClick={() => handleDelete(aircraft)} aria-label="Delete">
                <Trash2 className="h-xs w-xs" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [isAuthenticated, hasPermission, fetchAircraft]); // Added fetchAircraft to dependencies of columns if handleEdit/Delete are not memoized

  return (
    <div className="p-md lg:p-lg">
      <PageHeader 
        title="Aircraft Management"
        actions={
          isAuthenticated && hasPermission('MANAGE_AIRCRAFT') ? (
            <Button variant="primary" onClick={handleCreate} icon={<PlusCircle />}>
              Add Aircraft
            </Button>
          ) : undefined
        }
      />

      <div className="mt-lg">
        <Table<Aircraft> // Specify type for Table
          columns={columns}
          data={aircraftList}
          isLoading={isLoading}
          // Pass API error to table for display if needed, or handle globally
          isError={!!apiError && !isLoading} 
          error={apiError ? <p>{apiError}</p> : <p>Error loading aircraft data.</p>}
          emptyStateMessage="No aircraft found. Add new aircraft to get started."
        />
      </div>

      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={handleCloseFormModal}
          title={editingAircraft ? 'Edit Aircraft' : 'Add Aircraft'}
          size="md" // Or a different size like "lg" if the form is wide
        >
          <AircraftForm
            initialData={editingAircraft || undefined} // Pass undefined instead of null if form expects that
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            apiError={apiError} // Pass API error to the form
            onCancel={handleCloseFormModal} 
          />
        </Modal>
      )}

      {showDeleteModal && deleteTarget && (
        <Modal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-md">
            <p>Are you sure you want to delete aircraft with tail number "{deleteTarget.tail_number}"?</p>
            <p className="text-sm-regular text-neutral-text-secondary">This action cannot be undone.</p>
            <div className="flex justify-end gap-sm pt-md">
              <Button 
                variant="outline" // Changed from secondary for consistency
                onClick={handleCloseDeleteModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete} 
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Delete Aircraft
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 