import { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useUserManagement } from '@hooks/useUserManagement';
import {
  UserManagementTable,
  ModalEditUserRole,
  ModalEditUserStatus,
  ModalEditObservations,
  ModalAssignHouse,
  ModalRemoveHouse,
  ModalEditActions,
} from '@components/index';
import type { User, ModalType } from '@/shared/types/user-management.types';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, fetchUsers, changeRole, changeStatus, changeObservations, addHouse, removeUserHouse, removeUser } =
    useUserManagement();

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedHouseNumber, setSelectedHouseNumber] = useState<number | null>(null);
  const [showEditActionsModal, setShowEditActionsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-error/20 border-2 border-error text-error rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">⛔</div>
          <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-sm">Solo administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const handleEdit = (user: User): void => {
    setSelectedUser(user);
    setShowEditActionsModal(true);
  };

  const openModal = (type: ModalType, user: User, houseNumber?: number): void => {
    setSelectedUser(user);
    setModalType(type);
    setShowEditActionsModal(false);
    if (houseNumber) setSelectedHouseNumber(houseNumber);
  };

  const closeModal = (): void => {
    setSelectedUser(null);
    setModalType(null);
    setSelectedHouseNumber(null);
    setShowEditActionsModal(false);
  };

  return (
    <div className="container flex-1 mx-auto p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">👥 Administración de Usuarios</h1>
        <p className="text-foreground-secondary">
          Gestiona los usuarios del condominio, roles, estados y asignación de casas
        </p>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-error/20 border-2 border-error text-error rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-bold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-base border-l-4 border-primary rounded-lg p-4">
          <div className="text-foreground-secondary text-sm font-semibold">Total Usuarios</div>
          <div className="text-3xl font-bold text-primary mt-2">{users.length}</div>
        </div>
        <div className="bg-base border-l-4 border-success rounded-lg p-4">
          <div className="text-foreground-secondary text-sm font-semibold">Activos</div>
          <div className="text-3xl font-bold text-success mt-2">
            {users.filter((u) => u.status === 'active').length}
          </div>
        </div>
        <div className="bg-base border-l-4 border-warning rounded-lg p-4">
          <div className="text-foreground-secondary text-sm font-semibold">Suspendidos</div>
          <div className="text-3xl font-bold text-warning mt-2">
            {users.filter((u) => u.status === 'suspend').length}
          </div>
        </div>
        <div className="bg-base border-l-4 border-error rounded-lg p-4">
          <div className="text-foreground-secondary text-sm font-semibold">Inactivos</div>
          <div className="text-3xl font-bold text-error mt-2">
            {users.filter((u) => u.status === 'inactive').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-secondary border border-base rounded-lg overflow-hidden shadow-lg">
        <UserManagementTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onAssignHouse={(user) => openModal('assign', user)}
          onRemoveHouse={(user, houseNumber) => openModal('remove', user, houseNumber)}
        />
      </div>

      {/* Modals */}
      <ModalEditActions
        isOpen={showEditActionsModal}
        user={selectedUser}
        onSelectRole={() => openModal('role', selectedUser!)}
        onSelectStatus={() => openModal('status', selectedUser!)}
        onSelectObservations={() => openModal('observations', selectedUser!)}
        onSelectHouse={() => openModal('assign', selectedUser!)}
        onDeleteUser={async () => {
          if (selectedUser) {
            await removeUser(selectedUser.id);
          }
        }}
        onClose={closeModal}
      />

      <ModalEditUserRole
        isOpen={modalType === 'role'}
        user={selectedUser}
        onSave={async (userId, data) => {
          await changeRole(userId, data);
        }}
        onClose={closeModal}
      />

      <ModalEditUserStatus
        isOpen={modalType === 'status'}
        user={selectedUser}
        onSave={async (userId, data) => {
          await changeStatus(userId, data);
        }}
        onClose={closeModal}
      />

      <ModalEditObservations
        isOpen={modalType === 'observations'}
        user={selectedUser}
        onSave={async (userId, data) => {
          await changeObservations(userId, data);
        }}
        onClose={closeModal}
      />

      <ModalAssignHouse
        isOpen={modalType === 'assign'}
        user={selectedUser}
        onSave={addHouse}
        onClose={closeModal}
      />

      <ModalRemoveHouse
        isOpen={modalType === 'remove'}
        user={selectedUser}
        houseNumber={selectedHouseNumber}
        onConfirm={removeUserHouse}
        onClose={closeModal}
      />
    </div>
  );
}
