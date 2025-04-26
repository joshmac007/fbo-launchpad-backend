import apiService from './apiService';

export const getFuelOrders = async (params = {}) => {
  try {
    const response = await apiService.get('/fuel-orders', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching fuel orders:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to fetch fuel orders' };
  }
};

export const createFuelOrder = async (orderData) => {
  try {
    const response = await apiService.post('/fuel-orders', orderData);
    return response.data; // Assuming { message, fuel_order } structure
  } catch (error) {
    console.error("Error creating fuel order:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to create fuel order' };
  }
};

export const getFuelOrderById = async (orderId) => {
  try {
    const response = await apiService.get(`/fuel-orders/${orderId}`);
    return response.data.fuel_order;
  } catch (error) {
    console.error(`Error fetching fuel order ${orderId}:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Failed to fetch fuel order ${orderId}` };
  }
};

export const reviewFuelOrder = async (orderId) => {
  try {
    const response = await apiService.patch(`/fuel-orders/${orderId}/review`);
    return response.data.fuel_order;
  } catch (error) {
    console.error(`Error marking order ${orderId} as reviewed:`, error.response?.data || error.message);
    throw error.response?.data || { message: `Failed to mark order ${orderId} as reviewed` };
  }
};

export const exportFuelOrdersCsv = async (params = {}) => {
  try {
    const response = await apiService.get('/fuel-orders/export', {
      params,
      responseType: 'blob', // Important: Expect file data
    });

    // Extract filename from content-disposition header
    const disposition = response.headers['content-disposition'];
    let filename = 'fuel_orders_export.csv'; // Default
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
    }

    // Check if the response indicates no data, even if status is 200
    // This depends on backend implementation (e.g., sending a specific header or empty blob)
    // For now, assume a non-empty blob means success with data.
    if (response.data.size === 0) {
        // Handle no data scenario - throwing a specific error type could be useful
        throw { code: 'NO_DATA_FOUND', message: 'No orders found matching criteria for export.' };
    }


    return {
        blob: response.data, // The actual file blob
        filename: filename
    };

  } catch (error) {
    // If it's the NO_DATA_FOUND error we threw, re-throw it
    if (error.code === 'NO_DATA_FOUND') {
        throw error;
    }

    console.error("Error exporting CSV:", error); // Log the full error

    // Try to parse error response if it's a JSON blob
    let errorData = { message: 'Failed to export CSV' };
    if (error.response && error.response.data instanceof Blob && error.response.headers['content-type']?.includes('application/json')) {
        try {
            const errorJsonText = await error.response.data.text();
            const errorJson = JSON.parse(errorJsonText);
            // Use the 'error' field if available, otherwise use 'message' or default
            errorData = { message: errorJson.error || errorJson.message || 'Failed to export CSV' };
        } catch (parseError) {
            console.error("Failed to parse error blob as JSON", parseError);
        }
    } else if (error.response?.data?.error) {
        // Use the 'error' field from standard JSON error response
         errorData = { message: error.response.data.error };
    } else if (error.response?.data?.message) {
         // Use 'message' if 'error' field is not present
         errorData = { message: error.response.data.message };
    } else if (error.message) {
        // Fallback to generic error message
        errorData = { message: error.message };
    }

    throw errorData; // Throw a structured error object
  }
};

// Additional fuel order service functions will be added here later
// e.g., createOrder, updateOrder, getOrderById, etc. 