import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, exportOrdersCSV as exportOrdersCSVService, updateOrderStatus } from '../../services/FuelOrderService'; // Added updateOrderStatus to named imports
import { FuelOrder, PaginatedFuelOrdersResponse, FuelOrderStatus } from '../../types/fuelOrder'; // Import types directly
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { PlusCircle, Download } from 'lucide-react';
import FuelOrderTable from '../../components/orders/FuelOrderTable';
import FuelOrderFilters, { FuelOrderFiltersState } from '../../components/orders/FuelOrderFilters'; // Import Filters component and its state type
import CreateOrderModal from '../../components/orders/CreateOrderModal';
import OrderDetailModal from '../../components/orders/OrderDetailModal';
import PaginationControls, { PaginationData as PaginationUIData } from '../../components/common/PaginationControls'; // Import PaginationControls
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import * as UserService from '../../services/UserService';
import * as FuelTruckService from '../../services/FuelTruckService';
import { User } from '../../types/users'; // Corrected path to users.ts
import { FuelTruck } from '../../types/fuelTruck';
import { useAuth } from '../../contexts/AuthContext'; // Added useAuth

const FuelOrdersPage: React.FC = () => {
  const [ordersResponse, setOrdersResponse] = useState<PaginatedFuelOrdersResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<FuelOrderFiltersState>({}); // Use the imported state type
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedOrderIdForDetail, setSelectedOrderIdForDetail] = useState<number | null>(null); // New state for Order ID
  const [orderToEditId, setOrderToEditId] = useState<number | null>(null); // State for ID of order to edit

  const [lstUsers, setLstUsers] = useState<User[]>([]);
  const [fuelTrucks, setFuelTrucks] = useState<FuelTruck[]>([]);
  const [isLoadingAuxData, setIsLoadingAuxData] = useState<boolean>(true);

  const { user, isAuthenticated, hasPermission, loadingAuth } = useAuth(); // Destructure user for logging

  const fetchOrders = useCallback(async (page: number, currentFilters: FuelOrderFiltersState) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOrders(currentFilters, page, 10); // 10 items per page
      setOrdersResponse(response);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch fuel orders.');
      setOrdersResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage, filters);
  }, [fetchOrders, currentPage, filters]);

  // Effect for fetching auxiliary data (LSTs, Trucks) on mount
  useEffect(() => {
    const fetchAuxiliaryData = async () => {
      setIsLoadingAuxData(true);
      try {
        const [lstUsersResponse, trucksResponse] = await Promise.all([
          UserService.getUsers({ role_ids: ['3'] }),
          FuelTruckService.getFuelTrucks()
        ]);
        setLstUsers(lstUsersResponse.users);
        setFuelTrucks(trucksResponse);
      } catch (err: any) {
        console.error("Failed to load LST/Truck data for table:", err);
        toast.error("Failed to load some auxiliary data for display. IDs will be shown.");
        // Keep empty arrays if fetch fails, so table doesn't break
        setLstUsers([]);
        setFuelTrucks([]);
      } finally {
        setIsLoadingAuxData(false);
      }
    };
    fetchAuxiliaryData();
  }, []); // Empty dependency array to run once on mount

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilters: FuelOrderFiltersState) => {
    setCurrentPage(1); // Reset to first page on filter change
    setFilters(newFilters);
  };

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderIdForDetail(orderId); // Set the ID to trigger modal
  };

  const handleEditOrder = (orderId: number) => {
    setOrderToEditId(orderId);
    setIsCreateModalOpen(true); 
  };

  const handleCancelOrder = async (orderId: number) => {
    const orderToCancel = ordersResponse?.orders.find(o => o.id === orderId);
    if (!orderToCancel) {
      toast.error("Could not find order details to cancel.");
      console.error(`Order with ID ${orderId} not found in current list for cancellation.`);
      return;
    }
    const truckIdForPayload = orderToCancel.assigned_truck_id; 

    if (window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) {
      setIsLoading(true); 
      try {
        await updateOrderStatus(orderId, {
          status: FuelOrderStatus.CANCELLED,
          assigned_truck_id: truckIdForPayload === null ? 0 : truckIdForPayload
        });
        toast.success(`Order #${orderId} cancelled successfully.`);
        fetchOrders(currentPage, filters); 
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || 'Failed to cancel order.');
        console.error(`Error cancelling order ${orderId}:`, err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleOrderModalClose = () => {
    setIsCreateModalOpen(false);
    setOrderToEditId(null); // Also reset editing ID when modal closes
  }

  const handleOrderCreated = () => {
    handleOrderModalClose(); // This already resets orderToEditId
    setSuccessMessage('Order created successfully!');
    fetchOrders(currentPage, filters); // Refresh orders
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  const handleOrderUpdated = () => {
    handleOrderModalClose(); // This closes modal and resets orderToEditId
    setSuccessMessage('Order updated successfully!');
    fetchOrders(currentPage, filters); // Refresh orders
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const blob = await exportOrdersCSVService(filters);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      saveAs(blob, `fuel_orders_export_${timestamp}.csv`);
      toast.success('Orders exported successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to export orders.');
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const paginationForUI: PaginationUIData | null = ordersResponse?.pagination ? {
    page: ordersResponse.pagination.page,
    total_pages: ordersResponse.pagination.pages,
    has_prev: ordersResponse.pagination.has_prev,
    has_next: ordersResponse.pagination.has_next,
    total_items: ordersResponse.pagination.total,
  } : null;

  if (loadingAuth) {
    return <div className="p-xl text-center">Loading authentication...</div>;
  }

  // Diagnostic logging for button permissions
  const canCreateOrders = isAuthenticated && hasPermission('CREATE_ORDERS');
  const canExportOrders = isAuthenticated && hasPermission('EXPORT_ORDERS_CSV');

  console.log(`[FuelOrdersPage] User: ${user?.email}, isAuthenticated: ${isAuthenticated}`);
  console.log(`[FuelOrdersPage] Permission check for CREATE_ORDERS: ${hasPermission('CREATE_ORDERS')}, Resulting button visibility: ${canCreateOrders}`);
  console.log(`[FuelOrdersPage] Permission check for EXPORT_ORDERS_CSV: ${hasPermission('EXPORT_ORDERS_CSV')}, Resulting button visibility: ${canExportOrders}`);

  return (
    <div className="container mx-auto p-lg">
      <PageHeader 
        title="Fuel Orders"
        actions={(
          <div className="flex items-center space-x-md">
            {canExportOrders && (
              <Button 
                variant="outline"
                onClick={handleExportCSV} 
                isLoading={isLoading}
                data-testid="export-csv-button"
              >
                <Download className="mr-sm h-sm w-sm" />
                Export CSV
              </Button>
            )}
            {canCreateOrders && (
              <Button 
                variant="primary" 
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
                isLoading={isLoading}
                data-testid="create-order-button"
              >
                <PlusCircle className="mr-sm h-sm w-sm" />
                Create New Order
              </Button>
            )}
          </div>
        )}
      />

      {successMessage && (
        <div className="my-md p-md rounded-md bg-status-success-surface border border-status-success-border text-status-success-text text-center">
          {successMessage}
        </div>
      )}

      <FuelOrderFilters 
        initialFilters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <div className="mt-lg" data-testid="fuel-orders-table">
        <FuelOrderTable 
          orders={ordersResponse?.orders || []} 
          isLoading={isLoading || isLoadingAuxData}
          onViewDetails={handleViewDetails}
          onEditOrder={handleEditOrder}
          onCancelOrder={handleCancelOrder}
          lstUsers={lstUsers}
          fuelTrucks={fuelTrucks}
        />
      </div>

      {paginationForUI && (
        <div className="mt-lg">
          <PaginationControls 
            paginationData={paginationForUI} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}

      {isCreateModalOpen && (
        <CreateOrderModal 
          isOpen={isCreateModalOpen} 
          onClose={handleOrderModalClose}
          onOrderCreated={handleOrderCreated}
          editingOrderId={orderToEditId} // Pass the ID of the order to edit
          onOrderUpdated={handleOrderUpdated} // Pass the update callback
        />
      )}
      {selectedOrderIdForDetail !== null && (
        <OrderDetailModal 
          orderId={selectedOrderIdForDetail}
          isOpen={selectedOrderIdForDetail !== null} 
          onClose={() => setSelectedOrderIdForDetail(null)} 
          onOrderUpdated={() => fetchOrders(currentPage, filters)}
        />
      )}

      {error && (
        <div className="mt-md p-md rounded-md bg-status-error-surface border border-status-error-border text-status-error-text">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default FuelOrdersPage; 