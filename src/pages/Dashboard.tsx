import { useNavigate } from 'react-router-dom';
import { Button, StatsCard, RoleBadge } from '@shared/ui';
import { useDashboardMetrics } from '@hooks/useDashboardMetrics';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@shared/constants';

interface DashboardFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  roles: Array<'admin' | 'owner' | 'tenant'>;
}

const DASHBOARD_FEATURES: DashboardFeature[] = [
  {
    id: 'vouchers',
    title: 'Comprobantes',
    description: 'Gestiona comprobantes de mantenimiento',
    icon: '📄',
    route: ROUTES.VOUCHER_LIST,
    roles: ['admin', 'owner', 'tenant'],
  },
  {
    id: 'transactions',
    title: 'Transacciones Bancarias',
    description: 'Sube y monitorea transacciones bancarias',
    icon: '💳',
    route: ROUTES.TRANSACTION_UPLOAD,
    roles: ['admin', 'owner'],
  },
  {
    id: 'reconciliation',
    title: 'Conciliación Bancaria',
    description: 'Concilia transacciones con vouchers',
    icon: '⚖️',
    route: ROUTES.BANK_RECONCILIATION,
    roles: ['admin', 'owner'],
  },
  {
    id: 'payments',
    title: 'Gestión de Pagos',
    description: 'Administra pagos de propiedades',
    icon: '💰',
    route: ROUTES.PAYMENT_MANAGEMENT,
    roles: ['admin', 'owner'],
  },
  {
    id: 'historical',
    title: 'Registros Históricos',
    description: 'Carga registros históricos de datos',
    icon: '📚',
    route: ROUTES.HISTORICAL_RECORDS_UPLOAD,
    roles: ['admin'],
  },
  {
    id: 'users',
    title: 'Administración de Usuarios',
    description: 'Gestiona usuarios del sistema',
    icon: '👥',
    route: ROUTES.USER_MANAGEMENT,
    roles: ['admin'],
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metrics, isLoading, error, refetch } = useDashboardMetrics();

  // Filtrar funcionalidades disponibles según rol
  const availableFeatures = DASHBOARD_FEATURES.filter((feature) =>
    user?.role ? feature.roles.includes(user.role as 'admin' | 'owner' | 'tenant') : false
  );

  // Mostrar spinner mientras carga
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container flex-1 mx-auto p-4 space-y-6">
      {/* Header */}
      <header className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              📊 Dashboard
            </h1>
            <p className="text-foreground-secondary mt-2">
              Bienvenido, <span className="font-semibold">{user?.firstName || user?.email}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {user?.role && <RoleBadge role={user.role as any} />}
            <Button
              onClick={() => refetch()}
              variant="primary"
              className="whitespace-nowrap"
            >
              🔄 Actualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-error/20 border-l-4 border-error rounded-lg p-4 flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-error">Error al cargar métricas</h3>
            <p className="text-sm text-error-secondary">{error}</p>
          </div>
        </div>
      )}

      {/* Sección de Métricas */}
      {metrics && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">📈 Métricas del Sistema</h2>

          {/* Grid de métricas de Vouchers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              label="Comprobantes Confirmados"
              value={metrics.vouchers.confirmed}
              variant="success"
              icon="✓"
            />
            <StatsCard
              label="Comprobantes Pendientes"
              value={metrics.vouchers.pending}
              variant="warning"
              icon="⏳"
            />
            <StatsCard
              label="Total de Comprobantes"
              value={metrics.vouchers.total}
              variant="primary"
              icon="📄"
            />

            {/* Métricas de Transacciones (admin/owner) */}
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <>
                <StatsCard
                  label="Transacciones Totales"
                  value={metrics.transactions.total}
                  variant="info"
                  icon="💳"
                />
                <StatsCard
                  label="Transacciones Reconciliadas"
                  value={metrics.transactions.reconciled}
                  variant="success"
                  icon="✓"
                />
                <StatsCard
                  label="Transacciones Pendientes"
                  value={metrics.transactions.pending}
                  variant="warning"
                  icon="⏳"
                />

                {/* Métricas de Conciliación */}
                <StatsCard
                  label="Validaciones Manuales Requeridas"
                  value={metrics.reconciliation.manualValidationRequired}
                  variant="warning"
                  icon="🔍"
                />
                <StatsCard
                  label="Depósitos No Reclamados"
                  value={metrics.reconciliation.unclaimedDeposits}
                  variant="error"
                  icon="🚨"
                />
              </>
            )}

            {/* Métricas de Usuarios (solo admin) */}
            {user?.role === 'admin' && metrics.users && (
              <>
                <StatsCard
                  label="Total de Usuarios"
                  value={metrics.users.total}
                  variant="primary"
                  icon="👥"
                />
                <StatsCard
                  label="Usuarios Activos"
                  value={metrics.users.active}
                  variant="success"
                  icon="✓"
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Sección de Navegación */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">🚀 Funcionalidades</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => navigate(feature.route)}
              className="bg-secondary border-2 border-primary/20 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg hover:scale-105"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-foreground-secondary">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center text-primary font-semibold text-sm">
                Ir →
              </div>
            </div>
          ))}
        </div>

        {availableFeatures.length === 0 && (
          <div className="bg-warning/20 border-l-4 border-warning rounded-lg p-4">
            <p className="text-foreground-secondary">
              No hay funcionalidades disponibles para tu rol.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
