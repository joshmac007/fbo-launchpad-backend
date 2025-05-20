import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import apiService from '../services/apiService';
import { FuelOrder } from '../types/fuelOrder';

interface OrderContextType {
  orders: FuelOrder[] | null;
  loading: boolean;
  error: Error | null;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<FuelOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    // Check authentication status directly from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Don't attempt to fetch orders if no token exists
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.get<{ orders: FuelOrder[]; [key: string]: any }>('/fuel-orders');
      
      let actualOrders: FuelOrder[] = [];

      if (response.data && Array.isArray(response.data.orders)) {
        actualOrders = response.data.orders;
      } else {
        console.warn('Unexpected data structure for fuel orders. Expected response.data.orders. Response data:', response.data);
        actualOrders = []; 
      }

      setOrders(actualOrders);
      setError(null);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Handle unauthorized error silently
        setLoading(false);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      }
      setOrders(null); // Clear orders on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    // Listen for storage events to detect token changes
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        fetchOrders();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchOrders]);

  return (
    <OrderContext.Provider value={{ orders, loading, error, refreshOrders: fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrdersContext = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrdersContext must be used within an OrderProvider');
  }
  return context;
}; 