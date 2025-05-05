import React, { useEffect, useState } from 'react';
import apiService from '../../services/apiService';

export default function AssignmentSettingsPage() {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchSetting() {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.get('/api/admin/assignment-settings');
        setAutoAssignEnabled(res.data.auto_assign_enabled);
      } catch (err) {
        setError('Failed to fetch assignment setting.');
      } finally {
        setLoading(false);
      }
    }
    fetchSetting();
  }, []);

  async function handleToggle(e) {
    const value = e.target.checked;
    setAutoAssignEnabled(value);
    setError('');
    setSuccess('');
    try {
      await apiService.post('/api/admin/assignment-settings', { auto_assign_enabled: value });
      setSuccess('Setting updated successfully.');
    } catch (err) {
      setError('Failed to update setting.');
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Assignment Settings</h1>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="autoAssignEnabled"
          checked={autoAssignEnabled}
          onChange={handleToggle}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <label htmlFor="autoAssignEnabled" className="text-lg font-medium">
          Enable Auto-Assign for LST/Truck
        </label>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="text-gray-500 text-sm">
        When enabled, new fuel orders will be assigned automatically to LSTs and trucks. When disabled, orders will appear in a queue for LSTs to claim in their app.
      </div>
    </div>
  );
}
