import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../__setup__/msw-server';
import { http, HttpResponse } from 'msw';
import {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../../src/services/voucherService';

describe('voucherService', () => {
  const API_URL = 'http://localhost:3000';

  describe('getVouchers', () => {
    it('should fetch all vouchers without filters', async () => {
      const mockResponse = {
        vouchers: [
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
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      server.use(
        http.get(`${API_URL}/vouchers`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await getVouchers();

      expect(result).toEqual(mockResponse);
      expect(result.vouchers).toHaveLength(1);
    });

    it('should fetch vouchers with filters', async () => {
      server.use(
        http.get(`${API_URL}/vouchers`, ({ request }) => {
          const url = new URL(request.url);
          const confirmationStatus = url.searchParams.get('confirmation_status');

          expect(confirmationStatus).toBe('true');

          return HttpResponse.json({
            vouchers: [],
            total: 0,
            page: 1,
            limit: 10,
          });
        })
      );

      await getVouchers({ confirmation_status: true });
    });

    it('should handle date range filters', async () => {
      server.use(
        http.get(`${API_URL}/vouchers`, ({ request }) => {
          const url = new URL(request.url);
          const startDate = url.searchParams.get('startDate');
          const endDate = url.searchParams.get('endDate');

          expect(startDate).toBe('2024-01-01');
          expect(endDate).toBe('2024-01-31');

          return HttpResponse.json({
            vouchers: [],
            total: 0,
            page: 1,
            limit: 10,
          });
        })
      );

      await getVouchers({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  describe('getVoucherById', () => {
    it('should fetch a single voucher by ID', async () => {
      const mockVoucher = {
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
      };

      server.use(
        http.get(`${API_URL}/vouchers/1`, () => {
          return HttpResponse.json(mockVoucher);
        })
      );

      const result = await getVoucherById('1');

      expect(result).toEqual(mockVoucher);
      expect(result.id).toBe(1);
    });

    it('should handle 404 error for non-existent voucher', async () => {
      server.use(
        http.get(`${API_URL}/vouchers/999`, () => {
          return HttpResponse.json(
            { message: 'Voucher not found' },
            { status: 404 }
          );
        })
      );

      await expect(getVoucherById('999')).rejects.toThrow();
    });
  });

  describe('createVoucher', () => {
    it('should create a new voucher', async () => {
      const newVoucherData = {
        date: '2024-01-01',
        authorization_number: 'AUTH003',
        confirmation_code: 'CONF003',
        amount: 1500,
        confirmation_status: false,
        url: 'http://example.com/voucher3.pdf',
      };

      server.use(
        http.post(`${API_URL}/vouchers`, async ({ request }) => {
          const body = await request.json();

          expect(body).toEqual(newVoucherData);

          return HttpResponse.json({
            success: true,
            message: 'Voucher created successfully',
            data: { id: 3, ...body },
          });
        })
      );

      const result = await createVoucher(newVoucherData as any);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(3);
    });
  });

  describe('updateVoucher', () => {
    it('should update an existing voucher', async () => {
      const updateData = {
        confirmation_status: true,
      };

      server.use(
        http.put(`${API_URL}/vouchers/1`, async ({ request }) => {
          const body = await request.json();

          expect(body).toEqual(updateData);

          return HttpResponse.json({
            success: true,
            message: 'Voucher updated successfully',
            data: { id: 1, ...body },
          });
        })
      );

      const result = await updateVoucher('1', updateData as any);

      expect(result.success).toBe(true);
    });
  });

  describe('deleteVoucher', () => {
    it('should delete a voucher', async () => {
      server.use(
        http.delete(`${API_URL}/vouchers/1`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Voucher deleted successfully',
          });
        })
      );

      const result = await deleteVoucher('1');

      expect(result.success).toBe(true);
    });

    it('should handle delete errors', async () => {
      server.use(
        http.delete(`${API_URL}/vouchers/999`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete voucher' },
            { status: 400 }
          );
        })
      );

      await expect(deleteVoucher('999')).rejects.toThrow();
    });
  });
});
