import test from 'node:test';import assert from 'node:assert/strict';import {requireTestDatabase} from '../scripts/test-environment.mjs';
test('production environment alone cannot authorize integration database',()=>assert.throws(()=>requireTestDatabase({MONGODB_URI:'mongodb://host/prod'})));
test('explicit production database name is rejected',()=>assert.throws(()=>requireTestDatabase({CUSTOMER_DIRECT_TEST_DB:'production',CUSTOMER_DIRECT_TEST_MONGODB_URI:'mongodb://host'})));
test('matching production database is rejected',()=>assert.throws(()=>requireTestDatabase({CUSTOMER_DIRECT_TEST_DB:'customer_direct_test_live',CUSTOMER_DIRECT_TEST_MONGODB_URI:'mongodb://host',MONGODB_DB:'customer_direct_test_live'})));
test('isolated explicit test configuration is accepted',()=>assert.equal(requireTestDatabase({CUSTOMER_DIRECT_TEST_DB:'customer_direct_test_fixture',CUSTOMER_DIRECT_TEST_MONGODB_URI:'mongodb://host'}).name,'customer_direct_test_fixture'));
