import { vi, describe, it, expect, beforeEach } from 'vitest';
// We don't need to mock axios here if we mock apiService,
// but keeping it doesn't hurt and might be useful if apiService was more complex.
import axios from 'axios'; 
import * as FuelOrderService from '../../services/FuelOrderService';
import { 
    FuelOrderStatus, 
    CreateFuelOrderPayload,
    UpdateFuelOrderStatusPayload,
    SubmitFuelDataPayload 
} from '../../types/fuelOrder';
import apiService from '../../services/apiService'; // Import to get the type, but it will be the mock

// Mock apiService with a factory to ensure it's properly mocked before FuelOrderService loads it
vi.mock('../../services/apiService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    // It's good practice to mock the structure apiService.ts actually exports/has (AxiosInstance like)
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  }
}));

// We might not need to mock axios globally anymore if apiService is fully contained by its mock.
// vi.mock('axios'); 
// const mockedAxios = vi.mocked(axios, true); 

// Get a reference to the mocked apiService.
// Vitest's auto-mocking system should make the imported 'apiService' the mocked version.
const mockedApiService = vi.mocked(apiService, true);

describe('FuelOrderService', () => {
  beforeEach(() => {
    // Reset all mocks. This is important because vi.fn()s are stateful.
    vi.resetAllMocks();
    
    // If you need to reset specific implementations for each test, do it here.
    // For example, if a default mock behavior is set up outside beforeEach.
    // mockedApiService.get.mockReset(); // etc.
    // However, with vi.resetAllMocks(), individual resets like these might be redundant
    // if the mocks are fresh from the factory each time.
    // Let's rely on vi.resetAllMocks() for now.
  });

  describe('getOrders', () => {
    it('should fetch orders with correct params and return paginated response', async () => {
      const mockResponseData = { // This is what apiService.get would return as response.data
        orders: [{ id: 1, tail_number: 'N123', status: FuelOrderStatus.PENDING }],
        pagination: { page: 1, per_page: 10, total: 1, pages: 1 },
        message: 'Success'
      };
      // Mock the 'get' method of the mocked apiService
      mockedApiService.get.mockResolvedValue({ data: mockResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

      const filters = { status: FuelOrderStatus.PENDING };
      const page = 1;
      const limit = 10;
      const result = await FuelOrderService.getOrders(filters, page, limit);

      expect(mockedApiService.get).toHaveBeenCalledWith('/fuel-orders', {
        params: { ...filters, page, per_page: limit }
      });
      expect(result.orders).toEqual(mockResponseData.orders);
      expect(result.pagination).toEqual(mockResponseData.pagination);
    });

    it('should handle API error for getOrders', async () => {
      mockedApiService.get.mockRejectedValue(new Error('Network Error'));
      await expect(FuelOrderService.getOrders({}, 1, 10)).rejects.toThrow('Network Error');
    });
  });

  describe('createOrder', () => {
    it('should send correct payload and return new order data', async () => {
      const payload: CreateFuelOrderPayload = {
        tail_number: 'N123',
        fuel_type: 'Jet A',
        requested_amount: 100,
        location_on_ramp: 'A1',
        assigned_lst_user_id: -1,
        assigned_truck_id: -1,
      };
      const mockResponseData = { // This is what apiService.post would return as response.data
        message: 'Order created',
        fuel_order: { id: 1, ...payload, status: FuelOrderStatus.PENDING }
      };
      mockedApiService.post.mockResolvedValue({ data: mockResponseData, status: 201, statusText: 'Created', headers: {}, config: {} as any });

      const result = await FuelOrderService.createOrder(payload);

      expect(mockedApiService.post).toHaveBeenCalledWith('/fuel-orders', payload);
      expect(result).toEqual(mockResponseData);
    });
  });
  
  describe('getOrderById', () => {
    it('should fetch a single order by ID', async () => {
        const orderId = 1;
        const mockOrder = { id: orderId, tail_number: 'N123', status: FuelOrderStatus.PENDING };
        const mockResponseData = { message: 'Order found', fuel_order: mockOrder }; 
        mockedApiService.get.mockResolvedValue({ data: mockResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

        const result = await FuelOrderService.getOrderById(orderId);

        expect(mockedApiService.get).toHaveBeenCalledWith(`/fuel-orders/${orderId}`);
        // The service method returns response.data directly for getOrderById.
        expect(result).toEqual(mockResponseData); 
    });
  });

  describe('updateOrderStatus', () => {
    it('should send PATCH request to update status', async () => {
        const orderId = 1;
        const payload: UpdateFuelOrderStatusPayload = {
            status: FuelOrderStatus.DISPATCHED,
            assigned_truck_id: 10,
        };
        const mockUpdatedOrder = { id: orderId, status: FuelOrderStatus.DISPATCHED, assigned_truck_id: 10 };
        // Assuming API returns the updated order directly as response.data
        mockedApiService.patch.mockResolvedValue({ data: mockUpdatedOrder, status: 200, statusText: 'OK', headers: {}, config: {} as any });

        const result = await FuelOrderService.updateOrderStatus(orderId, payload);
        expect(mockedApiService.patch).toHaveBeenCalledWith(`/fuel-orders/${orderId}/status`, payload);
        expect(result).toEqual(mockUpdatedOrder);
    });
  });

  describe('submitFuelData', () => {
    it('should send PUT request to submit fuel data', async () => {
        const orderId = 1;
        const payload: SubmitFuelDataPayload = {
            start_meter_reading: 1000,
            end_meter_reading: 1100,
            lst_notes: 'All good'
        };
        const mockResponseData = { message: 'Data submitted', fuel_order: { id: orderId, start_meter_reading: '1000', end_meter_reading: '1100'} }; 
        mockedApiService.put.mockResolvedValue({ data: mockResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

        const result = await FuelOrderService.submitFuelData(orderId, payload);
        expect(mockedApiService.put).toHaveBeenCalledWith(`/fuel-orders/${orderId}/submit-data`, payload);
        expect(result).toEqual(mockResponseData);
    });
  });

  describe('reviewOrder', () => {
    it('should send PATCH request to review order', async () => {
        const orderId = 1;
        const mockReviewedOrder = { id: orderId, status: FuelOrderStatus.REVIEWED };
        const mockResponseData = { message: 'Order reviewed', fuel_order: mockReviewedOrder };
        mockedApiService.patch.mockResolvedValue({ data: mockResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

        const result = await FuelOrderService.reviewOrder(orderId);
        expect(mockedApiService.patch).toHaveBeenCalledWith(`/fuel-orders/${orderId}/review`);
        expect(result).toEqual(mockResponseData);
    });
  });

  describe('exportOrdersCSV', () => {
    it('should request CSV data with correct params', async () => {
        const filters = { status: FuelOrderStatus.COMPLETED };
        const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
        // apiService.get for blob response
        mockedApiService.get.mockResolvedValue({ data: mockBlob, status: 200, statusText: 'OK', headers: { 'content-type': 'text/csv' }, config: { responseType: 'blob' } as any });

        const result = await FuelOrderService.exportOrdersCSV(filters);
        expect(mockedApiService.get).toHaveBeenCalledWith('/fuel-orders/export', {
            params: filters,
            responseType: 'blob'
        });
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('text/csv');
    });
  });

  describe('getStatusCounts', () => {
    it('should fetch status counts', async () => {
        const mockCounts = { PENDING: 5, COMPLETED: 10 };
        const mockResponseData = { message: 'Counts retrieved', counts: mockCounts };
        mockedApiService.get.mockResolvedValue({ data: mockResponseData, status: 200, statusText: 'OK', headers: {}, config: {} as any });

        const result = await FuelOrderService.getStatusCounts();
        expect(mockedApiService.get).toHaveBeenCalledWith('/fuel-orders/stats/status-counts');
        expect(result).toEqual(mockResponseData);
    });
  });

}); 