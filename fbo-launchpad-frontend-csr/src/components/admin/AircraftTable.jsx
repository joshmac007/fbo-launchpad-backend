import React from 'react';

const AircraftTable = ({ aircraftList = [], onEdit, onDelete, isLoading }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Tail Number</th>
            <th className="px-4 py-2 border-b">Customer ID</th>
            <th className="px-4 py-2 border-b">Aircraft Type</th>
            <th className="px-4 py-2 border-b">Fuel Type</th>
            <th className="px-4 py-2 border-b">Created At</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
          ) : (
            aircraftList.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4">No aircraft found.</td></tr>
            ) : (
              aircraftList.map(aircraft => (
                <tr key={aircraft.tail_number}>
                  <td className="px-4 py-2 border-b">{aircraft.tail_number}</td>
                  <td className="px-4 py-2 border-b">{aircraft.customer_id || '-'}</td>
                  <td className="px-4 py-2 border-b">{aircraft.aircraft_type}</td>
                  <td className="px-4 py-2 border-b">{aircraft.fuel_type}</td>
                  <td className="px-4 py-2 border-b">{aircraft.created_at ? new Date(aircraft.created_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 border-b space-x-2">
                    <button 
                      className="btn btn-xs btn-outline" 
                      onClick={() => onEdit(aircraft)}
                      title="Edit aircraft"
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-xs btn-danger" 
                      onClick={() => onDelete(aircraft.tail_number)}
                      title="Delete aircraft"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AircraftTable;
