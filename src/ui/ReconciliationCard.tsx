import { Button } from './Button';

export interface PossibleMatch {
  transactionId?: number;
  amount?: number;
  date: string;
  matchScore?: number;
}

export interface ReconciliationCardProps {
  voucherId?: number;
  amount?: number;
  date: string;
  reason?: string;
  possibleMatches?: PossibleMatch[];
  onConciliate: (transactionId: number) => void;
  isProcessing?: boolean;
  formatDate: (date: string) => string;
}

export function ReconciliationCard({
  voucherId,
  amount,
  date,
  reason,
  possibleMatches = [],
  onConciliate,
  isProcessing = false,
  formatDate,
}: ReconciliationCardProps) {
  return (
    <div className="border border-error/30 rounded-lg p-4 bg-error/5">
      <div className="mb-3">
        <h3 className="font-semibold text-error">
          Voucher #{voucherId ?? 'N/A'} - $
          {amount ? amount.toFixed(2) : '0.00'}
        </h3>
        <p className="text-sm text-foreground-secondary">Fecha: {formatDate(date)}</p>
        <p className="text-sm text-error mt-1">{reason || 'Sin razón especificada'}</p>
      </div>
      <div className="bg-base rounded p-3">
        <p className="text-sm font-medium text-foreground mb-2">Posibles coincidencias:</p>
        <div className="space-y-2">
          {possibleMatches?.map((match, matchIdx) => (
            <div key={matchIdx} className="flex items-center justify-between p-2 border border-base rounded hover:bg-secondary transition-colors">
              <div className="flex-1">
                <div>
                  <span className="text-sm font-medium">
                    Transacción #{match.transactionId ?? 'N/A'}
                  </span>
                  <span className="ml-3 text-xs text-foreground-tertiary">
                    Monto: ${match.amount ? match.amount.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="text-xs text-foreground-tertiary mt-1">
                  Fecha: {formatDate(match.date)} | Score:{' '}
                  {match.matchScore ? (match.matchScore * 100).toFixed(0) : '0'}%
                </div>
              </div>
              <Button
                onClick={() => {
                  if (match.transactionId) {
                    onConciliate(match.transactionId);
                  }
                }}
                disabled={isProcessing || !match.transactionId}
                isLoading={isProcessing}
                variant="info"
                className="ml-3 text-sm py-1 px-3"
              >
                Conciliar
              </Button>
            </div>
          )) ?? []}
        </div>
      </div>
    </div>
  );
}
