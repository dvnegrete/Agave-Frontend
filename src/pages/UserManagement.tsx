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
import { ColumnSelector, type ColumnOption } from '@shared/ui';
import type { User, ModalType } from '@/shared/types/user-management.types';
import { isAdmin, isActive, isSuspended, isInactive } from '@shared/utils/roleAndStatusHelpers';
import { USER_ROLES, ROLE_LABELS } from '@shared/constants';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, fetchUsers, changeRole, changeStatus, changeObservations, addHouse, removeUserHouse, removeUser } =
    useUserManagement();

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedHouseNumber, setSelectedHouseNumber] = useState<number | null>(null);
  const [showEditActionsModal, setShowEditActionsModal] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  // Filter state
  const [searchName, setSearchName] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [showOnlyNoHouse, setShowOnlyNoHouse] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'role', 'houses', 'actions']);
  const [isColumnsExpanded, setIsColumnsExpanded] = useState(false);

  // Available columns configuration
  const availableColumns: ColumnOption[] = [
    { id: 'name', label: 'Nombre' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Teléfono' },
    { id: 'role', label: 'Rol' },
    { id: 'status', label: 'Estado' },
    { id: 'observations', label: 'Observaciones' },
    { id: 'houses', label: 'Casas Asignadas' },
    { id: 'actions', label: 'Acciones' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check if current user is admin
  if (!currentUser?.role || !isAdmin(currentUser.role)) {
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

  // Filter users based on criteria
  const filteredUsers = users.filter((user) => {
    // Filter by name (case insensitive)
    if (searchName && !user.name?.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // Filter by role
    if (selectedRole && user.role !== selectedRole) {
      return false;
    }

    // Filter by house
    if (selectedHouse && !user.houses.includes(Number(selectedHouse))) {
      return false;
    }

    // Filter: show only users with no house assigned
    if (showOnlyNoHouse && user.houses.length > 0) {
      return false;
    }

    return true;
  });

  // Get unique house numbers from all users for the house filter dropdown
  const uniqueHouses = Array.from(new Set(users.flatMap((u) => u.houses))).sort((a, b) => a - b);

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

      {/* Stats Cards - Colapsables en mobile */}
      <div className="mb-8">
        {/* Header con botón de toggle */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-lg font-semibold text-foreground">Resumen de Usuarios</h2>
          <button
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
          >
            {isStatsExpanded ? '▼ Ocultar' : '▶ Mostrar'}
          </button>
        </div>

        {/* Grid de stats */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ${isStatsExpanded ? 'opacity-100 visible' : 'hidden lg:grid opacity-100'
            }`}
        >
          <div className="bg-base border-l-4 border-primary rounded-lg p-4">
            <div className="text-foreground-secondary text-sm font-semibold">Total Usuarios</div>
            <div className="text-3xl font-bold text-primary mt-2">{users.length}</div>
          </div>
          <div className="bg-base border-l-4 border-success rounded-lg p-4">
            <div className="text-foreground-secondary text-sm font-semibold">Activos</div>
            <div className="text-3xl font-bold text-success mt-2">
              {users.filter((u) => isActive(u.status)).length}
            </div>
          </div>
          <div className="bg-base border-l-4 border-warning rounded-lg p-4">
            <div className="text-foreground-secondary text-sm font-semibold">Suspendidos</div>
            <div className="text-3xl font-bold text-warning mt-2">
              {users.filter((u) => isSuspended(u.status)).length}
            </div>
          </div>
          <div className="bg-base border-l-4 border-error rounded-lg p-4">
            <div className="text-foreground-secondary text-sm font-semibold">Inactivos</div>
            <div className="text-3xl font-bold text-error mt-2">
              {users.filter((u) => isInactive(u.status)).length}
            </div>
          </div>
        </div>
      </div>

      {/* Column Selector */}
      <ColumnSelector
        availableColumns={availableColumns}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        isExpanded={isColumnsExpanded}
        onToggleExpand={setIsColumnsExpanded}
      />

      {/* Filters Section */}
      <div className="bg-secondary border border-base rounded-lg mb-8 shadow-lg">
        {/* Header con botón de toggle en mobile */}
        <div className="flex items-center justify-between p-6 lg:hidden">
          <h2 className="text-lg font-semibold text-foreground">🔍 Filtrar...</h2>
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
          >
            {isFiltersExpanded ? '▼ Ocultar' : '▶ Mostrar'}
          </button>
        </div>

        {/* Title para desktop */}
        <div className="hidden lg:block p-6 pb-0">
          <h2 className="text-lg font-semibold text-foreground mb-4">🔍 Filtrar...</h2>
        </div>

        {/* Grid de filtros */}
        <div
          className={`transition-all duration-300 overflow-hidden ${isFiltersExpanded ? 'opacity-100 visible' : 'hidden lg:grid opacity-100'
            }`}
        >
          <div className="p-6 pt-0 lg:pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-2">Nombre</label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="px-3 py-2 bg-base border border-base rounded-lg text-foreground placeholder-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter by Role */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-2">Rol</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 bg-base border border-base rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los roles</option>
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by House */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-2">Casa Asignada</label>
              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="px-3 py-2 bg-base border border-base rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todas las casas</option>
                {uniqueHouses.map((house) => (
                  <option key={house} value={house}>
                    Casa {house}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox: Show only users with no house */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyNoHouse}
                  onChange={(e) => setShowOnlyNoHouse(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-semibold text-foreground">Sin casa asignada</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-secondary border border-base rounded-lg overflow-hidden shadow-lg">
        <UserManagementTable
          users={filteredUsers}
          loading={loading}
          onEdit={handleEdit}
          onAssignHouse={(user) => openModal('assign', user)}
          onRemoveHouse={(user, houseNumber) => openModal('remove', user, houseNumber)}
          visibleColumnIds={visibleColumns}
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
