import { Role } from './roles'; // Role.id is now number

export interface User {
  id: number | string; // Keeping as number | string as UserService handles it
  name: string;
  email: string;
  is_active: boolean;
  roles?: Role[]; // This Role will now have id: number
  created_at?: string;
  updated_at?: string;
  // Add other user-specific fields as necessary
}

export interface UserListResponse {
  users: User[];
  total?: number;
  page?: number;
  per_page?: number;
}

// DTOs for create and update operations
// UserForm seems to handle role_ids as an array of numbers
export interface UserCreateDto {
  name: string;
  email: string;
  password?: string;
  is_active?: boolean;
  role_ids?: number[]; // This is consistent with Role.id being number
}

export type UserUpdateDto = Partial<Omit<UserCreateDto, 'password'>> & { password?: string | null }; // Allow password to be explicitly null to not change it 