export enum FuelTruckStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  IN_USE = 'IN_USE',
  NEEDS_MAINTENANCE = 'NEEDS_MAINTENANCE',
}

export interface FuelTruck {
  id: number;
  identifier: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  capacity_gallons?: number;
  current_fuel_level_gallons?: number;
  fuel_type_supported?: string; // e.g., 'Jet A', '100LL', 'Multiple'
  status: FuelTruckStatus | string;
  last_maintenance_date?: string; // ISO date string
  next_maintenance_due_date?: string; // ISO date string
  location?: string; // e.g., 'Ramp A', 'Hangar 1'
  notes?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export type FuelTruckCreateDto = Omit<FuelTruck, 'id' | 'created_at' | 'updated_at'>;
export type FuelTruckUpdateDto = Partial<FuelTruckCreateDto>;

export interface FuelTruckListResponse {
  fuel_trucks: FuelTruck[];
  // Add pagination if supported by API
  total?: number;
  page?: number;
  per_page?: number;
} 