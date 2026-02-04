import { API_BASE_URL } from '@config/api';
import { tokenManager } from './tokenManager';

export interface HttpClientOptions {
  headers?: HeadersInit;
  body?: Record<string, unknown> | FormData;
  signal?: AbortSignal;
}

class HttpClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: (() => void)[] = [];
  private requestCount: Map<string, number> = new Map();
  private readonly MAX_RETRIES_PER_ENDPOINT = 3;
  private isRedirectingToLogin: boolean = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Main request method with cookie auth and 401 handling
   */
  private async request<T>(
    endpoint: string,
    method: string,
    options?: HttpClientOptions,
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestKey = `${method}:${endpoint}`;

    // Track retry count to prevent infinite loops
    const currentRetries = this.requestCount.get(requestKey) || 0;
    this.requestCount.set(requestKey, currentRetries + 1);

    // Merge custom headers with default content-type
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof options?.headers === 'object' && options?.headers !== null ? (options.headers as Record<string, string>) : {}),
    };

    // Agregar Authorization header si existe accessToken
    // Fallback para cuando cookies no se comparten entre dominios diferentes
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      signal: options?.signal,
    };

    if (options?.body) {
      if (options.body instanceof FormData) {
        delete (headers as Record<string, unknown>)['Content-Type'];
        config.body = options.body;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/signin' && endpoint !== '/auth/oauth/signin' && endpoint !== '/auth/oauth/callback') {
        console.log(`[httpClient] 401 recibido para ${endpoint} (retry #${currentRetries}/${this.MAX_RETRIES_PER_ENDPOINT})`);

        // Prevent infinite 401 loops
        if (currentRetries >= this.MAX_RETRIES_PER_ENDPOINT) {
          console.error(`[httpClient] ❌ Max retries (${this.MAX_RETRIES_PER_ENDPOINT}) exceeded for ${requestKey}, session expired`);
          this.requestCount.delete(requestKey);

          // Prevent multiple simultaneous redirects
          if (!this.isRedirectingToLogin) {
            this.isRedirectingToLogin = true;
            tokenManager.clearAll();
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please login again.');
        }

        console.log('[httpClient] Intentando refrescar token...');
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          console.log('[httpClient] ✅ Token refrescado, reintentando request...');
          // Clear retry count on successful refresh and retry
          this.requestCount.delete(requestKey);
          return this.request<T>(endpoint, method, options, retryCount + 1);
        } else {
          console.error('[httpClient] ❌ Token refresh failed, session expired');

          // Prevent multiple simultaneous redirects
          if (!this.isRedirectingToLogin) {
            this.isRedirectingToLogin = true;
            tokenManager.clearAll();
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please login again.');
        }
      }

      // Clear retry count on successful response
      if (response.ok) {
        this.requestCount.delete(requestKey);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('HTTP Error:', response.status, response.statusText);
        throw new Error(
          errorData.message || `HTTP Error: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        return jsonData;
      }

      return {} as T;
    } catch (error) {
      console.error('Request failed:', error);
      this.requestCount.delete(requestKey);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Handle token refresh with subscriber pattern
   * Ensures only one refresh happens even if multiple requests fail with 401
   * Backend automatically sets the new access token in the httpOnly cookie
   */
  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      console.log('[handleTokenRefresh] ⏳ Refresh ya en progreso, esperando...');
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          resolve('refreshed');
        });
      });
    }

    this.isRefreshing = true;
    console.log('[handleTokenRefresh] Iniciando refrescación de token...');

    try {
      const refreshToken = tokenManager.getRefreshToken();
      console.log('[handleTokenRefresh] Refresh token del storage:', refreshToken ? '✅ Existe' : '❌ No existe');

      if (!refreshToken) {
        console.warn('[handleTokenRefresh] ❌ No refresh token available - session has expired');
        throw new Error('No refresh token available');
      }

      console.log('[handleTokenRefresh] POST /auth/refresh...');
      // Call backend refresh endpoint
      // Backend will automatically set new access_token cookie AND return in response
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ refreshToken }),
      });

      console.log('[handleTokenRefresh] Respuesta del backend:', response.status);

      if (!response.ok) {
        // Backend retorna 401 si el refresh token está expirado o inválido
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Token refresh failed';

          console.error('[handleTokenRefresh] ❌ Refresh token invalid or expired:', errorMessage);
          throw new Error(`REFRESH_TOKEN_EXPIRED: ${errorMessage}`);
        }

        throw new Error(`Refresh failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('[handleTokenRefresh] Data del backend:', data);

      // Guardar nuevo accessToken si viene en la respuesta
      // (Para usar en Authorization header si cookies no funcionan)
      if (data.accessToken) {
        console.log('[handleTokenRefresh] ✅ Guardando nuevo accessToken...');
        tokenManager.setAccessToken(data.accessToken);
      }

      // Notify all subscribers
      this.refreshSubscribers.forEach(cb => cb());
      this.refreshSubscribers = [];

      this.isRefreshing = false;
      console.log('[handleTokenRefresh] ✅ Token refrescado exitosamente');
      return 'refreshed'; // Return truthy value to indicate success
    } catch (error) {
      console.error('[handleTokenRefresh] ❌ Token refresh failed:', error);
      this.isRefreshing = false;
      this.refreshSubscribers = [];

      // Detectar si es específicamente expiración del refresh token
      const isRefreshTokenExpired =
        error instanceof Error &&
        (error.message.includes('REFRESH_TOKEN_EXPIRED') ||
          error.message.includes('expirado') ||
          error.message.includes('expired'));

      if (isRefreshTokenExpired) {
        console.warn('[handleTokenRefresh] ⚠️ Refresh token has expired. Redirecting to login.');
      }

      // Clear tokens and redirect to login (prevent multiple redirects)
      if (!this.isRedirectingToLogin) {
        this.isRedirectingToLogin = true;
        console.warn('[handleTokenRefresh] 🔄 Limpiando tokens y redirigiendo a login...');
        tokenManager.clearAll();
        window.location.href = '/login';
      }
      return null;
    }
  }

  async get<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  async post<T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', { ...options, body });
  }

  async put<T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', { ...options, body });
  }

  async delete<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }

  async patch<T>(endpoint: string, body?: Record<string, unknown> | FormData, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', { ...options, body });
  }
}

export const httpClient = new HttpClient(API_BASE_URL);
