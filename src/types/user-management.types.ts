export type Role = 'admin' | 'owner' | 'tenant';
export type Status = 'active' | 'suspend' | 'inactive';

export interface User {
  id: string;
  role: Role;
  status: Status;
  name: string | null;
  email: string | null;
  cel_phone: number | null;
  houses: number[]; // Array of house numbers
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export interface UpdateUserStatusRequest {
  status: Status;
}

export interface AssignHouseRequest {
  house_number: number;
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
