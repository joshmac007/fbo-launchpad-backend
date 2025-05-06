import apiService from './apiService';

export const getAircraft = async (params = {}) => {
  try {
    const response = await apiService.get('/admin/aircraft', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching aircraft:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch aircraft' };
  }
};

export const getAircraftById = async (id) => {
  try {
    // Placeholder for GET /api/admin/aircraft/{id}
    return { aircraft: {} };
  } catch (error) {
    console.error('Error fetching aircraft by id:', error);
    throw { message: 'Failed to fetch aircraft' };
  }
};

export const createAircraft = async (aircraftData) => {
  try {
    const response = await apiService.post('/admin/aircraft', aircraftData);
    return response.data;
  } catch (error) {
    console.error('Error creating aircraft:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create aircraft' };
  }
};

export const updateAircraft = async (tailNumber, aircraftData) => {
  try {
    const response = await apiService.patch(`/admin/aircraft/${tailNumber}`, aircraftData);
    return response.data;
  } catch (error) {
    console.error('Error updating aircraft:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to update aircraft' };
  }
};

export const deleteAircraft = async (tailNumber) => {
  try {
    await apiService.delete(`/admin/aircraft/${tailNumber}`);
    return {}; // Return empty object for successful deletion
  } catch (error) {
    console.error('Error deleting aircraft:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete aircraft' };
  }
};

const AircraftService = {
  getAircraft,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft
};

export default AircraftService;
