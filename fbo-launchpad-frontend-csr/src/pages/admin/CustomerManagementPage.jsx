import React, { useEffect, useState } from 'react';
import CustomerService from '../../services/CustomerService';
import CustomerForm from '../../components/admin/CustomerForm';
import Modal from '../../components/common/Modal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import CustomerTable from '../../components/admin/CustomerTable';

export default function CustomerManagementPage() {
  const [customerList, setCustomerList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await CustomerService.getCustomers();
      setCustomerList(res.customers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowFormModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowFormModal(true);
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingCustomer) {
        await CustomerService.updateCustomer(editingCustomer.id, formData);
      } else {
        await CustomerService.createCustomer(formData);
      }
      setShowFormModal(false);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setError('');
    try {
      await CustomerService.deleteCustomer(deleteTarget);
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to delete customer');
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Customer Management</h1>
        <button className="btn btn-primary shadow-md" onClick={handleCreate}>Add Customer</button>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4">
        <CustomerTable
          customerList={customerList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <CustomerForm
          initialData={editingCustomer}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </Modal>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
      >
        <p>Are you sure you want to delete this customer?</p>
        <div className="flex gap-2 mt-4">
          <button className="btn btn-danger" onClick={confirmDelete} disabled={isSubmitting}>Delete</button>
          <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
        </div>
      </Modal>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}

