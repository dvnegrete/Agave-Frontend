type CardVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: CardVariant;
  icon?: string;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  primary: 'bg-blue-50 border-l-4 border-primary',
  success: 'bg-success/10 border-l-4 border-success',
  warning: 'bg-warning/10 border-l-4 border-warning',
  error: 'bg-error/10 border-l-4 border-error',
  info: 'bg-info/10 border-l-4 border-info',
};

const valueStyles: Record<CardVariant, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export function StatsCard({
  label,
  value,
  variant = 'primary',
  icon,
  className = '',
}: StatsCardProps) {
  const cardStyle = variantStyles[variant];
  const valueStyle = valueStyles[variant];

  return (
    <div className={`${cardStyle} p-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-sm font-semibold text-foreground-secondary">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${valueStyle}`}>{value}</p>
    </div>
  );
}
