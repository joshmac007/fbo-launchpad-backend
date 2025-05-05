import { useState, useEffect } from 'react';
import apiService, { getApiUrl } from '../services/apiService';
import { FuelOrder } from '../types/orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<FuelOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiService.get(getApiUrl('/fuel-orders/'));
        setOrders(response.data.fuel_orders || response.data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
        setOrders(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
}; 