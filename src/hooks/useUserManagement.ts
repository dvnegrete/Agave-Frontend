import { useState } from 'react';
import {
  type UpdateUserRoleRequest,
  type UpdateUserStatusRequest,
  type AssignHouseRequest,
  type UpdateUserObservationsRequest,
} from '@/shared/types/user-management.types'
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  updateUserObservations,
  assignHouse,
  removeHouse,
  deleteUser,
} from '@services/userManagementService';
import type { User } from '@/shared/types/user-management.types';

interface UseUserManagementReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  changeRole: (userId: string, data: UpdateUserRoleRequest) => Promise<User | undefined>;
  changeStatus: (userId: string, data: UpdateUserStatusRequest) => Promise<User | undefined>;
  changeObservations: (userId: string, data: UpdateUserObservationsRequest) => Promise<User | undefined>;
  addHouse: (userId: string, data: AssignHouseRequest) => Promise<void>;
  removeUserHouse: (userId: string, houseNumber: number) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
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

  const changeObservations = async (userId: string, data: UpdateUserObservationsRequest): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateUserObservations(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating observations';
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
      // Actualizar el usuario en el estado local inmediatamente sin refetch completo
      // Agregamos la nueva casa al array de casas del usuario
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, houses: [...u.houses, data.house_number] }
            : u
        )
      );
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
      // Actualizar el usuario en el estado local inmediatamente sin refetch completo
      // Removemos la casa del array de casas del usuario
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, houses: u.houses.filter((h) => h !== houseNumber) }
            : u
        )
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error removing house';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      // Refresh users to get updated list
      await fetchUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting user';
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
    changeObservations,
    addHouse,
    removeUserHouse,
    removeUser,
  };
};
