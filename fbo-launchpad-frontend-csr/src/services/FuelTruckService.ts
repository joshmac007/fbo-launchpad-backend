import apiService from './apiService';
import { 
  FuelTruck, 
  FuelTruckCreateDto, 
  FuelTruckUpdateDto, 
  FuelTruckListResponse 
} from '../types/fuelTruck'; // Import newly created types

const FUEL_TRUCKS_ENDPOINT = '/fuel-trucks';

// Define a type for params if specific filters are known, otherwise Record<string, any>
// export type GetFuelTrucksParams = {
//   status?: FuelTruckStatus;
//   fuel_type_supported?: string;
//   // ... other filterable fields
// };

export const getFuelTrucks = async (params: Record<string, any> = {}): Promise<FuelTruck[]> => {
  try {
    // Assuming the backend returns { fuel_trucks: FuelTruck[] } or just FuelTruck[] directly
    // The old .js file expected response.data.fuel_trucks
    const response = await apiService.get<FuelTruckListResponse | FuelTruck[]>(FUEL_TRUCKS_ENDPOINT, { params });
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && 'fuel_trucks' in response.data) {
      return (response.data as FuelTruckListResponse).fuel_trucks || [];
    }
    return []; // Fallback for unexpected structure
  } catch (error: any) {
    console.error("Error fetching fuel trucks:", error.response?.data || error.message);
    // Consider a more specific error type or rethrow structure
    throw error.response?.data || { message: 'Failed to fetch fuel trucks' };
  }
};

export const createFuelTruck = async (data: FuelTruckCreateDto): Promise<{message: string, fuel_truck: FuelTruck}> => {
  try {
    // Assuming backend returns { message: string, fuel_truck: FuelTruck }
    const response = await apiService.post<{message: string, fuel_truck: FuelTruck}>(FUEL_TRUCKS_ENDPOINT, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create fuel truck' };
  }
};

export const getFuelTruckById = async (id: number): Promise<FuelTruck> => {
  try {
    // Assuming backend returns { fuel_truck: FuelTruck } or FuelTruck directly
    const response = await apiService.get<{ fuel_truck: FuelTruck } | FuelTruck>(`${FUEL_TRUCKS_ENDPOINT}/${id}`);
    if (response.data && typeof response.data === 'object' && 'fuel_truck' in response.data) {
      return (response.data as { fuel_truck: FuelTruck }).fuel_truck;
    }
    return response.data as FuelTruck; // If FuelTruck is returned directly
  } catch (error: any) {
    console.error('Error fetching fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch fuel truck' };
  }
};

export const updateFuelTruck = async (id: number, data: FuelTruckUpdateDto): Promise<{message: string, fuel_truck: FuelTruck}> => {
  try {
    // Assuming PATCH is correct and backend returns { message: string, fuel_truck: FuelTruck }
    const response = await apiService.patch<{message: string, fuel_truck: FuelTruck}>(`${FUEL_TRUCKS_ENDPOINT}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to update fuel truck' };
  }
};

export const deleteFuelTruck = async (id: number): Promise<{ message: string }> => {
  try {
    // Assuming backend returns a message on successful deletion
    const response = await apiService.delete<{ message: string }>(`${FUEL_TRUCKS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete fuel truck' };
  }
};

// Exporting as an object is also an option if preferred later
// const FuelTruckService = {
//   getFuelTrucks,
//   createFuelTruck,
//   getFuelTruckById,
//   updateFuelTruck,
//   deleteFuelTruck
// };
// export default FuelTruckService; 