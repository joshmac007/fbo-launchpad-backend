import { Permission } from './permissions'; // Assuming Permission is in permissions.ts

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface RoleListResponse {
  roles: Role[];
  total?: number;
  page?: number;
  per_page?: number;
}

export type RoleCreateDto = Omit<Role, 'id' | 'created_at' | 'updated_at' | 'permissions'> & {
  permission_ids?: number[];
};

export type RoleUpdateDto = Partial<RoleCreateDto>; 