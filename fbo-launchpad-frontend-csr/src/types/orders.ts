export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface FuelOrder {
  id: number;
  tail_number: string;
  customer: string;
  fuel_type: string;
  requested_amount: number;
  status: OrderStatus;
  created_at: string;
  assigned_lst_id?: number | string | null;
  assigned_lst?: { 
    id: number | string;
    username?: string; 
  } | null;
  completed_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by_csr_user_id?: number | string | null;
} 