export enum FuelOrderStatus {
  PENDING = 'PENDING',
  DISPATCHED = 'DISPATCHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  EN_ROUTE = 'EN_ROUTE',
  FUELING = 'FUELING',
  COMPLETED = 'COMPLETED',
  REVIEWED = 'REVIEWED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD' // Added based on common FBO scenarios, confirm if used
}

export interface FuelOrder {
  id: number;
  tail_number: string;
  customer_id?: number | null;
  fuel_type: string;
  additive_requested: boolean;
  requested_amount: string | null; // Backend returns as string (Decimal)
  assigned_lst_user_id: number | null;
  assigned_truck_id: number | null;
  location_on_ramp: string;
  csr_notes?: string | null;
  status: FuelOrderStatus | string;
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string
  start_meter_reading?: string | null; // Decimal
  end_meter_reading?: string | null; // Decimal
  calculated_gallons_dispensed?: string | null; // Decimal
  lst_notes?: string | null;
  dispatch_timestamp?: string | null;
  acknowledge_timestamp?: string | null;
  en_route_timestamp?: string | null;
  fueling_start_timestamp?: string | null;
  completion_timestamp?: string | null;
  reviewed_timestamp?: string | null;
  reviewed_by_csr_user_id?: number | null;
  // Add other fields from detailed view if needed (e.g., aircraft, customer details if joined)
}

export interface PaginatedFuelOrdersResponse {
  orders: FuelOrder[];
  message: string;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface FuelOrderStatusCounts {
  [key: string]: number; // e.g., { "PENDING": 5, "COMPLETED": 10 }
}

export interface StatusCountsResponse {
    message: string;
    counts: FuelOrderStatusCounts;
}

// Add other Fuel Order related types here as the UI develops, for example:
// export interface FuelOrderFilters {
//   status?: FuelOrderStatus | string;
//   tail_number?: string;
//   assigned_lst_user_id?: number;
//   assigned_truck_id?: number;
//   date_from?: string;
//   date_to?: string;
// } 

// --- Interfaces for Request Payloads (from FuelOrderService.ts) ---

export interface CreateFuelOrderPayload {
  tail_number: string;
  fuel_type: string;
  assigned_lst_user_id: number; // -1 for auto-assign
  assigned_truck_id: number; // -1 for auto-assign
  requested_amount: number;
  location_on_ramp: string;
  aircraft_type?: string;
  customer_id?: number;
  additive_requested?: boolean;
  csr_notes?: string;
}

export interface UpdateFuelOrderStatusPayload {
  status: FuelOrderStatus | string; // Allow string for flexibility, backend expects uppercase enum string
  assigned_truck_id: number;
}

export interface SubmitFuelDataPayload {
  start_meter_reading: number;
  end_meter_reading: number;
  lst_notes?: string;
}

export interface UpdateFuelOrderPayload {
  tail_number?: string;
  fuel_type?: string;
  assigned_lst_user_id?: number;
  assigned_truck_id?: number;
  requested_amount?: number;
  location_on_ramp?: string;
  aircraft_type?: string; // Or aircraft_id if that's what your system uses
  customer_id?: number;
  additive_requested?: boolean;
  csr_notes?: string;
  // Fields like 'status' are typically updated via specific status change endpoints,
  // so it might be excluded here unless general edit can also change it.
  // For now, mirroring CreateFuelOrderPayload closely, excluding status.
  priority?: 'Low' | 'Normal' | 'High'; // If priority is stored and editable
} 