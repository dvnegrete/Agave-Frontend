import { useEffect, useMemo, useState } from 'react';
import { useTransactionsBank } from '@hooks/useTransactionsBank';
import { useUnfundedVouchersMutations } from '@hooks/useBankReconciliationEndpoints';
import { useFormatDate as formatDate } from '@hooks/useFormatDate';
import { useAlert } from '@hooks/useAlert';
import { Button, Modal, StatusBadge, Table, type TableColumn } from '@shared/ui';
import type { Voucher } from '@shared';
import type { UploadedTransaction } from '@shared/types/bank-transactions.types';
import { formatCurrency } from '@/utils/formatters';

const DAYS_RANGE = 7;
const MIN_HOUSE = 1;
const MAX_HOUSE = 66;
const DAY_MS = 24 * 60 * 60 * 1000;

interface ModalMatchVoucherDepositProps {
  voucher: Voucher | null;
  onClose: () => void;
}

type CandidateDeposit = UploadedTransaction & { amountMatches: boolean; daysDiff: number };

/** Fecha ISO → YYYY-MM-DD desplazada N días (UTC) */
function shiftDate(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Modal para asociar un voucher pendiente con un depósito bancario no conciliado.
 * Reutiliza POST /bank-reconciliation/unfunded-vouchers/:voucherId/match-deposit
 */
export function ModalMatchVoucherDeposit({ voucher, onClose }: ModalMatchVoucherDepositProps) {
  const alert = useAlert();
  const { matchDeposit, matching } = useUnfundedVouchersMutations();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [houseNumber, setHouseNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Reiniciar el formulario cada vez que se abre con otro voucher
  useEffect(() => {
    if (!voucher) return;
    setStartDate(shiftDate(voucher.date, -DAYS_RANGE));
    setEndDate(shiftDate(voucher.date, DAYS_RANGE));
    setSelectedId(null);
    setHouseNumber(voucher.number_house ? String(voucher.number_house) : '');
    setAdminNotes('');
  }, [voucher]);

  const query = useMemo(
    () => (voucher && startDate && endDate ? { startDate, endDate } : undefined),
    [voucher, startDate, endDate]
  );
  const { transactions, loading, error } = useTransactionsBank(query);

  // Solo depósitos no conciliados; primero los de mismo monto, luego por cercanía de fecha
  const candidates = useMemo<CandidateDeposit[]>(() => {
    if (!voucher) return [];
    const voucherTime = new Date(voucher.date).getTime();
    return (transactions as unknown as UploadedTransaction[])
      .filter((txn) => txn.is_deposit && txn.status !== 'reconciled')
      .map((txn) => ({
        ...txn,
        amountMatches: Math.abs(Number(txn.amount) - Number(voucher.amount)) < 0.01,
        daysDiff: Math.abs(new Date(txn.date).getTime() - voucherTime) / DAY_MS,
      }))
      .sort((a, b) => Number(b.amountMatches) - Number(a.amountMatches) || a.daysDiff - b.daysDiff);
  }, [transactions, voucher]);

  const handleSubmit = async (): Promise<void> => {
    if (!voucher) return;
    const house = Number(houseNumber);
    if (!selectedId) {
      alert.warning('Depósito requerido', 'Selecciona el movimiento bancario a asociar');
      return;
    }
    if (!Number.isInteger(house) || house < MIN_HOUSE || house > MAX_HOUSE) {
      alert.warning('Casa inválida', `El número de casa debe estar entre ${MIN_HOUSE} y ${MAX_HOUSE}`);
      return;
    }
    try {
      await matchDeposit(voucher.id, {
        transactionBankId: selectedId,
        houseNumber: house,
        adminNotes: adminNotes.trim() || undefined,
      });
      alert.success('Éxito', 'Voucher asociado al movimiento bancario');
      onClose();
    } catch (err) {
      console.error('Error matching voucher with deposit:', err);
      const message = err instanceof Error ? err.message : '';
      alert.error('No se pudo asociar el voucher', message);
    }
  };

  const columns: TableColumn<CandidateDeposit>[] = [
    {
      id: 'select',
      header: '',
      align: 'center',
      render: (txn) => (
        <input
          type="radio"
          name="deposit"
          checked={selectedId === txn.id}
          onChange={() => setSelectedId(txn.id)}
          className="w-4 h-4 accent-primary cursor-pointer"
          aria-label={`Seleccionar depósito ${txn.id}`}
        />
      ),
    },
    { id: 'date', header: 'Fecha', align: 'center', render: (txn) => formatDate(txn.date) },
    { id: 'time', header: 'Hora', align: 'center', render: (txn) => txn.time || '—' },
    {
      id: 'amount',
      header: 'Monto',
      align: 'right',
      render: (txn) => (
        <span className="font-bold text-success">
          ${formatCurrency(Number(txn.amount))}
          {txn.amountMatches && (
            <span className="ml-2">
              <StatusBadge status="success" label="Monto coincide" icon="✓" />
            </span>
          )}
        </span>
      ),
    },
    { id: 'concept', header: 'Concepto', align: 'left', render: (txn) => txn.concept || '—' },
    { id: 'bank', header: 'Banco', align: 'center', render: (txn) => txn.bank_name || '—' },
  ];

  const inputClasses =
    'w-full mt-1 px-3 py-2 bg-base border border-base rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <Modal isOpen={!!voucher} onClose={onClose} title="Asociar voucher a movimiento bancario" maxWidth="lg">
      {voucher && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm bg-tertiary rounded-lg p-3">
            <div>
              <span className="text-foreground-secondary">Casa</span>
              <p className="font-semibold">{voucher.number_house ?? '—'}</p>
            </div>
            <div>
              <span className="text-foreground-secondary">Fecha</span>
              <p className="font-semibold">{formatDate(voucher.date)}</p>
            </div>
            <div>
              <span className="text-foreground-secondary">Monto</span>
              <p className="font-semibold text-primary-light">${formatCurrency(voucher.amount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Desde
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} />
            </label>
            <label className="text-sm font-medium">
              Hasta
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClasses} />
            </label>
          </div>

          {error && <div className="border border-error text-error px-3 py-2 rounded text-sm">{error}</div>}

          {loading ? (
            <p className="text-center text-foreground-secondary py-4">Cargando movimientos...</p>
          ) : (
            <Table
              columns={columns}
              data={candidates}
              keyField="id"
              maxHeight="300px"
              variant="compact"
              emptyMessage="No hay depósitos sin conciliar en este rango de fechas"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Número de casa ({MIN_HOUSE}-{MAX_HOUSE})
              <input
                type="number"
                min={MIN_HOUSE}
                max={MAX_HOUSE}
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                className={inputClasses}
              />
            </label>
            <label className="text-sm font-medium">
              Notas (opcional)
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={inputClasses}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              variant="success"
              isLoading={matching}
              disabled={matching || !selectedId}
              className="flex-1"
            >
              🔗 Asociar
            </Button>
            <Button onClick={onClose} variant="sameUi" className="flex-1" disabled={matching}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
