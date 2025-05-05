import apiService, { getApiUrl } from './apiService';

export const getFuelTrucks = async (params = {}) => {
  try {
    const response = await apiService.get(getApiUrl('/fuel-trucks/'), { params });
    return response.data.fuel_trucks || [];
  } catch (error) {
    console.error("Error fetching fuel trucks:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch fuel trucks' };
  }
};

export const createFuelTruck = async (data) => {
  try {
    const response = await apiService.post(getApiUrl('/fuel-trucks/'), data);
    return response.data;
  } catch (error) {
    console.error('Error creating fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create fuel truck' };
  }
};

export const getFuelTruckById = async (id) => {
  try {
    const response = await apiService.get(getApiUrl(`/fuel-trucks/${id}`));
    return response.data.fuel_truck;
  } catch (error) {
    console.error('Error fetching fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch fuel truck' };
  }
};

export const updateFuelTruck = async (id, data) => {
  try {
    const response = await apiService.patch(getApiUrl(`/fuel-trucks/${id}`), data);
    return response.data;
  } catch (error) {
    console.error('Error updating fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to update fuel truck' };
  }
};

export const deleteFuelTruck = async (id) => {
  try {
    const response = await apiService.delete(getApiUrl(`/fuel-trucks/${id}`));
    return response.data;
  } catch (error) {
    console.error('Error deleting fuel truck:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete fuel truck' };
  }
};

const FuelTruckService = {
  getFuelTrucks,
  createFuelTruck,
  getFuelTruckById,
  updateFuelTruck,
  deleteFuelTruck
};

export default FuelTruckService;