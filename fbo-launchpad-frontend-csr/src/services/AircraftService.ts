import { API_BASE_URL } from '../config'; // Corrected path
import { getAuthToken } from '../utils/auth'; // Assuming a utility to get auth token

// Define this based on actual API response and requirements
export interface Aircraft {
  id: string; 
  tail_number: string;
  model?: string;
  type?: string;
  status?: string;
  customer_id?: string | number; // Added: Can be string or number from backend, form handles as string
  fuel_type?: string;          // Added: Preferred fuel type for the aircraft
  // Add other relevant fields from your backend model
  created_at?: string;
  updated_at?: string;
}

export type AircraftCreateDto = Omit<Aircraft, 'id' | 'created_at' | 'updated_at'>;
export type AircraftUpdateDto = Partial<Omit<Aircraft, 'id' | 'created_at' | 'updated_at'> >;

const AIRCRAFT_ENDPOINT = `${API_BASE_URL}/aircraft`;

// Helper function for API requests
async function fetchApi(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // Ignore if response is not JSON
    }
    const errorMessage = errorData?.message || errorData?.error || `HTTP error ${response.status}`;
    throw new Error(errorMessage);
  }
  if (response.status === 204) { // No Content
    return null;
  }
  return response.json();
}

const AircraftService = {
  async getAircraft(): Promise<{ aircraft: Aircraft[] }> {
    // In a real app, the backend might return an object like { data: Aircraft[] } or just Aircraft[]
    // Adjust accordingly. For now, assuming it matches the mock structure.
    const data = await fetchApi(AIRCRAFT_ENDPOINT);
    return { aircraft: data || [] }; // Adjust based on actual API response structure
  },

  async getAircraftById(id: string): Promise<Aircraft> {
    return fetchApi(`${AIRCRAFT_ENDPOINT}/${id}`);
  },

  async createAircraft(aircraftData: AircraftCreateDto): Promise<Aircraft> {
    return fetchApi(AIRCRAFT_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(aircraftData),
    });
  },

  async updateAircraft(id: string, aircraftData: AircraftUpdateDto): Promise<Aircraft> {
    return fetchApi(`${AIRCRAFT_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(aircraftData),
    });
  },

  async deleteAircraft(id: string): Promise<void> {
    await fetchApi(`${AIRCRAFT_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  },
};

export default AircraftService; 