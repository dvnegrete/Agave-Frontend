import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// API Base URL
const API_BASE_URL = 'http://localhost:3000';

// Handlers por defecto
export const handlers = [
  // Vouchers endpoints
  http.get(`${API_BASE_URL}/vouchers`, () => {
    return HttpResponse.json({
      vouchers: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  }),

  http.get(`${API_BASE_URL}/vouchers/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      date: '2024-01-01',
      authorization_number: 'AUTH123',
      confirmation_code: 'CONF123',
      amount: 1000,
      confirmation_status: true,
      url: 'http://example.com/voucher.pdf',
      number_house: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });
  }),

  http.post(`${API_BASE_URL}/vouchers`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Voucher created',
      data: { id: 1, ...data },
    });
  }),

  http.put(`${API_BASE_URL}/vouchers/:id`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Voucher updated',
      data: { id: 1, ...data },
    });
  }),

  http.delete(`${API_BASE_URL}/vouchers/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Voucher deleted',
    });
  }),

  // Transactions Bank endpoints
  http.get(`${API_BASE_URL}/transactions-bank`, () => {
    return HttpResponse.json({
      transactions: [],
      total: 0,
    });
  }),

  http.post(`${API_BASE_URL}/transactions-bank/upload`, async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json({
      success: true,
      message: 'Transactions uploaded',
      data: { uploaded: formData.getAll('files').length },
    });
  }),

  // Payment Management endpoints
  http.get(`${API_BASE_URL}/payment-management/periods`, () => {
    return HttpResponse.json({
      periods: [],
      total: 0,
    });
  }),

  http.get(`${API_BASE_URL}/payment-management/config`, () => {
    return HttpResponse.json({
      config: {
        year: 2024,
        period: 1,
      },
    });
  }),

  http.get(`${API_BASE_URL}/payment-management/houses/:houseId/payments`, () => {
    return HttpResponse.json({
      history: [],
    });
  }),

  http.get(`${API_BASE_URL}/payment-management/houses/:houseId/balance`, () => {
    return HttpResponse.json({
      balance: {
        house_id: 1,
        balance: 0,
        status: 'balanced',
      },
    });
  }),

  // Bank Reconciliation endpoints
  http.post(`${API_BASE_URL}/bank-reconciliation/start`, async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Reconciliation started',
      data: data,
    });
  }),

  // Unclaimed Deposits endpoints
  http.get(`${API_BASE_URL}/unclaimed-deposits`, () => {
    return HttpResponse.json({
      deposits: [],
      total: 0,
    });
  }),
];

// Create server
export const server = setupServer(...handlers);
