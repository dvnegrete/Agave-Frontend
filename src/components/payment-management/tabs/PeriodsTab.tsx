import { useState } from 'react';
import { usePeriodsQuery, useUpdatePeriodConceptsMutation } from '@hooks/usePaymentManagement';
import { Table, type TableColumn } from '@shared/ui';
import type { PeriodResponseDto } from '@shared';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : '—';

export function PeriodsTab() {
  const { periods, isLoading, error } = usePeriodsQuery();
  const { updateConcepts, isPending } = useUpdatePeriodConceptsMutation();

  // Edición inline del día límite
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEdit = (period: PeriodResponseDto) => {
    setEditingId(period.id);
    setEditValue(period.payment_due_day != null ? String(period.payment_due_day) : '');
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setSaveError(null);
  };

  const saveEdit = async (periodId: number) => {
    const parsed = editValue === '' ? null : parseInt(editValue, 10);
    if (parsed !== null && (parsed < 1 || parsed > 28)) {
      setSaveError('El día debe estar entre 1 y 28');
      return;
    }
    try {
      await updateConcepts({ periodId, data: { payment_due_day: parsed } });
      setEditingId(null);
      setEditValue('');
      setSaveError(null);
    } catch {
      setSaveError('Error al guardar');
    }
  };

  const columns: TableColumn<PeriodResponseDto>[] = [
    {
      id: 'period',
      header: 'Período',
      render: (p) => (
        <span className="font-medium">
          {MONTH_NAMES[p.month - 1]} {p.year}
        </span>
      ),
    },
    {
      id: 'start_date',
      header: 'Fecha Inicio',
      align: 'center',
      render: (p) => formatDate(p.start_date),
    },
    {
      id: 'end_date',
      header: 'Fecha Fin',
      align: 'center',
      render: (p) => formatDate(p.end_date),
    },
    {
      id: 'payment_due_day',
      header: 'Día Límite de Pago',
      align: 'center',
      render: (p) => {
        if (editingId === p.id) {
          return (
            <div className="flex items-center justify-center gap-1">
              <input
                type="number"
                min="1"
                max="28"
                autoFocus
                className="w-16 rounded border border-foreground/30 bg-base px-2 py-1 text-center text-sm"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="—"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(p.id);
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
              <button
                onClick={() => saveEdit(p.id)}
                disabled={isPending}
                className="text-success hover:opacity-80 text-base px-1 disabled:opacity-40"
                title="Guardar"
              >
                ✓
              </button>
              <button
                onClick={cancelEdit}
                className="text-error hover:opacity-80 text-base px-1"
                title="Cancelar"
              >
                ✗
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2 group">
            <span
              className={
                p.payment_due_day != null
                  ? 'font-medium'
                  : 'text-foreground/40 italic text-sm'
              }
            >
              {p.payment_due_day != null ? `Día ${p.payment_due_day}` : 'Usar config'}
            </span>
            <button
              onClick={() => startEdit(p)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/50 hover:text-primary text-sm"
              title="Editar día límite"
            >
              ✎
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-secondary shadow-lg rounded-lg border-4 border-primary/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">📋 Períodos de Facturación</h2>
        <p className="text-sm text-foreground/50">
          Pasa el cursor sobre "Día Límite" para editar
        </p>
      </div>

      {(error || saveError) && (
        <div className="border-l-4 border-error rounded-lg p-4 mb-4">
          <p className="text-error font-semibold text-sm">{error || saveError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-foreground/60">Cargando períodos...</div>
      ) : (
        <Table
          columns={columns}
          data={periods}
          keyField="id"
          emptyMessage="No hay períodos registrados"
          hoverable
        />
      )}
    </div>
  );
}
