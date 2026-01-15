// API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type ApiStatus = 'checking' | 'online' | 'offline';

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  statusCode?: number;
}

// Layout props
export type BaseLayoutProps = {
    children: React.ReactNode
    showMenu?: boolean
}

// Menu item type
export interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

// Voucher Upload Steps
export type Step = 'upload' | 'review' | 'confirmed';