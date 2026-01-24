import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Environment
      environment: 'jsdom',

      // Setup files
      setupFiles: ['./tests/__setup__/setup.ts'],

      // Globals
      globals: true,

      // CSS handling
      css: true,

      // Coverage configuration
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'tests/__setup__/',
          'tests/__mocks__/',
          '**/*.config.{js,ts}',
          '**/main.tsx',
          '**/vite-env.d.ts',
          '**/*.d.ts',
          '**/types/',
          '**/dist/',
        ],
        // Coverage thresholds
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 65,
          statements: 70,
        },
      },

      // Include/Exclude patterns
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

      // Test timeout
      testTimeout: 10000,

      // Hooks timeout
      hookTimeout: 10000,

      // Reporters
      reporters: ['verbose'],

      // Mock reset
      clearMocks: true,
      restoreMocks: true,
      mockReset: true,
    },
  })
);
