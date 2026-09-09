import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser', timeout:60000, workers:1,
  use:{baseURL:'http://127.0.0.1:3101',headless:true},
  webServer:{command:'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3101',url:'http://127.0.0.1:3101',reuseExistingServer:false,env:{SSO_CLIENT_ID:'local-gds-test',SSO_CLIENT_SECRET:'local-gds-test-only',deli_MONGODB_URI:'',MONGODB_URI:''}},
});
