import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  use: {
    baseURL: process.env.KANBAN_SPA_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
});
