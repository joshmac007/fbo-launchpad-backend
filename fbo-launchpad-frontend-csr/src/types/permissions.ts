export interface Permission {
  id: number;
  name: string; // e.g., 'MANAGE_USERS', 'VIEW_ORDERS'
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionListResponse {
  permissions: Permission[];
  total?: number;
  page?: number;
  per_page?: number;
} 