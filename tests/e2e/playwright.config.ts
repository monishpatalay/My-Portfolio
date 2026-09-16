import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.pw.ts',
  outputDir: './artifacts/results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: {timeout: 10_000},
  reporter: [['list'], ['json', {outputFile:'artifacts/results.json'}], ['html', {outputFolder:'artifacts/html', open:'never'}]],
  use: {
    baseURL:'http://127.0.0.1:3100',
    viewport:{width:1440,height:900},
    screenshot:'only-on-failure', trace:'retain-on-failure', video:'retain-on-failure',
  },
  webServer: {
    command:'pnpm build && pnpm start --hostname 127.0.0.1 --port 3100',
    cwd:'../..',
    url:'http://127.0.0.1:3100',
    timeout:240_000,
    reuseExistingServer:false,
    stdout:'pipe', stderr:'pipe',
  },
  projects: [
    {name:'chromium', use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
    {name:'firefox', use:{...devices['Desktop Firefox'],viewport:{width:1440,height:900}}},
    {name:'webkit', use:{...devices['Desktop Safari'],viewport:{width:1440,height:900}}},
    {name:'performance', testMatch:'scroll-performance.pw.ts', use:{browserName:'chromium',headless:false,viewport:{width:1440,height:900}}},
  ],
});
