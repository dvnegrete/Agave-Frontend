type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'deposit' | 'withdrawal';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  icon?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'bg-success text-foreground-foreground-tertiary border border-light',
  warning: 'bg-base text-warning border border-warning',
  error: 'bg-base text-error border border-error',
  info: 'bg-info text-foreground border border-info/50',
  pending: 'bg-warning text-foreground border border-warning/50',
  deposit: 'bg-success text-foreground border border-success/50',
  withdrawal: 'bg-error text-foreground border border-error/50',
};

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const badgeStyle = statusStyles[status];

  return (
    <span className={`px-4 py-2 m-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full transition-all duration-200 shadow-sm ${badgeStyle}`}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
