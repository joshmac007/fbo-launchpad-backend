export interface Truck {
  id: number | string;
  truck_number: string;
  fuel_type: string;
  capacity: number;
  // Add other truck-specific fields here as needed
  created_at?: string;
  updated_at?: string;
}

export type TruckCreateDto = Omit<Truck, 'id' | 'created_at' | 'updated_at'>;
export type TruckUpdateDto = Partial<TruckCreateDto>; 