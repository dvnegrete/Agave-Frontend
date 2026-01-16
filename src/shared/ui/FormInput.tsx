interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  optional?: boolean;
  min?: string | number;
  max?: string | number;
}

export function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = true,
  disabled = false,
  optional = false,
  min,
  max,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {optional && <span className="text-foreground-tertiary text-xs font-normal"> (Opcional)</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className="px-4 py-3 bg-base border-2 border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-foreground-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
