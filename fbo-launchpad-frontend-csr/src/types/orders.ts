export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface FuelOrder {
  id: number;
  tail_number: string;
  customer: string;
  fuel_type: string;
  requested_amount: number;
  status: OrderStatus;
  created_at: string;
} 