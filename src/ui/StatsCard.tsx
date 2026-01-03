type CardVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: CardVariant;
  icon?: string;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  primary: 'bg-blue-600/30 border-l-4 border-blue-500',
  success: 'bg-green-600/30 border-l-4 border-green-500',
  warning: 'bg-yellow-400/60 border-l-4 border-yellow-500',
  error: 'bg-red-700/30 border-l-4 border-red-500',
  info: 'bg-cyan-600/40 border-l-4 border-cyan-500',
};

const valueStyles: Record<CardVariant, string> = {
  primary: 'text-blue-700',
  success: 'text-green-800',
  warning: 'text-yellow-800',
  error: 'text-red-800',
  info: 'text-cyan-800',
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
