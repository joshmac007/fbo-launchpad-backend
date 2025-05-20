import apiService from './apiService';
import { 
  FuelOrderStatus, 
  FuelOrder, 
  PaginatedFuelOrdersResponse, 
  StatusCountsResponse,
  CreateFuelOrderPayload,
  UpdateFuelOrderStatusPayload,
  SubmitFuelDataPayload,
  UpdateFuelOrderPayload
} from '../types/fuelOrder';

// --- Interfaces for Request Payloads --- (MOVED TO ../types/fuelOrder.ts)

// export interface CreateFuelOrderPayload { ... }
// export interface UpdateFuelOrderStatusPayload { ... } 
// export interface SubmitFuelDataPayload { ... }

// --- Interfaces for API Responses --- (MOVED TO ../types/fuelOrder.ts)
// export interface FuelOrder { ... }
// export interface PaginatedFuelOrdersResponse { ... }
// export interface FuelOrderStatusCounts { ... }
// export interface StatusCountsResponse { ... }

// --- Service Methods ---

const FUEL_ORDERS_BASE_URL = '/fuel-orders';

/**
 * Fetches a paginated list of fuel orders.
 * @param filters - Optional filter parameters (e.g., { status: 'PENDING', tail_number: 'N123' })
 * @param page - Optional page number for pagination.
 * @param perPage - Optional items per page for pagination.
 */
export const getOrders = async (
  filters?: Record<string, any>,
  page?: number,
  perPage?: number
): Promise<PaginatedFuelOrdersResponse> => {
  const params = { ...filters };
  if (page) params.page = page;
  if (perPage) params.per_page = perPage;

  try {
    const response = await apiService.get<PaginatedFuelOrdersResponse>(FUEL_ORDERS_BASE_URL, { params });
    // console.log(\'[FuelOrderService] getOrders response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error fetching orders:\', error);
    throw error;
  }
};

/**
 * Creates a new fuel order.
 * @param data - The payload for creating the fuel order.
 */
export const createOrder = async (payload: CreateFuelOrderPayload): Promise<{ message: string; fuel_order: FuelOrder }> => {
  try {
    const response = await apiService.post<{ message: string; fuel_order: FuelOrder }>(FUEL_ORDERS_BASE_URL, payload);
    // console.log(\'[FuelOrderService] createOrder response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error creating order:\', error);
    throw error;
  }
};

/**
 * Fetches a single fuel order by its ID.
 * @param id - The ID of the fuel order.
 */
export const getOrderById = async (id: number): Promise<{ message: string; fuel_order: FuelOrder }> => {
  try {
    const response = await apiService.get<{ message: string; fuel_order: FuelOrder }>(`${FUEL_ORDERS_BASE_URL}/${id}`);
    // console.log(\'[FuelOrderService] getOrderById response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error fetching order by ID:\', error);
    throw error;
  }
};

/**
 * Updates the status of a fuel order.
 * @param id - The ID of the fuel order.
 * @param payload - The payload containing the new status and assigned truck ID.
 */
export const updateOrderStatus = async (id: number, payload: UpdateFuelOrderStatusPayload): Promise<FuelOrder> => {
  try {
    const response = await apiService.patch<FuelOrder>(`${FUEL_ORDERS_BASE_URL}/${id}/status`, payload);
    // console.log(\'[FuelOrderService] updateOrderStatus response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error updating order status:\', error);
    throw error;
  }
};

/**
 * Submits fuel data (meter readings, notes) for a fuel order.
 * @param id - The ID of the fuel order.
 * @param payload - The payload containing fuel data.
 */
export const submitFuelData = async (id: number, payload: SubmitFuelDataPayload): Promise<{ message: string; fuel_order: Partial<FuelOrder> }> => {
  try {
    const response = await apiService.put<{ message: string; fuel_order: Partial<FuelOrder> }>(`${FUEL_ORDERS_BASE_URL}/${id}/submit-data`, payload);
    // console.log(\'[FuelOrderService] submitFuelData response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error submitting fuel data:\', error);
    throw error;
  }
};

/**
 * Marks a fuel order as reviewed.
 * @param id - The ID of the fuel order.
 */
export const reviewOrder = async (id: number): Promise<{ message: string; fuel_order: Partial<FuelOrder> }> => {
  try {
    const response = await apiService.patch<{ message: string; fuel_order: Partial<FuelOrder> }>(`${FUEL_ORDERS_BASE_URL}/${id}/review`);
    // console.log(\'[FuelOrderService] reviewOrder response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error reviewing order:\', error);
    throw error;
  }
};

/**
 * Exports fuel orders to CSV.
 * @param filters - Optional filter parameters.
 */
export const exportOrdersCSV = async (filters?: Record<string, any>): Promise<Blob> => {
  try {
    const response = await apiService.get<Blob>(`${FUEL_ORDERS_BASE_URL}/export`, {
      params: filters,
      responseType: 'blob', // Important for file downloads
    });
    // console.log(\'[FuelOrderService] exportOrdersCSV response. Headers:\', response.headers);
    // If backend returns JSON for "no data", handle it:
    if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
        // Attempt to parse it as text first to check for a message
        const text = await (response.data as any).text();
        try {
            const jsonData = JSON.parse(text);
            if (jsonData.message) { // Or jsonData.error
                 // You might want to throw a custom error or return a specific object
                throw new Error(jsonData.message || 'No data to export');
            }
        } catch (e) {
            // Not JSON or not the expected structure
            // console.warn(\'[FuelOrderService] exportOrdersCSV: Received JSON but could not parse expected message', e);
        }
         // Fallback to empty blob or throw error
        return new Blob([], { type: 'text/csv' }); // Or throw
    }

    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error exporting orders to CSV:\', error);
    throw error;
  }
};

/**
 * Fetches counts of fuel orders grouped by status.
 */
export const getStatusCounts = async (): Promise<StatusCountsResponse> => {
  try {
    const response = await apiService.get<StatusCountsResponse>(`${FUEL_ORDERS_BASE_URL}/stats/status-counts`);
    // console.log(\'[FuelOrderService] getStatusCounts response:\', response.data);
    return response.data;
  } catch (error) {
    // console.error(\'[FuelOrderService] Error fetching status counts:\', error);
    throw error;
  }
};

/**
 * Updates an existing fuel order.
 * @param orderId - The ID of the fuel order to update.
 * @param payload - The data to update the fuel order with.
 */
export const updateOrder = async (orderId: number, payload: UpdateFuelOrderPayload): Promise<FuelOrder> => {
  try {
    // Assuming the backend returns the full updated order object
    const response = await apiService.put<{ fuel_order: FuelOrder }>(`${FUEL_ORDERS_BASE_URL}/${orderId}`, payload);
    return response.data.fuel_order;
  } catch (error) {
    // console.error(`[FuelOrderService] Error updating order ${orderId}:`, error);
    throw error;
  }
};

// It might be useful to export the service as an object if you prefer that pattern
// const FuelOrderService = {
//   getOrders,
//   createOrder,
//   getOrderById,
//   updateOrderStatus,
//   submitFuelData,
//   reviewOrder,
//   exportOrdersCSV,
//   getStatusCounts,
// };
// export default FuelOrderService;

// Alternatively, continue exporting functions directly as done above. 