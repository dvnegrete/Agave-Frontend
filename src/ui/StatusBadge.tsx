type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'deposit' | 'withdrawal';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  icon?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'bg-success/30 text-success border border-success/50',
  warning: 'bg-warning/30 text-warning border border-warning/50',
  error: 'bg-error/30 text-error border border-error/50',
  info: 'bg-info/30 text-info border border-info/50',
  pending: 'bg-warning/30 text-warning border border-warning/50',
  deposit: 'bg-success/30 text-success border border-success/50',
  withdrawal: 'bg-error/30 text-error border border-error/50',
};

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const badgeStyle = statusStyles[status];

  return (
    <span className={`px-4 py-2 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full transition-all duration-200 shadow-sm ${badgeStyle}`}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
