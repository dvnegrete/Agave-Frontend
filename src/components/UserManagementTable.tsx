import { Table, type TableColumn } from '@shared/ui';
import { RoleBadge } from '@shared/ui';
import { StatusBadge } from '@shared/ui';
import { Button } from '@shared/ui';
import type { User } from '@/shared/types/user-management.types';

interface UserManagementTableProps {
  users: User[];
  loading: boolean;
  onEditRole: (user: User) => void;
  onEditStatus: (user: User) => void;
  onAssignHouse: (user: User) => void;
  onRemoveHouse: (user: User, houseNumber: number) => void;
}

export function UserManagementTable({
  users,
  loading,
  onEditRole,
  onEditStatus,
  onAssignHouse,
  onRemoveHouse,
}: UserManagementTableProps) {
  const columns: TableColumn<User>[] = [
    {
      id: 'name',
      header: 'Nombre',
      render: (user) =>
        user.name ? (
          <span className="text-foreground">{user.name}</span>
        ) : (
          <span className="text-foreground-tertiary">Sin nombre</span>
        ),
    },
    {
      id: 'email',
      header: 'Email',
      render: (user) =>
        user.email ? (
          <span className="text-foreground text-sm">{user.email}</span>
        ) : (
          <span className="text-foreground-tertiary">-</span>
        ),
    },
    {
      id: 'phone',
      header: 'Teléfono',
      render: (user) =>
        user.cel_phone ? (
          <span className="text-foreground">{user.cel_phone}</span>
        ) : (
          <span className="text-foreground-tertiary">-</span>
        ),
    },
    {
      id: 'role',
      header: 'Rol',
      render: (user) => (
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          <Button
            variant="sm"
            onClick={() => onEditRole(user)}
            className="bg-primary/30 hover:bg-primary/50"
          >
            ✏️
          </Button>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      render: (user) => (
        <div className="flex items-center gap-2">
          <StatusBadge
            status={
              user.status === 'active'
                ? 'success'
                : user.status === 'suspend'
                  ? 'warning'
                  : 'error'
            }
            label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          />
          <Button
            variant="sm"
            onClick={() => onEditStatus(user)}
            className="bg-primary/30 hover:bg-primary/50"
          >
            ✏️
          </Button>
        </div>
      ),
    },
    {
      id: 'houses',
      header: 'Casas Asignadas',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.houses.length > 0 ? (
            <>
              {user.houses.map((house) => (
                <span
                  key={house}
                  className="bg-primary/20 px-2 py-1 rounded text-xs flex items-center gap-1 text-foreground font-semibold"
                >
                  {house}
                  <button
                    onClick={() => onRemoveHouse(user, house)}
                    className="text-error hover:text-error-light transition-colors"
                    title="Remover casa"
                  >
                    ×
                  </button>
                </span>
              ))}
              <Button
                variant="sm"
                onClick={() => onAssignHouse(user)}
                className="bg-success/30 hover:bg-success/50 text-success"
              >
                + Casa
              </Button>
            </>
          ) : (
            <Button
              variant="sm"
              onClick={() => onAssignHouse(user)}
              className="bg-warning/30 hover:bg-warning/50 text-warning"
            >
              Asignar Casa
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-foreground-secondary">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <Table<User>
      columns={columns}
      data={users}
      keyField="id"
      hoverable
      striped
      headerVariant="primary"
      emptyMessage="📭 No hay usuarios registrados"
      variant="spacious"
    />
  );
}
