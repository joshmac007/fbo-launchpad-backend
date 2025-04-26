import apiService from './apiService';

export const getFuelTrucks = async (params = {}) => {
  try {
    const response = await apiService.get('/fuel-trucks', { params });
    return response.data.fuel_trucks || []; // Assuming { message, fuel_trucks } structure
  } catch (error) {
    console.error("Error fetching fuel trucks:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch fuel trucks' };
  }
}; 