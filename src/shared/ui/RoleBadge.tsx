import type { Role } from '@/shared/types/user-management.types';

interface RoleBadgeProps {
  role: Role;
}

const roleStyles: Record<
  Role,
  { bgClass: string; borderClass: string; textClass: string; icon: string; label: string }
> = {
  admin: {
    bgClass: 'bg-base',
    borderClass: 'border-error',
    textClass: 'text-error',
    icon: '👑',
    label: 'Administrador',
  },
  owner: {
    bgClass: 'bg-base',
    borderClass: 'border-warning',
    textClass: 'text-warning',
    icon: '🏠',
    label: 'Propietario',
  },
  tenant: {
    bgClass: 'bg-base',
    borderClass: 'border-info',
    textClass: 'text-info',
    icon: '👤',
    label: 'Inquilino',
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleStyles[role];

  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1 ${config.bgClass} ${config.borderClass} ${config.textClass}`}
    >
      {config.icon} {config.label}
    </span>
  );
}
