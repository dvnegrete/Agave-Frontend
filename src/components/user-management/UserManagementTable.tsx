import type { TableColumn } from '@shared/ui';
import { RoleBadge, StatusBadge, Button, Table } from '@shared/ui';
import type { User } from '@/shared';
import { getStatusBadgeColor, getStatusLabel } from '@shared/utils/roleAndStatusHelpers';

interface UserManagementTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onAssignHouse: (user: User) => void;
  onRemoveHouse: (user: User, houseNumber: number) => void;
  visibleColumnIds?: string[];
}

export function UserManagementTable({
  users,
  loading,
  onEdit,
  onRemoveHouse,
  visibleColumnIds = ['name', 'role', 'houses', 'actions'],
}: UserManagementTableProps) {
  const allColumns: TableColumn<User>[] = [
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
      render: (user) => <RoleBadge role={user.role} />,
    },
    {
      id: 'status',
      header: 'Estado',
      render: (user) => (
        <StatusBadge
          status={getStatusBadgeColor(user.status)}
          label={getStatusLabel(user.status)}
        />
      ),
    },
    {
      id: 'observations',
      header: 'Observaciones',
      render: (user) => (
        <div>
          {user.observations ? (
            <span className="text-foreground text-sm whitespace-pre-wrap break-words">{user.observations}</span>
          ) : (
            <span className="text-foreground-tertiary">-</span>
          )}
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
            </>
          ) : (
            <span className="text-foreground-tertiary text-sm">Sin casas asignadas</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (user) => (
        <Button
          variant="sm"
          onClick={() => onEdit(user)}
          className="bg-primary/30 hover:bg-primary/50"
        >
          Editar
        </Button>
      ),
    },
  ];

  // Filter columns based on visibleColumnIds
  const columns = allColumns.filter((col) => visibleColumnIds.includes(col.id));

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
