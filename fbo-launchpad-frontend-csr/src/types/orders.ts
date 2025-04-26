export enum OrderStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export interface FuelOrder {
  id: number;
  aircraft: string;
  customer: string;
  fuelType: string;
  quantity: number;
  status: OrderStatus;
  created: string;
} 