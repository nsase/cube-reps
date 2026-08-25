import { defineConfig, devices } from '@playwright/test';

/** 全端末で実行するレスポンシブテストを識別するタグ。 */
const responsiveTestTag = /@responsive/;
/** CubeRepsの実ブラウザテスト設定。 */
const config = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4200',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-wide',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'ipad-mini',
      grep: responsiveTestTag,
      use: { ...devices['iPad Mini'], browserName: 'chromium' },
    },
    {
      name: 'ipad-mini-landscape',
      grep: responsiveTestTag,
      use: { ...devices['iPad Mini landscape'], browserName: 'chromium' },
    },
    {
      name: 'ipad-pro-11',
      grep: responsiveTestTag,
      use: { ...devices['iPad Pro 11'], browserName: 'chromium' },
    },
    {
      name: 'ipad-pro-11-landscape',
      grep: responsiveTestTag,
      use: { ...devices['iPad Pro 11 landscape'], browserName: 'chromium' },
    },
    {
      name: 'pixel-7',
      grep: responsiveTestTag,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'pixel-7-landscape',
      grep: responsiveTestTag,
      use: { ...devices['Pixel 7 landscape'] },
    },
  ],
  webServer: {
    command: 'npm start -- --port 4200',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});

export default config;
