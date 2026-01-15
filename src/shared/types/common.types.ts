// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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