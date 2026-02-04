// Single source of truth for roles and statuses
export const USER_ROLES_ARRAY = ['admin', 'owner', 'tenant'] as const;
export const USER_STATUSES_ARRAY = ['active', 'suspend', 'inactive'] as const;

export type Role = typeof USER_ROLES_ARRAY[number];
export type Status = typeof USER_STATUSES_ARRAY[number];

export interface User {
  id: string;
  role: Role;
  status: Status;
  name: string | null;
  email: string | null;
  cel_phone: number | null;
  houses: number[]; // Array of house numbers
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRoleRequest {
  role: Role;
  [key: string]: unknown;
}

export interface UpdateUserStatusRequest {
  status: Status;
  [key: string]: unknown;
}

export interface UpdateUserObservationsRequest {
  observations: string | null;
  [key: string]: unknown;
}

export interface AssignHouseRequest {
  house_number: number;
  [key: string]: unknown;
}

export interface RemoveHouseResponse {
  message: string;
}

export interface AssignHouseResponse {
  message: string;
  house_number: number;
  user_id: string;
}

export interface UsersResponse {
  users: User[];
}

// Modal Types for User Management
export type ModalType =
  | 'role'
  | 'status'
  | 'observations'
  | 'assign'
  | 'remove'
  | null;
