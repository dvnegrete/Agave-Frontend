import { Button } from './Button';

export interface PossibleVoucher {
  voucherId: number;
  similarity: number;
  dateDifferenceHours?: number;
}

export interface ReconciliationCardProps {
  transactionBankId: string;
  reason: string;
  possibleMatches: PossibleVoucher[];
  onConciliate: (voucherId: number) => void;
  isProcessing?: boolean;
}

export function ReconciliationCard({
  transactionBankId,
  reason,
  possibleMatches = [],
  onConciliate,
  isProcessing = false,
}: ReconciliationCardProps) {
  return (
    <div className="border border-error/30 rounded-lg p-4 bg-error/5">
      <div className="mb-3">
        <h3 className="font-semibold text-error">
          Transacción Bancaria #{transactionBankId}
        </h3>
        <p className="text-sm text-error mt-1">{reason || 'Sin razón especificada'}</p>
      </div>
      <div className="bg-base rounded p-3">
        <p className="text-sm font-medium text-foreground mb-2">Posibles vouchers coincidentes:</p>
        <div className="space-y-2">
          {possibleMatches?.map((match, matchIdx) => (
            <div key={matchIdx} className="flex items-center justify-between p-2 border border-base rounded hover:bg-secondary transition-colors">
              <div className="flex-1">
                <div>
                  <span className="text-sm font-medium">
                    Voucher #{match.voucherId}
                  </span>
                  <span className="ml-3 text-xs text-foreground-tertiary">
                    Similitud: {(match.similarity * 100).toFixed(0)}%
                  </span>
                </div>
                {match.dateDifferenceHours !== undefined && (
                  <div className="text-xs text-foreground-tertiary mt-1">
                    Diferencia de fecha: {match.dateDifferenceHours.toFixed(2)} horas
                  </div>
                )}
              </div>
              <Button
                onClick={() => onConciliate(match.voucherId)}
                disabled={isProcessing}
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
