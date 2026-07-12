import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'dist/playwright-report' }]],
  use: {
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
    {
      name: 'mobile-chrome',
      use: devices['Pixel 5'],
    },
  ],
  webServer: process.env.CI
    ? {
        command: 'pnpm preview',
        url: 'http://localhost:4173',
        reuseExistingServer: false,
        env: {
          VITE_ENABLE_MOCK: 'true',
          VITE_SENTRY_DSN: '',
        },
      }
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        env: {
          VITE_ENABLE_MOCK: 'true',
          VITE_SENTRY_DSN: '',
        },
      },
})
