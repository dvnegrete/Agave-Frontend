import { useState, useEffect } from 'react';
import {
  type Voucher,
  type VoucherQuery,
  type CreateVoucherRequest,
  type UpdateVoucherRequest,
} from '@shared/types/vouchers.types'
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '@services/voucherService';

interface UseVouchersReturn {
  vouchers: Voucher[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

interface UseVoucherReturn {
  voucher: Voucher | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseVoucherMutationsReturn {
  create: (data: CreateVoucherRequest) => Promise<Voucher | undefined>;
  update: (id: string, data: UpdateVoucherRequest) => Promise<Voucher | undefined>;
  remove: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useVouchers = (query?: VoucherQuery): UseVouchersReturn => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(query?.page || 1);
  const [limit, setLimit] = useState(query?.limit || 10);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getVouchers(
          { ...query, page, limit },
          abortController.signal
        );
        setVouchers(response.vouchers);
        setTotal(response.total);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();

    return () => abortController.abort();
  }, [query?.confirmation_status, query?.startDate, query?.endDate, page, limit]);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVouchers({ ...query, page, limit });
      setVouchers(response.vouchers);
      setTotal(response.total);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    vouchers,
    loading,
    error,
    total,
    page,
    limit,
    setPage,
    setLimit,
    refetch,
  };
};

export const useVoucher = (id: string): UseVoucherReturn => {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchVoucher = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getVoucherById(id, abortController.signal);
        setVoucher(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();

    return () => abortController.abort();
  }, [id]);

  const refetch = async (): Promise<void> => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getVoucherById(id);
      setVoucher(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { voucher, loading, error, refetch };
};

export const useVoucherMutations = (): UseVoucherMutationsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateVoucherRequest): Promise<Voucher | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createVoucher(data);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: UpdateVoucherRequest): Promise<Voucher | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateVoucher(id, data);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteVoucher(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  return { create, update, remove, loading, error };
};
