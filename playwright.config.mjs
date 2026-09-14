import {defineConfig} from '@playwright/test';

export default defineConfig({
 testDir:'./tests/browser',
 use:{baseURL:'http://127.0.0.1:3122'},
 webServer:{command:'CUSTOMER_DIRECT_MANAGED=0 pnpm exec next dev -p 3122',url:'http://127.0.0.1:3122',reuseExistingServer:!process.env.CI},
 reporter:'list'
});
