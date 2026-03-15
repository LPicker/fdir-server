import path from 'node:path';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 10000,
  use: {
    baseURL: 'http://localhost:1024',
    screenshot: 'only-on-failure',
    // headless: false,
  },
  webServer: {
    command: `npx tsm src/test-server.ts 1024 ${path.resolve('test/fixtures')}`,
    port: 1024,
    timeout: 120000,
    reuseExistingServer: true,
  },
});
