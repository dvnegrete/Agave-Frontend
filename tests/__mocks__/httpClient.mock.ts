import { vi } from 'vitest';

export const mockHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Helper para resetear mocks
export function resetHttpClientMock() {
  mockHttpClient.get.mockReset();
  mockHttpClient.post.mockReset();
  mockHttpClient.put.mockReset();
  mockHttpClient.patch.mockReset();
  mockHttpClient.delete.mockReset();
}

// Helper para configurar respuestas
export function mockHttpClientResponse(method: keyof typeof mockHttpClient, response: any) {
  mockHttpClient[method].mockResolvedValue(response);
}

export function mockHttpClientError(method: keyof typeof mockHttpClient, error: Error) {
  mockHttpClient[method].mockRejectedValue(error);
}
