import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5199',
    // Use the Chrome that is already installed, so no browser download is needed.
    // Set PW_CHANNEL=msedge to use Edge instead.
    channel: process.env.PW_CHANNEL ?? 'chrome',
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: true,
  },
});
