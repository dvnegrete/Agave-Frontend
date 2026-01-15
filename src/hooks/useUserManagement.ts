import { useState } from 'react';
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  assignHouse,
  removeHouse,
  type UpdateUserRoleRequest,
  type UpdateUserStatusRequest,
  type AssignHouseRequest,
} from '../services/userManagementService';
import type { User } from '../types/user-management.types';

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  changeRole: (userId: string, data: UpdateUserRoleRequest) => Promise<User | undefined>;
  changeStatus: (userId: string, data: UpdateUserStatusRequest) => Promise<User | undefined>;
  addHouse: (userId: string, data: AssignHouseRequest) => Promise<void>;
  removeUserHouse: (userId: string, houseNumber: number) => Promise<void>;
}

export const useUserManagement = (): UseUserManagementReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching users';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: string, data: UpdateUserRoleRequest): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateUserRole(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating role';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (userId: string, data: UpdateUserStatusRequest): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateUserStatus(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addHouse = async (userId: string, data: AssignHouseRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await assignHouse(userId, data);
      // Refresh users to get updated house assignments
      await fetchUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error assigning house';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeUserHouse = async (userId: string, houseNumber: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await removeHouse(userId, houseNumber);
      // Refresh users to get updated house assignments
      await fetchUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error removing house';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    changeRole,
    changeStatus,
    addHouse,
    removeUserHouse,
  };
};
