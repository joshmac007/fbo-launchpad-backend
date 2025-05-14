import React, { useEffect, useState, useCallback } from 'react';
import CustomerService, { Customer, CustomerCreateDto, CustomerUpdateDto, CustomerListResponse } from '../../services/CustomerService';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Table, { ColumnDef } from '../../components/common/Table';
import { Edit3, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Placeholder for CustomerForm props - this will be refined when CustomerForm.tsx is created
interface CustomerFormPropsPlaceholder {
  initialData?: Partial<Customer> | null;
  onSubmit: (data: CustomerCreateDto | CustomerUpdateDto) => void | Promise<void>;
  isSubmitting: boolean;
  apiError?: string | null;
  onCancel: () => void;
}
const CustomerFormPlaceholder: React.FC<CustomerFormPropsPlaceholder> = (props) => 
  <div>CustomerForm Placeholder (Props: {JSON.stringify(Object.keys(props))})</div>;


const CustomerManagementPage: React.FC = () => {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null); // For general page errors or table loading errors
  const [formApiError, setFormApiError] = useState<string | null>(null); // Specifically for form submission errors
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form/action submissions
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  
  const { isAuthenticated, hasPermission } = useAuth();

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res: CustomerListResponse = await CustomerService.getCustomers();
      setCustomerList(res.customers || []);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch customers';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormApiError(null);
    setShowFormModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormApiError(null);
    setShowFormModal(true);
  };

  const handleDeleteRequest = (customer: Customer) => {
    setDeleteTarget(customer);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData: CustomerCreateDto | CustomerUpdateDto) => {
    setIsSubmitting(true);
    setFormApiError(null);
    try {
      if (editingCustomer && editingCustomer.id) {
        await CustomerService.updateCustomer(editingCustomer.id, formData as CustomerUpdateDto);
        toast.success('Customer updated successfully');
      } else {
        await CustomerService.createCustomer(formData as CustomerCreateDto);
        toast.success('Customer created successfully');
      }
      setShowFormModal(false);
      setEditingCustomer(null);
      await fetchCustomers(); // Refresh list
    } catch (err: any) {
      const msg = err.message || 'Failed to save customer';
      setFormApiError(msg);
      toast.error(msg);
      // Keep modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      await CustomerService.deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await fetchCustomers(); // Refresh list
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer');
      // Keep modal open or provide feedback
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingCustomer(null);
    setFormApiError(null);
  };

  const columns = React.useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: 'id', header: 'ID', cell: info => info.getValue() },
    { accessorKey: 'name', header: 'Name', cell: info => info.getValue() },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: info => {
        const createdAt = info.getValue() as string | undefined;
        return createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-xs">
            {isAuthenticated && hasPermission('EDIT_CUSTOMER') && (
              <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)} aria-label="Edit">
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {isAuthenticated && hasPermission('DELETE_CUSTOMER') && (
              <Button variant="destructive" size="icon" onClick={() => handleDeleteRequest(customer)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [isAuthenticated, hasPermission, fetchCustomers]); // Added fetchCustomers as it's used in edit/delete flows that might refresh.

  return (
    <div className="p-md lg:p-lg">
      <PageHeader 
        title="Customer Management"
        actions={
          isAuthenticated && hasPermission('MANAGE_CUSTOMERS') ? (
            <Button variant="primary" onClick={handleCreate} icon={<PlusCircle />}>
              Add Customer
            </Button>
          ) : undefined
        }
      />

      <div className="mt-lg">
        <Table<Customer>
          columns={columns}
          data={customerList}
          isLoading={isLoading}
          isError={!!apiError && !isLoading}
          error={apiError ? <p>{apiError}</p> : <p>Error loading customers.</p>}
          emptyStateMessage="No customers found. Add a new customer to get started."
        />
      </div>

      {showFormModal && (
        <Modal
          isOpen={showFormModal}
          onClose={handleCloseFormModal}
          title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
          size="lg" // Customer forms can be larger
        >
          <CustomerFormPlaceholder
            initialData={editingCustomer}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            apiError={formApiError}
            onCancel={handleCloseFormModal}
          />
        </Modal>
      )}

      {showDeleteModal && deleteTarget && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
          title="Confirm Delete Customer"
          size="sm"
        >
          <div className="space-y-md">
            <p>Are you sure you want to delete customer "<strong>{deleteTarget.name}</strong>"?</p>
            <p className="text-sm-regular text-neutral-text-secondary dark:text-neutral-text-secondary-dark">This action cannot be undone.</p>
            <div className="flex justify-end gap-sm pt-md">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete Customer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomerManagementPage; 