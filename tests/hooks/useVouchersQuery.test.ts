import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useVouchersQuery } from '../../src/hooks/useVouchersQuery';
import { server } from '../__setup__/msw-server';
import { http, HttpResponse } from 'msw';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
}

describe('useVouchersQuery', () => {
  const mockVouchers = [
    {
      id: 1,
      date: '2024-01-01',
      authorization_number: 'AUTH001',
      confirmation_code: 'CONF001',
      amount: 1000,
      confirmation_status: true,
      url: 'http://example.com/voucher1.pdf',
      number_house: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      date: '2024-01-02',
      authorization_number: 'AUTH002',
      confirmation_code: 'CONF002',
      amount: 2000,
      confirmation_status: false,
      url: 'http://example.com/voucher2.pdf',
      number_house: 2,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    server.use(
      http.get('http://localhost:3000/vouchers', () => {
        return HttpResponse.json({
          vouchers: mockVouchers,
          total: 2,
          page: 1,
          limit: 10,
        });
      })
    );
  });

  it('should fetch vouchers successfully', async () => {
    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.vouchers).toEqual(mockVouchers);
    expect(result.current.total).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    // Estado inicial mientras se carga
    expect(result.current.isLoading).toBe(true);
  });

  it('should have setFilters function available', async () => {
    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.setFilters).toBe('function');
  });

  it('should have refetch function available', async () => {
    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should calculate total correctly', async () => {
    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.total).toBe(2);
    expect(result.current.vouchers.length).toBe(2);
  });

  it('should handle errors', async () => {
    server.use(
      http.get('http://localhost:3000/vouchers', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.vouchers).toEqual([]);
  });

  it('should accept initial query parameters', async () => {
    server.use(
      http.get('http://localhost:3000/vouchers', ({ request }) => {
        const url = new URL(request.url);
        const confirmationStatus = url.searchParams.get('confirmation_status');

        // Verificar que se pasó el parámetro
        if (confirmationStatus === 'true') {
          return HttpResponse.json({
            vouchers: [mockVouchers[0]],
            total: 1,
            page: 1,
            limit: 10,
          });
        }

        return HttpResponse.json({
          vouchers: mockVouchers,
          total: 2,
          page: 1,
          limit: 10,
        });
      })
    );

    const { result } = renderHook(
      () => useVouchersQuery({ confirmation_status: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.total).toBe(1);
    expect(result.current.vouchers).toHaveLength(1);
  });

  it('should expose isFetching state', async () => {
    const { result } = renderHook(() => useVouchersQuery(), {
      wrapper: createWrapper(),
    });

    // Mientras se carga, isFetching debería ser true
    expect(typeof result.current.isFetching).toBe('boolean');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Después de cargar, isFetching debería ser false
    expect(result.current.isFetching).toBe(false);
  });
});
