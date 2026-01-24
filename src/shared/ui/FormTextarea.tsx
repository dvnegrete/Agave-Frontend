interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  optional?: boolean;
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  disabled = false,
  maxLength,
  showCounter = false,
  optional = false,
}: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
          {optional && <span className="text-foreground-tertiary text-xs font-normal"> (Opcional)</span>}
        </label>
        {showCounter && maxLength && (
          <span className="text-xs text-foreground-tertiary">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      />
    </div>
  );
}
