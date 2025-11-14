import { useState, useEffect } from 'react';
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  type Voucher,
  type VoucherQuery,
  type CreateVoucherRequest,
  type UpdateVoucherRequest,
} from '../services';

export const useVouchers = (query?: VoucherQuery) => {
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
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();

    return () => abortController.abort();
  }, [query?.status, query?.startDate, query?.endDate, page, limit]);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVouchers({ ...query, page, limit });
      setVouchers(response.vouchers);
      setTotal(response.total);
    } catch (err) {
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

export const useVoucher = (id: string) => {
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
      } catch (err) {
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

  const refetch = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getVoucherById(id);
      setVoucher(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { voucher, loading, error, refetch };
};

export const useVoucherMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateVoucherRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createVoucher(data);
      return response.data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: UpdateVoucherRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateVoucher(id, data);
      return response.data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteVoucher(id);
    } catch (err) {
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
