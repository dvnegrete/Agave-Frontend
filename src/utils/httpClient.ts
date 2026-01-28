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

        // Prevent infinite 401 loops
        if (currentRetries >= this.MAX_RETRIES_PER_ENDPOINT) {
          console.error(`Max retries (${this.MAX_RETRIES_PER_ENDPOINT}) exceeded, session expired`);
          this.requestCount.delete(requestKey);
          tokenManager.clearAll();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          // Clear retry count on successful refresh and retry
          this.requestCount.delete(requestKey);
          return this.request<T>(endpoint, method, options, retryCount + 1);
        } else {
          console.error('Token refresh failed, session expired');
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
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          resolve('refreshed');
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call backend refresh endpoint
      // Backend will automatically set new access_token cookie AND return in response
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      const data = await response.json();

      // Guardar nuevo accessToken si viene en la respuesta
      // (Para usar en Authorization header si cookies no funcionan)
      if (data.accessToken) {
        tokenManager.setAccessToken(data.accessToken);
      }

      // Notify all subscribers
      this.refreshSubscribers.forEach(cb => cb());
      this.refreshSubscribers = [];

      this.isRefreshing = false;
      return 'refreshed'; // Return truthy value to indicate success
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.isRefreshing = false;
      this.refreshSubscribers = [];

      // Clear tokens and redirect to login
      tokenManager.clearAll();
      window.location.href = '/login';
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
