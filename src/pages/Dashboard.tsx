import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, StatsCard, RoleBadge } from '@shared/ui';
import { useDashboardMetrics } from '@hooks/useDashboardMetrics';
import { useAuth } from '@hooks/useAuth';
import { DASHBOARD_FEATURES } from '@shared/constants';
import { isAdmin, isAdminOrOwner } from '@shared/utils/roleAndStatusHelpers';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metrics, isLoading, error, refetch } = useDashboardMetrics();
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(true);

  // Filtrar funcionalidades disponibles según rol
  const availableFeatures = DASHBOARD_FEATURES.filter((feature) => {
    if (!user?.role) return false;
    return feature.roles.some((r) => r === user.role);
  });

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
        <div className="border-l-4 border-error rounded-lg p-4 flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-error">Error al cargar métricas</h3>
            <p className="text-sm text-error-secondary">{error}</p>
          </div>
        </div>
      )}

      {/* Sección de Métricas */}
      {metrics && user?.role && isAdmin(user.role) && (
        <section className="space-y-3">
          {/* Header con botón de toggle en mobile */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">📈 Métricas del Sistema</h2>
            {/* Botón visible solo en mobile */}
            <button
              onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
              className="lg:hidden px-4 py-2 bg-primary text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
            >
              {isMetricsExpanded ? '▼ Ocultar' : '▶ Mostrar'}
            </button>
          </div>

          {/* Grid de métricas de Vouchers - Colapsable en mobile */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 transition-all duration-300 ${
              isMetricsExpanded ? 'opacity-100 visible' : 'hidden lg:grid opacity-100'
            }`}
          >
            {/* <StatsCard
              label="Confirmados"
              value={metrics.vouchers.confirmed}
              variant="success"
              icon="✓"
              className="!p-3"
            /> */}
            <StatsCard
              label="Pendientes"
              value={metrics.vouchers.pending}
              variant="warning"
              icon="⏳"
              className="!p-3"
            />
            {/* <StatsCard
              label="Total"
              value={metrics.vouchers.total}
              variant="primary"
              icon="📄"
              className="!p-3"
            /> */}

            {/* Métricas de Transacciones (admin/owner) */}
            {user?.role && isAdminOrOwner(user.role) && (
              <>
                <StatsCard
                  label="Trans. Total"
                  value={metrics.transactions.total}
                  variant="info"
                  icon="💳"
                  className="!p-3"
                />
                <StatsCard
                  label="Trans. Conciliadas"
                  value={metrics.transactions.reconciled}
                  variant="success"
                  icon="✓"
                  className="!p-3"
                />
                <StatsCard
                  label="Trans. Pendientes"
                  value={metrics.transactions.pending}
                  variant="warning"
                  icon="⏳"
                  className="!p-3"
                />

                {/* Métricas de Conciliación */}
                {/* <StatsCard
                  label="Validación Manual"
                  value={metrics.reconciliation.manualValidationRequired}
                  variant="warning"
                  icon="🔍"
                  className="!p-3"
                /> */}
                <StatsCard
                  label="Trans. Sin Reclamar"
                  value={metrics.reconciliation.unclaimedDeposits}
                  variant="error"
                  icon="🚨"
                  className="!p-3"
                />
              </>
            )}

            {/* Métricas de Usuarios (solo admin) */}
            {user?.role && isAdmin(user.role) && metrics.users && (
              <>
                <StatsCard
                  label="Total Usuarios"
                  value={metrics.users.total}
                  variant="primary"
                  icon="👥"
                  className="!p-3"
                />
                {/* <StatsCard
                  label="Activos"
                  value={metrics.users.active}
                  variant="success"
                  icon="✓"
                  className="!p-3"
                /> */}
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
