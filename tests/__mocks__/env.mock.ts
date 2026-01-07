import { vi } from 'vitest';

export const mockEnv = {
  VITE_API_BASE_URL: 'http://localhost:3000',
};

// Para tests específicos
export function setMockEnv(key: string, value: string) {
  vi.stubEnv(key, value);
}

export function resetMockEnv() {
  vi.unstubAllEnvs();
}
