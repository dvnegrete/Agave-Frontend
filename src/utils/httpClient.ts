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

    console.log(`🌐 [HTTP] ${method} ${url} (retry: ${currentRetries}/${this.MAX_RETRIES_PER_ENDPOINT})`,
      options?.body ? { body: options.body } : '');

    // Merge custom headers with default content-type
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include', // Send cookies with every request
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

      console.log(`📡 [HTTP] Response Status: ${response.status} ${response.statusText}`);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/signin' && endpoint !== '/auth/oauth/signin' && endpoint !== '/auth/oauth/callback') {

        // Prevent infinite 401 loops
        if (currentRetries >= this.MAX_RETRIES_PER_ENDPOINT) {
          console.error(`❌ [HTTP] Max retries (${this.MAX_RETRIES_PER_ENDPOINT}) exceeded for ${requestKey}, giving up`);
          this.requestCount.delete(requestKey);
          tokenManager.clearAll();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        console.log('🔐 [HTTP] Received 401, attempting token refresh...');
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          // Clear retry count on successful refresh and retry
          this.requestCount.delete(requestKey);
          console.log('✅ [HTTP] Token refreshed, retrying request...');
          return this.request<T>(endpoint, method, options, retryCount + 1);
        } else {
          console.error('❌ [HTTP] Token refresh failed');
          throw new Error('Session expired. Please login again.');
        }
      }

      // Clear retry count on successful response
      if (response.ok) {
        this.requestCount.delete(requestKey);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [HTTP] Error Response:', errorData);
        throw new Error(
          errorData.message || `HTTP Error: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log('✅ [HTTP] Response Data:', jsonData);
        return jsonData;
      }

      return {} as T;
    } catch (error) {
      console.error('🚨 [HTTP] Request Failed:', error);
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
    console.log('🔐 [HTTP] handleTokenRefresh called, isRefreshing:', this.isRefreshing);

    if (this.isRefreshing) {
      console.log('🔐 [HTTP] Already refreshing, waiting for result...');
      // Wait for ongoing refresh
      return new Promise((resolve) => {
        this.refreshSubscribers.push(() => {
          console.log('🔐 [HTTP] Subscriber notified of refresh completion');
          resolve('refreshed');
        });
      });
    }

    this.isRefreshing = true;
    console.log('🔐 [HTTP] Starting token refresh');

    try {
      const refreshToken = tokenManager.getRefreshToken();
      console.log('🔐 [HTTP] Refresh token exists:', !!refreshToken);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call backend refresh endpoint
      // Backend will automatically set new access_token cookie
      console.log('🔐 [HTTP] Calling /auth/refresh endpoint...');
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      console.log('🔐 [HTTP] Refresh successful');

      // Notify all subscribers
      // Note: We don't return an access token since it's in the httpOnly cookie now
      console.log(`🔐 [HTTP] Notifying ${this.refreshSubscribers.length} subscribers`);
      this.refreshSubscribers.forEach(cb => cb());
      this.refreshSubscribers = [];

      this.isRefreshing = false;
      console.log('✅ [HTTP] Token refresh completed successfully');
      return 'refreshed'; // Return truthy value to indicate success
    } catch (error) {
      console.error('❌ [HTTP] Token refresh failed:', error);
      this.isRefreshing = false;
      this.refreshSubscribers = [];

      // Clear tokens and redirect to login
      console.log('❌ [HTTP] Clearing tokens and redirecting to login');
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
