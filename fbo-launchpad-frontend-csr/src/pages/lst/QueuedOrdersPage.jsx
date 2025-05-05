import React, { useEffect, useState } from 'react';
import apiService from '../../services/apiService';

export default function QueuedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.get('/api/orders/unassigned');
        setOrders(res.data.orders || []);
      } catch (err) {
        setError('Failed to fetch queued orders.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  async function handleAccept(orderId) {
    setAccepting(orderId);
    setError('');
    setSuccess('');
    try {
      await apiService.post(`/api/orders/${orderId}/accept`);
      setOrders(orders.filter(o => o.id !== orderId));
      setSuccess('Order accepted!');
    } catch (err) {
      setError('Failed to accept order.');
    } finally {
      setAccepting(null);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Queued Fuel Orders</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {orders.length === 0 && !loading && (
        <div className="text-gray-500">No queued orders at this time.</div>
      )}
      <ul className="space-y-4">
        {orders.map(order => (
          <li key={order.id} className="bg-white dark:bg-gray-800 rounded shadow p-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">Tail #: {order.tail_number}</div>
                <div className="text-sm text-gray-500">Requested: {order.requested_amount} gal</div>
                <div className="text-sm text-gray-500">Location: {order.location_on_ramp}</div>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={() => handleAccept(order.id)}
                disabled={accepting === order.id}
              >
                {accepting === order.id ? 'Accepting...' : 'Accept'}
              </button>
            </div>
            <div className="text-xs text-gray-400">Created: {order.created_at}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
