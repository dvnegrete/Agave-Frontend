import type { HouseStatus } from '@shared';

export function getHouseStatusVariant(status: HouseStatus): 'success' | 'info' | 'error' {
  switch (status) {
    case 'al_dia': return 'success';
    case 'saldo_a_favor': return 'info';
    case 'morosa': return 'error';
  }
}

export function getHouseStatusLabel(status: HouseStatus): string {
  switch (status) {
    case 'al_dia': return 'Al Día';
    case 'saldo_a_favor': return 'Saldo a Favor';
    case 'morosa': return 'Morosa';
  }
}

export function getHouseStatusIcon(status: HouseStatus): string {
  switch (status) {
    case 'al_dia': return '✅';
    case 'saldo_a_favor': return '💚';
    case 'morosa': return '🔴';
  }
}

export function getPeriodStatusVariant(status: string): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'unpaid': return 'error';
    default: return 'error';
  }
}

export function getPeriodStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Pagado';
    case 'partial': return 'Parcial';
    case 'unpaid': return 'No Pagado';
    default: return status;
  }
}

export function getConceptLabel(conceptType: string): string {
  switch (conceptType) {
    case 'maintenance': return 'Mantenimiento';
    case 'water': return 'Agua';
    case 'extraordinary_fee': return 'Cuota Extraordinaria';
    case 'penalties': return 'Penalidad';
    default: return conceptType.replace(/_/g, ' ');
  }
}
