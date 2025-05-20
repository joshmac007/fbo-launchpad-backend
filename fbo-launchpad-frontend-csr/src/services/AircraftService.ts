import apiService from './apiService'; // Import shared apiService

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

const AIRCRAFT_ENDPOINT = '/aircraft'; // No API_BASE_URL prefix needed

const AircraftService = {
  async getAircraft(): Promise<{ aircraft: Aircraft[] }> {
    // Assuming apiService.get returns { data: { aircraft: Aircraft[] } } or similar
    // Adjust based on actual apiService and backend response structure
    const response = await apiService.get<{ aircraft: Aircraft[] }>(AIRCRAFT_ENDPOINT);
    return response.data; // apiService.get directly returns response.data with axios
  },

  async getAircraftById(id: string): Promise<Aircraft> {
    const response = await apiService.get<Aircraft>(`${AIRCRAFT_ENDPOINT}/${id}`);
    return response.data;
  },

  async createAircraft(aircraftData: AircraftCreateDto): Promise<Aircraft> {
    const response = await apiService.post<Aircraft>(AIRCRAFT_ENDPOINT, aircraftData);
    return response.data;
  },

  async updateAircraft(id: string, aircraftData: AircraftUpdateDto): Promise<Aircraft> {
    // Assuming PUT is the correct method, consistent with previous .ts file
    const response = await apiService.put<Aircraft>(`${AIRCRAFT_ENDPOINT}/${id}`, aircraftData);
    return response.data;
  },

  async deleteAircraft(id: string): Promise<void> {
    // apiService.delete might not return data, or might return a confirmation
    // Adjust based on apiService behavior and backend response
    await apiService.delete(`${AIRCRAFT_ENDPOINT}/${id}`);
    // No explicit return needed if the promise resolves successfully for void functions
  },
};

export default AircraftService; 