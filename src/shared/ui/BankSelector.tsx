interface BankSelectorProps {
  value: string;
  customValue: string;
  onBankChange: (bank: string) => void;
  onCustomChange: (custom: string) => void;
  predefinedBanks: string[];
  disabled?: boolean;
  customPlaceholder?: string;
  customHint?: string;
}

export function BankSelector({
  value,
  customValue,
  onBankChange,
  onCustomChange,
  predefinedBanks,
  disabled = false,
  customPlaceholder = 'Ej: Scotiabank, Inbursa, HSBC',
  customHint = '💡 Ingresa el nombre exacto del banco para identificar la fuente de los registros',
}: BankSelectorProps) {
  return (
    <div className="mb-6 p-4 bg-info border border-info rounded-lg">
      <label className="block text-sm font-semibold text-foreground mb-4">
        🏦 Selecciona el Banco Origen:
      </label>

      {/* Predefined Banks */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {predefinedBanks.map((bank) => (
            <label key={bank} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="bankSelection"
                value={bank}
                checked={value === bank}
                onChange={() => {
                  onBankChange(bank);
                  onCustomChange('');
                }}
                disabled={disabled}
                className="mr-3 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-foreground">{bank}</span>
            </label>
          ))}

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="bankSelection"
              value="custom"
              checked={value === 'custom'}
              onChange={() => onBankChange('custom')}
              disabled={disabled}
              className="mr-3 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">Otro Banco</span>
          </label>
        </div>
      </div>

      {/* Custom Bank Input */}
      {value === 'custom' && (
        <div className="mt-4 p-3 bg-base border border-light rounded-md">
          <label className="block text-xs font-semibold text-info mb-2 uppercase tracking-wide">
            Nombre del Banco
          </label>
          <input
            type="text"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={customPlaceholder}
            disabled={disabled}
            className="w-full px-3 py-2 border border-base rounded-md bg-secondary text-info focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-foreground-secondary mt-2">{customHint}</p>
        </div>
      )}
    </div>
  );
}
