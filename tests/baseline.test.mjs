import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {inventory,validateFixture} from '../scripts/baseline-check.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/legacy-deli.json',import.meta.url),'utf8'));
test('legacy synthetic fixture captures unsafe fallback without endorsing it',()=>assert(validateFixture(fixture)));
test('fixture rejects inconsistent monetary snapshots',()=>{const bad=structuredClone(fixture);bad.orders[0].total++;assert.throws(()=>validateFixture(bad));});
test('fixture cannot contain real customer addresses',()=>{const bad=structuredClone(fixture);bad.customers[0].email='someone@real.com';assert.throws(()=>validateFixture(bad));});
test('inventory covers public API, dashboards and global connection consumers',()=>{const i=inventory();assert(i.routes.includes('app/api/orders/route.js'));assert(i.routes.includes('app/dashboard/integrations/page.js'));assert(i.models.includes('models/Order.js'));assert(i.globalModelConsumers.includes('lib/auth.js'));assert(i.environmentNames.includes('SSO_CLIENT_SECRET'));});
