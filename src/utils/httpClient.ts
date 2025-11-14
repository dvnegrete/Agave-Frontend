import { API_BASE_URL } from '../config/api';

export interface HttpClientOptions {
  headers?: HeadersInit;
  body?: any;
  signal?: AbortSignal;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    options?: HttpClientOptions
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (options?.body) {
      if (options.body instanceof FormData) {
        delete (headers as any)['Content-Type'];
        config.body = options.body;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      console.log(`🌐 [HTTP] ${method} ${url}`, options?.body ? { body: options.body } : '');

      const response = await fetch(url, config);

      console.log(`📡 [HTTP] Response Status: ${response.status} ${response.statusText}`);

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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', options);
  }

  async post<T>(endpoint: string, body?: any, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', { ...options, body });
  }

  async put<T>(endpoint: string, body?: any, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', { ...options, body });
  }

  async delete<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', options);
  }

  async patch<T>(endpoint: string, body?: any, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', { ...options, body });
  }
}

export const httpClient = new HttpClient(API_BASE_URL);
