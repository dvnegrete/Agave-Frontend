import { httpClient } from '../utils/httpClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  User,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  AssignHouseRequest,
  AssignHouseResponse,
  RemoveHouseResponse,
} from '../types/user-management.types';

/**
 * Get all users with their assigned houses
 */
export const getUsers = async (signal?: AbortSignal): Promise<User[]> => {
  try {
    return httpClient.get<User[]>(API_ENDPOINTS.userManagementUsers, { signal });
  } catch (err: unknown) {
    console.error('❌ [Service] Error in getUsers:', err);
    throw err;
  }
};

/**
 * Update a user's role
 */
export const updateUserRole = async (
  userId: string,
  data: UpdateUserRoleRequest,
  signal?: AbortSignal
): Promise<User> => {
  try {
    return httpClient.patch<User>(
      API_ENDPOINTS.userManagementUserRole(userId),
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in updateUserRole:', err);
    throw err;
  }
};

/**
 * Update a user's status
 */
export const updateUserStatus = async (
  userId: string,
  data: UpdateUserStatusRequest,
  signal?: AbortSignal
): Promise<User> => {
  try {
    return httpClient.patch<User>(
      API_ENDPOINTS.userManagementUserStatus(userId),
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in updateUserStatus:', err);
    throw err;
  }
};

/**
 * Assign a house to a user
 */
export const assignHouse = async (
  userId: string,
  data: AssignHouseRequest,
  signal?: AbortSignal
): Promise<AssignHouseResponse> => {
  try {
    return httpClient.post<AssignHouseResponse>(
      API_ENDPOINTS.userManagementUserHouses(userId),
      data,
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in assignHouse:', err);
    throw err;
  }
};

/**
 * Remove a house from a user
 */
export const removeHouse = async (
  userId: string,
  houseNumber: number,
  signal?: AbortSignal
): Promise<RemoveHouseResponse> => {
  try {
    return httpClient.delete<RemoveHouseResponse>(
      API_ENDPOINTS.userManagementUserHouseRemove(userId, houseNumber),
      { signal }
    );
  } catch (err: unknown) {
    console.error('❌ [Service] Error in removeHouse:', err);
    throw err;
  }
};
